import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ['admin', 'doctor', 'patient'], default: 'patient' },
    phone: { type: String, trim: true },
    profileImage: { type: String, trim: true },

    // Doctor-only fields
    specialization: {
      type: String,
      trim: true
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department'
    },
    experience: {
      type: Number,
      min: 0
    },
    qualification: {
      type: String,
      trim: true
    },
    consultationFee: {
      type: Number,
      min: 0
    },
    availability: {
      days: {
        type: [String],
        enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        validate: {
          validator(v) {
            if (this.role !== 'doctor') return true;
            // Allow undefined or empty; just ensure it's an array when provided
            if (v === undefined) return true;
            return Array.isArray(v);
          },
          message: 'Availability days must be an array'
        }
      },
      startTime: {
        type: String,
        trim: true
      },
      endTime: {
        type: String,
        trim: true
      }
    },
    bio: { type: String, trim: true },

    // Patient-only fields
    dateOfBirth: {
      type: Date,
      validate: {
        validator(v) {
          if (this.role !== 'patient' || v === undefined) return true;
          return v <= new Date();
        },
        message: 'dateOfBirth must be in the past'
      }
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
      trim: true
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      trim: true
    },
    maritalStatus: {
      type: String,
      enum: ['Single', 'Married', 'Divorced', 'Widowed', 'Separated', 'Other'],
      trim: true
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      postalCode: { type: String, trim: true }
    },
    emergencyContact: {
      name: { type: String, trim: true },
      phone: { type: String, trim: true },
      relationship: { type: String, trim: true }
    },
    allergies: [{ type: String, trim: true }],
    chronicDiseases: [{ type: String, trim: true }],
    pastSurgeries: [{ type: String, trim: true }],
    familyHistory: { type: String, trim: true },
    smokingStatus: { type: Boolean, default: false },
    alcoholConsumption: { type: Boolean, default: false },
    height: { type: Number, min: 0 }, // in cm
    weight: { type: Number, min: 0 }, // in kg
    bmi: { type: Number, min: 0 },

    // Notification preferences
    emailNotificationsEnabled: { type: Boolean, default: true },
    smsNotificationsEnabled: { type: Boolean, default: false },
    appointmentReminderEnabled: { type: Boolean, default: true },

    // Admin notification preferences
    receiveSystemAlerts: { type: Boolean, default: true },
    receiveLowStockAlerts: { type: Boolean, default: true },
    receiveSecurityAlerts: { type: Boolean, default: true },
    receiveRevenueReports: { type: Boolean, default: true },

    // Admin-only fields
    fullName: { type: String, trim: true },
    phoneNumber: { type: String, trim: true },
    alternatePhone: { type: String, trim: true },
    designation: { type: String, trim: true },
    departmentAccess: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Department' }],
    lastLogin: { type: Date },
    twoFactorEnabled: { type: Boolean, default: false },
    loginAttempts: { type: Number, default: 0, min: 0 },
    accountStatus: {
      type: String,
      enum: ['active', 'suspended'],
      default: 'active'
    },

    // Soft delete flag
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Hash password before save when it has been modified/created
userSchema.pre('save', async function (next) {
  try {
    // Hash password if changed
    if (this.isModified('password')) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }

    // Auto-calc BMI for patients if height/weight provided
    if (this.role === 'patient' && this.height && this.weight) {
      const heightM = this.height / 100; // cm to meters
      if (heightM > 0) this.bmi = Number((this.weight / (heightM * heightM)).toFixed(2));
    }

    // Ensure admin-only defaults stay sane
    if (this.role !== 'admin') {
      this.twoFactorEnabled = this.twoFactorEnabled || false;
      this.loginAttempts = this.loginAttempts || 0;
      if (!this.accountStatus) this.accountStatus = 'active';
    }

    next();
  } catch (err) {
    next(err);
  }
});

// Compare plaintext password with hashed password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model('User', userSchema);
