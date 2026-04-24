module.exports = {
  key: 'repair',
  label: 'Mobile & Computer Repair',
  icon: 'wrench',
  terminology: {
    job: 'Repair Job', jobPlural: 'Repair Jobs',
    item: 'Device', itemPlural: 'Devices',
    actionVerb: 'Repair', jobIdPrefix: 'RPR',
    createButton: 'New Repair Job', registerButton: 'Register Device'
  },
  fields: [
    { key: 'deviceType', label: 'Device Type', type: 'select', options: ['Mobile', 'Laptop'], required: true, group: 'item', order: 1 },
    { key: 'brand', label: 'Brand', type: 'searchable_dropdown', dataSource: 'deviceBrands', required: true, group: 'item', order: 2, dependsOnValue: { field: 'deviceType', mapping: { Mobile: 'MOBILE_BRANDS_MODELS', Laptop: 'LAPTOP_BRANDS_MODELS' } } },
    { key: 'model', label: 'Model', type: 'searchable_dropdown', dataSource: 'deviceModels', required: true, group: 'item', order: 3, dependsOn: 'brand' },
    { key: 'identifier', label: 'IMEI / Serial No.', type: 'text', required: false, group: 'item', order: 4 },
    { key: 'color', label: 'Color / Finish', type: 'text', required: false, group: 'item', order: 5 },
    { key: 'repairCategory', label: 'Repair Category', type: 'select', options: ['Hardware', 'Software', 'Both', 'General Service', 'Data Recovery', 'Unsure'], required: true, group: 'details', order: 1 },
    { key: 'reportedIssue', label: 'Reported Issues', type: 'tags', required: false, group: 'details', order: 2,
      presetTags: { Mobile: ['Broken Screen','Battery Drain','Charging Port','Software Hang','Water Damage','Camera Issue','Speaker/Mic'], Laptop: ['Slow Performance','Screen Damage','Keyboard Issue','Charging Issue','Overheating','No Display','Virus/Malware','RAM/SSD Upgrade'] },
      presetTagKey: 'deviceType'
    },
    { key: 'deviceCondition', label: 'Condition on Receipt', type: 'textarea', required: false, group: 'details', order: 3, placeholder: 'e.g. Minor scratches on back glass, missing SIM tray.' }
  ],
  statuses: [
    { key: 'received', label: 'Received', type: 'initial', color: '#3B82F6', cssClass: 'status-received' },
    { key: 'under_diagnosis', label: 'Under Diagnosis', type: 'progress', color: '#8B5CF6', cssClass: 'status-diagnosis' },
    { key: 'waiting_for_parts', label: 'Waiting for Parts', type: 'progress', color: '#F59E0B', cssClass: 'status-waiting' },
    { key: 'repair_in_progress', label: 'Repair in Progress', type: 'progress', color: '#6366F1', cssClass: 'status-repairing' },
    { key: 'quality_check', label: 'Quality Check', type: 'progress', color: '#14B8A6', cssClass: 'status-quality' },
    { key: 'ready_for_pickup', label: 'Ready for Pickup', type: 'ready', color: '#22C55E', cssClass: 'status-ready' },
    { key: 'delivered_closed', label: 'Delivered / Closed', type: 'terminal', color: '#10B981', cssClass: 'status-delivered' },
    { key: 'cannot_be_done', label: 'Cannot be Repaired', type: 'terminal', color: '#EF4444', cssClass: 'status-cannot' },
    { key: 'on_hold', label: 'On Hold', type: 'hold', color: '#6B7280', cssClass: 'status-hold' }
  ],
  messageTemplates: {
    received: "Hello {{customerName}}! \n\nWe have received your *{{brand}} {{model}}* for repair.\n\n Job ID: *{{jobId}}*\n Date: {{date}}\n\nWe will keep you updated at every step. Thank you for choosing *{{shopName}}*! ",
    under_diagnosis: "Hi {{customerName}}! \n\nOur technician has started diagnosing your *{{brand}} {{model}}*.\n\n Job ID: *{{jobId}}*\n\nWe'll let you know once we identify the issue.\n\nTrack status: {{trackingUrl}} — *{{shopName}}*",
    waiting_for_parts: "Hi {{customerName}}! \n\nWe've identified the issue with your *{{brand}} {{model}}*.\n\nWe've ordered the required part and will begin repairs as soon as it arrives.\n\n Job ID: *{{jobId}}*\n\nThank you for your patience!\n\nTrack status: {{trackingUrl}} — *{{shopName}}*",
    repair_in_progress: "Hi {{customerName}}! \n\nGreat news! Our technician has started repairing your *{{brand}} {{model}}*.\n\n Job ID: *{{jobId}}*\n\nWe'll notify you as soon as it's done!\n\nTrack status: {{trackingUrl}}\n\nTrack status: {{trackingUrl}} — *{{shopName}}*",
    quality_check: "Hi {{customerName}}! \n\nThe repair on your *{{brand}} {{model}}* is complete! We're running a final quality check.\n\n Job ID: *{{jobId}}*\n\nAlmost ready!\n\nTrack status: {{trackingUrl}} — *{{shopName}}*",
    ready_for_pickup: "Hi {{customerName}}! \n\nYour *{{brand}} {{model}}* is READY FOR PICKUP!\n\n Job ID: *{{jobId}}*\n Total Amount: ₹{{amount}}\n\nPlease visit us at your earliest convenience.\n\nThank you for trusting *{{shopName}}*! ",
    delivered_closed: "Hi {{customerName}}! \n\nThank you for collecting your *{{brand}} {{model}}*.\n\nWe hope it's working perfectly! If you face any issues, feel free to contact us.\n\nSee you next time! — *{{shopName}}* ⭐",
    cannot_be_done: "Hi {{customerName}}.\n\nWe regret to inform you that your *{{brand}} {{model}}* unfortunately cannot be repaired.\n\n Job ID: *{{jobId}}*\n\nPlease visit us to collect your device. — *{{shopName}}*",
    on_hold: "Hi {{customerName}}.\n\nYour repair job for *{{brand}} {{model}}* is currently on hold.\n\n Job ID: *{{jobId}}*\n\nPlease contact us when you'd like us to proceed.\n\nTrack status: {{trackingUrl}} — *{{shopName}}*"
  },
  financials: { showEstimatedCost: true, showFinalCost: true, showAdvancePaid: true, currency: '₹', pricingModel: 'flat' },
  // Summary builder: how to display item info in lists/cards
  itemSummary: (details) => `${details.brand || ''} ${details.model || ''}`.trim() || 'Device',
  itemIcon: (details) => details.deviceType === 'Laptop' ? 'laptop' : 'smartphone'
};
