const express = require('express');
const router = express.Router();
const {authenticateToken} = require('../middleware/auth');
const { getNotifications, readNotification, readAllNotifications } = require('../controllers/notification/notification');

router.get('/', authenticateToken, getNotifications);
router.patch('/:id/read', authenticateToken, readNotification);
router.patch('/read-all', authenticateToken, readAllNotifications);

module.exports = router;