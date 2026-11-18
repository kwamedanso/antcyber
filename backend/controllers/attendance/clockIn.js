// controllers/attendance/clockIn.js
const { clockIn } = require('../../services/attendance/attendance.service');

const clockInController = async (req, res, next) => {
    try {
        // req.user.id is from your auth middleware
        const record = await clockIn(req.body, req.user.userId);
        return res.status(201).json({ message: 'Clocked in successfully.', data: record });
    } catch (error) {
        next(error);
    }
};
module.exports = { clockInController };