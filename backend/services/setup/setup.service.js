// services/auth/setup.service.js
const bcrypt = require('bcrypt');
const { query, startTransaction } = require('../../utils/database/connection');

const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 12;

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

const createSuperAdmin = async ({ email, password, first_name, last_name }) => {
    // 1. Verify system is empty (Security check)
    const userCheck = await query(`SELECT id FROM users LIMIT 1`);
    if (userCheck.rows.length > 0) {
        const error = new Error('System is already set up. This route is disabled.');
        error.statusCode = 403;
        error.code = "SUPER_ADMIN_ALREADY_EXIST"
        throw error;
    }

    // 2. Hash password
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // 3. Create User & Staff in a transaction
    const result = await withTransaction(async (client) => {
        // Create User
        const userInsert = await client.query(
            `INSERT INTO users 
                (email, password_hash, user_type, is_active, must_change_password, email_verified_at)
             VALUES ($1, $2, 'employee', TRUE, FALSE, NOW())
             RETURNING id, email`,
            [email, passwordHash]
        );
        const user = userInsert.rows[0];

        // Generate a Staff ID (e.g., ADM-260001)
        const year = String(new Date().getFullYear()).slice(-2);
        const staffId = `ACE-001`;

        // Create Staff
        await client.query(
            `INSERT INTO staffs 
                (user_id, staff_id, first_name, last_name, employment_status)
             VALUES ($1, $2, $3, $4, 'active')`,
            [user.id, staffId, first_name, last_name]
        );

        // Assign Super Admin Role
        const roleResult = await client.query(`SELECT id FROM roles WHERE name = 'super_admin'`);
        if (roleResult.rows.length > 0) {
            await client.query(
                `INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)`,
                [user.id, roleResult.rows[0].id]
            );
        }

        return user;
    });

    return result;
};

module.exports = { createSuperAdmin };