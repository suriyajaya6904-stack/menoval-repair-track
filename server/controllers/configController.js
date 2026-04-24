const { getClientConfig, getAllBusinessTypes } = require('../config/businessTypeRegistry');
const Shop = require('../models/Shop');

/**
 * GET /api/config/business-type
 * Returns the config for the currently logged-in shop's business type.
 * Cached client-side via Cache-Control header (1 hour).
 */
const getMyBusinessConfig = async (req, res) => {
  try {
    const shop = await Shop.findById(req.user.id).select('businessType').lean();
    if (!shop) return res.status(404).json({ error: 'Shop not found' });

    const config = getClientConfig(shop.businessType);
    if (!config) return res.status(404).json({ error: 'Business type config not found' });

    res.set('Cache-Control', 'private, no-store'); // Per-user — must not be cached across logins
    res.status(200).json(config);
  } catch (error) {
    console.error('Config fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch business config' });
  }
};

/**
 * GET /api/config/business-types
 * Returns all available business types (for admin shop creation dropdown).
 */
const listBusinessTypes = (req, res) => {
  res.set('Cache-Control', 'public, max-age=86400'); // 24 hour cache
  res.status(200).json(getAllBusinessTypes());
};

module.exports = { getMyBusinessConfig, listBusinessTypes };
