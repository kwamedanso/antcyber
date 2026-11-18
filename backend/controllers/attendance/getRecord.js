// controllers/attendance/getRecord.js
const { getAttendanceById } = require('../../services/attendance/attendance.service');

const getRecordController = async (req, res, next) => {
    try {
        const record = await getAttendanceById(req.params.id);
        if (!record) return res.status(404).json({ message: 'Record not found.' });
        
        return res.status(200).json({ message: 'Record retrieved.', data: record });
    } catch (error) {
        next(error);
    }
};
module.exports = { getRecordController };