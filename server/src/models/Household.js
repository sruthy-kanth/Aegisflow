import mongoose from 'mongoose';

const householdSchema = new mongoose.Schema(
  {
    regionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Region',
      required: true
    },
    zoneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Zone',
      required: true
    },
    headName: {
      type: String,
      required: true,
      trim: true
    },
    membersCount: {
      type: Number,
      default: 4
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    phoneMasked: {
      type: String,
      default: ''
    },
    phoneEncrypted: {
      type: String,
      default: ''
    },
    address: {
      type: String,
      required: true
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
        required: true
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true
      }
    },
    language: {
      type: String,
      enum: ['en', 'ml'],
      default: 'ml'
    },
    vulnerable: {
      type: Boolean,
      default: false
    },
    vulnerableNotes: {
      type: String,
      default: ''
    },
    assignedCampId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Camp',
      default: null
    },
    primaryRouteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Route',
      default: null
    },
    alternateRouteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Route',
      default: null
    },
    // SHA-256 hash of the 32-byte secret link token
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
    lastAlertReceivedAt: {
      type: Date,
      default: null
    },
    lastConfirmedAt: {
      type: Date,
      default: null
    },
    lastConfirmationStatus: {
      type: String,
      enum: ['none', 'received', 'safe', 'needs_help'],
      default: 'none'
    }
  },
  { timestamps: true }
);

householdSchema.index({ location: '2dsphere' });
householdSchema.index({ regionId: 1, zoneId: 1 });
householdSchema.index({ vulnerable: 1 });

export const Household = mongoose.model('Household', householdSchema);
