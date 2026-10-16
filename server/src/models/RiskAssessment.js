import mongoose from 'mongoose';

const riskAssessmentSchema = new mongoose.Schema(
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
    computedAt: {
      type: Date,
      default: () => new Date(),
      required: true
    },
    tier: {
      type: String,
      enum: ['none', 'watch', 'warning', 'evacuate'],
      required: true
    },
    confidence: {
      dataFreshness: {
        type: String,
        enum: ['fresh', 'moderate', 'stale'],
        default: 'fresh'
      },
      sensorCoverage: {
        type: String,
        enum: ['high', 'medium', 'low', 'none'],
        default: 'none'
      },
      rainfallSourceQuality: {
        type: String,
        enum: ['ground_sensor', 'satellite_high_res', 'model_forecast'],
        default: 'model_forecast'
      },
      thresholdCalibration: {
        type: String,
        enum: ['locally_calibrated', 'regional_default'],
        default: 'regional_default'
      }
    },
    reasons: [
      {
        type: String
      }
    ],
    inputs: {
      rain24h: { type: Number, default: 0 },
      rain72h: { type: Number, default: 0 },
      rainForecast24h: { type: Number, default: 0 },
      soilMoisture: { type: Number, default: null }
    },
    thresholdVersion: {
      type: Number,
      default: 1
    }
  },
  { timestamps: true }
);

riskAssessmentSchema.index({ zoneId: 1, computedAt: -1 });
riskAssessmentSchema.index({ regionId: 1, computedAt: -1 });

export const RiskAssessment = mongoose.model('RiskAssessment', riskAssessmentSchema);
