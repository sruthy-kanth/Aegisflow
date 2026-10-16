import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema(
  {
    regionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Region',
      required: true
    },
    tier: {
      type: String,
      enum: ['watch', 'warning', 'evacuate'],
      required: true
    },
    zones: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Zone',
        required: true
      }
    ],
    proposalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AlertProposal',
      default: null
    },
    message: {
      en: { type: String, required: true },
      ml: { type: String, required: true }
    },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    issuedByName: {
      type: String,
      default: 'Authorized DDMA Officer'
    },
    issuedAt: {
      type: Date,
      default: () => new Date(),
      required: true
    },
    source: {
      type: String,
      enum: ['auto', 'manual'],
      default: 'manual'
    },
    status: {
      type: String,
      enum: ['active', 'resolved', 'cancelled'],
      default: 'active'
    },
    stats: {
      totalHouseholds: { type: Number, default: 0 },
      deliveriesQueued: { type: Number, default: 0 },
      deliveriesSent: { type: Number, default: 0 },
      deliveriesDelivered: { type: Number, default: 0 },
      deliveriesFailed: { type: Number, default: 0 },
      confirmationsReceived: { type: Number, default: 0 },
      safeCount: { type: Number, default: 0 },
      needsHelpCount: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
);

alertSchema.index({ regionId: 1, issuedAt: -1 });
alertSchema.index({ status: 1 });

export const Alert = mongoose.model('Alert', alertSchema);
