import mongoose from 'mongoose';

const confirmationSchema = new mongoose.Schema(
  {
    alertId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Alert',
      default: null
    },
    householdId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Household',
      required: true
    },
    regionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Region',
      required: true
    },
    status: {
      type: String,
      enum: ['received', 'safe', 'needs_help'],
      required: true
    },
    at: {
      type: Date,
      default: () => new Date(),
      required: true
    },
    needDetails: {
      type: String,
      default: ''
    },
    rescueRequired: {
      type: Boolean,
      default: false
    },
    evacuatingToCampId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Camp',
      default: null
    },
    ip: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

confirmationSchema.index({ householdId: 1, at: -1 });
confirmationSchema.index({ alertId: 1, status: 1 });
confirmationSchema.index({ regionId: 1, status: 1 });

export const Confirmation = mongoose.model('Confirmation', confirmationSchema);
