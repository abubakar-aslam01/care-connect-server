import { User } from '../models/User.js';
import { Appointment } from '../models/Appointment.js';
import { PharmacyTransaction } from '../models/PharmacyTransaction.js';
import { Appointment as Appt } from '../models/Appointment.js';
import { getPatientBilling } from './patientBillingController.js';

const success = (res, message, data = {}, status = 200) => res.status(status).json({ success: true, message, data });

export const exportPatientData = async (req, res, next) => {
  try {
    const patientId = req.user._id;

    const patient = await User.findById(patientId).select('-password');
    if (!patient) {
      const error = new Error('Patient not found');
      error.statusCode = 404;
      throw error;
    }

    const [appointments, prescriptions] = await Promise.all([
      Appointment.find({ patientId }).populate('doctorId', 'name email role consultationFee'),
      PharmacyTransaction.find({ patientId })
        .populate('doctorId', 'name email role')
        .populate('items.medicine', 'name price')
    ]);

    // Reuse billing logic
    const billingRes = {};
    const mockRes = {
      status() {
        return this;
      },
      json(payload) {
        Object.assign(billingRes, payload.data);
      }
    };
    await getPatientBilling(req, mockRes, next);

    const data = {
      personalInfo: {
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        profileImage: patient.profileImage,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        bloodGroup: patient.bloodGroup,
        maritalStatus: patient.maritalStatus,
        address: patient.address,
        emergencyContact: patient.emergencyContact,
        notificationPreferences: {
          emailNotificationsEnabled: patient.emailNotificationsEnabled,
          smsNotificationsEnabled: patient.smsNotificationsEnabled,
          appointmentReminderEnabled: patient.appointmentReminderEnabled
        }
      },
      medicalInfo: {
        allergies: patient.allergies,
        chronicDiseases: patient.chronicDiseases,
        pastSurgeries: patient.pastSurgeries,
        familyHistory: patient.familyHistory,
        smokingStatus: patient.smokingStatus,
        alcoholConsumption: patient.alcoholConsumption,
        height: patient.height,
        weight: patient.weight,
        bmi: patient.bmi
      },
      appointments,
      prescriptions,
      billing: billingRes || {}
    };

    return success(res, 'Patient data exported', data);
  } catch (err) {
    next(err);
  }
};
