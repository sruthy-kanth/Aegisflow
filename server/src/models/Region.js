import mongoose from 'mongoose';

const regionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      unique: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    country: {
      type: String,
      default: 'India'
    },
    description: {
      type: String,
      default: ''
    },
    centerLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
      }
    },
    boundary: {
      type: {
        type: String,
        enum: ['Polygon', 'MultiPolygon'],
        default: 'Polygon'
      },
      coordinates: {
        type: Array,
        required: false
      }
    },
    bounds: {
      north: { type: Number, required: true },
      south: { type: Number, required: true },
      east: { type: Number, required: true },
      west: { type: Number, required: true }
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata'
    },
    active: {
      type: Boolean,
      default: true
    },
    emergencyContacts: [
      {
        title: { type: String, required: true },
        phone: { type: String, required: true },
        role: { type: String, default: 'Control Room' }
      }
    ],
    settings: {
      approvalTimeoutMinutes: { type: Number, default: 15 },
      voiceFallbackDelayMinutes: { type: Number, default: 20 },
      doorKnockDelayMinutes: { type: Number, default: 30 },
      buzzerEnabled: { type: Boolean, default: true }
    }
  },
  { timestamps: true }
);

regionSchema.index({ centerLocation: '2dsphere' });
regionSchema.index({ active: 1 });

export const Region = mongoose.model('Region', regionSchema);
