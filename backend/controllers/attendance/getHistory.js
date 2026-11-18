// controllers/attendance/getHistory.js
const { getAttendanceHistory } = require('../../services/attendance/attendance.service');

const getHistoryController = async (req, res, next) => {

    try {
        const { staff_id, page, limit, start_date, end_date } = req.query;

        const result = await getAttendanceHistory(
            { staff_id, start_date, end_date }, 
            { page, limit }
        );
        return res.status(200).json({ message: 'History retrieved.', data: result });
    } catch (error) {
        next(error);
    }
};
module.exports = { getHistoryController };