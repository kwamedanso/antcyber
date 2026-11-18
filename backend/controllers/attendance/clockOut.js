// controllers/attendance/clockOut.js
const { clockOut } = require('../../services/attendance/attendance.service');

const clockOutController = async (req, res, next) => {
    try {
        const { id } = req.params; // attendance_id
        const record = await clockOut(id, req.body, req.user.userId);
        return res.status(200).json({ message: 'Clocked out successfully.', data: record });
    } catch (error) {
        next(error);
    }
};
module.exports = { clockOutController };