// controllers/attendance/getActiveAttendance.js
const { getActiveAttendance } = require('../../services/attendance/attendance.service');

const getActiveAttendanceController = async (req, res, next) => {
    try {
        const records = await getActiveAttendance();
        return res.status(200).json({
            message: 'Active attendance records retrieved.',
            data: records
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getActiveAttendanceController };