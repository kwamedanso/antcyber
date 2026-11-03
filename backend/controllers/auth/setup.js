// controllers/auth/setup.controller.js
const { createSuperAdmin } = require('../../services/setup/setup.service');

const setupSuperAdmin = async (req, res, next) => {
    try {
        const { email, password, first_name, last_name } = req.body;

        if (!email || !password || !first_name || !last_name) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const user = await createSuperAdmin({
            email,
            password,
            first_name,
            last_name
        });

        return res.status(201).json({
            message: 'Super Admin created successfully. You can now log in.',
            data: user
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { setupSuperAdmin };