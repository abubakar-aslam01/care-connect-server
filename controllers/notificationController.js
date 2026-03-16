import { Notification } from '../models/Notification.js';

const success = (res, message, data = {}, status = 200) => res.status(status).json({ success: true, message, data });

export const getNotifications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Notification.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments({ user: req.user._id })
    ]);

    const unreadCount = await Notification.countDocuments({ user: req.user._id, read: false });

    return success(res, 'Notifications fetched', {
      notifications: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
        unreadCount
      }
    });
  } catch (err) {
    next(err);
  }
};

export const markRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await Notification.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { read: true },
      { new: true }
    );
    if (!updated) {
      const error = new Error('Notification not found');
      error.statusCode = 404;
      throw error;
    }
    return success(res, 'Notification marked as read', { notification: updated });
  } catch (err) {
    next(err);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Notification.findOneAndDelete({ _id: id, user: req.user._id });
    if (!deleted) {
      const error = new Error('Notification not found');
      error.statusCode = 404;
      throw error;
    }
    return success(res, 'Notification deleted');
  } catch (err) {
    next(err);
  }
};
