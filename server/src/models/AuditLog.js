import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    actorName: {
      type: String,
      default: 'System'
    },
    role: {
      type: String,
      default: 'SYSTEM'
    },
    action: {
      type: String,
      required: true,
      trim: true
    },
    entity: {
      type: String,
      required: true,
      trim: true
    },
    entityId: {
      type: String,
      default: null
    },
    regionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Region',
      default: null
    },
    before: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    after: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    ip: {
      type: String,
      default: ''
    },
    userAgent: {
      type: String,
      default: ''
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: { createdAt: 'at', updatedAt: false }
  }
);

auditLogSchema.index({ at: -1 });
auditLogSchema.index({ entity: 1 });
auditLogSchema.index({ regionId: 1, at: -1 });
auditLogSchema.index({ actorId: 1 });

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
