const bcrypt = require('bcryptjs');
const { query } = require('../../utils/database/connection');
const { userQueries } = require('../../utils/database/queries');
const { validateRegistration } = require('../../utils/validators');


// Register new user
async function register(req, res, next) {

    // return res.json({
    //     success: true,
    //     message: 'User registered successfully',
    //     data: {
    //         user: {
    //             id: 1,
    //             name: req.body.name,
    //             email: req.body.email,
    //             role: req.body.role,
    //             created_at: new Date().toISOString()
    //         }
    //     }
    // })


    // Destructure all required fields from the request body
    const { name, email, password, role } = req.body;

    // --- The Required Fields Validation ---
    if (!name || !email || !password || !role) {
        return res.status(400).json({
            success: false,
            'message': 'All profile fields are required.'
        });
    }


    try {

        // Validate input
        const validation = validateRegistration({ name, email, password, role });

        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }


        // Check if user already exists
        const existingUser = await query(userQueries.findUserByEmail, [email]);
        if (existingUser.rows[0]) {
            return res.status(409).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Hash password
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(password, saltRounds);


        // Create user
        const newUser = await query(userQueries.createUser, [
            name, email, passwordHash, role
        ]);

        const user = newUser.rows[0];

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    created_at: user.created_at
                }
            }
        });

    } catch (error) {
        console.error('Registration error:', error);

        // Database connection errors
        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
            return res.status(503).json({
                success: false,
                message: 'Service temporarily unavailable. Please try again later.'
            });
        }

        // Database query errors
        if (error.code === '23505') { // PostgreSQL unique violation
            return res.status(409).json({
                success: false,
                message: 'A user with this email already exists.'
            });
        }

        if (error.code === '23502') { // PostgreSQL not null violation
            return res.status(400).json({
                success: false,
                message: 'Required field missing in database operation.'
            });
        }

        if (error.code && error.code.startsWith('23')) { // Other PostgreSQL constraint violations
            return res.status(400).json({
                success: false,
                message: 'Database constraint violation. Please check your input data.'
            });
        }

        // Password hashing errors
        if (error.message.includes('password') || error.message.includes('hash')) {
            return res.status(500).json({
                success: false,
                message: 'Error processing password. Please try again.'
            });
        }

        // General database errors
        if (error.code && error.code.startsWith('XX') || error.severity === 'ERROR') {
            return res.status(500).json({
                success: false,
                message: 'Database error occurred. Please try again later.'
            });
        }

        // Rate limiting or other service errors
        if (error.status === 429) {
            return res.status(429).json({
                success: false,
                message: 'Too many registration attempts. Please try again later.'
            });
        }

        // Fallback for unexpected errors
        return res.status(500).json({
            success: false,
            message: 'An unexpected error occurred during registration. Please try again.'
        });
    }
}

module.exports = register;