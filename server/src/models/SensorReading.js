import mongoose from 'mongoose';

const sensorReadingSchema = new mongoose.Schema(
  {
    sensorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sensor',
      required: true
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
    value: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      default: 'mm'
    },
    timestamp: {
      type: Date,
      default: () => new Date(),
      required: true
    }
  },
  { timestamps: true }
);

sensorReadingSchema.index({ sensorId: 1, timestamp: -1 });
sensorReadingSchema.index({ zoneId: 1, timestamp: -1 });
sensorReadingSchema.index({ timestamp: -1 });

export const SensorReading = mongoose.model('SensorReading', sensorReadingSchema);
