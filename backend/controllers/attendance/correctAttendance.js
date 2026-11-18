// controllers/attendance/correctAttendance.js
const { correctAttendance } = require('../../services/attendance/attendance.service');

const correctAttendanceController = async (req, res, next) => {
    try {
        const record = await correctAttendance(req.params.id, req.body, req.user.userId);
        return res.status(200).json({ message: 'Attendance corrected successfully.', data: record });
    } catch (error) {
        next(error);
    }
};
module.exports = { correctAttendanceController };