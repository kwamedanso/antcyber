// controllers/staff/updateStaff.js
const { updateStaff } = require('../../services/staff/staff.service');

const updateStaffController = async (req, res, next) => {
    try {
        const { id } = req.params;

        const staff = await updateStaff(id, req.body, {
            actor_user_id: req.user.userId
        });

        return res.status(200).json({
            message: 'Staff updated successfully.',
            data: staff
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { updateStaffController };