import mongoose from 'mongoose';

const sensorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    deviceId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
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
    type: {
      type: String,
      enum: ['rain', 'soil'],
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
    elevationMeters: {
      type: Number,
      default: 850
    },
    // SHA-256 hash of the generated device API key
    deviceKeyHash: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    lastSeenAt: {
      type: Date,
      default: null
    },
    battery: {
      type: Number, // Percentage 0 - 100
      default: 100
    },
    status: {
      type: String,
      enum: ['active', 'degraded', 'silent', 'inactive'],
      default: 'active'
    },
    calibrationOffset: {
      type: Number,
      default: 0.0
    }
  },
  { timestamps: true }
);

sensorSchema.index({ location: '2dsphere' });
sensorSchema.index({ regionId: 1, zoneId: 1 });
sensorSchema.index({ status: 1 });

export const Sensor = mongoose.model('Sensor', sensorSchema);
