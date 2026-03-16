import { Medicine } from '../models/Medicine.js';
import { logPharmacyAction } from './pharmacyActivityLogger.js';

const success = (res, message, data = {}, status = 200) => res.status(status).json({ success: true, message, data });

export const listMedicinesAdmin = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const query = {};
    if (search) query.name = { $regex: search, $options: 'i' };
    const [items, total] = await Promise.all([
      Medicine.find(query).skip(skip).limit(Number(limit)).sort({ name: 1 }),
      Medicine.countDocuments(query)
    ]);
    return success(res, 'Medicines fetched', {
      medicines: items,
      pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) || 1 }
    });
  } catch (err) {
    next(err);
  }
};

export const createMedicine = async (req, res, next) => {
  try {
    const { name, description, stock, price, unit } = req.body;
    const existing = await Medicine.findOne({ name: name.trim() });
    if (existing) {
      const error = new Error('Medicine with this name already exists');
      error.statusCode = 400;
      throw error;
    }
    const med = await Medicine.create({ name: name.trim(), description, stock, price, unit });

    await logPharmacyAction({ action: 'pharmacy:create', description: `Added medicine ${med.name}`, user: req.user, medicineId: med._id });
    return success(res, 'Medicine created', { medicine: med }, 201);
  } catch (err) {
    next(err);
  }
};

export const updateMedicine = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, stock, price, unit } = req.body;
    const med = await Medicine.findById(id);
    if (!med) {
      const error = new Error('Medicine not found');
      error.statusCode = 404;
      throw error;
    }
    med.name = name?.trim() || med.name;
    if (description !== undefined) med.description = description;
    if (stock !== undefined) med.stock = stock;
    if (price !== undefined) med.price = price;
    if (unit !== undefined) med.unit = unit;
    await med.save();

    await logPharmacyAction({ action: 'pharmacy:update', description: `Updated medicine ${med.name}`, user: req.user, medicineId: med._id });
    return success(res, 'Medicine updated', { medicine: med });
  } catch (err) {
    next(err);
  }
};

export const deleteMedicine = async (req, res, next) => {
  try {
    const { id } = req.params;
    const med = await Medicine.findById(id);
    if (!med) {
      const error = new Error('Medicine not found');
      error.statusCode = 404;
      throw error;
    }
    await med.deleteOne();

    await logPharmacyAction({ action: 'pharmacy:delete', description: `Deleted medicine ${med.name}`, user: req.user, medicineId: med._id });
    return success(res, 'Medicine deleted');
  } catch (err) {
    next(err);
  }
};
