import mongoose from 'mongoose';

const deliverySchema = new mongoose.Schema(
  {
    alertId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Alert',
      required: true
    },
    regionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Region',
      required: true
    },
    householdId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Household',
      required: true
    },
    channel: {
      type: String,
      enum: ['sms', 'voice', 'buzzer'],
      required: true
    },
    status: {
      type: String,
      enum: ['queued', 'sent', 'delivered', 'failed'],
      default: 'queued'
    },
    recipientPhoneMasked: {
      type: String,
      default: ''
    },
    language: {
      type: String,
      default: 'ml'
    },
    messageContent: {
      type: String,
      required: true
    },
    providerRef: {
      type: String,
      default: ''
    },
    provider: {
      type: String,
      default: 'mock'
    },
    attempts: {
      type: Number,
      default: 0
    },
    lastAttemptAt: {
      type: Date,
      default: null
    },
    deliveredAt: {
      type: Date,
      default: null
    },
    errorMessage: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

deliverySchema.index({ alertId: 1, householdId: 1 });
deliverySchema.index({ regionId: 1, status: 1 });

export const Delivery = mongoose.model('Delivery', deliverySchema);
