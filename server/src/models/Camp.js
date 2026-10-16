import mongoose from 'mongoose';

const campSchema = new mongoose.Schema(
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
    address: {
      type: String,
      required: true
    },
    capacity: {
      type: Number,
      required: true,
      default: 200
    },
    currentOccupancy: {
      type: Number,
      default: 0
    },
    facilities: [
      {
        type: String // e.g. 'Medical aid', 'Drinking water', 'Sanitation', 'Power backup', 'Child care'
      }
    ],
    contactPerson: {
      type: String,
      default: ''
    },
    contactPhone: {
      type: String,
      default: ''
    },
    lastInspectedAt: {
      type: Date,
      default: () => new Date()
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

campSchema.index({ location: '2dsphere' });
campSchema.index({ regionId: 1 });

export const Camp = mongoose.model('Camp', campSchema);
