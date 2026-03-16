import { Notification } from '../models/Notification.js';

export const notifyUser = async ({ userId, title, message, type = 'info', meta = {} }) => {
  if (!userId) return;
  await Notification.create({ user: userId, title, message, type, meta });
};
