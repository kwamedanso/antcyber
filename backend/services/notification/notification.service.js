// services/notification/notification.service.js
const { query } = require('../../utils/database/connection');

// ============================================================================
// CREATE NOTIFICATION
// ============================================================================
const createNotification = async ({
    userId,
    actorId = null,
    type,
    title,
    message,
    link = null,
    entityType = null,
    entityId = null
}) => {
    const result = await query(
        `INSERT INTO notifications 
            (user_id, actor_id, type, title, message, link, entity_type, entity_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [userId, actorId, type, title, message, link, entityType, entityId]
    );
    return result.rows[0];
};

// ============================================================================
// GET USER NOTIFICATIONS
// ============================================================================
const getUserNotifications = async (userId, limit = 10) => {
    const result = await query(
        `SELECT * FROM notifications 
         WHERE user_id = $1 AND is_read = FALSE
         ORDER BY created_at DESC 
         LIMIT $2`,
        [userId, limit]
    );
    return result.rows;
};

// ============================================================================
// GET UNREAD COUNT (For the badge)
// ============================================================================
const getUnreadCount = async (userId) => {
    const result = await query(
        `SELECT COUNT(*)::int AS count 
         FROM notifications 
         WHERE user_id = $1 AND is_read = FALSE`,
        [userId]
    );
    return result.rows[0]?.count || 0;
};

// ============================================================================
// MARK AS READ
// ============================================================================
const markAsRead = async (notificationId, userId) => {
    const result = await query(
        `UPDATE notifications 
         SET is_read = TRUE, read_at = NOW() 
         WHERE id = $1 AND user_id = $2
         RETURNING id`,
        [notificationId, userId]
    );
    return result.rows.length > 0;
};

const markAllAsRead = async (userId) => {
    await query(
        `UPDATE notifications 
         SET is_read = TRUE, read_at = NOW() 
         WHERE user_id = $1 AND is_read = FALSE`,
        [userId]
    );
};

module.exports = {
    createNotification,
    getUserNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead
};