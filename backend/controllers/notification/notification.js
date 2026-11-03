// controllers/notification/notification.controller.js
const { 
    getUserNotifications, 
    getUnreadCount, 
    markAsRead, 
    markAllAsRead 
} = require('../../services/notification/notification.service');

const getNotifications = async (req, res, next) => {
    try {
        const notifications = await getUserNotifications(req.user.userId, 20);
        const unreadCount = await getUnreadCount(req.user.userId);

        return res.status(200).json({
            message: 'Notifications retrieved successfully.',
            data: {
                unreadCount,
                notifications
            }
        });
    } catch (error) {
        next(error);
    }
};

const readNotification = async (req, res, next) => {
    console.log(req.params)
    try {
        const success = await markAsRead(req.params.id, req.user.userId);
        if (!success) return res.status(404).json({ message: 'Notification not found.' });
        
        return res.status(200).json({ message: 'Notification marked as read.' });
    } catch (error) {
        next(error);
    }
};

const readAllNotifications = async (req, res, next) => {
    try {
        await markAllAsRead(req.user.userId);
        return res.status(200).json({ message: 'All notifications marked as read.' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getNotifications,
    readNotification,
    readAllNotifications
};