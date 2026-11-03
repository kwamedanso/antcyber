// controllers/staff/listStaff.js
const { listStaff } = require('../../services/staff/staff.service');

const listStaffController = async (req, res, next) => {
    try {
        const { 
            page, 
            limit, 
            search, 
            employment_status, 
            user_type, 
            is_active 
        } = req.query;

        const result = await listStaff(
            { search, employment_status, user_type, is_active },
            { page, limit }
        );

        return res.status(200).json({
            message: 'Staff retrieved successfully.',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { listStaffController };