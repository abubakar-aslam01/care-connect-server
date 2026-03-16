import { Appointment } from '../models/Appointment.js';
import { notifyUser } from '../utils/notify.js';
import { User } from '../models/User.js';

// Helper to format responses
const success = (res, message, data = {}, status = 200) =>
  res.status(status).json({ success: true, message, data });

// Patient: create appointment
export const createAppointment = async (req, res, next) => {
  try {
    const patientId = req.user._id;
    const { doctorId, date, time, notes } = req.body;

    if (!doctorId || !date || !time) {
      const error = new Error('doctorId, date, and time are required');
      error.statusCode = 400;
      throw error;
    }

    const appointment = await Appointment.create({
      patientId,
      doctorId,
      date,
      time,
      notes
    });

    // Notify doctor
    await notifyUser({
      userId: doctorId,
      title: 'New appointment booked',
      message: `A patient booked an appointment on ${new Date(date).toDateString()} at ${time}`,
      type: 'appointment',
      meta: { appointmentId: appointment._id }
    });

    return success(res, 'Appointment created', { appointment }, 201);
  } catch (err) {
    next(err);
  }
};

// Patient: view own appointments
export const getMyAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find({ patientId: req.user._id })
      .sort({ date: 1, time: 1 })
      .populate('doctorId', 'name email role');
    return success(res, 'Appointments fetched', { appointments });
  } catch (err) {
    next(err);
  }
};

// Patient: cancel appointment (soft via status)
export const cancelAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findOne({ _id: id, patientId: req.user._id });
    if (!appointment) {
      const error = new Error('Appointment not found');
      error.statusCode = 404;
      throw error;
    }

    appointment.status = 'rejected';
    await appointment.save();

    // Notify doctor of cancellation
    await notifyUser({
      userId: appointment.doctorId,
      title: 'Appointment cancelled',
      message: 'A patient cancelled an appointment.',
      type: 'appointment',
      meta: { appointmentId: appointment._id }
    });

    return success(res, 'Appointment cancelled', { appointment });
  } catch (err) {
    next(err);
  }
};

// Doctor: view assigned appointments
export const getDoctorAppointments = async (req, res, next) => {
  try {
    const filter = { doctorId: req.user._id };
    if (req.query.status && ['pending', 'approved', 'rejected'].includes(req.query.status)) {
      filter.status = req.query.status;
    }
    const appointments = await Appointment.find(filter)
      .sort({ date: 1, time: 1 })
      .populate('patientId', 'name email role phone');
    return success(res, 'Appointments fetched', { appointments });
  } catch (err) {
    next(err);
  }
};

// Doctor: approve or reject appointment
export const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      const error = new Error('Invalid status');
      error.statusCode = 400;
      throw error;
    }

    const appointment = await Appointment.findOne({ _id: id, doctorId: req.user._id });
    if (!appointment) {
      const error = new Error('Appointment not found');
      error.statusCode = 404;
      throw error;
    }

    appointment.status = status;
    await appointment.save();

    // Notify doctor on status change (approved/rejected)
    await notifyUser({
      userId: req.user._id,
      title: `Appointment ${status}`,
      message: `Appointment has been ${status}.`,
      type: 'appointment',
      meta: { appointmentId: appointment._id }
    });

    return success(res, 'Appointment status updated', { appointment });
  } catch (err) {
    next(err);
  }
};

// Doctor: add prescription/notes
export const addPrescriptionNotes = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    if (!notes) {
      const error = new Error('Notes are required');
      error.statusCode = 400;
      throw error;
    }

    const appointment = await Appointment.findOne({ _id: id, doctorId: req.user._id });
    if (!appointment) {
      const error = new Error('Appointment not found');
      error.statusCode = 404;
      throw error;
    }

    appointment.notes = notes;
    await appointment.save();

    return success(res, 'Notes updated', { appointment });
  } catch (err) {
    next(err);
  }
};

// Admin: view all appointments
export const getAllAppointments = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { status } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const [total, appointments] = await Promise.all([
      Appointment.countDocuments(filter),
      Appointment.find(filter)
        .sort({ date: -1, time: -1 })
        .skip(skip)
        .limit(limit)
        .populate('patientId', 'name email role phone')
        .populate('doctorId', 'name email role')
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return success(res, 'All appointments fetched', {
      appointments,
      pagination: { page, limit, total, totalPages }
    });
  } catch (err) {
    next(err);
  }
};
