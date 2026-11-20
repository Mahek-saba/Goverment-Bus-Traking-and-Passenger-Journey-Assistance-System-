const Notification = require('../models/Notification');
const Feedback = require('../models/Feedback');
const Bus = require('../models/Bus');
const Trip = require('../models/Trip');

/**
 * GET /api/passenger/notifications
 * Get notifications for current user (plus general system alerts)
 */
const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user ? req.user._id : null;
    let query = {};

    if (userId) {
      query = { user: userId };
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount,
      data: notifications
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/passenger/notifications/:id/read
 * Mark a single notification as read
 */
const markNotificationRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found.'
      });
    }

    notification.isRead = true;
    await notification.save();

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read.',
      data: notification
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/passenger/notifications/read-all
 * Mark all user notifications as read
 */
const markAllNotificationsRead = async (req, res, next) => {
  try {
    const userId = req.user._id;
    await Notification.updateMany({ user: userId, isRead: false }, { isRead: true });

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/passenger/feedback
 * Submit journey feedback or service review
 */
const submitFeedback = async (req, res, next) => {
  try {
    const { rating, message, busId, busNumber, tripId } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'A valid rating between 1 and 5 stars is required.'
      });
    }

    let resolvedBusId = null;
    if (busId) {
      resolvedBusId = busId;
    } else if (busNumber) {
      const foundBus = await Bus.findOne({ busNumber: busNumber.trim().toUpperCase() });
      if (foundBus) resolvedBusId = foundBus._id;
    }

    let resolvedTripId = null;
    if (tripId) {
      const foundTrip = await Trip.findOne({ tripId: String(tripId) });
      if (foundTrip) resolvedTripId = foundTrip._id;
    }

    const newFeedback = await Feedback.create({
      user: req.user ? req.user._id : null,
      bus: resolvedBusId,
      trip: resolvedTripId,
      rating: Number(rating),
      message: message ? message.trim() : null
    });

    const populatedFeedback = await Feedback.findById(newFeedback._id)
      .populate('user', 'name email')
      .populate('bus', 'busNumber busType')
      .populate('trip', 'tripId');

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your feedback has been recorded successfully.',
      data: populatedFeedback
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/passenger/feedback
 * Get feedback list (user-specific if logged in, or recent public reviews)
 */
const getFeedbackList = async (req, res, next) => {
  try {
    const userId = req.user ? req.user._id : null;
    const { scope } = req.query; // 'my' or 'all'

    let query = {};
    if (scope === 'my' && userId) {
      query.user = userId;
    }

    const feedbacks = await Feedback.find(query)
      .populate('user', 'name')
      .populate('bus', 'busNumber busType')
      .populate('trip', 'tripId')
      .sort({ createdAt: -1 })
      .limit(30);

    return res.status(200).json({
      success: true,
      count: feedbacks.length,
      data: feedbacks
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  submitFeedback,
  getFeedbackList
};
