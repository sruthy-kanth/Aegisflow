import mongoose from 'mongoose';

const zoneSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    },
    regionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Region',
      required: true
    },
    // GeoJSON Polygon for zone geographical boundary
    geometry: {
      type: {
        type: String,
        enum: ['Polygon'],
        required: true,
        default: 'Polygon'
      },
      coordinates: {
        type: [[[Number]]], // Array of arrays of [lng, lat]
        required: true
      }
    },
    centroid: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true
      }
    },
    // Optional threshold overrides specific to this zone
    thresholdOverrides: {
      rainfall24h: { watch: Number, warning: Number, evacuate: Number },
      rainfall72h: { watch: Number, warning: Number, evacuate: Number },
      rainfallForecast24h: { watch: Number, warning: Number, evacuate: Number }
    },
    isLocallyCalibrated: {
      type: Boolean,
      default: false
    },
    populationEstimate: {
      type: Number,
      default: 0
    },
    elevationRangeMeters: {
      min: { type: Number, default: 700 },
      max: { type: Number, default: 1800 }
    },
    slopeRiskScore: {
      type: Number,
      default: 7.5 // 1-10 scale
    },
    currentTier: {
      type: String,
      enum: ['none', 'watch', 'warning', 'evacuate'],
      default: 'none'
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

zoneSchema.index({ geometry: '2dsphere' });
zoneSchema.index({ centroid: '2dsphere' });
zoneSchema.index({ regionId: 1, code: 1 }, { unique: true });

export const Zone = mongoose.model('Zone', zoneSchema);
