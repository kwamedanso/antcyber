// controllers/staff/getStaff.js
const { getStaffById } = require('../../services/staff/staff.service');

const getStaffController = async (req, res, next) => {
    try {
        const { id } = req.params; // Using staff_id (e.g., GTV-260001)

        const staff = await getStaffById(id);

        if (!staff) {
            return res.status(404).json({
                message: 'Staff not found.'
            });
        }

        return res.status(200).json({
            message: 'Staff retrieved successfully.',
            data: staff
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getStaffController };