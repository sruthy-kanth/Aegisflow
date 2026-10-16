import mongoose from 'mongoose';

const rainfallObservationSchema = new mongoose.Schema(
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
    timestamp: {
      type: Date,
      required: true
    },
    mm: {
      type: Number,
      required: true
    },
    source: {
      type: String,
      enum: ['sensor', 'open-meteo', 'manual'],
      default: 'open-meteo'
    }
  },
  { timestamps: true }
);

rainfallObservationSchema.index({ zoneId: 1, timestamp: -1 });
rainfallObservationSchema.index({ regionId: 1, timestamp: -1 });

export const RainfallObservation = mongoose.model('RainfallObservation', rainfallObservationSchema);
