import mongoose from "mongoose";

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
  ipAddress: String,
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

// User schema
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: { type: String },
    modules: [
      {
        type: String,
      },
    ],
    ////////////////////////////////////////////////////////////////// Onboarding
    first_name: {
      type: String,
    },
    middle_name: {
      type: String,
    },
    last_name: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
    },
    employment_type: { type: String },
    skill: {
      type: String,
    },
    company_policy_visited: {
      type: String,
    },
    employee_photo: {
      type: String,
    },
    resume: { type: String },
    address_proof: { type: String },

    ////////////////////////////////////////////////////////////////// KYC
    designation: {
      type: String,
    },
    department: {
      type: String,
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
    },
    dob: {
      type: String,
    },
    mobile: {
      type: String,
    },
    blood_group: {
      type: String,
    },
    highest_qualification: {
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
    },
    kyc_date: { type: String },
    kyc_approval: {
      type: String,
    },
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

// Method to generate backup codes
userSchema.methods.generateBackupCodes = function (numCodes = 10) {
  const codes = [];
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"; // Characters to use in codes

  for (let i = 0; i < numCodes; i++) {
    let code = "";
    for (let j = 0; j < 8; j++) {
      // Ensure each code is 8 characters long
      const randomIndex = Math.floor(Math.random() * characters.length);
      code += characters[randomIndex];
    }
    codes.push(code);
  }

  this.backupCodes = codes; // Save codes to the user instance
  return codes; // Return the generated codes
};

const UserModel = mongoose.model("User", userSchema);
export default UserModel;
