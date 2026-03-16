import { User } from '../models/User.js';

const success = (res, message, data = {}, status = 200) => res.status(status).json({ success: true, message, data });

const buildQuery = (req) => {
  const query = { role: 'doctor' };
  const { department, search } = req.query;
  if (department) query.department = department;
  if (search) {
    const regex = new RegExp(search, 'i');
    query.$or = [{ name: regex }, { specialization: regex }];
  }
  return query;
};

export const createDoctor = async (req, res, next) => {
  try {
    const { email } = req.body;
    const exists = await User.findOne({ email });
    if (exists) {
      const err = new Error('Email already in use');
      err.statusCode = 409;
      throw err;
    }

    const doctor = await User.create({
      ...req.body,
      role: 'doctor',
      specialization: req.body.specialization || '',
      department: req.body.department || undefined,
      experience: req.body.experience ?? undefined,
      availability: req.body.availability || {}
    });

    return success(res, 'Doctor created', {
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        specialization: doctor.specialization,
        department: doctor.department,
        experience: doctor.experience,
        qualification: doctor.qualification,
        consultationFee: doctor.consultationFee,
        availability: doctor.availability,
        bio: doctor.bio
      }
    }, 201);
  } catch (err) {
    next(err);
  }
};

export const updateDoctor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const doctor = await User.findOne({ _id: id, role: 'doctor' }).select('+password');
    if (!doctor) {
      const err = new Error('Doctor not found');
      err.statusCode = 404;
      throw err;
    }

    Object.assign(doctor, {
      ...req.body,
      specialization: req.body.specialization ?? doctor.specialization,
      department: req.body.department ?? doctor.department,
      experience: req.body.experience ?? doctor.experience,
      availability: req.body.availability ?? doctor.availability
    });
    if (req.body.password) doctor.markModified('password');
    await doctor.save();

    return success(res, 'Doctor updated', { doctor });
  } catch (err) {
    next(err);
  }
};

export const deleteDoctor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const doctor = await User.findOneAndDelete({ _id: id, role: 'doctor' });
    if (!doctor) {
      const err = new Error('Doctor not found');
      err.statusCode = 404;
      throw err;
    }
    return success(res, 'Doctor deleted');
  } catch (err) {
    next(err);
  }
};

export const getDoctors = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = buildQuery(req);

    const [doctors, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .populate('department', 'name')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      User.countDocuments(query)
    ]);

    return success(res, 'Doctors fetched', {
      doctors,
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

// Public/list for patients & doctors selection (read-only)
export const listPublicDoctors = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;
    const query = buildQuery(req);

    const doctors = await User.find(query)
      .select('name specialization department consultationFee availability')
      .populate('department', 'name')
      .limit(limit)
      .sort({ name: 1 });

    return success(res, 'Doctors fetched', { doctors });
  } catch (err) {
    next(err);
  }
};
