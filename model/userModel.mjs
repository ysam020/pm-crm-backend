import mongoose from "mongoose";
import {
  generateBackupCodes,
  getFullName,
  encryptField,
  decryptField,
  resetBlockStatus,
  isPasswordCorrect,
} from "./methods/userMethod.mjs";
import bcrypt from "bcrypt";

const Schema = mongoose.Schema;

// Session schema
const sessionSchema = new Schema({
  sessionID: {
    type: String,
  },
  loginAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
  },
  userAgent: String,
  latitude: {
    type: Number,
  },
  longitude: {
    type: Number,
  },
});

// Credential schema
const CredentialSchema = new mongoose.Schema({
  credentialID: String,
  publicKey: String,
  counter: Number,
  transports: [String],
  device: {
    type: String,
    default: "Unknown Device",
  },
});

// Appraisal schema
const appraisalSchema = new Schema({
  appraisalDate: { type: String },
  performanceScore: { type: Number },
  strengths: { type: String },
  areasOfImprovement: { type: String },
  feedback: { type: String },
});

// Training schema
const trainingSchema = new Schema({
  trainingProgram: {
    type: String,
  },
  trainingDate: {
    type: String,
  },
  duration: {
    type: String,
  },
  trainingProvider: {
    type: String,
  },
  feedback: {
    type: String,
  },
});

// Event Schema
const eventSchmea = new Schema({
  title: { type: String },
  date: { type: String },
  startTime: { type: String },
  endTime: { type: String },
  description: { type: String },
});

// Warning memo schema
const warningMemoSchema = new Schema({
  subject: {
    type: String,
  },
  description: {
    type: String,
  },
});

// User schema
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    rank: { type: Number },
    modules: [
      {
        type: String,
      },
    ],
    note: {
      type: String,
    },
    // Hiring
    salary: {
      type: String,
    },
    reference_by: {
      type: String,
    },
    ////////////////////////////////////////////////////////////////// KYC
    first_name: {
      type: String,
      uppercase: true,
    },
    middle_name: {
      type: String,
      uppercase: true,
    },
    last_name: {
      type: String,
      uppercase: true,
    },
    email: {
      type: String,
      lowercase: true,
    },
    employee_photo: {
      type: String,
    },
    designation: {
      type: String,
      uppercase: true,
    },
    department: {
      type: String,
      uppercase: true,
    },
    joining_date: {
      type: String,
    },
    permanent_address_line_1: {
      type: String,
    },
    permanent_address_line_2: {
      type: String,
    },
    permanent_address_city: {
      type: String,
    },
    permanent_address_state: {
      type: String,
    },
    permanent_address_pincode: {
      type: String,
    },
    communication_address_line_1: {
      type: String,
    },
    communication_address_line_2: {
      type: String,
    },
    communication_address_city: {
      type: String,
    },
    communication_address_state: {
      type: String,
    },
    communication_address_pincode: {
      type: String,
    },
    official_email: {
      type: String,
      lowercase: true,
    },
    dob: {
      type: String,
    },
    mobile: {
      type: String,
    },
    blood_group: {
      type: String,
      uppercase: true,
    },
    qualification: {
      type: String,
    },
    aadhar_no: {
      type: String,
    },
    aadhar_photo_front: {
      type: String,
    },
    aadhar_photo_back: {
      type: String,
    },
    pan_no: {
      type: String,
    },
    pan_photo: {
      type: String,
    },
    education_certificates: [
      {
        type: String,
      },
    ],
    experience_certificate: {
      type: String,
    },
    electricity_bill: {
      type: String,
    },
    pcc: {
      type: String,
    },
    dra: {
      type: Boolean,
    },
    dra_certificate: {
      type: String,
    },
    pf_no: {
      type: String,
    },
    esic_no: {
      type: String,
    },
    insurance_status: [
      {
        type: String,
      },
    ],
    bank_account_no: {
      type: String,
    },
    bank_name: {
      type: String,
    },
    ifsc_code: {
      type: String,
      uppercase: true,
    },
    kyc_date: { type: String },
    kyc_approval: {
      type: String,
    },
    // Module fields
    appraisals: [appraisalSchema],
    trainings: [trainingSchema],
    warningMemos: [warningMemoSchema],
    events: [eventSchmea],
    // Password reset fields
    resetPasswordOTP: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
    sessions: [sessionSchema],
    // 2FA fields
    twoFactorSecret: {
      type: String,
    },
    qrCodeImage: { type: String },
    isTwoFactorEnabled: {
      type: Boolean,
    },
    // Rate-limiting fields for login attempts
    failedLoginAttempts: { type: Number, default: 0 },
    firstFailedLoginAt: { type: Date },
    isBlocked: { type: Boolean, default: false },
    blockedUntil: { type: Date },
    backupCodes: {
      type: [String], // Array to store backup codes
    },
    // WebAuthn
    webAuthnCredentials: [CredentialSchema],
    // Push Notification
    fcmTokens: [String],
  },
  { optimisticConcurrency: true }
);

userSchema.methods.generateBackupCodes = generateBackupCodes;
userSchema.methods.getFullName = getFullName;
userSchema.methods.encryptField = encryptField;
userSchema.methods.decryptField = decryptField;
userSchema.methods.resetBlockStatus = resetBlockStatus;
userSchema.methods.isPasswordCorrect = isPasswordCorrect;

userSchema.pre("save", async function (next) {
  try {
    // Check if password has been modified or is being set for the first time
    if (this.isModified("password") || this.isNew) {
      // Hash the password using bcrypt
      const hashedPassword = await bcrypt.hash(this.password, 10);
      this.password = hashedPassword;
    }
    next();
  } catch (error) {
    next(error);
  }
});

const UserModel = mongoose.model("User", userSchema);
export default UserModel;
