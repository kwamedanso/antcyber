// services/rbac/rbac.service.js
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

// Helper to format role names into URL-friendly slugs (e.g., "HR Manager" -> "hr-manager")
const slugify = (text) => {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
};

// ============================================================================
// PERMISSIONS
// ============================================================================

const getAllPermissions = async () => {
    const result = await query(
        `SELECT id, resource, action, display_name, category, description, module
         FROM permissions
         ORDER BY module, category, resource, action`
    );
    return result.rows;
};

// ============================================================================
// ROLES
// ============================================================================

const getAllRoles = async () => {
    const result = await query(
        `SELECT r.id, r.name, r.display_name, r.is_active, r.created_at,
                COUNT(rp.permission_id)::int AS permission_count
         FROM roles r
         LEFT JOIN role_permissions rp ON rp.role_id = r.id
         GROUP BY r.id
         ORDER BY r.name ASC`
    );
    return result.rows;
};

const getRoleById = async (roleId) => {
    requireUUID(roleId, 'Role ID');

    const roleResult = await query(
        `SELECT id, name, display_name, is_active, created_at, updated_at 
         FROM roles WHERE id = $1`,
        [roleId]
    );

    if (!roleResult.rows.length) return null;
    const role = roleResult.rows[0];

    const permissionsResult = await query(
        `SELECT p.id, p.resource, p.action, p.display_name 
         FROM role_permissions rp
         JOIN permissions p ON p.id = rp.permission_id
         WHERE rp.role_id = $1`,
        [roleId]
    );

    role.permissions = permissionsResult.rows;
    return role;
};

const createRole = async (payload, actorUserId) => {
    const { display_name, description, permission_ids = [] } = payload;
    requireValue(display_name, 'Role Display Name');
    requireUUID(actorUserId, 'Actor User ID');

    const name = slugify(display_name);

    return withTransaction(async (client) => {
        // Check for duplicates
        const existing = await client.query(
            `SELECT id FROM roles WHERE name = $1 OR display_name = $2`,
            [name, display_name]
        );
        if (existing.rows.length) {
            const error = new Error('A role with this name already exists.');
            error.statusCode = 409;
            throw error;
        }

        // Create Role
        const insertResult = await client.query(
            `INSERT INTO roles (name, display_name, is_active, updated_by)
             VALUES ($1, $2, TRUE, $3)
             RETURNING id, name, display_name, is_active, created_at`,
            [name, display_name, actorUserId]
        );
        const role = insertResult.rows[0];

        // Assign Permissions
        if (permission_ids.length > 0) {
            // Validate permissions exist
            const validPerms = await client.query(
                `SELECT id FROM permissions WHERE id = ANY($1::uuid[])`,
                [permission_ids]
            );
            if (validPerms.rows.length !== permission_ids.length) {
                const error = new Error('One or more permissions are invalid.');
                error.statusCode = 400;
                throw error;
            }

            for (const permId of permission_ids) {
                await client.query(
                    `INSERT INTO role_permissions (role_id, permission_id)
                     VALUES ($1, $2) ON CONFLICT DO NOTHING`,
                    [role.id, permId]
                );
            }
        }

        return await getRoleById(role.id);
    });
};

const updateRole = async (roleId, payload, actorUserId) => {
    requireUUID(roleId, 'Role ID');
    requireUUID(actorUserId, 'Actor User ID');

    const { display_name, is_active } = payload;

    return withTransaction(async (client) => {
        const existing = await client.query(`SELECT id FROM roles WHERE id = $1 FOR UPDATE`, [roleId]);
        if (!existing.rows.length) {
            const error = new Error('Role not found.');
            error.statusCode = 404;
            throw error;
        }

        const sets = [];
        const params = [];
        const push = (col, val) => {
            params.push(val);
            sets.push(`${col} = $${params.length}`);
        };

        if (display_name !== undefined) {
            push('display_name', display_name);
            push('name', slugify(display_name));
        }
        if (is_active !== undefined) push('is_active', is_active);

        params.push(actorUserId);
        sets.push(`updated_by = $${params.length}`);
        sets.push('updated_at = NOW()');

        params.push(roleId);
        await client.query(
            `UPDATE roles SET ${sets.join(', ')} WHERE id = $${params.length}`,
            params
        );

        return await getRoleById(roleId);
    });
};

const deleteRole = async (roleId) => {
    requireUUID(roleId, 'Role ID');

    return withTransaction(async (client) => {
        // Prevent deleting core roles if needed (e.g., 'admin')
        const role = await client.query(`SELECT name FROM roles WHERE id = $1`, [roleId]);
        if (role.rows[0]?.name === 'admin') {
            const error = new Error('The Admin role cannot be deleted.');
            error.statusCode = 403;
            throw error;
        }

        const result = await client.query(`DELETE FROM roles WHERE id = $1 RETURNING id`, [roleId]);
        if (!result.rows.length) {
            const error = new Error('Role not found.');
            error.statusCode = 404;
            throw error;
        }
        return true;
    });
};

// ============================================================================
// ROLE PERMISSIONS (Sync)
// ============================================================================

const updateRolePermissions = async (roleId, permissionIds, actorUserId) => {
    requireUUID(roleId, 'Role ID');
    requireUUID(actorUserId, 'Actor User ID');

    if (!Array.isArray(permissionIds)) {
        const error = new Error('permission_ids must be an array.');
        error.statusCode = 400;
        throw error;
    }

    return withTransaction(async (client) => {
        // 1. Delete all existing permissions for this role
        await client.query(`DELETE FROM role_permissions WHERE role_id = $1`, [roleId]);

        // 2. Insert new permissions
        if (permissionIds.length > 0) {
            // Validate permissions exist
            const validPerms = await client.query(
                `SELECT id FROM permissions WHERE id = ANY($1::uuid[])`,
                [permissionIds]
            );
            if (validPerms.rows.length !== permissionIds.length) {
                const error = new Error('One or more permissions are invalid.');
                error.statusCode = 400;
                throw error;
            }

            for (const permId of permissionIds) {
                await client.query(
                    `INSERT INTO role_permissions (role_id, permission_id)
                     VALUES ($1, $2) ON CONFLICT DO NOTHING`,
                    [roleId, permId]
                );
            }
        }

        // 3. Update role meta
        await client.query(
            `UPDATE roles SET updated_at = NOW(), updated_by = $1 WHERE id = $2`,
            [actorUserId, roleId]
        );

        return await getRoleById(roleId);
    });
};

// ============================================================================
// GET USER ROLES & PERMISSIONS
// ============================================================================
const getUserRoles = async (userId) => {
    const result = await query(
        `SELECT r.id, r.name, r.display_name
         FROM roles r
         JOIN user_roles ur ON ur.role_id = r.id
         WHERE ur.user_id = $1
         ORDER BY r.name`,
        [userId]
    );
    return result.rows;
};

const getUserPermissions = async (userId) => {
    const result = await query(
        `SELECT DISTINCT p.id 
         FROM permissions p
         WHERE (
             -- 1. Direct Permissions (Granted)
             p.id IN (
                 SELECT up.permission_id 
                 FROM user_permissions up 
                 WHERE up.user_id = $1 AND up.granted = TRUE
             )
             OR 
             -- 2. Role Permissions
             p.id IN (
                 SELECT rp.permission_id
                 FROM user_roles ur
                 JOIN role_permissions rp ON rp.role_id = ur.role_id
                 JOIN roles r ON r.id = ur.role_id
                 WHERE ur.user_id = $1 AND r.is_active = TRUE
             )
         )
         -- 3. Explicit Denies (Remove if granted = FALSE)
         AND p.id NOT IN (
             SELECT up.permission_id 
             FROM user_permissions up 
             WHERE up.user_id = $1 AND up.granted = FALSE
         )`,
        [userId]
    );
    return result.rows.map(row => row.id);
};

const getUserAccessDetails = async (userId) => {
    const roles = await getUserRoles(userId);
    const permissionIds = await getUserPermissions(userId);

    return {
        role_ids: roles.map(r => r.id),
        roles,
        permission_ids: permissionIds // Array of strings (UUIDs)
    };
};

module.exports = {
    getAllPermissions,
    getAllRoles,
    getRoleById,
    createRole,
    updateRole,
    deleteRole,
    updateRolePermissions,
    getUserAccessDetails,
    getUserPermissions,
    getUserRoles
};