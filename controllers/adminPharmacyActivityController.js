import { ActivityLog } from '../models/ActivityLog.js';

const success = (res, message, data = {}, status = 200) => res.status(status).json({ success: true, message, data });

export const listPharmacyActivity = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const query = { action: { $regex: '^pharmacy:' } };
    const [logs, total] = await Promise.all([
      ActivityLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      ActivityLog.countDocuments(query)
    ]);
    return success(res, 'Pharmacy activity', {
      logs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)) || 1
      }
    });
  } catch (err) {
    next(err);
  }
};
