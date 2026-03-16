import { ActivityLog } from '../models/ActivityLog.js';

export const logPharmacyAction = async ({ action, description, user, medicineId }) => {
  try {
    await ActivityLog.create({
      action,
      description,
      role: user?.role,
      userId: user?._id,
      meta: { medicineId }
    });
  } catch (err) {
    // Do not block main flow if logging fails
    console.error('ActivityLog pharmacy error:', err.message);
  }
};
