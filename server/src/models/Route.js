import mongoose from 'mongoose';

const routeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
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
      enum: ['primary', 'alternate'],
      default: 'primary'
    },
    status: {
      type: String,
      enum: ['clear', 'blocked', 'unknown'],
      default: 'clear'
    },
    path: {
      type: {
        type: String,
        enum: ['LineString'],
        default: 'LineString',
        required: true
      },
      coordinates: {
        type: [[Number]], // Array of [lng, lat] points
        required: true
      }
    },
    blockedReason: {
      type: String,
      default: ''
    },
    blockedPhotoUrl: {
      type: String,
      default: ''
    },
    destinationCampId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Camp',
      default: null
    },
    updatedBy: {
      type: String,
      default: 'System'
    },
    updatedAtStatus: {
      type: Date,
      default: () => new Date()
    }
  },
  { timestamps: true }
);

routeSchema.index({ path: '2dsphere' });
routeSchema.index({ regionId: 1, zoneId: 1 });
routeSchema.index({ status: 1 });

export const Route = mongoose.model('Route', routeSchema);
