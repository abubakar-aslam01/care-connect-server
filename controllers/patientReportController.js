import path from 'path';
import fs from 'fs';
import { MedicalRecord } from '../models/MedicalRecord.js';

const success = (res, message, data = {}, status = 200) => res.status(status).json({ success: true, message, data });

export const uploadReport = async (req, res, next) => {
  try {
    if (!req.file) {
      const error = new Error('File is required');
      error.statusCode = 400;
      throw error;
    }

    const fileUrl = `/uploads/reports/${req.file.filename}`;
    const fileType = req.file.mimetype;

    const record = await MedicalRecord.create({
      patientId: req.user._id,
      fileUrl,
      fileType,
      description: req.body.description || ''
    });

    return success(res, 'Report uploaded', { record }, 201);
  } catch (err) {
    next(err);
  }
};

export const getReports = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      MedicalRecord.find({ patientId: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      MedicalRecord.countDocuments({ patientId: req.user._id })
    ]);

    return success(res, 'Reports fetched', {
      records,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1
      }
    });
  } catch (err) {
    next(err);
  }
};

export const deleteReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const record = await MedicalRecord.findOne({ _id: id, patientId: req.user._id });
    if (!record) {
      const error = new Error('Report not found');
      error.statusCode = 404;
      throw error;
    }

    // Delete file from disk
    const filePath = path.join(process.cwd(), 'server', record.fileUrl.replace('/uploads', 'uploads'));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await record.deleteOne();
    return success(res, 'Report deleted');
  } catch (err) {
    next(err);
  }
};
