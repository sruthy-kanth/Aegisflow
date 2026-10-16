import mongoose from 'mongoose';

const doorKnockTaskSchema = new mongoose.Schema(
  {
    alertId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Alert',
      required: true
    },
    householdId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Household',
      required: true
    },
    volunteerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Volunteer',
      default: null
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
    status: {
      type: String,
      enum: ['pending', 'assigned', 'visited', 'unreachable'],
      default: 'pending'
    },
    priority: {
      type: Number, // Higher number = higher priority (e.g. vulnerable households get 10)
      default: 1
    },
    isVulnerable: {
      type: Boolean,
      default: false
    },
    visitedAt: {
      type: Date,
      default: null
    },
    notes: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

doorKnockTaskSchema.index({ alertId: 1, status: 1, priority: -1 });
doorKnockTaskSchema.index({ volunteerId: 1, status: 1 });
doorKnockTaskSchema.index({ regionId: 1, status: 1 });

export const DoorKnockTask = mongoose.model('DoorKnockTask', doorKnockTaskSchema);
