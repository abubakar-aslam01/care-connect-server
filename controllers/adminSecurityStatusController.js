import { User } from '../models/User.js';
import { ActivityLog } from '../models/ActivityLog.js';
import fs from 'fs';
import path from 'path';

const success = (res, message, data = {}, status = 200) => res.status(status).json({ success: true, message, data });

export const getSecurityStatus = async (req, res, next) => {
  try {
    const [failedLoginAttempts, lockedAccounts, suspiciousActivities] = await Promise.all([
      User.aggregate([
        { $match: { role: 'admin' } },
        {
          $group: {
            _id: null,
            attempts: { $sum: '$loginAttempts' }
          }
        }
      ]),
      User.countDocuments({ accountStatus: 'suspended' }),
      ActivityLog.countDocuments({ action: { $regex: 'failed login', $options: 'i' } })
    ]);

    // last backup file time
    const backupDir = path.join(process.cwd(), 'server', 'backups');
    let lastBackupDate = null;
    if (fs.existsSync(backupDir)) {
      const files = fs
        .readdirSync(backupDir)
        .filter((f) => f.startsWith('backup-') && f.endsWith('.json'))
        .map((f) => ({ f, time: fs.statSync(path.join(backupDir, f)).mtime }))
        .sort((a, b) => b.time - a.time);
      if (files.length) lastBackupDate = files[0].time;
    }

    // simple system alerts (e.g., too many failures)
    const totalFailed = failedLoginAttempts[0]?.attempts || 0;
    const alerts = [];
    if (totalFailed > 20) alerts.push('High number of failed admin logins');
    if (lockedAccounts > 0) alerts.push('Some accounts are suspended');

    return success(res, 'Security status fetched', {
      failedLoginAttempts: totalFailed,
      suspiciousActivities,
      lockedAccounts,
      lastBackupDate,
      systemAlerts: alerts
    });
  } catch (err) {
    next(err);
  }
};
