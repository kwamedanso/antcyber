// routes/attendance.routes.js
const express = require('express');
const router = express.Router();
const {authenticateToken} = require('../middleware/auth');
// If you have an admin middleware, add it to the correction route
// const requireAdmin = require('../middleware/requireAdmin');

const { clockInController } = require('../controllers/attendance/clockIn');
const { clockOutController } = require('../controllers/attendance/clockOut');
const { getHistoryController } = require('../controllers/attendance/getHistory');
const { getRecordController } = require('../controllers/attendance/getRecord');
const { correctAttendanceController } = require('../controllers/attendance/correctAttendance');
const { getActiveAttendanceController } = require('../controllers/attendance/getActiveAttendance');

router.post('/clock-in', authenticateToken, clockInController);
router.patch('/clock-out/:id', authenticateToken, clockOutController);
router.get('/history', authenticateToken, getHistoryController);
router.get('/active', authenticateToken, getActiveAttendanceController); 

router.get('/:id', authenticateToken, getRecordController);

// This should be restricted to admins only
router.patch('/:id/correct', authenticateToken, correctAttendanceController);

module.exports = router;