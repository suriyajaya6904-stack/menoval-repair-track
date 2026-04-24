const mongoose = require('mongoose');
const crypto = require('crypto');
const Job = require('../models/Job');
const Shop = require('../models/Shop');
const Customer = require('../models/Customer');
const ActivityLog = require('../models/ActivityLog');
const { renderTemplate, getStatusKeyFromLabel, getInitialStatus, getTerminalStatuses, isValidStatus, getConfig } = require('../config/businessTypeRegistry');
const { sendMessage } = require('../services/whatsappService');

// ── Generate unique Job ID using business-type prefix ──
// e.g. RPR-2026-0047 for repair, LDR-2026-0012 for laundry
const generateJobId = async (prefix = 'JOB') => {
  const year = new Date().getFullYear();
  const pattern = `${prefix}-${year}-`;

  // Find latest job with this prefix for counter increment
  const latestJob = await Job.findOne({ jobId: { $regex: `^${pattern}` } })
    .select('jobId')
    .sort({ createdAt: -1 })
    .lean(); // lean() for performance — no Mongoose document overhead

  let counter = 1;
  if (latestJob && latestJob.jobId) {
    const parts = latestJob.jobId.split('-');
    if (parts.length === 3) {
      counter = parseInt(parts[2], 10) + 1;
    }
  }

  return `${pattern}${counter.toString().padStart(4, '0')}`;
};

const createJob = async (req, res) => {
  try {
    const shopOwnerId = req.user.id;

    // Fetch shop with businessType in one lean query
    const shop = await Shop.findById(shopOwnerId)
      .select('shopName businessType whatsappConnected _id')
      .lean();

    if (!shop) return res.status(404).json({ error: 'Shop not found' });

    const config = getConfig(shop.businessType);
    const initialStatus = getInitialStatus(shop.businessType);

    const { customerInfo, itemDetails, description, tags, estimatedCost, estimatedDelivery } = req.body;

    // Validate customer info
    if (!customerInfo || !customerInfo.name || !customerInfo.phone) {
      return res.status(400).json({ error: 'Customer name and phone are required' });
    }

    // Validate required fields from config
    if (config && config.fields) {
      for (const field of config.fields) {
        if (field.required && (!itemDetails || !itemDetails[field.key])) {
          return res.status(400).json({ error: `${field.label} is required` });
        }
      }
    }

    // 1. Handle Customer (Find existing or Create new) — lean findOne
    let customer = await Customer.findOne({ phone: customerInfo.phone, shopOwnerId }).select('_id name phone');
    if (!customer) {
      customer = await Customer.create({
        name: customerInfo.name,
        phone: customerInfo.phone,
        shopOwnerId
      });
    }

    // 2. Generate Job ID with business-type prefix
    const prefix = config?.terminology?.jobIdPrefix || 'JOB';
    const jobId = await generateJobId(prefix);

    // 3. Build job document
    const jobData = {
      jobId,
      customer: customer._id,
      shopOwnerId,
      businessType: shop.businessType,
      itemDetails: itemDetails || {},
      description: description || '',
      tags: tags || [],
      estimatedCost: estimatedCost ? Number(estimatedCost) : 0,
      estimatedDelivery: estimatedDelivery || null,
      status: initialStatus.label,
      statusHistory: [{ status: initialStatus.label }],
      trackingToken: crypto.randomBytes(16).toString('hex')
    };

    // Backward-compat: populate legacy repair fields if repair type
    if (shop.businessType === 'repair' && itemDetails) {
      jobData.deviceType = itemDetails.deviceType;
      jobData.brand = itemDetails.brand;
      jobData.model = itemDetails.model;
      jobData.color = itemDetails.color || '';
      jobData.identifier = itemDetails.identifier || '';
      jobData.repairCategory = itemDetails.repairCategory || '';
      jobData.reportedIssue = itemDetails.reportedIssue || [];
      jobData.deviceCondition = itemDetails.deviceCondition || '';
      jobData.internalNotes = '';
    }

    const job = new Job(jobData);
    await job.save();

    // Log creation
    await ActivityLog.create({
      jobId: job._id,
      shopId: shopOwnerId,
      toStatus: initialStatus.label,
      changedBy: 'shop_owner',
      note: `${config?.terminology?.job || 'Job'} created`
    });

    // Populate customer for response + notification
    await job.populate('customer');

    // Respond IMMEDIATELY
    res.status(201).json({ job, notificationSent: false });

    // Background: WhatsApp notification (fire-and-forget)
    if (shop.whatsappConnected) {
      try {
        const statusKey = getStatusKeyFromLabel(shop.businessType, initialStatus.label);
        const trackingUrl = `${process.env.CLIENT_URL || 'http://localhost:5174'}/track/${job.jobId}?token=${job.trackingToken}`;
        const messageText = renderTemplate(shop.businessType, statusKey, {
          customerName: job.customer.name,
          jobId: job.jobId,
          shopName: shop.shopName,
          date: new Date().toLocaleDateString(),
          amount: job.estimatedCost || 0,
          itemDetails: job.itemDetails,
          trackingUrl
        });

        if (messageText) {
          sendMessage(
            shop._id,
            job.customer.phone,
            messageText,
            job._id,
            job.customer.name,
            `status_change:${initialStatus.label}`
          ).then(() => {
            ActivityLog.findOneAndUpdate(
              { jobId: job._id, toStatus: initialStatus.label },
              { whatsappSent: true }
            ).catch(e => console.error('ActivityLog update failed:', e));
          }).catch(err => {
            console.error('Initial WhatsApp notification failed:', err.message);
          });
        }
      } catch (err) {
        console.error('Initial WhatsApp notification failed:', err.message);
      }
    }
  } catch (error) {
    console.error('Create Job Error:', error);
    res.status(500).json({ error: 'Failed to create job' });
  }
};

const getJobs = async (req, res) => {
  try {
    const { status, search } = req.query;

    let query = { shopOwnerId: req.user.id };
    if (status) query.status = status;

    // Uses compound index: shopOwnerId + businessType + status + updatedAt
    let jobs = await Job.find(query)
      .populate('customer', 'name phone')
      .sort({ updatedAt: -1 })
      .lean(); // lean for read performance

    // Client-side filtering for search (populated fields can't be indexed)
    if (search) {
      const s = search.toLowerCase();
      jobs = jobs.filter(j => {
        // Search in jobId, customer name/phone
        if (j.jobId.toLowerCase().includes(s)) return true;
        if (j.customer && j.customer.name.toLowerCase().includes(s)) return true;
        if (j.customer && j.customer.phone.includes(s)) return true;
        // Search in itemDetails (flatten string values)
        if (j.itemDetails) {
          const vals = Object.values(j.itemDetails);
          for (const v of vals) {
            if (typeof v === 'string' && v.toLowerCase().includes(s)) return true;
          }
        }
        // Legacy repair fields
        if (j.brand && j.brand.toLowerCase().includes(s)) return true;
        if (j.model && j.model.toLowerCase().includes(s)) return true;
        return false;
      });
    }

    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
};

const getJobById = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, shopOwnerId: req.user.id })
      .populate('customer');

    if (!job) return res.status(404).json({ error: 'Job not found' });

    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch job details' });
  }
};

const updateJobStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const job = await Job.findOne({ _id: id, shopOwnerId: req.user.id }).populate('customer');
    if (!job) return res.status(404).json({ error: 'Job not found' });

    if (job.status === status) {
      return res.status(400).json({ error: 'Job is already in this status' });
    }

    // Validate status against business type config
    const businessType = job.businessType || 'repair';
    if (!isValidStatus(businessType, status)) {
      return res.status(400).json({ error: `Invalid status "${status}" for business type "${businessType}"` });
    }

    const previousStatus = job.status;
    const shop = await Shop.findById(req.user.id).select('shopName businessType whatsappConnected _id').lean();

    // Update status
    job.status = status;
    job.statusHistory.push({ status });
    await job.save();

    // Log
    await ActivityLog.create({
      jobId: job._id,
      shopId: shop._id,
      fromStatus: previousStatus,
      toStatus: status,
      changedBy: 'shop_owner',
      whatsappSent: false
    });

    // Respond immediately
    res.status(200).json(job);

    // Background: WhatsApp notification
    if (shop.whatsappConnected) {
      try {
        const statusKey = getStatusKeyFromLabel(businessType, status);
        const trackingUrl = `${process.env.CLIENT_URL || 'http://localhost:5174'}/track/${job.jobId}?token=${job.trackingToken}`;
        const messageText = renderTemplate(businessType, statusKey, {
          customerName: job.customer.name,
          jobId: job.jobId,
          shopName: shop.shopName,
          amount: job.finalCost || job.estimatedCost || 0,
          itemDetails: job.itemDetails,
          trackingUrl
        });

        if (messageText) {
          sendMessage(
            shop._id,
            job.customer.phone,
            messageText,
            job._id,
            job.customer.name,
            `status_change:${status}`
          ).then(() => {
            ActivityLog.findOneAndUpdate(
              { jobId: job._id, toStatus: status },
              { whatsappSent: true }
            ).catch(e => console.error('ActivityLog update failed:', e));
          }).catch(err => {
            console.error(`[WhatsApp] ${status} notification FAILED for ${job.jobId}:`, err.message);
          });
        }
      } catch (err) {
        console.error('Status update WhatsApp notification failed:', err.message);
      }
    }
  } catch (error) {
    console.error('Update Job Status Error:', error);
    res.status(500).json({ error: 'Failed to update job status' });
  }
};

const updateJobDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Prevent bypassing status update logic
    if (updates.status) delete updates.status;

    const job = await Job.findOneAndUpdate(
      { _id: id, shopOwnerId: req.user.id },
      { $set: updates },
      { new: true }
    ).populate('customer');

    if (!job) return res.status(404).json({ error: 'Job not found' });

    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update job details' });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const shopOwnerId = req.user.id;

    // Get shop's business type for dynamic terminal statuses
    const shop = await Shop.findById(shopOwnerId).select('businessType').lean();
    const businessType = shop?.businessType || 'repair';
    const terminalStatuses = getTerminalStatuses(businessType);

    // Active jobs = not in terminal statuses
    const activeJobsCount = await Job.countDocuments({
      shopOwnerId,
      status: { $nin: terminalStatuses }
    });

    // Status breakdown for active jobs — uses compound index
    const statusBreakdown = await Job.aggregate([
      { $match: { shopOwnerId: new mongoose.Types.ObjectId(shopOwnerId), status: { $nin: terminalStatuses } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const breakdownObj = {};
    statusBreakdown.forEach(item => breakdownObj[item._id] = item.count);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Completed today = terminal status updated today
    const completedTodayCount = await Job.countDocuments({
      shopOwnerId,
      status: { $in: terminalStatuses },
      updatedAt: { $gte: today }
    });

    // Revenue from paid terminal jobs
    const revenueCalc = await Job.aggregate([
      { $match: { shopOwnerId: new mongoose.Types.ObjectId(shopOwnerId), status: { $in: terminalStatuses }, paymentStatus: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$finalCost' } } }
    ]);
    const totalRevenue = revenueCalc.length > 0 ? revenueCalc[0].total : 0;

    res.status(200).json({
      activeJobs: activeJobsCount,
      completedToday: completedTodayCount,
      totalRevenue,
      statusBreakdown: breakdownObj
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

module.exports = {
  createJob, getJobs, getJobById,
  updateJobStatus, updateJobDetails, getDashboardStats
};
