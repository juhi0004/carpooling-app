const notificationService = require('../services/notificationService');

class NotificationController {
  // Get notifications
  async getNotifications(req, res) {
    try {
      const { page, limit, isRead } = req.query;

      const result = await notificationService.getNotifications(req.user.id, {
        page,
        limit,
        isRead: isRead === 'true' ? true : isRead === 'false' ? false : undefined,
      });

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get unread count
  async getUnreadCount(req, res) {
    try {
      const count = await notificationService.getUnreadCount(req.user.id);

      res.status(200).json({
        success: true,
        unreadCount: count,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Mark as read
  async markAsRead(req, res) {
    try {
      const { id } = req.params;

      const notification = await notificationService.markAsRead(id, req.user.id);

      res.status(200).json({
        success: true,
        message: 'Notification marked as read',
        notification,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Mark all as read
  async markAllAsRead(req, res) {
    try {
      const result = await notificationService.markAllAsRead(req.user.id);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Delete notification
  async deleteNotification(req, res) {
    try {
      const { id } = req.params;

      const result = await notificationService.deleteNotification(id, req.user.id);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Register device token
  async registerDeviceToken(req, res) {
    try {
      const { token, platform } = req.body;

      if (!token || !platform) {
        return res.status(400).json({
          success: false,
          message: 'Token and platform required',
        });
      }

      const result = await notificationService.registerDeviceToken(
        req.user.id,
        token,
        platform
      );

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new NotificationController();
