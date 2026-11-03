// services/staff/staff.service.js
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { query, startTransaction } = require('../../utils/database/connection');
const { 
    assignRoles, 
    assignDirectPermissions, 
    activateUserPortal, 
    deactivateUserPortal 
} = require('../auth/auth.service');

// ============================================================================
// CONSTANTS
// ============================================================================
const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 12;
const STAFF_ID_PREFIX = process.env.STAFF_ID_PREFIX || 'ANT';

// ============================================================================
// HELPERS
// ============================================================================

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

const isEmpty = (v) => v === undefined || v === null || v === '';

const requireValue = (value, fieldName) => {
    if (isEmpty(value) || (typeof value === 'string' && !value.trim())) {
        const error = new Error(`${fieldName} is required.`);
        error.statusCode = 400;
        throw error;
    }
    return value;
};

const requireUUID = (value, fieldName) => {
    requireValue(value, fieldName);
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (typeof value !== 'string' || !uuidRegex.test(value)) {
        const error = new Error(`${fieldName} must be a valid UUID.`);
        error.statusCode = 400;
        throw error;
    }
    return value;
};

const requireEmail = (value, fieldName = 'Email') => {
    requireValue(value, fieldName);
    const normalized = String(value).trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalized)) {
        const error = new Error(`${fieldName} is invalid.`);
        error.statusCode = 400;
        throw error;
    }
    return normalized;
};

const normalizeDate = (value, fieldName) => {
    if (value === undefined || value === null || value === '') return null;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) {
        const error = new Error(`${fieldName} is not a valid date.`);
        error.statusCode = 400;
        throw error;
    }
    return d.toISOString().slice(0, 10);
};

// ============================================================================
// STAFF ID GENERATOR
// ============================================================================
const generateStaffId = async (client) => {
    // const yearSuffix = String(new Date().getFullYear()).slice(-2);
    const result = await client.query(
        `SELECT staff_id FROM staffs 
         WHERE staff_id LIKE $1 
         ORDER BY staff_id DESC LIMIT 1`,
        [`${STAFF_ID_PREFIX}%`]
    );

    let nextNumber = 1;
    if (result.rows.length) {
        const last = result.rows[0].staff_id;
        const parts = last.split('-');
        const seq = parseInt(parts[parts.length - 1], 10);
        if (!Number.isNaN(seq)) nextNumber = seq + 1;
    }
    return `${STAFF_ID_PREFIX}-${String(nextNumber).padStart(2, '0')}`;
};

// ============================================================================
// SEARCH INDEX HELPERS
// ============================================================================
const upsertStaffSearchIndex = async (client, staff, contacts = []) => {
    const searchText = [
        staff.staff_id, staff.first_name, staff.middle_name, staff.last_name,
        staff.full_name, staff.title, staff.rank, staff.gender, staff.employment_status
    ].concat(contacts.map(c => c.value))
     .filter(Boolean).join(' ').toLowerCase();

    await client.query(
        `INSERT INTO staffs_search_index (entity_id, search_text, search_vector, is_active, updated_at)
         VALUES ($1, $2, to_tsvector('simple', $2), TRUE, NOW())
         ON CONFLICT (entity_id) DO UPDATE
         SET search_text = EXCLUDED.search_text,
             search_vector = EXCLUDED.search_vector,
             is_active = TRUE,
             updated_at = NOW()`,
        [staff.staff_id, searchText]
    );
};

const upsertUserSearchIndex = async (client, user, staff = null) => {
    const parts = [user.email, user.user_type];
    if (staff) {
        parts.push(staff.staff_id, staff.first_name, staff.middle_name, staff.last_name, staff.full_name);
    }
    const searchText = parts.filter(Boolean).join(' ').toLowerCase();

    await client.query(
        `INSERT INTO users_search_index (entity_type, entity_id, search_text, search_vector, is_active, updated_at)
         VALUES ($1, $2, $3, to_tsvector('simple', $3), TRUE, NOW())
         ON CONFLICT (entity_type, entity_id) DO UPDATE
         SET search_text = EXCLUDED.search_text,
             search_vector = EXCLUDED.search_vector,
             is_active = TRUE,
             updated_at = NOW()`,
        [user.user_type, user.id, searchText]
    );
};

// ============================================================================
// CREATE STAFF (The Master Function)
// ============================================================================
const createStaff = async (payload, metaData = {}) => {
    const {
        email, first_name, middle_name = null, last_name,
        date_of_birth = null, gender = null, title = null,
        employment_date = null, employment_status = 'active', religion_id = null,
        user_type = 'employee', rank = null,
        
        contacts = [], identifications = [], addresses = [], education = [],
        role_ids = [], permission_ids = []
    } = payload;

    const { actor_user_id: actorUserId } = metaData;

    requireUUID(actorUserId, 'Actor User ID');
    const normalizedEmail = requireEmail(email, 'Email');
    requireValue(first_name, 'First name');
    requireValue(last_name, 'Last name');

    if (!['employee', 'external'].includes(user_type)) {
        const error = new Error('user_type must be "employee" or "external".');
        error.statusCode = 400;
        throw error;
    }

    // ------------------------------------------------------------------
    // 1. Generate Default Password
    // ------------------------------------------------------------------
    const firstInitial = first_name.trim().charAt(0).toUpperCase();
    const secondChar = last_name.trim().charAt(0).toLowerCase(); // e.g. John Doe -> Jo123$
    const otherLastNameChar = last_name.trim().charAt(1).toLowerCase(); // e.g. John Doe -> JDoe123$
    const defaultPassword = `${firstInitial}${secondChar}${otherLastNameChar}123$`;
    const passwordHash = await bcrypt.hash(defaultPassword, BCRYPT_ROUNDS);

    // ------------------------------------------------------------------
    // 2. Preflight — email must be unique
    // ------------------------------------------------------------------
    const existing = await query(`SELECT id FROM users WHERE email = $1 LIMIT 1`, [normalizedEmail]);
    if (existing.rows.length) {
        const error = new Error('A user with this email already exists.');
        error.statusCode = 409;
        throw error;
    }

    // ------------------------------------------------------------------
    // 3. Run the write side inside a single transaction.
    // ------------------------------------------------------------------
    const result = await withTransaction(async (client) => {
        // 3a. users row
        const userInsert = await client.query(
            `INSERT INTO users
                (email, password_hash, user_type, must_change_password, is_active, updated_by)
             VALUES ($1, $2, $3, TRUE, TRUE, $4)
             RETURNING id, email, user_type, is_active, created_at`,
            [normalizedEmail, passwordHash, user_type, actorUserId]
        );
        const user = userInsert.rows[0];

        // 3b. staff_id resolution
        const staffId = await generateStaffId(client);

        // 3c. staffs row
        const staffInsert = await client.query(
            `INSERT INTO staffs
                (user_id, staff_id, first_name, middle_name, last_name,
                 date_of_birth, gender, title, rank, employment_date, employment_status, religion_id, updated_by)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
             RETURNING *`,
            [
                user.id, staffId, first_name.trim(), middle_name?.trim() || null, last_name.trim(),
                normalizeDate(date_of_birth, 'Date of birth'), gender, title, rank,
                normalizeDate(employment_date, 'Employment date'), employment_status, religion_id || null, actorUserId
            ]
        );
        const staff = staffInsert.rows[0];

        // 3d. Primary Email Contact
        await client.query(
            `INSERT INTO staff_contacts (staff_id, contact_type, value, is_primary, is_verified)
             VALUES ($1, 'email', $2, TRUE, TRUE)`,
            [staffId, normalizedEmail]
        );

        // 3e. Additional Contacts
        for (const c of contacts) {
            requireValue(c.value, 'Contact value');
            requireValue(c.contact_type, 'Contact type');
            await client.query(
                `INSERT INTO staff_contacts (staff_id, contact_type, value, is_primary, is_verified)
                 VALUES ($1, $2, $3, $4, $5)`,
                [staffId, c.contact_type, c.value, c.is_primary || false, c.is_verified || false]
            );
        }

        // 3f. Identifications
        for (const idn of identifications) {
            requireValue(idn.id_type, 'ID Type');
            requireValue(idn.id_number, 'ID Number');
            await client.query(
                `INSERT INTO staff_identifications
                    (staff_id, id_type, id_number, issue_date, expiry_date, is_verified, notes, updated_by)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [staffId, idn.id_type, idn.id_number, normalizeDate(idn.issue_date), normalizeDate(idn.expiry_date), idn.is_verified || false, idn.notes || null, actorUserId]
            );
        }

        // 3g. Addresses
        for (const addr of addresses) {
            requireValue(addr.address_type, 'Address type');
            await client.query(
                `INSERT INTO staff_addresses
                    (staff_id, address_type, address, city, region, country, postal_code, notes, updated_by)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                [staffId, addr.address_type, addr.address, addr.city, addr.region, addr.country, addr.postal_code, addr.notes || null, actorUserId]
            );
        }

        // 3h. Education
        for (const edu of education) {
            requireValue(edu.qualification_type, 'Qualification type');
            requireValue(edu.qualification_name, 'Qualification name');
            requireValue(edu.institution_name, 'Institution name');
            await client.query(
                `INSERT INTO staff_education
                    (staff_id, qualification_type, qualification_name, institution_name, start_year, end_year, grade_obtained, is_verified, document_url)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                [staffId, edu.qualification_type, edu.qualification_name, edu.institution_name, edu.start_year || null, edu.end_year || null, edu.grade_obtained || null, edu.is_verified || false, edu.document_url || null]
            );
        }

        // 3i. Search Indexes
        await upsertStaffSearchIndex(client, staff);
        await upsertUserSearchIndex(client, user, staff);

        return { user, staff, defaultPassword };
    });

    // ------------------------------------------------------------------
    // 4. Assign Roles & Permissions (Outside main transaction, non-fatal)
    // ------------------------------------------------------------------
    if (Array.isArray(role_ids) && role_ids.length > 0) {
        try {
            await assignRoles(result.user.id, role_ids);
        } catch (error) {
            console.error(`[Staff Service] Role assignment failed for ${result.user.id}:`, error);
        }
    }

    if (Array.isArray(permission_ids) && permission_ids.length > 0) {
        try {
            await assignDirectPermissions(result.user.id, permission_ids, true, actorUserId);
        } catch (error) {
            console.error(`[Staff Service] Permission assignment failed for ${result.user.id}:`, error);
        }
    }

    // ------------------------------------------------------------------
    // 5. Response
    // ------------------------------------------------------------------
    return {
        user: result.user,
        staff: result.staff,
        defaultPassword
    };
};

// ============================================================================
// UPDATE STAFF
// ============================================================================
const updateStaff = async (staffId, payload, metaData = {}) => {
    const { actor_user_id: actorUserId } = metaData;
    requireUUID(actorUserId, 'Actor User ID');
    requireValue(staffId, 'Staff ID');

    const {
        first_name, middle_name, last_name, date_of_birth, gender, title, rank,
        employment_date, employment_status, religion_id,
        role_ids, permission_ids
    } = payload;

    // 1. Update core staff details in a transaction
    const updatedStaff = await withTransaction(async (client) => {
        const existing = await client.query(`SELECT * FROM staffs WHERE staff_id = $1 FOR UPDATE`, [staffId]);
        if (!existing.rows.length) {
            const error = new Error('Staff not found.');
            error.statusCode = 404;
            throw error;
        }

        const sets = [];
        const params = [];
        const push = (col, val) => {
            params.push(val);
            sets.push(`${col} = $${params.length}`);
        };

        if (first_name !== undefined) push('first_name', first_name.trim());
        if (middle_name !== undefined) push('middle_name', middle_name?.trim() || null);
        if (last_name !== undefined) push('last_name', last_name.trim());
        if (date_of_birth !== undefined) push('date_of_birth', normalizeDate(date_of_birth));
        if (gender !== undefined) push('gender', gender);
        if (title !== undefined) push('title', title);
        if (rank !== undefined) push('rank', rank);
        if (employment_date !== undefined) push('employment_date', normalizeDate(employment_date));
        if (employment_status !== undefined) push('employment_status', employment_status);
        if (religion_id !== undefined) push('religion_id', religion_id);

        params.push(actorUserId);
        sets.push(`updated_by = $${params.length}`);
        sets.push('updated_at = NOW()');

        params.push(staffId);
        const updateResult = await client.query(
            `UPDATE staffs SET ${sets.join(', ')} WHERE staff_id = $${params.length} RETURNING *`,
            params
        );

        const staff = updateResult.rows[0];
        await upsertStaffSearchIndex(client, staff);

        return staff;
    });

    // 2. Update Roles & Permissions (Run after core update)
    const userId = updatedStaff.user_id;
    
    // Handle Roles Update
    if (Array.isArray(role_ids)) {
        try {
            await query(`DELETE FROM user_roles WHERE user_id = $1`, [userId]);
            if (role_ids.length > 0) {
                await assignRoles(userId, role_ids);
            }
        } catch (error) {
            console.error(`[Staff Service] Role update failed for ${userId}:`, error);
        }
    }

    // Handle Permissions Update (With Deny Logic)
    if (Array.isArray(permission_ids)) {
        try {
            // 1. Get ALL permissions inherited from the updated roles
            const rolePermsResult = await query(
                `SELECT DISTINCT rp.permission_id 
                 FROM user_roles ur
                 JOIN role_permissions rp ON rp.role_id = ur.role_id
                 JOIN roles r ON r.id = ur.role_id
                 WHERE ur.user_id = $1 AND r.is_active = TRUE`,
                [userId]
            );
            const rolePermissionIds = rolePermsResult.rows.map(r => r.permission_id);

            // 2. Clear existing direct overrides (both grants and denies)
            await query(`DELETE FROM user_permissions WHERE user_id = $1`, [userId]);

            const permissionsToGrant = [];
            const permissionsToDeny = [];

            // 3. Identify explicit Grants (Selected in UI but NOT in Roles)
            for (const permId of permission_ids) {
                if (!rolePermissionIds.includes(permId)) {
                    permissionsToGrant.push(permId);
                }
            }

            // 4. Identify explicit Denies (IN Roles but NOT selected in UI)
            for (const rolePermId of rolePermissionIds) {
                if (!permission_ids.includes(rolePermId)) {
                    permissionsToDeny.push(rolePermId);
                }
            }

            // 5. Apply Grants
            if (permissionsToGrant.length > 0) {
                await assignDirectPermissions(userId, permissionsToGrant, true, actorUserId);
            }

            // 6. Apply Denies
            if (permissionsToDeny.length > 0) {
                await assignDirectPermissions(userId, permissionsToDeny, false, actorUserId);
            }

        } catch (error) {
            console.error(`[Staff Service] Permission update failed for ${userId}:`, error);
        }
    }

    return updatedStaff;
};

// ============================================================================
// DELETE STAFF
// ============================================================================
const deleteStaff = async (staffId, actorUserId) => {
    requireValue(staffId, 'Staff ID');
    requireUUID(actorUserId, 'Actor User ID');

    return withTransaction(async (client) => {
        // Get user_id to delete the user as well
        const staffResult = await client.query(`SELECT user_id FROM staffs WHERE staff_id = $1`, [staffId]);
        if (!staffResult.rows.length) {
            const error = new Error('Staff not found.');
            error.statusCode = 404;
            throw error;
        }
        const userId = staffResult.rows[0].user_id;

        // Delete user (CASCADE will delete staff, contacts, addresses, etc.)
        // Note: If tasks/projects are assigned to this user, the DB will either 
        // cascade delete them (if ON DELETE CASCADE) or block the delete (if ON DELETE RESTRICT).
        await client.query(`DELETE FROM users WHERE id = $1`, [userId]);

        return true;
    });
};

// ============================================================================
// GET STAFF DETAILS
// ============================================================================
// const getStaffById = async (staffId) => {
//     requireValue(staffId, 'Staff ID');

//     const result = await query(
//         `SELECT s.*, u.email, u.user_type, u.is_active,
//                 COALESCE(
//                     (SELECT json_agg(c) FROM staff_contacts c WHERE c.staff_id = s.staff_id), '[]'
//                 ) as contacts,
//                 COALESCE(
//                     (SELECT json_agg(i) FROM staff_identifications i WHERE i.staff_id = s.staff_id), '[]'
//                 ) as identifications,
//                 COALESCE(
//                     (SELECT json_agg(a) FROM staff_addresses a WHERE a.staff_id = s.staff_id), '[]'
//                 ) as addresses,
//                 COALESCE(
//                     (SELECT json_agg(e) FROM staff_education e WHERE e.staff_id = s.staff_id), '[]'
//                 ) as education
//          FROM staffs s
//          JOIN users u ON u.id = s.user_id
//          WHERE s.staff_id = $1`,
//         [staffId]
//     );

//     if (!result.rows.length) return null;
//     return result.rows[0];
// };


// services/staff/staff.service.js

const getStaffById = async (staffId) => {
    requireValue(staffId, 'Staff ID');

    const result = await query(
        `SELECT s.*, u.email, u.user_type, u.is_active,
                COALESCE(
                    (SELECT json_agg(c ORDER BY c.is_primary DESC) FROM staff_contacts c WHERE c.staff_id = s.staff_id), '[]'
                ) as contacts,
                COALESCE(
                    (SELECT json_agg(i) FROM staff_identifications i WHERE i.staff_id = s.staff_id), '[]'
                ) as identifications,
                COALESCE(
                    (SELECT json_agg(a) FROM staff_addresses a WHERE a.staff_id = s.staff_id), '[]'
                ) as addresses,
                COALESCE(
                    (SELECT json_agg(e) FROM staff_education e WHERE e.staff_id = s.staff_id), '[]'
                ) as education,
                COALESCE(
                    (SELECT json_agg(ur.role_id) FROM user_roles ur WHERE ur.user_id = u.id), '[]'
                ) as role_ids,
                COALESCE(
                    (SELECT json_agg(up.permission_id) FROM user_permissions up WHERE up.user_id = u.id AND up.granted = TRUE), '[]'
                ) as permission_ids
         FROM staffs s
         JOIN users u ON u.id = s.user_id
         WHERE s.staff_id = $1`,
        [staffId]
    );

    if (!result.rows.length) return null;
    return result.rows[0];
};

// ============================================================================
// PORTAL ACCESS WRAPPERS
// ============================================================================
const togglePortalAccess = async (userId, isActive, actorUserId) => {
    if (isActive) {
        return await activateUserPortal(userId, actorUserId);
    } else {
        return await deactivateUserPortal(userId, actorUserId);
    }
};

// ============================================================================
// LIST STAFF
// ============================================================================
const listStaff = async (filters = {}, pagination = {}) => {
    const { 
        search = null, 
        employment_status = null, 
        user_type = null,
        is_active = null 
    } = filters;

    const limit = Math.min(Math.max(Number(pagination.limit) || 10, 1), 100);
    const page = Math.max(Number(pagination.page) || 1, 1);
    const offset = (page - 1) * limit;

    const conditions = [];
    const params = [];

    // 1. Text Search (Name, Email, Staff ID)
    if (search) {
        params.push(`%${String(search).trim().toLowerCase()}%`);
        conditions.push(
            `(
                LOWER(s.full_name) LIKE $${params.length}
                OR LOWER(s.staff_id) LIKE $${params.length}
                OR LOWER(u.email) LIKE $${params.length}
            )`
        );
    }

    // 2. Employment Status Filter (active, suspended, retired, etc.)
    if (employment_status) {
        params.push(employment_status);
        conditions.push(`s.employment_status = $${params.length}`);
    }

    // 3. User Type Filter (employee, external)
    if (user_type) {
        params.push(user_type);
        conditions.push(`u.user_type = $${params.length}`);
    }

    // 4. Portal Access Filter (Active/Inactive)
    if (is_active !== null && is_active !== undefined) {
        params.push(is_active === 'true' || is_active === true);
        conditions.push(`u.is_active = $${params.length}`);
    }

    const whereClause = conditions.length
        ? `WHERE ${conditions.join(' AND ')}`
        : '';

    // Count query
    const countResult = await query(
        `SELECT COUNT(*)::int AS total 
         FROM staffs s
         JOIN users u ON u.id = s.user_id
         ${whereClause}`,
        params
    );
    const total = countResult.rows[0]?.total || 0;

    // Fetch page
    const listParams = [...params, limit, offset];
    const listResult = await query(
        `SELECT s.id, s.staff_id, s.first_name, s.middle_name, s.last_name, s.full_name,
                s.date_of_birth, s.gender, s.title, s.rank, s.employment_date, s.employment_status,
                u.id AS user_id, u.email, u.user_type, u.is_active
         FROM staffs s
         JOIN users u ON u.id = s.user_id
         ${whereClause}
         ORDER BY COALESCE(s.full_name, u.email) ASC
         LIMIT $${listParams.length - 1} OFFSET $${listParams.length}`,
        listParams
    );

    return {
        results: listResult.rows,
        pagination: {
            total,
            page,
            limit,
            total_pages: Math.ceil(total / limit) || 1
        }
    };
};

module.exports = {
    createStaff,
    updateStaff,
    deleteStaff,
    getStaffById,
    togglePortalAccess,
    listStaff,
};