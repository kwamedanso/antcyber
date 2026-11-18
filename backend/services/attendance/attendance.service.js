// services/attendance/attendance.service.js
const { query, startTransaction } = require('../../utils/database/connection');

const withTransaction = async (callback) => {
    const tx = await startTransaction();
    try {
        const result = await callback(tx.client);
        await tx.commit();
        return result;
    } catch (error) {
        try { await tx.rollback(); } catch (e) { console.error(e); }
        throw error;
    }
};

// ============================================================================
// OPENSTREETMAP REVERSE GEOCODING HELPER
// ============================================================================
const getAddressFromCoordinates = async (latitude, longitude) => {
    try {
        const url = new URL('https://nominatim.openstreetmap.org/reverse');
        url.search = new URLSearchParams({
            format: 'jsonv2',
            lat: latitude,
            lon: longitude,
            zoom: '18',
            addressdetails: '1',
            'accept-language': 'en'
        });

        const response = await fetch(url, {
            headers: {
                // Nominatim requires a valid User-Agent
                'User-Agent': 'AntCyberPortal/1.0 (contact@antcyber.com)' 
            }
        });

        if (!response.ok) return null;

        const data = await response.json();
        if (!data || !data.address) return null;

        const address = data.address;
        const area = address.suburb || address.neighbourhood || address.quarter || address.city_district || address.village || address.town || address.city;

        return {
            full_address: data.display_name,
            area: area || null,
            street: address.road || null,
            house_number: address.house_number || null,
            city: address.city || address.town || null,
            region: address.state || null,
            country: address.country || null,
            postcode: address.postcode || null,
            latitude: Number(data.lat),
            longitude: Number(data.lon),
            osm_type: data.type || null
        };
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        return null;
    }
};

// ============================================================================
// CLOCK IN
// ============================================================================
const clockIn = async (payload, actorUserId) => {
    const { staff_id, latitude, longitude, accuracy, device } = payload;

    if (!staff_id) throw new Error('Staff ID is required');

    return withTransaction(async (client) => {
        // 1. Check if staff already has an open session (no clock out)
        const activeSession = await client.query(
            `SELECT attendance_id, clock_in_at FROM attendance_records 
             WHERE staff_id = $1 AND clock_out_at IS NULL 
             LIMIT 1`,
            [staff_id]
        );

        if (activeSession.rows.length > 0) {
            const session = activeSession.rows[0];
            const clockInDate = new Date(session.clock_in_at);
            const today = new Date();

            // If the open session was started TODAY, block the clock in.
            // If it was started on a previous day, we auto-close it and allow the clock in.
            if (clockInDate.toDateString() === today.toDateString()) {
                const error = new Error('You are already clocked in. Please clock out first.');
                error.statusCode = 400;
                throw error;
            } else {
                // Auto-close the forgotten session at 11:59 PM of that day
                const clockOutDate = new Date(clockInDate);
                clockOutDate.setHours(23, 59, 0, 0);

                await client.query(
                    `UPDATE attendance_records 
                     SET clock_out_at = $1, 
                         clock_out_address = '{"auto_closed": true, "reason": "Forgot to clock out"}'::jsonb,
                         updated_at = NOW()
                     WHERE attendance_id = $2`,
                    [clockOutDate.toISOString(), session.attendance_id]
                );
            }
        }

        // 2. Get Address from OpenStreetMap
        let addressJson = null;
        if (latitude && longitude) {
            addressJson = await getAddressFromCoordinates(latitude, longitude);
        }

        // 3. Insert record
        const result = await client.query(
            `INSERT INTO attendance_records 
                (staff_id, clock_in_user_id, clock_in_latitude, clock_in_longitude, clock_in_accuracy, clock_in_address, clock_in_device)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [
                staff_id, actorUserId, 
                latitude || null, longitude || null, accuracy || null, 
                addressJson ? JSON.stringify(addressJson) : null, 
                device || null
            ]
        );

        return result.rows[0];
    });
};

// ============================================================================
// CLOCK OUT
// ============================================================================
const clockOut = async (attendanceId, payload, actorUserId) => {
    const { latitude, longitude, accuracy, device } = payload;

    return withTransaction(async (client) => {
        // 1. Verify record exists and is open
        const existing = await client.query(
            `SELECT * FROM attendance_records WHERE attendance_id = $1 FOR UPDATE`,
            [attendanceId]
        );

        if (!existing.rows.length) {
            const error = new Error('Attendance record not found.');
            error.statusCode = 404;
            throw error;
        }

        if (existing.rows[0].clock_out_at) {
            const error = new Error('Already clocked out for this session.');
            error.statusCode = 400;
            throw error;
        }

        // 2. Get Address
        let addressJson = null;
        if (latitude && longitude) {
            addressJson = await getAddressFromCoordinates(latitude, longitude);
        }

        // 3. Update record
        const result = await client.query(
            `UPDATE attendance_records 
             SET clock_out_at = NOW(), 
                 clock_out_user_id = $1,
                 clock_out_latitude = $2, 
                 clock_out_longitude = $3, 
                 clock_out_accuracy = $4, 
                 clock_out_address = $5, 
                 clock_out_device = $6,
                 updated_at = NOW()
             WHERE attendance_id = $7
             RETURNING *`,
            [
                actorUserId, 
                latitude || null, longitude || null, accuracy || null, 
                addressJson ? JSON.stringify(addressJson) : null, 
                device || null, attendanceId
            ]
        );

        return result.rows[0];
    });
};

// ============================================================================
// GET ATTENDANCE HISTORY (List) — with Auto-Close Safety Net
// ============================================================================
const getAttendanceHistory = async (filters = {}, pagination = {}) => {
    const { staff_id = null, start_date = null, end_date = null } = filters;

    console.log("Staff id", staff_id);

    // 1. AUTO-CLOSE FORGOTTEN SESSIONS (Safety Net)
    //    - Single UPDATE instead of N+1 loop
    //    - Uses server-side date comparison (no client timezone drift)
    //    - Only touches sessions older than today
    if (staff_id) {
        await query(
            `UPDATE attendance_records
             SET clock_out_at = date_trunc('day', clock_in_at) + INTERVAL '23 hours 59 minutes',
                 clock_out_address = '{"auto_closed": true, "reason": "Forgot to clock out"}'::jsonb,
                 updated_at = NOW()
             WHERE staff_id = $1
               AND clock_out_at IS NULL
               AND clock_in_at::date < CURRENT_DATE`,
            [staff_id]
        );
    }

    // 2. Pagination setup
    const limit  = Math.min(Math.max(Number(pagination.limit) || 20, 1), 100);
    const page   = Math.max(Number(pagination.page) || 1, 1);
    const offset = (page - 1) * limit;

    const conditions = [];
    const params = [];

    // NOTE: All conditions are qualified with the `a.` alias so they work
    // in both the COUNT query (aliased) and the SELECT query (with JOIN).
    if (staff_id) {
        params.push(staff_id);
        conditions.push(`a.staff_id = $${params.length}`);
    }

    if (start_date) {
        params.push(start_date);
        conditions.push(`a.clock_in_at >= $${params.length}`);
    }

    if (end_date) {
        // Treat end_date as inclusive of the whole day if a date-only
        // string is passed (e.g. '2025-11-16' → < '2025-11-17 00:00').
        params.push(end_date);
        conditions.push(`a.clock_in_at < ($${params.length}::timestamptz + INTERVAL '1 day')`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    // 3. Count (aliased so `a.*` conditions resolve)
    const countResult = await query(
        `SELECT COUNT(*)::int AS total
         FROM attendance_records a
         ${whereClause}`,
        params
    );
    const total = countResult.rows[0]?.total || 0;

    // 4. Fetch page
    const listParams = [...params, limit, offset];
    const result = await query(
        `SELECT a.*,
                s.first_name, s.last_name, s.full_name
         FROM attendance_records a
         JOIN staffs s ON s.staff_id = a.staff_id
         ${whereClause}
         ORDER BY a.clock_in_at DESC
         LIMIT $${listParams.length - 1} OFFSET $${listParams.length}`,
        listParams
    );

    return {
        results: result.rows,
        pagination: {
            total,
            page,
            limit,
            total_pages: Math.ceil(total / limit) || 1,
        },
    };
};

// ============================================================================
// GET SINGLE RECORD
// ============================================================================
const getAttendanceById = async (attendanceId) => {
    const result = await query(
        `SELECT a.*, s.full_name
         FROM attendance_records a
         JOIN staffs s ON s.staff_id = a.staff_id
         WHERE attendance_id = $1`,
        [attendanceId]
    );
    return result.rows[0] || null;
};

// ============================================================================
// ATTENDANCE CORRECTION (Admin)
// ============================================================================
const correctAttendance = async (attendanceId, payload, actorUserId) => {
    const { clock_in_at, clock_out_at, staff_id } = payload;

    return withTransaction(async (client) => {
        const existing = await client.query(`SELECT attendance_id FROM attendance_records WHERE attendance_id = $1`, [attendanceId]);
        if (!existing.rows.length) {
            const error = new Error('Attendance record not found.');
            error.statusCode = 404;
            throw error;
        }

        const sets = ['updated_at = NOW()'];
        const params = [];

        if (clock_in_at) {
            params.push(clock_in_at);
            sets.push(`clock_in_at = $${params.length}`);
        }
        if (clock_out_at) {
            params.push(clock_out_at);
            sets.push(`clock_out_at = $${params.length}`);
        }
        if (staff_id) {
            params.push(staff_id);
            sets.push(`staff_id = $${params.length}`);
        }

        params.push(attendanceId);
        const result = await client.query(
            `UPDATE attendance_records SET ${sets.join(', ')} WHERE attendance_id = $${params.length} RETURNING *`,
            params
        );

        return result.rows[0];
    });
};


const getActiveAttendance = async () => {
    const result = await query(
        `SELECT a.*, s.full_name, s.staff_id, u.email
         FROM attendance_records a
         JOIN staffs s ON s.staff_id = a.staff_id
         JOIN users u ON u.id = a.clock_in_user_id
         WHERE a.clock_out_at IS NULL
         ORDER BY a.clock_in_at DESC`
    );
    return result.rows;
};

module.exports = {
    clockIn,
    clockOut,
    getAttendanceHistory,
    getAttendanceById,
    correctAttendance,
    getActiveAttendance
};