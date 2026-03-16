import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { User } from '../models/User.js';
import { Appointment } from '../models/Appointment.js';
import { Department } from '../models/Department.js';
import { PharmacyTransaction } from '../models/PharmacyTransaction.js';

const success = (res, message, data = {}, status = 200) => res.status(status).json({ success: true, message, data });

const getRevenueTotals = async () => {
  const consultationAgg = await Appointment.aggregate([
    { $match: { status: 'approved' } },
    {
      $lookup: {
        from: 'users',
        localField: 'doctorId',
        foreignField: '_id',
        as: 'doctor'
      }
    },
    { $unwind: '$doctor' },
    {
      $group: {
        _id: null,
        total: { $sum: { $ifNull: ['$doctor.consultationFee', 0] } }
      }
    }
  ]);
  const consultationTotal = consultationAgg[0]?.total || 0;

  const pharmacyAgg = await PharmacyTransaction.aggregate([
    { $group: { _id: null, total: { $sum: '$total' } } }
  ]);
  const pharmacyTotal = pharmacyAgg[0]?.total || 0;

  return { consultationTotal, pharmacyTotal, revenueTotal: consultationTotal + pharmacyTotal };
};

export const exportSystemData = async (req, res, next) => {
  try {
    const [users, appointments, departments, pharmacy, revenue] = await Promise.all([
      User.find().select('-password -isDeleted'),
      Appointment.find().populate('doctorId', 'name email role').populate('patientId', 'name email role'),
      Department.find(),
      PharmacyTransaction.find().populate('doctorId', 'name email role').populate('items.medicine', 'name price'),
      getRevenueTotals()
    ]);

    return success(res, 'System data exported', {
      users,
      appointments,
      departments,
      pharmacy,
      revenue
    });
  } catch (err) {
    next(err);
  }
};

export const backupSystemData = async (req, res, next) => {
  try {
    const [users, appointments, departments, pharmacy, revenue] = await Promise.all([
      User.find().select('-password -isDeleted'),
      Appointment.find(),
      Department.find(),
      PharmacyTransaction.find(),
      getRevenueTotals()
    ]);

    const payload = { users, appointments, departments, pharmacy, revenue, createdAt: new Date().toISOString() };
    const dir = path.join(process.cwd(), 'server', 'backups');
    fs.mkdirSync(dir, { recursive: true });
    const filename = `backup-${Date.now()}.json`;
    const filepath = path.join(dir, filename);
    const dataString = JSON.stringify(payload, null, 2);

    // Encrypt backup with AES-256-GCM using env key
    const key = process.env.BACKUP_SECRET;
    if (!key || key.length < 32) {
      const error = new Error('BACKUP_SECRET env missing or too short');
      error.statusCode = 500;
      throw error;
    }
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(key.slice(0, 32)), iv);
    const encrypted = Buffer.concat([cipher.update(dataString, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();

    const payloadEncrypted = Buffer.concat([iv, tag, encrypted]).toString('base64');
    fs.writeFileSync(filepath, payloadEncrypted);

    return success(res, 'Backup created (encrypted)', { filename, path: filepath });
  } catch (err) {
    next(err);
  }
};

export const restoreSystemData = async (req, res, next) => {
  try {
    // For safety, we accept the payload but do not overwrite existing data automatically.
    if (!req.body || Object.keys(req.body).length === 0) {
      const error = new Error('No restore payload provided');
      error.statusCode = 400;
      throw error;
    }
    // In a production system, you'd validate and selectively restore.
    return success(res, 'Restore request received. Manual review required.', { receivedKeys: Object.keys(req.body) });
  } catch (err) {
    next(err);
  }
};
