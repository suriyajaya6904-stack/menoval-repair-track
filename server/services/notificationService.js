/**
 * Unified Notification Service — Config-driven WhatsApp templates.
 * 
 * Replaces the old hardcoded statusTemplates with the business type registry.
 * Maintains backward-compatible API for any code still calling these functions.
 */

const whatsappService = require('./whatsappService');
const { renderTemplate, getStatusKeyFromLabel } = require('../config/businessTypeRegistry');

/**
 * Triggers an automated WhatsApp message based on the job status update.
 * Now config-driven: reads templates from BusinessTypeConfig.
 */
async function sendStatusUpdateNotification(job, shopName) {
  try {
    const businessType = job.businessType || 'repair';
    const statusKey = getStatusKeyFromLabel(businessType, job.status);

    if (!statusKey) {
      console.log(`No automated message configured for status: ${job.status}`);
      return false;
    }

    const trackingUrl = job.trackingToken
      ? `${process.env.CLIENT_URL || 'http://localhost:5174'}/track/${job.jobId}?token=${job.trackingToken}`
      : '';

    const message = renderTemplate(businessType, statusKey, {
      customerName: job.customer?.name || '',
      jobId: job.jobId,
      shopName,
      date: new Date().toLocaleDateString(),
      amount: job.finalCost || job.estimatedCost || 0,
      itemDetails: job.itemDetails || {},
      trackingUrl,
      // Legacy field flattening for backward compat
      brand: job.itemDetails?.brand || job.brand || '',
      model: job.itemDetails?.model || job.model || '',
      deviceType: job.itemDetails?.deviceType || job.deviceType || ''
    });

    if (!message) {
      console.log(`No template found for ${businessType}:${statusKey}`);
      return false;
    }

    await whatsappService.sendMessage(job.shopOwnerId, job.customer.phone, message);
    return true;
  } catch (error) {
    console.error(`Failed to send status notification for job ${job.jobId}:`, error);
    return false;
  }
}

/**
 * Triggers a payment pending reminder.
 * Uses a generic template since this is the same across all business types.
 */
async function sendPaymentReminder(job, shopName) {
  try {
    const businessType = job.businessType || 'repair';
    
    // Use the ready_for_pickup template as a payment reminder
    const message = renderTemplate(businessType, 'ready_for_pickup', {
      customerName: job.customer?.name || '',
      jobId: job.jobId,
      shopName,
      amount: job.finalCost || job.estimatedCost || 0,
      itemDetails: job.itemDetails || {},
      brand: job.itemDetails?.brand || job.brand || '',
      model: job.itemDetails?.model || job.model || ''
    });

    if (!message) return false;

    await whatsappService.sendMessage(job.shopOwnerId, job.customer.phone, message);
    return true;
  } catch (error) {
    console.error(`Failed to send payment reminder for job ${job.jobId}:`, error);
    return false;
  }
}

module.exports = { 
  sendStatusUpdateNotification, 
  sendPaymentReminder
};
