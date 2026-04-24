/**
 * BusinessType Config Registry — In-memory cached, zero-DB-dependency config loader.
 * All configs loaded once at require() time and cached as a frozen Map for O(1) lookups.
 * 
 * Performance: No DB calls, no file I/O after initial load. ~0ms per lookup.
 */

const path = require('path');
const fs = require('fs');

// ── Load all business type configs at startup ──
const CONFIG_DIR = path.join(__dirname, 'businessTypes');
const _configMap = new Map();
const _configList = [];

// Auto-discover and load all .js files in businessTypes/
const files = fs.readdirSync(CONFIG_DIR).filter(f => f.endsWith('.js'));
for (const file of files) {
  const config = require(path.join(CONFIG_DIR, file));
  if (config.key) {
    // Freeze config to prevent accidental mutation
    Object.freeze(config.terminology);
    Object.freeze(config.financials);
    config.statuses.forEach(s => Object.freeze(s));
    Object.freeze(config.statuses);
    Object.freeze(config.messageTemplates);
    
    // Pre-compute lookup maps for O(1) status lookups
    config._statusByKey = {};
    config._statusByLabel = {};
    config._terminalStatuses = [];
    config._initialStatus = null;
    
    for (const s of config.statuses) {
      config._statusByKey[s.key] = s;
      config._statusByLabel[s.label] = s;
      if (s.type === 'terminal') config._terminalStatuses.push(s.label);
      if (s.type === 'initial') config._initialStatus = s;
    }
    
    Object.freeze(config._statusByKey);
    Object.freeze(config._statusByLabel);
    Object.freeze(config._terminalStatuses);
    
    _configMap.set(config.key, config);
    _configList.push({
      key: config.key,
      label: config.label,
      icon: config.icon
    });
  }
}

Object.freeze(_configList);

/**
 * Get config for a business type. O(1) Map lookup.
 * @param {string} businessType - The business type key (e.g. 'repair', 'laundry')
 * @returns {Object|null} The frozen config object or null
 */
function getConfig(businessType) {
  return _configMap.get(businessType) || _configMap.get('repair'); // fallback to repair
}

/**
 * Get list of all available business types (for admin dropdown).
 * @returns {Array<{key, label, icon}>}
 */
function getAllBusinessTypes() {
  return _configList;
}

/**
 * Validate a status label against a business type's allowed statuses. O(1) lookup.
 * @param {string} businessType
 * @param {string} statusLabel - The display label (e.g. 'Received', 'Under Diagnosis')
 * @returns {boolean}
 */
function isValidStatus(businessType, statusLabel) {
  const config = getConfig(businessType);
  return config ? !!config._statusByLabel[statusLabel] : false;
}

/**
 * Get the initial (first) status for a business type.
 * @param {string} businessType
 * @returns {Object} Status object { key, label, type, color, cssClass }
 */
function getInitialStatus(businessType) {
  const config = getConfig(businessType);
  return config?._initialStatus || { key: 'received', label: 'Received', type: 'initial' };
}

/**
 * Get terminal status labels for a business type (for dashboard stats exclusion).
 * @param {string} businessType
 * @returns {string[]}
 */
function getTerminalStatuses(businessType) {
  const config = getConfig(businessType);
  return config?._terminalStatuses || ['Delivered / Closed'];
}

/**
 * Get all status labels for a business type (for dropdown/filter rendering).
 * @param {string} businessType
 * @returns {string[]}
 */
function getStatusLabels(businessType) {
  const config = getConfig(businessType);
  return config ? config.statuses.map(s => s.label) : [];
}

/**
 * Render a WhatsApp message template with variable substitution.
 * Uses regex replace for {{variable}} placeholders — O(n) where n = template length.
 * Flattens itemDetails into the data object for template access.
 * 
 * @param {string} businessType
 * @param {string} statusKey - Status key (e.g. 'received', 'ready_for_pickup')
 * @param {Object} data - Template variables (customerName, jobId, shopName, etc.)
 * @returns {string|null}
 */
function renderTemplate(businessType, statusKey, data) {
  const config = getConfig(businessType);
  if (!config) return null;
  
  const template = config.messageTemplates[statusKey];
  if (!template) return null;
  
  // Flatten itemDetails into data for template access
  const flatData = { ...data };
  if (data.itemDetails && typeof data.itemDetails === 'object') {
    for (const [k, v] of Object.entries(data.itemDetails)) {
      if (!(k in flatData) && typeof v !== 'object') {
        flatData[k] = v;
      }
    }
    // Build itemsSummary for per-item business types
    if (Array.isArray(data.itemDetails.items)) {
      flatData.itemsSummary = data.itemDetails.items
        .map(i => `${i.qty || 0} ${i.type || 'item'}`)
        .join(', ');
    }
  }
  
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const val = flatData[key];
    return val !== undefined && val !== null ? String(val) : '';
  });
}

/**
 * Get status key from status label (for template lookup). O(1).
 * @param {string} businessType
 * @param {string} statusLabel
 * @returns {string|null}
 */
function getStatusKeyFromLabel(businessType, statusLabel) {
  const config = getConfig(businessType);
  if (!config) return null;
  const status = config._statusByLabel[statusLabel];
  return status ? status.key : null;
}

/**
 * Get a sanitized config safe for sending to the frontend (no functions).
 * @param {string} businessType
 * @returns {Object}
 */
function getClientConfig(businessType) {
  const config = getConfig(businessType);
  if (!config) return null;
  
  // Strip functions (itemSummary, itemIcon) — frontend will have its own renderers
  return {
    key: config.key,
    label: config.label,
    icon: config.icon,
    terminology: config.terminology,
    fields: config.fields,
    statuses: config.statuses,
    financials: config.financials
  };
}

module.exports = {
  getConfig,
  getAllBusinessTypes,
  isValidStatus,
  getInitialStatus,
  getTerminalStatuses,
  getStatusLabels,
  renderTemplate,
  getStatusKeyFromLabel,
  getClientConfig
};
