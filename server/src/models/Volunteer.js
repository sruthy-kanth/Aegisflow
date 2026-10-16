import mongoose from 'mongoose';

const volunteerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    role: {
      type: String,
      enum: ['VOLUNTEER', 'WARDEN'],
      default: 'VOLUNTEER'
    },
    regionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Region',
      required: true
    },
    assignedZoneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Zone',
      default: null
    },
    assignedRouteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Route',
      default: null
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    tokenRevoked: {
      type: Boolean,
      default: false
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

volunteerSchema.index({ regionId: 1, role: 1 });

export const Volunteer = mongoose.model('Volunteer', volunteerSchema);
