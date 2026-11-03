// project.service.js
const { query, startTransaction } = require('../../utils/database/connection');

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
        try {
            await tx.rollback();
        } catch (rollbackError) {
            console.error('[Project Service] Rollback failed:', rollbackError);
        }
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
    const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (typeof value !== 'string' || !uuidRegex.test(value)) {
        const error = new Error(`${fieldName} must be a valid UUID.`);
        error.statusCode = 400;
        throw error;
    }
    return value;
};

const normalizeUUIDArray = (ids, fieldName) => {
    if (!Array.isArray(ids)) {
        const error = new Error(`${fieldName} must be an array.`);
        error.statusCode = 400;
        throw error;
    }
    const normalized = ids.map((id) => requireUUID(id, `${fieldName} item`));
    const unique = [...new Set(normalized)];
    if (unique.length !== normalized.length) {
        const error = new Error(`${fieldName} contains duplicates.`);
        error.statusCode = 400;
        throw error;
    }
    return unique;
};

// ============================================================================
// HYDRATION — attach member count + member list to each project row
// ============================================================================

const hydrateProjects = async (rows, client = null) => {
    if (!rows.length) return [];

    const queryFn = client ? (sql, params) => client.query(sql, params) : query;

    const ids = rows.map((r) => r.id);

    // Use queryFn here instead of query()
    const membersResult = await queryFn(
        `SELECT pm.project_id, u.id AS user_id, u.email,
                s.full_name, s.first_name, s.last_name
         FROM project_members pm
         JOIN users u ON u.id = pm.user_id
         LEFT JOIN staffs s ON s.user_id = u.id
         WHERE pm.project_id = ANY($1::uuid[])`,
        [ids]
    );

    const byProject = new Map();

    for (const m of membersResult.rows) {
        if (!byProject.has(m.project_id)) byProject.set(m.project_id, []);
        byProject.get(m.project_id).push({
            user_id: m.user_id,
            email: m.email,
            full_name:
                m.full_name ||
                [m.first_name, m.last_name].filter(Boolean).join(' ') ||
                m.email
        });
    }

    return rows.map((r) => {
        const members = byProject.get(r.id) || [];
        return {
            ...r,
            member_count: members.length,
            members
        };
    });
};

// ============================================================================
// CREATE
// ============================================================================

const createProject = async (payload, actorUserId) => {
    requireUUID(actorUserId, 'Actor user ID');

    const {
        name,
        description = null,
        member_ids = []
    } = payload;

    requireValue(name, 'Project name');

    const memberIds =
        Array.isArray(member_ids) && member_ids.length
            ? normalizeUUIDArray(member_ids, 'Member IDs')
            : [];

    return withTransaction(async (client) => {
        // All members must be real, active users
        if (memberIds.length) {
            const users = await client.query(
                `SELECT id FROM users WHERE id = ANY($1::uuid[]) AND is_active = TRUE`,
                [memberIds]
            );
            if (users.rows.length !== memberIds.length) {
                const error = new Error(
                    'One or more members were not found or are inactive.'
                );
                error.statusCode = 404;
                throw error;
            }
        }

        const insert = await client.query(
            `INSERT INTO projects
                (name, description, created_by, updated_by)
             VALUES ($1, $2, $3, $3)
             RETURNING id, name, description, created_by,
                       created_at, updated_at, updated_by`,
            [String(name).trim(), description, actorUserId]
        );

        const project = insert.rows[0];

        // Insert members (creator is automatically a member)
        const allMembers = [...new Set([actorUserId, ...memberIds])];

        await client.query(
            `INSERT INTO project_members (project_id, user_id)
             SELECT $1, UNNEST($2::uuid[])
             ON CONFLICT (project_id, user_id) DO NOTHING`,
            [project.id, allMembers]
        );

        const [hydrated] = await hydrateProjects([project]);
        return hydrated;
    });
};

// ============================================================================
// LIST
// ============================================================================

const listProjects = async (filters = {}, pagination = {}) => {
    const { search = null, member_id = null } = filters;

    const limit = Math.min(Math.max(Number(pagination.limit) || 20, 1), 100);
    const page = Math.max(Number(pagination.page) || 1, 1);
    const offset = (page - 1) * limit;

    const conditions = [];
    const params = [];

    if (search) {
        params.push(`%${String(search).trim().toLowerCase()}%`);
        conditions.push(
            `(LOWER(p.name) LIKE $${params.length} OR LOWER(COALESCE(p.description, '')) LIKE $${params.length})`
        );
    }

    if (member_id) {
        requireUUID(member_id, 'Member ID');
        params.push(member_id);
        conditions.push(
            `EXISTS (SELECT 1 FROM project_members pm
                     WHERE pm.project_id = p.id AND pm.user_id = $${params.length})`
        );
    }

    const whereClause = conditions.length
        ? `WHERE ${conditions.join(' AND ')}`
        : '';

    const countResult = await query(
        `SELECT COUNT(*)::int AS total FROM projects p ${whereClause}`,
        params
    );
    const total = countResult.rows[0]?.total || 0;

    const listParams = [...params, limit, offset];
    const listResult = await query(
        `SELECT p.id, p.name, p.description, p.created_by,
                p.created_at, p.updated_at, p.updated_by
         FROM projects p
         ${whereClause}
         ORDER BY p.created_at DESC
         LIMIT $${listParams.length - 1}
         OFFSET $${listParams.length}`,
        listParams
    );

    const hydrated = await hydrateProjects(listResult.rows);

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
// GET ONE
// ============================================================================

const getProjectById = async (projectId) => {
    requireUUID(projectId, 'Project ID');

    const result = await query(
        `SELECT p.id, p.name, p.description, p.created_by,
                p.created_at, p.updated_at, p.updated_by
         FROM projects p
         WHERE p.id = $1
         LIMIT 1`,
        [projectId]
    );

    if (!result.rows.length) return null;
    const [project] = await hydrateProjects(result.rows);
    return project;
};

// ============================================================================
// LIST MEMBERS OF A PROJECT
// ============================================================================

const listProjectMembers = async (projectId, filters = {}) => {
    requireUUID(projectId, 'Project ID');

    const { search = null } = filters;

    const params = [projectId];
    let searchClause = '';

    if (search) {
        params.push(`%${String(search).trim().toLowerCase()}%`);
        searchClause = `
            AND (
                LOWER(u.email) LIKE $${params.length}
                OR LOWER(COALESCE(s.full_name, '')) LIKE $${params.length}
            )`;
    }

    const result = await query(
        `SELECT u.id AS user_id, u.email,
                s.staff_id, s.full_name, s.first_name, s.last_name,
                pm.created_at AS joined_at
         FROM project_members pm
         JOIN users u ON u.id = pm.user_id
         LEFT JOIN staffs s ON s.user_id = u.id
         WHERE pm.project_id = $1
         ${searchClause}
         ORDER BY COALESCE(s.full_name, u.email) ASC`,
        params
    );

    return result.rows.map((m) => ({
        user_id: m.user_id,
        email: m.email,
        staff_id: m.staff_id,
        first_name: m.first_name,
        last_name: m.last_name,
        full_name:
            m.full_name ||
            [m.first_name, m.last_name].filter(Boolean).join(' ') ||
            m.email,
        joined_at: m.joined_at
    }));
};

// ============================================================================
// UPDATE
// ============================================================================

const updateProject = async (projectId, payload, actorUserId) => {
    requireUUID(projectId, 'Project ID');
    requireUUID(actorUserId, 'Actor user ID');

    const { name, description, member_ids } = payload;

    if (name !== undefined) requireValue(name, 'Project name');

    const normalizedMembers = member_ids !== undefined ? normalizeUUIDArray(member_ids, 'Member IDs') : null;

    return withTransaction(async (client) => {
        // 1. Get the project to ensure it exists and grab the creator ID
        const existing = await client.query(
            `SELECT id, created_by FROM projects WHERE id = $1 FOR UPDATE`,
            [projectId]
        );
        if (!existing.rows.length) {
            const error = new Error('Project not found.');
            error.statusCode = 404;
            throw error;
        }
        
        const creatorId = existing.rows[0].created_by;

        // 2. Validate members if being replaced (and array is not empty)
        if (normalizedMembers && normalizedMembers.length > 0) {
            const users = await client.query(
                `SELECT id FROM users WHERE id = ANY($1::uuid[]) AND is_active = TRUE`,
                [normalizedMembers]
            );
            if (users.rows.length !== normalizedMembers.length) {
                const error = new Error(
                    'One or more members were not found or are inactive.'
                );
                error.statusCode = 404;
                throw error;
            }
        }

        // 3. Update Project Fields (Name/Description)
        const sets = [];
        const params = [];
        const push = (col, val) => {
            params.push(val);
            sets.push(`${col} = $${params.length}`);
        };

        if (name !== undefined) push('name', String(name).trim());
        if (description !== undefined) push('description', description);

        params.push(actorUserId);
        sets.push(`updated_by = $${params.length}`);
        sets.push('updated_at = NOW()');

        params.push(projectId);
        const updateResult = await client.query(
            `UPDATE projects
             SET ${sets.join(', ')}
             WHERE id = $${params.length}
             RETURNING id, name, description, created_by,
                       created_at, updated_at, updated_by`,
            params
        );

        const project = updateResult.rows[0];

        // 4. Replace Members (The part that was failing)
        if (normalizedMembers !== null) {
            // DELETE all current members for this project
            await client.query(
                `DELETE FROM project_members WHERE project_id = $1`,
                [projectId]
            );

            // Ensure the creator is always included in the final list
            const finalMembers = [...new Set([creatorId, ...normalizedMembers])].filter(Boolean);

            // INSERT the new members one by one (safest way to handle arrays)
            for (const memberId of finalMembers) {
                await client.query(
                    `INSERT INTO project_members (project_id, user_id)
                     VALUES ($1, $2)
                     ON CONFLICT (project_id, user_id) DO NOTHING`,
                    [projectId, memberId]
                );
            }
        }

        // 5. Re-hydrate the project to return the fresh state
        const [hydrated] = await hydrateProjects([project], client);
        return hydrated;
    });
};


// ============================================================================
// LIST ALL STAFF (searchable, optionally excluding some user IDs)
// ============================================================================

const getAllStaff = async (filters = {}) => {
    const {
        search = null,
        exclude_ids = [],      // user IDs to skip (e.g. already assigned)
        limit = 50,
    } = filters;

    const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 100);

    const params = [];
    const conditions = ['u.is_active = TRUE'];

    if (search && String(search).trim()) {
        params.push(`%${String(search).trim().toLowerCase()}%`);
        conditions.push(
            `(
                LOWER(u.email) LIKE $${params.length}
                OR LOWER(COALESCE(s.full_name, '')) LIKE $${params.length}
                OR LOWER(COALESCE(s.staff_id, '')) LIKE $${params.length}
            )`
        );
    }

    if (Array.isArray(exclude_ids) && exclude_ids.length) {
        // Validate before embedding into the query
        const clean = exclude_ids.map((id) => requireUUID(id, 'Exclude ID'));
        params.push(clean);
        conditions.push(`u.id <> ALL($${params.length}::uuid[])`);
    }

    params.push(safeLimit);

    const result = await query(
        `SELECT u.id AS user_id, u.email, u.user_type,
                s.staff_id, s.first_name, s.middle_name, s.last_name,
                s.full_name, s.title, s.employment_status
         FROM users u
         LEFT JOIN staffs s ON s.user_id = u.id
         WHERE ${conditions.join(' AND ')}
         ORDER BY COALESCE(s.full_name, u.email) ASC
         LIMIT $${params.length}`,
        params
    );

    return result.rows.map((r) => ({
        user_id: r.user_id,
        email: r.email,
        user_type: r.user_type,
        staff_id: r.staff_id,
        first_name: r.first_name,
        middle_name: r.middle_name,
        last_name: r.last_name,
        full_name:
            r.full_name ||
            [r.first_name, r.last_name].filter(Boolean).join(' ') ||
            r.email,
        title: r.title,
        employment_status: r.employment_status,
    }));
};


// ============================================================================
// DELETE PROJECT
// ============================================================================
const deleteProject = async (projectId) => {
    requireUUID(projectId, 'Project ID');

    const result = await query(
        `DELETE FROM projects 
         WHERE id = $1 
         RETURNING id`,
        [projectId]
    );

    if (!result.rows.length) {
        const error = new Error('Project not found.');
        error.statusCode = 404;
        throw error;
    }

    return true;
};

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
    createProject,
    listProjects,
    getProjectById,
    listProjectMembers,
    updateProject,
    getAllStaff,
    deleteProject
};