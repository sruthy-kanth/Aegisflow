import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['SUPERADMIN', 'ADMIN'],
      required: true
    },
    regionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Region',
      required: function () {
        return this.role === 'ADMIN';
      },
      default: null
    },
    phone: {
      type: String,
      default: ''
    },
    designation: {
      type: String,
      default: 'Disaster Management Officer'
    },
    department: {
      type: String,
      default: 'District Disaster Management Authority (DDMA)'
    },
    backupAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    active: {
      type: Boolean,
      default: true
    },
    lastLoginAt: {
      type: Date,
      default: null
    },
    refreshTokenHash: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

userSchema.index({ role: 1 });
userSchema.index({ regionId: 1 });

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

userSchema.statics.hashPassword = async function (plainPassword) {
  return bcrypt.hash(plainPassword, 10);
};

export const User = mongoose.model('User', userSchema);
