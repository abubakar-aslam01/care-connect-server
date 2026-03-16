import { Department } from '../models/Department.js';
import { User } from '../models/User.js';
import { Appointment } from '../models/Appointment.js';

const success = (res, message, data = {}, status = 200) => res.status(status).json({ success: true, message, data });

export const getDoctorDepartment = async (req, res, next) => {
  try {
    const doctor = await User.findById(req.user._id).select('department');
    if (!doctor?.department) {
      const error = new Error('No department assigned');
      error.statusCode = 404;
      throw error;
    }

    const department = await Department.findById(doctor.department)
      .populate('head', 'name email role')
      .lean();

    if (!department) {
      const error = new Error('Department not found');
      error.statusCode = 404;
      throw error;
    }

    const doctors = await User.find({ role: 'doctor', department: doctor.department }).select('_id').lean();
    const doctorIds = doctors.map((d) => d._id);
    const totalDoctors = doctorIds.length;

    const totalAppointments = doctorIds.length
      ? await Appointment.countDocuments({ doctorId: { $in: doctorIds } })
      : 0;

    return success(res, 'Department details fetched', {
      department: {
        id: department._id,
        name: department.name,
        description: department.description || '',
        head: department.head || null,
        totalDoctors,
        totalAppointments
      }
    });
  } catch (err) {
    next(err);
  }
};
