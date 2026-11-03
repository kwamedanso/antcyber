const pool = require('../../config/database');

const query = async (text, params) => {
    try {
        const result = await pool.query(text, params);
        return result;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
};

const startTransaction = async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        return {
            client,
            commit: async () => {
                await client.query('COMMIT');
                client.release();
            },
            rollback: async () => {
                await client.query('ROLLBACK');
                client.release();
            }
        };
    } catch (error) {
        client.release();
        throw error;
    }
};

module.exports = {
    query,
    startTransaction
};