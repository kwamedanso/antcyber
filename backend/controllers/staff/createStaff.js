// controllers/staff/createStaff.js
const { createStaff } = require('../../services/staff/staff.service');

const createStaffController = async (req, res, next) => {
    try {
        const result = await createStaff(req.body, {
            actor_user_id: req.user.userId
        });

        return res.status(201).json({
            message: 'Staff created successfully.',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { createStaffController };