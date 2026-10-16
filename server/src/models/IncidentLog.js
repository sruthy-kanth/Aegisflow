import mongoose from 'mongoose';

const incidentLogSchema = new mongoose.Schema(
  {
    regionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Region',
      required: true
    },
    zoneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Zone',
      default: null
    },
    type: {
      type: String,
      enum: ['miss', 'false_alarm', 'landslide_event', 'flash_flood_event', 'sensor_outage', 'drill'],
      required: true
    },
    severity: {
      type: String,
      enum: ['minor', 'moderate', 'severe', 'catastrophic'],
      default: 'moderate'
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    actualRainfallMm: {
      type: Number,
      default: null
    },
    leadTimeMinutes: {
      type: Number,
      default: null
    },
    lessonsLearned: {
      type: String,
      default: ''
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    occurredAt: {
      type: Date,
      default: () => new Date()
    }
  },
  { timestamps: true }
);

incidentLogSchema.index({ regionId: 1, occurredAt: -1 });
incidentLogSchema.index({ type: 1 });

export const IncidentLog = mongoose.model('IncidentLog', incidentLogSchema);
