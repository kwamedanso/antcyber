const { query, startTransaction } = require('../../utils/database/connection');

/**
 * Reusable transaction helper
 */
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
            console.error('[Auth Mutation] Rollback failed:', rollbackError);
        }
        throw error;
    }
};

// ==========================================
// ROLES
// ==========================================

/**
 * Create a new role
 */
const createRole = async (data, createdBy) => {
    const sql = `
        INSERT INTO roles (name, display_name, is_active, updated_by)
        VALUES ($1, $2, $3, $4)
        RETURNING *
    `;
    
    try {
        const { rows } = await query(sql, [
            data.name, 
            data.display_name, 
            data.is_active ?? true, 
            createdBy
        ]);
        return rows[0];
    } catch (error) {
        // Catch Postgres Unique Violation (23505) for name or display_name
        if (error.code === '23505') {
            const customError = new Error('A role with this name or display name already exists.');
            customError.statusCode = 409;
            customError.code = 'ROLE_EXISTS';
            throw customError;
        }
        throw error;
    }
};

/**
 * Sync permissions to a role (Replace existing permissions with new list)
 */
const syncRolePermissions = async (roleId, permissionIds = [], updatedBy) => {
    return withTransaction(async (client) => {
        // 1. Verify the role exists
        const roleCheck = await client.query('SELECT id FROM roles WHERE id = $1', [roleId]);
        if (roleCheck.rows.length === 0) {
            const error = new Error('Role not found.');
            error.statusCode = 404;
            error.code = 'ROLE_NOT_FOUND';
            throw error;
        }

        // 2. Update the role's timestamp and updater
        await client.query(
            'UPDATE roles SET updated_at = CURRENT_TIMESTAMP, updated_by = $1 WHERE id = $2',
            [updatedBy, roleId]
        );

        // 3. Delete all existing permissions for this role
        await client.query('DELETE FROM role_permissions WHERE role_id = $1', [roleId]);

        // 4. Insert the new permissions
        if (permissionIds && permissionIds.length > 0) {
            // Build a bulk insert query: VALUES ($1, $2), ($1, $3), ...
            const params = [roleId];
            const placeholders = permissionIds.map((permId, index) => {
                params.push(permId);
                return `($1, $${index + 2})`;
            }).join(', ');

            const insertSql = `
                INSERT INTO role_permissions (role_id, permission_id)
                VALUES ${placeholders}
                ON CONFLICT DO NOTHING
            `;

            try {
                await client.query(insertSql, params);
            } catch (error) {
                // Catch Postgres Foreign Key Violation (23503) if an invalid permission_id is passed
                if (error.code === '23503') {
                    const customError = new Error('One or more of the provided permissions are invalid.');
                    customError.statusCode = 400;
                    customError.code = 'INVALID_PERMISSIONS';
                    throw customError;
                }
                throw error;
            }
        }

        // 5. Fetch and return the updated list of permissions for the frontend cache
        const finalResult = await client.query(`
            SELECT p.* 
            FROM permissions p
            JOIN role_permissions rp ON p.id = rp.permission_id
            WHERE rp.role_id = $1
            ORDER BY p.module ASC, p.resource ASC
        `, [roleId]);

        return finalResult.rows;
    });
};

module.exports = {
    createRole,
    syncRolePermissions,
};