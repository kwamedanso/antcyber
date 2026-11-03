// task.service.js
const { query, startTransaction } = require('../../utils/database/connection');
const { createNotification } = require('../notification/notification.service');


// ============================================================================
// CONSTANTS
// ============================================================================

const VALID_PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const VALID_STATUSES = ['todo', 'in_progress', 'blocked', 'done', 'cancelled'];

// ============================================================================
// HELPERS (mirrors auth/staff service conventions)
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
            console.error('[Task Service] Rollback failed:', rollbackError);
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

const normalizeDateOnly = (value, fieldName) => {
    requireValue(value, fieldName);
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) {
        const error = new Error(`${fieldName} is not a valid date.`);
        error.statusCode = 400;
        throw error;
    }
    return d.toISOString().slice(0, 10); // YYYY-MM-DD
};

// ============================================================================
// SEARCH INDEX
// ============================================================================

const upsertTaskSearchIndex = async (client, task) => {
    const searchText = [
        task.title,
        task.description,
        task.priority,
        task.status
    ]
        .filter((p) => p !== undefined && p !== null && p !== '')
        .join(' ')
        .toLowerCase();

    await client.query(
        `INSERT INTO task_search_index
            (entity_id, search_text, search_vector, is_active, updated_at)
         VALUES ($1, $2, to_tsvector('simple', $2), TRUE, NOW())
         ON CONFLICT (entity_id) DO UPDATE
            SET search_text   = EXCLUDED.search_text,
                search_vector = EXCLUDED.search_vector,
                is_active     = TRUE,
                updated_at    = NOW()`,
        [task.id, searchText]
    );
};

// ============================================================================
// HYDRATION — attach assignees, project, creator to a task row
// ============================================================================

const hydrateTasks = async (rows) => {
    if (!rows.length) return [];

    const taskIds = rows.map((r) => r.id);

    const assigneesResult = await query(
        `SELECT ta.task_id, u.id AS user_id, u.email,
                s.full_name, s.first_name, s.last_name
         FROM task_assignees ta
         JOIN users u ON u.id = ta.user_id
         LEFT JOIN staffs s ON s.user_id = u.id
         WHERE ta.task_id = ANY($1::uuid[])`,
        [taskIds]
    );

    const byTask = new Map();

    for (const a of assigneesResult.rows) {
        if (!byTask.has(a.task_id)) byTask.set(a.task_id, []);
        byTask.get(a.task_id).push({
            user_id: a.user_id,
            email: a.email,
            full_name:
                a.full_name ||
                [a.first_name, a.last_name].filter(Boolean).join(' ') ||
                a.email
        });
    }

    return rows.map((r) => ({
        ...r,
        assignees: byTask.get(r.id) || []
    }));
};

// ============================================================================
// CREATE
// ============================================================================

const createTask = async (payload, actorUserId) => {
    const {
        project_id,
        assignee_ids,
        due_date,
        priority = 'medium',
        title,
        description
    } = payload;

    requireUUID(project_id, 'Project ID');
    requireUUID(actorUserId, 'Actor user ID');
    requireValue(title, 'Title');
    requireValue(description, 'Description');
    requireValue(due_date, 'Due date');

    if (!VALID_PRIORITIES.includes(priority)) {
        const error = new Error('Invalid priority.');
        error.statusCode = 400;
        throw error;
    }

    const normalizedDueDate = normalizeDateOnly(due_date, 'Due date');
    const assigneeIds = normalizeUUIDArray(assignee_ids || [], 'Assignee IDs');

    if (!assigneeIds.length) {
        const error = new Error('At least one assignee is required.');
        error.statusCode = 400;
        throw error;
    }

    return withTransaction(async (client) => {
        // Project must exist
        const project = await client.query(
            `SELECT id FROM projects WHERE id = $1 LIMIT 1`,
            [project_id]
        );
        if (!project.rows.length) {
            const error = new Error('Project not found.');
            error.statusCode = 404;
            throw error;
        }

        // Every assignee must be a real, active user
        const users = await client.query(
            `SELECT id FROM users WHERE id = ANY($1::uuid[]) AND is_active = TRUE`,
            [assigneeIds]
        );
        if (users.rows.length !== assigneeIds.length) {
            const error = new Error('One or more assignees were not found or are inactive.');
            error.statusCode = 404;
            throw error;
        }

        // Insert the task
        const taskInsert = await client.query(
            `INSERT INTO tasks
                (project_id, title, description, due_date, priority,
                 status, created_by, updated_by)
             VALUES ($1, $2, $3, $4, $5, 'todo', $6, $6)
             RETURNING id, project_id, title, description, due_date, priority,
                       status, created_by, completed_at, created_at, updated_at`,
            [
                project_id,
                String(title).trim(),
                String(description).trim(),
                normalizedDueDate,
                priority,
                actorUserId
            ]
        );

        const task = taskInsert.rows[0];

        // Insert assignees
        await client.query(
            `INSERT INTO task_assignees (task_id, user_id)
             SELECT $1, UNNEST($2::uuid[])`,
            [task.id, assigneeIds]
        );

        for (const assigneeId of assigneeIds) {
            if (assigneeId !== actorUserId) {
                await createNotification({
                    userId: assigneeId,
                    actorId: actorUserId,
                    type: 'task_assigned',
                    title: 'New Task Assigned',
                    message: `You have been assigned a new task: "${title}".`,
                    link: `/admin/tasks/${task.id}`,
                    entityType: 'task',
                    entityId: task.id
                });
            }
        }

        // Search index
        await upsertTaskSearchIndex(client, task);

        // Hydrate for the response
        const [hydrated] = await hydrateTasks([task]);
        return hydrated;
    });
};

// ============================================================================
// LIST
// ============================================================================

const listTasks = async (filters = {}, pagination = {}) => {
    const {
        project_id = null,
        assignee_id = null,
        status = null,
        priority = null,
        search = null,
        created_by = null
    } = filters;

    const limit = Math.min(Math.max(Number(pagination.limit) || 20, 1), 100);
    const page = Math.max(Number(pagination.page) || 1, 1);
    const offset = (page - 1) * limit;

    const conditions = [];
    const params = [];

    if (project_id) {
        requireUUID(project_id, 'Project ID');
        params.push(project_id);
        conditions.push(`t.project_id = $${params.length}`);
    }

    if (assignee_id) {
        requireUUID(assignee_id, 'Assignee ID');
        params.push(assignee_id);
        conditions.push(
            `EXISTS (SELECT 1 FROM task_assignees ta
                     WHERE ta.task_id = t.id AND ta.user_id = $${params.length})`
        );
    }

    if (created_by) {                          
        requireUUID(created_by, 'Creator ID');
        params.push(created_by);
        conditions.push(`t.created_by = $${params.length}`);
    }

    if (status) {
        if (!VALID_STATUSES.includes(status)) {
            const error = new Error('Invalid status filter.');
            error.statusCode = 400;
            throw error;
        }
        params.push(status);
        conditions.push(`t.status = $${params.length}`);
    }

    if (priority) {
        if (!VALID_PRIORITIES.includes(priority)) {
            const error = new Error('Invalid priority filter.');
            error.statusCode = 400;
            throw error;
        }
        params.push(priority);
        conditions.push(`t.priority = $${params.length}`);
    }

    if (search) {
        params.push(`%${String(search).trim().toLowerCase()}%`);
        conditions.push(
            `(LOWER(t.title) LIKE $${params.length} OR LOWER(t.description) LIKE $${params.length})`
        );
    }

    const whereClause = conditions.length
        ? `WHERE ${conditions.join(' AND ')}`
        : '';

    // Count (same WHERE + params, no LIMIT/OFFSET)
    const countResult = await query(
        `SELECT COUNT(*)::int AS total FROM tasks t ${whereClause}`,
        params
    );
    const total = countResult.rows[0]?.total || 0;

    // Page of rows
    const listParams = [...params, limit, offset];
    const listResult = await query(
        `SELECT t.id, t.project_id, p.name AS project_name,
                t.title, t.description, t.due_date, t.priority, t.status,
                t.created_by, t.completed_at, t.created_at, t.updated_at, t.updated_by
         FROM tasks t
         JOIN projects p ON p.id = t.project_id
         ${whereClause}
         ORDER BY
            CASE t.priority
                WHEN 'urgent' THEN 1
                WHEN 'high'   THEN 2
                WHEN 'medium' THEN 3
                WHEN 'low'    THEN 4
                ELSE 5
            END,
            t.due_date ASC,
            t.created_at DESC
         LIMIT $${listParams.length - 1}
         OFFSET $${listParams.length}`,
        listParams
    );

    const hydrated = await hydrateTasks(listResult.rows);

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

const getTaskById = async (taskId) => {
    requireUUID(taskId, 'Task ID');

    const result = await query(
        `SELECT t.id, t.project_id, p.name AS project_name,
                t.title, t.description, t.due_date, t.priority, t.status,
                t.created_by, t.completed_at, t.created_at, t.updated_at, t.updated_by
         FROM tasks t
         JOIN projects p ON p.id = t.project_id
         WHERE t.id = $1
         LIMIT 1`,
        [taskId]
    );

    if (!result.rows.length) return null;
    const [task] = await hydrateTasks(result.rows);
    return task;
};

// ============================================================================
// UPDATE
// ============================================================================

const updateTask = async (taskId, payload, actorUserId) => {
    requireUUID(taskId, 'Task ID');
    requireUUID(actorUserId, 'Actor user ID');

    const {
        project_id,
        assignee_ids,
        due_date,
        priority,
        title,
        description,
        status
    } = payload;

    // Validate whatever fields were supplied (PATCH semantics)
    if (priority !== undefined && !VALID_PRIORITIES.includes(priority)) {
        const error = new Error('Invalid priority.');
        error.statusCode = 400;
        throw error;
    }
    if (status !== undefined && !VALID_STATUSES.includes(status)) {
        const error = new Error('Invalid status.');
        error.statusCode = 400;
        throw error;
    }
    if (project_id !== undefined) requireUUID(project_id, 'Project ID');
    if (title !== undefined) requireValue(title, 'Title');
    if (description !== undefined) requireValue(description, 'Description');

    const normalizedDueDate =
        due_date !== undefined ? normalizeDateOnly(due_date, 'Due date') : null;

    const normalizedAssignees =
        assignee_ids !== undefined
            ? normalizeUUIDArray(assignee_ids, 'Assignee IDs')
            : null;

    if (normalizedAssignees !== null && normalizedAssignees.length === 0) {
        const error = new Error('At least one assignee is required.');
        error.statusCode = 400;
        throw error;
    }

    return withTransaction(async (client) => {
        const existing = await client.query(
            `SELECT id, status, completed_at
             FROM tasks
             WHERE id = $1
             FOR UPDATE`,
            [taskId]
        );

        if (!existing.rows.length) {
            const error = new Error('Task not found.');
            error.statusCode = 404;
            throw error;
        }

        // Build the dynamic UPDATE
        const sets = [];
        const params = [];

        const push = (column, value) => {
            params.push(value);
            sets.push(`${column} = $${params.length}`);
        };

        if (project_id !== undefined) push('project_id', project_id);
        if (title !== undefined) push('title', String(title).trim());
        if (description !== undefined) push('description', String(description).trim());
        if (normalizedDueDate !== null) push('due_date', normalizedDueDate);
        if (priority !== undefined) push('priority', priority);

        if (status !== undefined) {
            push('status', status);
            // Stamp completed_at when transitioning to 'done', clear it otherwise.
            if (status === 'done') {
                params.push(new Date().toISOString());
                sets.push(`completed_at = $${params.length}`);
            } else {
                sets.push('completed_at = NULL');
            }
        }

        // Always stamp updated_at / updated_by
        params.push(actorUserId);
        sets.push(`updated_by = $${params.length}`);
        sets.push('updated_at = NOW()');

        // Validate new project / assignees exist if they're being changed
        if (project_id !== undefined) {
            const p = await client.query(
                `SELECT id FROM projects WHERE id = $1 LIMIT 1`,
                [project_id]
            );
            if (!p.rows.length) {
                const error = new Error('Project not found.');
                error.statusCode = 404;
                throw error;
            }
        }

        if (normalizedAssignees !== null && normalizedAssignees.length) {
            const u = await client.query(
                `SELECT id FROM users
                 WHERE id = ANY($1::uuid[]) AND is_active = TRUE`,
                [normalizedAssignees]
            );
            if (u.rows.length !== normalizedAssignees.length) {
                const error = new Error('One or more assignees were not found or are inactive.');
                error.statusCode = 404;
                throw error;
            }
        }

        params.push(taskId);
        const updateResult = await client.query(
            `UPDATE tasks
             SET ${sets.join(', ')}
             WHERE id = $${params.length}
             RETURNING id, project_id, title, description, due_date, priority,
                       status, created_by, completed_at, created_at, updated_at`,
            params
        );

        const task = updateResult.rows[0];

        // Replace assignees if supplied
        if (normalizedAssignees !== null) {
            await client.query(
                `DELETE FROM task_assignees WHERE task_id = $1`,
                [taskId]
            );
            if (normalizedAssignees.length) {
                await client.query(
                    `INSERT INTO task_assignees (task_id, user_id)
                     SELECT $1, UNNEST($2::uuid[])`,
                    [taskId, normalizedAssignees]
                );
            }
        }

        await upsertTaskSearchIndex(client, task);

        const [hydrated] = await hydrateTasks([task]);
        return hydrated;
    });
};

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
    createTask,
    listTasks,
    getTaskById,
    updateTask
};