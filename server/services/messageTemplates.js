/**
 * Config-driven message template engine.
 * Templates are defined per-business-type in config/businessTypes/*.js
 * This module provides the legacy getMessageForStatus API for backward compatibility
 * AND the new renderTemplate API from the config registry.
 */

const { renderTemplate, getStatusKeyFromLabel } = require('../config/businessTypeRegistry');

/**
 * Legacy API — maps old status labels to config-driven templates.
 * Used by existing code that hasn't been refactored yet.
 * 
 * @param {string} status - Status label (e.g. 'Received', 'Ready for Pickup')
 * @param {Object} data - { customerName, deviceBrand, deviceModel, jobId, shopName, amount, date, reason }
 * @param {string} [businessType='repair'] - Business type key
 * @returns {string|null}
 */
const getMessageForStatus = (status, data, businessType = 'repair') => {
  const statusKey = getStatusKeyFromLabel(businessType, status);
  if (!statusKey) return null;

  // Map legacy data fields to new template format
  const templateData = {
    customerName: data.customerName,
    jobId: data.jobId,
    shopName: data.shopName,
    date: data.date || new Date().toLocaleDateString(),
    amount: data.amount || 0,
    itemDetails: {
      brand: data.deviceBrand || data.brand,
      model: data.deviceModel || data.model,
      deviceType: data.deviceType,
      ...(data.itemDetails || {})
    }
  };

  return renderTemplate(businessType, statusKey, templateData);
};

module.exports = { getMessageForStatus };
