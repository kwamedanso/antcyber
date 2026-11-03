// controllers/staff/deleteStaff.js
const { deleteStaff } = require('../../services/staff/staff.service');

const deleteStaffController = async (req, res, next) => {
    try {
        const { id } = req.params;

        await deleteStaff(id, req.user.id);

        return res.status(200).json({
            message: 'Staff deleted successfully.'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { deleteStaffController };