/**
 * Public Job Tracking Controller — No authentication required.
 * Secured by per-job trackingToken (32-char hex).
 * Returns job status, history timeline, shop info, and config statuses.
 */

const Job = require('../models/Job');
const Shop = require('../models/Shop');
const { getClientConfig } = require('../config/businessTypeRegistry');
const fs = require('fs');
const path = require('path');

// Pre-load banner as base64 at startup (supports png, gif, jpg, webp)
let bannerBase64 = null;
const bannerDir = path.join(__dirname, '..', 'assets');
const supportedFormats = [
  { ext: 'gif', mime: 'image/gif' },
  { ext: 'png', mime: 'image/png' },
  { ext: 'jpg', mime: 'image/jpeg' },
  { ext: 'jpeg', mime: 'image/jpeg' },
  { ext: 'webp', mime: 'image/webp' }
];

for (const fmt of supportedFormats) {
  const filePath = path.join(bannerDir, `banner.${fmt.ext}`);
  if (fs.existsSync(filePath)) {
    const buffer = fs.readFileSync(filePath);
    bannerBase64 = `data:${fmt.mime};base64,${buffer.toString('base64')}`;
    console.log(`[Tracking] Banner loaded: banner.${fmt.ext}`);
    break; // Use the first found format (GIF takes priority)
  }
}
if (!bannerBase64) console.log('[Tracking] No banner image found in', bannerDir);

/**
 * GET /api/track/:jobId?token=xxx
 * Public endpoint — returns tracking data for a job.
 */
const getJobTracking = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { token } = req.query;

    if (!token) {
      return res.status(403).json({ error: 'Tracking token required' });
    }

    // Find job by jobId (human-readable ID like RPR-2026-0047)
    const job = await Job.findOne({ jobId })
      .populate('customer', 'name phone')
      .populate('shopOwnerId', 'shopName phone address city')
      .lean();

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Validate tracking token
    if (job.trackingToken !== token) {
      return res.status(403).json({ error: 'Invalid tracking token' });
    }

    // Get business type config for statuses
    const config = getClientConfig(job.businessType || 'repair');
    const statuses = config ? config.statuses : [];

    // Build response — only safe public data, no internal notes or financials
    const trackingData = {
      jobId: job.jobId,
      businessType: job.businessType || 'repair',
      shopName: job.shopOwnerId?.shopName || '',
      shopCity: job.shopOwnerId?.city || '',
      customerName: job.customer?.name || '',
      status: job.status,
      statusHistory: (job.statusHistory || []).map(h => ({
        status: h.status,
        timestamp: h.timestamp
      })),
      statuses: statuses.map(s => ({
        key: s.key,
        label: s.label,
        type: s.type,
        color: s.color
      })),
      terminology: config?.terminology || {},
      receivedDate: job.receivedDate || job.createdAt,
      estimatedDelivery: job.estimatedDelivery,
      estimatedCost: job.estimatedCost || 0,
      banner: bannerBase64
    };

    // Public data — cacheable for 5 minutes
    res.set('Cache-Control', 'public, max-age=300');
    res.status(200).json(trackingData);
  } catch (error) {
    console.error('Tracking fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch tracking data' });
  }
};

module.exports = { getJobTracking };
