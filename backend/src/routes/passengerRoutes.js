const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  submitFeedback,
  getFeedbackList
} = require('../controllers/passengerController');
const { requireAuth, optionalAuth } = require('../middlewares/authMiddleware');

// Notifications
router.get('/notifications', requireAuth, getNotifications);
router.patch('/notifications/read-all', requireAuth, markAllNotificationsRead);
router.patch('/notifications/:id/read', requireAuth, markNotificationRead);

// Feedback
router.post('/feedback', optionalAuth, submitFeedback);
router.get('/feedback', optionalAuth, getFeedbackList);

module.exports = router;
