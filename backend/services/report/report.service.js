// services/report/report.service.js
const fs = require('fs');
const path = require('path');
const { query, startTransaction } = require('../../utils/database/connection');
const { createNotification } = require('../notification/notification.service');


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

const requireValue = (value, fieldName) => {
    if (value === undefined || value === null || (typeof value === 'string' && !value.trim())) {
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

// ============================================================================
// REFERENCE NUMBER GENERATOR
// ============================================================================
const generateReportReference = async (client) => {
    const year = new Date().getFullYear();
    const result = await client.query(
        `SELECT reference_number 
         FROM reports 
         WHERE reference_number LIKE $1 
         ORDER BY reference_number DESC 
         LIMIT 1`,
        [`REP-${year}-%`]
    );

    let nextSequence = 1;
    if (result.rows.length > 0) {
        const lastRef = result.rows[0].reference_number;
        const parts = lastRef.split('-');
        const sequence = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(sequence)) nextSequence = sequence + 1;
    }
    return `REP-${year}-${String(nextSequence).padStart(5, '0')}`;
};

// ============================================================================
// HYDRATION (Attach prepared_by, submitted_to, project, and files)
// ============================================================================
const hydrateReports = async (rows, client = null) => {
    if (!rows.length) return [];
    const queryFn = client ? (sql, params) => client.query(sql, params) : query;
    const ids = rows.map((r) => r.id);

    // Fetch related data in parallel
    const [usersResult, projectsResult, filesResult] = await Promise.all([
        queryFn(
            `SELECT u.id, s.full_name, u.email 
             FROM users u 
             LEFT JOIN staffs s ON s.user_id = u.id`,
            []
        ),
        queryFn(
            `SELECT id, name FROM projects`,
            []
        ),
        queryFn(
            `SELECT * FROM report_attachments WHERE report_id = ANY($1::uuid[])`,
            [ids]
        )
    ]);

    // Build maps for quick lookup
    const userMap = new Map(usersResult.rows.map(u => [u.id, u]));
    const projectMap = new Map(projectsResult.rows.map(p => [p.id, p]));
    
    const filesMap = new Map();
    for (const file of filesResult.rows) {
        if (!filesMap.has(file.report_id)) filesMap.set(file.report_id, []);
        filesMap.get(file.report_id).push(file);
    }

    return rows.map(r => ({
        ...r,
        prepared_by_details: userMap.get(r.prepared_by) || null,
        submitted_to_details: userMap.get(r.submitted_to) || null,
        project_details: r.project_id ? (projectMap.get(r.project_id) || null) : null,
        attachments: filesMap.get(r.id) || []
    }));
};

// ============================================================================
// CREATE REPORT
// ============================================================================
const createReport = async (payload, files = [], actorUserId) => {
    const {
        title, report_type, submitted_to, project_id,
        summary, recommendations, status = 'draft' // Default to draft
    } = payload;

    requireValue(title, 'Title');
    requireValue(report_type, 'Report Type');
    requireUUID(submitted_to, 'Submitted To');
    requireValue(summary, 'Summary');
    requireUUID(actorUserId, 'Actor User ID');

    // 1. Determine allow_edit based on status
    let allowEdit = false;
    if (status === 'draft') {
        allowEdit = true; // Always true for drafts
    }

    return withTransaction(async (client) => {
        // Generate Reference Number
        const referenceNumber = await generateReportReference(client);

        // Insert Report
        const insertResult = await client.query(
            `INSERT INTO reports 
                (reference_number, title, report_type, prepared_by, submitted_to, 
                 project_id, summary, recommendations, status, allow_edit, updated_by)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $4)
             RETURNING *`,
            [
                referenceNumber, title, report_type, actorUserId, submitted_to,
                project_id || null, summary, recommendations || null, status, allowEdit
            ]
        );
        const report = insertResult.rows[0];

        // Insert File Attachments
        if (files && files.length > 0) {
            for (const file of files) {
                await client.query(
                    `INSERT INTO report_attachments 
                        (report_id, file_name, file_url, file_size, mime_type, uploaded_by)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [
                        report.id, file.originalname,
                        `/public/uploads/reports/${file.filename}`,
                        file.size, file.mimetype, actorUserId
                    ]
                );
            }
        }

        if (status === 'submitted') {
            await createNotification({
                userId: submitted_to, 
                actorId: actorUserId, 
                type: 'report_submitted',
                title: 'New Report Submitted',
                message: `A new report "${title}" has been submitted for your review.`,
                link: `/admin/reports/${report.id}`, 
                entityType: 'report',
                entityId: report.id
            });
        }

        const [hydrated] = await hydrateReports([report], client);
        return hydrated;
    });
};

// ============================================================================
// LIST REPORTS
// ============================================================================
// ============================================================================
// LIST REPORTS (Supports filtering by prepared_by and submitted_to)
// ============================================================================
const listReports = async (filters = {}, pagination = {}) => {
    const { 
        search = null, 
        status = null, 
        report_type = null,
        prepared_by = null,   
        submitted_to = null   
    } = filters;
    
    const limit = Math.min(Math.max(Number(pagination.limit) || 10, 1), 100);
    const page = Math.max(Number(pagination.page) || 1, 1);
    const offset = (page - 1) * limit;

    const conditions = [];
    const params = [];

    if (search) {
        params.push(`%${String(search).trim().toLowerCase()}%`);
        conditions.push(
            `(LOWER(title) LIKE $${params.length} OR LOWER(reference_number) LIKE $${params.length})`
        );
    }
    
    if (status) {
        params.push(status);
        conditions.push(`status = $${params.length}`);
    }
    
    if (report_type) {
        params.push(report_type);
        conditions.push(`report_type = $${params.length}`);
    }

    // Filter: Reports created by a specific user
    if (prepared_by) {
        requireUUID(prepared_by, 'Prepared By ID');
        params.push(prepared_by);
        conditions.push(`prepared_by = $${params.length}`);
    }

    // Filter: Reports submitted to a specific user
    if (submitted_to) {
        requireUUID(submitted_to, 'Submitted To ID');
        params.push(submitted_to);
        conditions.push(`submitted_to = $${params.length}`);
        
        // NEW: If we are looking at "Submitted to Me", drafts should never appear
        conditions.push(`status != 'draft'`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count query
    const countResult = await query(
        `SELECT COUNT(*)::int AS total FROM reports ${whereClause}`, 
        params
    );
    const total = countResult.rows[0]?.total || 0;

    // List query
    const listParams = [...params, limit, offset];
    const listResult = await query(
        `SELECT * FROM reports 
         ${whereClause} 
         ORDER BY created_at DESC 
         LIMIT $${listParams.length - 1} OFFSET $${listParams.length}`,
        listParams
    );

    const hydrated = await hydrateReports(listResult.rows);

    return {
        results: hydrated,
        pagination: { 
            total, 
            page, 
            limit, 
            total_pages: Math.ceil(total / limit) || 1 
        }
    };
};

// ============================================================================
// GET SINGLE REPORT
// ============================================================================
const getReportById = async (reportId) => {
    requireUUID(reportId, 'Report ID');
    const result = await query(`SELECT * FROM reports WHERE id = $1`, [reportId]);
    if (!result.rows.length) return null;
    
    const [hydrated] = await hydrateReports(result.rows);
    return hydrated;
};

// ============================================================================
// UPDATE REPORT
// ============================================================================
const updateReport = async (reportId, payload, newFiles = [], actorUserId) => {
    requireUUID(reportId, 'Report ID');
    requireUUID(actorUserId, 'Actor User ID');

    const { 
        title, summary, recommendations, status,
        submitted_to, report_type, project_id,
        reviewer_notes, allow_edit 
    } = payload;

    return withTransaction(async (client) => {
        // 1. Fetch existing report
        const existingResult = await client.query(`SELECT * FROM reports WHERE id = $1 FOR UPDATE`, [reportId]);
        if (!existingResult.rows.length) {
            const error = new Error('Report not found.');
            error.statusCode = 404;
            throw error;
        }
        const existing = existingResult.rows[0];

        // 2. Authorization checks
        const isReviewer = existing.submitted_to === actorUserId;
        const isCreator = existing.prepared_by === actorUserId;

        if (!isCreator && !isReviewer) {
            const error = new Error('You do not have permission to edit this report.');
            error.statusCode = 403;
            throw error;
        }

        // Prevent creator from editing submitted content unless explicitly allowed
        if (isCreator && !isReviewer && existing.status !== 'draft' && !existing.allow_edit) {
            const error = new Error('This report is currently locked. The reviewer must allow edits.');
            error.statusCode = 403;
            throw error;
        }

        // 3. Build Unified Update Object (Prevents duplicate column assignments)
        const updates = {};

        // --- Creator Updates ---
        if (isCreator) {
            if (title !== undefined) updates.title = title;
            if (summary !== undefined) updates.summary = summary;
            if (recommendations !== undefined) updates.recommendations = recommendations;
            if (submitted_to !== undefined) updates.submitted_to = submitted_to;
            if (report_type !== undefined) updates.report_type = report_type;
            if (project_id !== undefined) updates.project_id = project_id === '' ? null : project_id;
            
            if (status !== undefined) {
                updates.status = status;
                
                // Force allow_edit based on status change
                if (status === 'draft') {
                    updates.allow_edit = true; // Drafts are always editable
                } else if (status === 'submitted' && existing.status === 'draft') {
                    updates.allow_edit = false; // Locks on submission
                }
            }
        }

        // --- Reviewer Updates ---
        if (isReviewer) {
            if (reviewer_notes !== undefined) updates.reviewer_notes = reviewer_notes;
            
            // Reviewer explicitly granting edit access
            if (allow_edit !== undefined) updates.allow_edit = allow_edit;
            
            // Reviewer changing status (e.g., to 'received')
            if (status !== undefined && existing.status !== 'draft') {
                updates.status = status;
                
                // Stamp reviewed_at if acknowledging receipt
                if (status === 'received') {
                    updates.reviewed_at = new Date().toISOString();
                }
            }
        }

        // 4. Build Dynamic SQL Query
        const sets = [];
        const params = [];

        // Loop through the unified updates object
        for (const [col, val] of Object.entries(updates)) {
            params.push(val);
            sets.push(`${col} = $${params.length}`);
        }

        // Always update metadata
        params.push(actorUserId);
        sets.push(`updated_by = $${params.length}`);
        sets.push('updated_at = NOW()');

        params.push(reportId);
        
        const updateResult = await client.query(
            `UPDATE reports SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING *`,
            params
        );

        const report = updateResult.rows[0];

        // 5. Add new files if any
        if (newFiles && newFiles.length > 0) {
            for (const file of newFiles) {
                await client.query(
                    `INSERT INTO report_attachments 
                        (report_id, file_name, file_url, file_size, mime_type, uploaded_by)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [report.id, file.originalname, `/public/uploads/reports/${file.filename}`, file.size, file.mimetype, actorUserId]
                );
            }
        }

        // 6. Trigger Notification on Submission
        if (status === 'submitted') {
            await createNotification({
                userId: report.submitted_to, 
                actorId: actorUserId, 
                type: 'report_submitted',
                title: 'New Report Submitted',
                message: `A new report "${report.title}" has been submitted for your review.`,
                link: `/admin/reports/${report.id}`, 
                entityType: 'report',
                entityId: report.id
            });
        }

        const [hydrated] = await hydrateReports([report], client);
        return hydrated;
    });
};
// ============================================================================
// DELETE REPORT (with file cleanup)
// ============================================================================
const deleteReport = async (reportId) => {
    requireUUID(reportId, 'Report ID');

    return withTransaction(async (client) => {
        // 1. Get files to delete them from disk
        const filesResult = await client.query(
            `SELECT file_url FROM report_attachments WHERE report_id = $1`,
            [reportId]
        );

        // 2. Delete report (ON DELETE CASCADE handles attachments table)
        const deleteResult = await client.query(
            `DELETE FROM reports WHERE id = $1 RETURNING id`,
            [reportId]
        );

        if (!deleteResult.rows.length) {
            const error = new Error('Report not found.');
            error.statusCode = 404;
            throw error;
        }

        // 3. Delete physical files from disk
        for (const file of filesResult.rows) {
            // file.file_url is like "/public/uploads/reports/report-123.pdf"
            const relativePath = file.file_url.replace('/public/', '');
            const absolutePath = path.join(__dirname, '../../public', relativePath);
            
            if (fs.existsSync(absolutePath)) {
                fs.unlinkSync(absolutePath);
            }
        }

        return true;
    });
};



const getNextReferenceNumber = async () => {
    // We can run this using the global `query` connection since it's just a read operation
    const year = new Date().getFullYear();
    
    const result = await query(
        `SELECT reference_number 
         FROM reports 
         WHERE reference_number LIKE $1 
         ORDER BY reference_number DESC 
         LIMIT 1`,
        [`REP-${year}-%`]
    );

    let nextSequence = 1;

    if (result.rows.length > 0) {
        const lastRef = result.rows[0].reference_number;
        const parts = lastRef.split('-');
        const sequence = parseInt(parts[parts.length - 1], 10);
        
        if (!isNaN(sequence)) {
            nextSequence = sequence + 1;
        }
    }

    const paddedSequence = String(nextSequence).padStart(5, '0');
    return `REP-${year}-${paddedSequence}`;
};


const deleteAttachment = async (reportId, attachmentId) => {
    requireUUID(reportId, 'Report ID');
    requireUUID(attachmentId, 'Attachment ID');

    // 1. Get the file URL to delete from disk
    const fileResult = await query(
        `SELECT file_url FROM report_attachments WHERE id = $1 AND report_id = $2`,
        [attachmentId, reportId]
    );

    if (!fileResult.rows.length) {
        const error = new Error('Attachment not found.');
        error.statusCode = 404;
        throw error;
    }

    // 2. Delete from DB
    await query(`DELETE FROM report_attachments WHERE id = $1`, [attachmentId]);

    // 3. Delete from disk
    const fileUrl = fileResult.rows[0].file_url;
    const relativePath = fileUrl.replace('/public/', '');
    const absolutePath = path.join(__dirname, '../../public', relativePath);
    
    if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
    }

    return true;
};

// Add to exports

module.exports = {
    createReport,
    listReports,
    getReportById,
    updateReport,
    deleteReport,
    getNextReferenceNumber,
    deleteAttachment
};