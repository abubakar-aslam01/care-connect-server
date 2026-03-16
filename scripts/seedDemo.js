import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Department } from '../models/Department.js';
import { Appointment } from '../models/Appointment.js';
import { MedicalRecord } from '../models/MedicalRecord.js';
import { Medicine } from '../models/Medicine.js';
import { PharmacyTransaction } from '../models/PharmacyTransaction.js';
import { Notification } from '../models/Notification.js';
import { ActivityLog } from '../models/ActivityLog.js';

dotenv.config();

const log = (...args) => console.log('[seed]', ...args);

const upsertUser = async (email, payload) => {
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create(payload);
    log('Created user', email);
  } else {
    log('User exists', email);
  }
  return user;
};

const ensureMedicalRecord = async ({ patientId, description, fileUrl, fileType }) => {
  const existing = await MedicalRecord.findOne({ patientId, description });
  if (existing) return existing;
  const record = await MedicalRecord.create({ patientId, description, fileUrl, fileType });
  log('Created medical record', description);
  return record;
};

const seed = async () => {
  await connectDB();

  // Optionally clear existing demo data (keep other data intact)
  // await Promise.all([Appointment.deleteMany({}), Department.deleteMany({})]);

  // Departments
  const deptData = [
    { name: 'Cardiology', description: 'Heart & vascular care' },
    { name: 'Neurology', description: 'Brain and nervous system' },
    { name: 'Pediatrics', description: 'Child health' },
    { name: 'Orthopedics', description: 'Bones & joints' }
  ];
  const departments = [];
  for (const d of deptData) {
    const existing = await Department.findOne({ name: d.name });
    if (existing) {
      departments.push(existing);
      continue;
    }
    const created = await Department.create(d);
    departments.push(created);
    log('Created department', d.name);
  }

  // Users
  const admin = await upsertUser('admin@careconnect.demo', {
    name: 'Admin User',
    email: 'admin@careconnect.demo',
    password: 'DemoPass123!',
    role: 'admin',
    phone: '+1-555-1000'
  });

  const doctor1 = await upsertUser('wilson@careconnect.demo', {
    name: 'Dr. Sarah Wilson',
    email: 'wilson@careconnect.demo',
    password: 'DemoPass123!',
    role: 'doctor',
    phone: '+1-555-2001',
    specialization: 'Cardiology',
    department: departments[0]?._id,
    experience: 12,
    qualification: 'MD, FACC',
    consultationFee: 180,
    availability: { days: ['Mon', 'Tue', 'Thu'], startTime: '09:00', endTime: '15:00' },
    bio: 'Interventional cardiologist focused on preventive care.'
  });

  const doctor2 = await upsertUser('chen@careconnect.demo', {
    name: 'Dr. Emily Chen',
    email: 'chen@careconnect.demo',
    password: 'DemoPass123!',
    role: 'doctor',
    phone: '+1-555-2002',
    specialization: 'Neurology',
    department: departments[1]?._id,
    experience: 9,
    qualification: 'MD, PhD',
    consultationFee: 200,
    availability: { days: ['Mon', 'Wed', 'Fri'], startTime: '10:00', endTime: '16:00' },
    bio: 'Neurologist specializing in movement disorders.'
  });

  const doctor3 = await upsertUser('patel@careconnect.demo', {
    name: 'Dr. Liam Patel',
    email: 'patel@careconnect.demo',
    password: 'DemoPass123!',
    role: 'doctor',
    phone: '+1-555-2003',
    specialization: 'Pediatrics',
    department: departments[2]?._id,
    experience: 7,
    qualification: 'MD, FAAP',
    consultationFee: 150,
    availability: { days: ['Tue', 'Thu', 'Sat'], startTime: '08:30', endTime: '14:30' },
    bio: 'Pediatrician focused on preventative care and wellness visits.'
  });

  const doctor4 = await upsertUser('martinez@careconnect.demo', {
    name: 'Dr. Olivia Martinez',
    email: 'martinez@careconnect.demo',
    password: 'DemoPass123!',
    role: 'doctor',
    phone: '+1-555-2004',
    specialization: 'Orthopedics',
    department: departments[3]?._id,
    experience: 15,
    qualification: 'MD, FAAOS',
    consultationFee: 210,
    availability: { days: ['Mon', 'Wed', 'Fri'], startTime: '09:30', endTime: '17:00' },
    bio: 'Orthopedic surgeon with focus on sports injuries and rehab.'
  });

  const patient1 = await upsertUser('james.anderson@careconnect.demo', {
    name: 'James Anderson',
    email: 'james.anderson@careconnect.demo',
    password: 'DemoPass123!',
    role: 'patient',
    phone: '+1-555-3001',
    dateOfBirth: new Date('1990-04-10'),
    gender: 'Male'
  });

  const patient2 = await upsertUser('maria.garcia@careconnect.demo', {
    name: 'Maria Garcia',
    email: 'maria.garcia@careconnect.demo',
    password: 'DemoPass123!',
    role: 'patient',
    phone: '+1-555-3002',
    dateOfBirth: new Date('1987-09-21'),
    gender: 'Female'
  });

  const patient3 = await upsertUser('robert.kim@careconnect.demo', {
    name: 'Robert Kim',
    email: 'robert.kim@careconnect.demo',
    password: 'DemoPass123!',
    role: 'patient',
    phone: '+1-555-3003',
    dateOfBirth: new Date('1982-11-05'),
    gender: 'Male'
  });

  const patient4 = await upsertUser('lily.thompson@careconnect.demo', {
    name: 'Lily Thompson',
    email: 'lily.thompson@careconnect.demo',
    password: 'DemoPass123!',
    role: 'patient',
    phone: '+1-555-3004',
    dateOfBirth: new Date('2014-02-14'),
    gender: 'Female',
    bloodGroup: 'O+',
    emergencyContact: { name: 'Emma Thompson', phone: '+1-555-9001', relationship: 'Parent' }
  });

  const patient5 = await upsertUser('ethan.walker@careconnect.demo', {
    name: 'Ethan Walker',
    email: 'ethan.walker@careconnect.demo',
    password: 'DemoPass123!',
    role: 'patient',
    phone: '+1-555-3005',
    dateOfBirth: new Date('1975-07-22'),
    gender: 'Male',
    bloodGroup: 'A-',
    allergies: ['Peanuts'],
    chronicDiseases: ['Hypertension']
  });

  // Appointments
  const baseDate = new Date();
  const mkDate = (daysAhead) => {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + daysAhead);
    d.setHours(10, 0, 0, 0);
    return d;
  };

  const appts = [
    { patientId: patient1._id, doctorId: doctor1._id, date: mkDate(0), time: '09:00', status: 'approved', notes: 'Follow-up, stable vitals.' },
    { patientId: patient2._id, doctorId: doctor1._id, date: mkDate(1), time: '10:30', status: 'pending', notes: 'Chest pain episodes.' },
    { patientId: patient1._id, doctorId: doctor2._id, date: mkDate(-1), time: '14:00', status: 'approved', notes: 'Migraine evaluation.' },
    { patientId: patient2._id, doctorId: doctor2._id, date: mkDate(3), time: '11:15', status: 'approved', notes: 'Tremor assessment.' },
    { patientId: patient3._id, doctorId: doctor1._id, date: mkDate(2), time: '15:30', status: 'rejected', notes: 'Reschedule requested.' },
    { patientId: patient3._id, doctorId: doctor2._id, date: mkDate(5), time: '10:00', status: 'pending', notes: 'New patient consult.' },
    { patientId: patient4._id, doctorId: doctor3._id, date: mkDate(-2), time: '11:45', status: 'approved', notes: 'Annual wellness and vaccination review.' },
    { patientId: patient5._id, doctorId: doctor4._id, date: mkDate(4), time: '13:15', status: 'pending', notes: 'Knee pain after marathon training.' },
    { patientId: patient4._id, doctorId: doctor1._id, date: mkDate(7), time: '09:30', status: 'approved', notes: 'Cardiology clearance for sports camp.' },
    { patientId: patient5._id, doctorId: doctor2._id, date: mkDate(-5), time: '16:00', status: 'approved', notes: 'Chronic migraine follow-up.' },
    { patientId: patient2._id, doctorId: doctor4._id, date: mkDate(8), time: '10:30', status: 'approved', notes: 'Shoulder mobility review post-physio.' }
  ];

  for (const a of appts) {
    const exists = await Appointment.findOne({
      patientId: a.patientId,
      doctorId: a.doctorId,
      date: a.date,
      time: a.time
    });
    if (!exists) {
      await Appointment.create(a);
      log('Created appointment', a.time, 'on', a.date.toDateString());
    }
  }

  // Medical records (dummy)
  const demoReports = [
    {
      patientId: patient1._id,
      description: 'ECG Report',
      fileUrl: 'https://www.africau.edu/images/default/sample.pdf',
      fileType: 'application/pdf'
    },
    {
      patientId: patient1._id,
      description: 'Lipid Panel - Feb 2026',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileType: 'application/pdf'
    },
    {
      patientId: patient2._id,
      description: 'MRI Brain Scan',
      fileUrl: 'https://www.africau.edu/images/default/sample.pdf',
      fileType: 'application/pdf'
    },
    {
      patientId: patient3._id,
      description: 'Knee X-Ray',
      fileUrl: 'https://via.placeholder.com/800x600.png',
      fileType: 'image/png'
    },
    {
      patientId: patient4._id,
      description: 'Pediatric Vaccination Record',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileType: 'application/pdf'
    },
    {
      patientId: patient5._id,
      description: 'Physical Therapy Progress Notes',
      fileUrl: 'https://www.africau.edu/images/default/sample.pdf',
      fileType: 'application/pdf'
    }
  ];

  for (const report of demoReports) {
    await ensureMedicalRecord(report);
  }

  // Medicines
  const meds = [
    { name: 'Atorvastatin 20mg', description: 'Cholesterol control', stock: 120, unit: 'tablet', price: 1.2 },
    { name: 'Metformin 500mg', description: 'Blood sugar control', stock: 200, unit: 'tablet', price: 0.8 },
    { name: 'Ibuprofen 400mg', description: 'Pain relief', stock: 300, unit: 'tablet', price: 0.5 },
    { name: 'Amoxicillin 500mg', description: 'Antibiotic', stock: 150, unit: 'capsule', price: 1.0 }
  ];
  const medDocs = [];
  for (const m of meds) {
    const existing = await Medicine.findOne({ name: m.name });
    if (existing) {
      medDocs.push(existing);
      continue;
    }
    const created = await Medicine.create(m);
    medDocs.push(created);
    log('Created medicine', m.name);
  }

  // Pharmacy transaction (demo prescription)
  if (medDocs.length) {
    const txnExists = await PharmacyTransaction.findOne({ doctorId: doctor1._id });
    if (!txnExists) {
      await PharmacyTransaction.create({
        doctorId: doctor1._id,
        patientName: 'James Anderson',
        notes: 'Post-visit prescription',
        items: [
          { medicine: medDocs[0]._id, quantity: 10, price: medDocs[0].price },
          { medicine: medDocs[2]._id, quantity: 6, price: medDocs[2].price }
        ],
        total: 10 * medDocs[0].price + 6 * medDocs[2].price
      });
      log('Created pharmacy transaction');
    }
  }

  // Simple notifications for doctor & patient
  const notifTargets = [doctor1, doctor2, doctor3, doctor4, patient1, patient2, patient3, patient4, patient5];
  for (const target of notifTargets) {
    const existing = await Notification.findOne({ user: target._id });
    if (!existing) {
      await Notification.create({
        user: target._id,
        type: 'system',
        title: 'Welcome to Care Connect',
        message: 'This is a sample notification for demo purposes.',
        read: false
      });
    }
  }

  // Activity logs
  const logs = await ActivityLog.countDocuments({});
  if (logs === 0) {
    await ActivityLog.insertMany([
      { userId: admin._id, role: 'admin', action: 'login', description: 'Admin logged in', ipAddress: '127.0.0.1' },
      { userId: doctor1._id, role: 'doctor', action: 'review_appointments', description: 'Reviewed today appointments', ipAddress: '127.0.0.1' },
      { userId: patient1._id, role: 'patient', action: 'book_appointment', description: 'Booked cardiology follow-up', ipAddress: '127.0.0.1' }
    ]);
    log('Created activity logs');
  }

  log('Seeding complete.');
  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error(err);
  mongoose.disconnect();
  process.exit(1);
});
