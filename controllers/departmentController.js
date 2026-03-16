import { Department } from '../models/Department.js';

const success = (res, message, data = {}, status = 200) => res.status(status).json({ success: true, message, data });

export const createDepartment = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      const err = new Error('Name is required');
      err.statusCode = 400;
      throw err;
    }
    const existing = await Department.findOne({ name });
    if (existing) {
      const err = new Error('Department already exists');
      err.statusCode = 409;
      throw err;
    }
    const department = await Department.create({ name, description });
    return success(res, 'Department created', { department }, 201);
  } catch (err) {
    next(err);
  }
};

export const updateDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const department = await Department.findById(id);
    if (!department) {
      const err = new Error('Department not found');
      err.statusCode = 404;
      throw err;
    }
    if (name) department.name = name;
    if (description !== undefined) department.description = description;
    await department.save();
    return success(res, 'Department updated', { department });
  } catch (err) {
    next(err);
  }
};

export const deleteDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const department = await Department.findById(id);
    if (!department) {
      const err = new Error('Department not found');
      err.statusCode = 404;
      throw err;
    }
    await department.deleteOne();
    return success(res, 'Department deleted');
  } catch (err) {
    next(err);
  }
};

export const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    return success(res, 'Departments fetched', { departments });
  } catch (err) {
    next(err);
  }
};
