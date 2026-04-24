const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const jobSchema = new mongoose.Schema({
  jobId: { type: String, required: true, unique: true }, // e.g. RPR-2026-0047, LDR-2026-0012
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  shopOwnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  businessType: { type: String, required: true, default: 'repair' },

  // ── Dynamic Fields (stores ALL business-specific data as key-value) ──
  // For repair: { deviceType, brand, model, color, identifier, repairCategory, reportedIssue, deviceCondition, ... }
  // For laundry: { serviceType, items: [{type, qty, rate, subtotal}], specialInstructions, ... }
  // For automotive: { vehicleType, brand, model, regNumber, serviceType, ... }
  itemDetails: { type: mongoose.Schema.Types.Mixed, default: {} },

  // ── Universal fields (every business type uses these) ──
  description: { type: String, default: '' },
  internalNotes: { type: String, default: '' },
  tags: [{ type: String }],

  // ── Backward-compat fields for repair (read-only after migration, used for existing queries) ──
  deviceType: { type: String },
  brand: { type: String },
  model: { type: String },
  color: { type: String, default: '' },
  identifier: { type: String, default: '' },
  repairCategory: { type: String, default: '' },
  reportedIssue: [{ type: String }],
  deviceCondition: { type: String, default: '' },
  technicianDiagnosis: { type: String, default: '' },
  technicianNotes: { type: String, default: '' },
  partsRequired: [{ type: String }],

  // ── Status and Tracking (no hardcoded enum — validated at app level via config) ──
  status: { type: String, required: true, default: 'Received' },
  statusHistory: [statusHistorySchema],

  // ── Financials (universal) ──
  estimatedCost: { type: Number, default: 0 },
  finalCost: { type: Number, default: 0 },
  advancePaid: { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ['Pending', 'Partial', 'Paid'], default: 'Pending' },

  priority: { type: String, enum: ['normal', 'urgent', 'vip'], default: 'normal' },

  // ── Dates ──
  receivedDate: { type: Date, default: Date.now },
  estimatedDelivery: { type: Date },
  completedDate: { type: Date },
  deliveredDate: { type: Date },

  // ── Public tracking ──
  trackingToken: { type: String, unique: true, sparse: true },

  // ── WhatsApp tracking ──
  lastMessageSent: { type: Date },
  messagesSentCount: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// ── Performance Indexes ──
// Primary compound index: covers 95% of queries (job listing, filtering, dashboard)
jobSchema.index({ shopOwnerId: 1, businessType: 1, status: 1, updatedAt: -1 });
// Dashboard stats: active jobs count, revenue aggregation
jobSchema.index({ shopOwnerId: 1, status: 1, paymentStatus: 1 });
// Customer lookup for job history
jobSchema.index({ customer: 1, shopOwnerId: 1 });
// Text search on description for free-text search
jobSchema.index({ description: 'text', 'itemDetails.brand': 'text', 'itemDetails.model': 'text' });
// Public tracking page lookup
jobSchema.index({ trackingToken: 1 });

// Update the updatedAt timestamp before saving
jobSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Job', jobSchema);
