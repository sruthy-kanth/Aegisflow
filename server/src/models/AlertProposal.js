import mongoose from 'mongoose';

const alertProposalSchema = new mongoose.Schema(
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
    proposedTier: {
      type: String,
      enum: ['watch', 'warning', 'evacuate'],
      required: true
    },
    reasons: [
      {
        type: String,
        required: true
      }
    ],
    status: {
      type: String,
      enum: ['draft', 'approved', 'rejected', 'expired', 'cancelled'],
      default: 'draft'
    },
    approvalDeadline: {
      type: Date,
      required: true
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    actionedAt: {
      type: Date,
      default: null
    },
    escalatedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    escalatedAt: {
      type: Date,
      default: null
    },
    notes: {
      type: String,
      default: ''
    },
    editedMessage: {
      en: { type: String, default: '' },
      ml: { type: String, default: '' }
    }
  },
  { timestamps: true }
);

alertProposalSchema.index({ regionId: 1, status: 1 });
alertProposalSchema.index({ zoneId: 1, createdAt: -1 });

export const AlertProposal = mongoose.model('AlertProposal', alertProposalSchema);
