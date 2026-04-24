module.exports = {
  key: 'appliance',
  label: 'Appliance Services',
  icon: 'fan',
  terminology: {
    job: 'Service Request', jobPlural: 'Service Requests',
    item: 'Appliance', itemPlural: 'Appliances',
    actionVerb: 'Service', jobIdPrefix: 'APL',
    createButton: 'New Service Request', registerButton: 'Register Appliance'
  },
  fields: [
    { key: 'applianceType', label: 'Appliance Type', type: 'select', options: ['AC / Air Conditioner', 'Refrigerator', 'Washing Machine', 'Microwave', 'RO/Water Purifier', 'Geyser', 'TV', 'Mixer/Grinder', 'Inverter/UPS', 'Other'], required: true, group: 'item', order: 1 },
    { key: 'brand', label: 'Brand', type: 'text', required: true, group: 'item', order: 2, placeholder: 'e.g. LG, Samsung, Voltas' },
    { key: 'model', label: 'Model / Capacity', type: 'text', required: false, group: 'item', order: 3, placeholder: 'e.g. 1.5 Ton Split AC' },
    { key: 'serialNumber', label: 'Serial Number', type: 'text', required: false, group: 'item', order: 4 },
    { key: 'serviceType', label: 'Service Type', type: 'select', options: ['Repair', 'Installation', 'AMC Service', 'Gas Refill', 'Deep Cleaning', 'General Service', 'Uninstallation'], required: true, group: 'details', order: 1 },
    { key: 'complaint', label: 'Complaint / Issue', type: 'textarea', required: true, group: 'details', order: 2, placeholder: 'Describe the issue...' },
    { key: 'location', label: 'Service Location', type: 'select', options: ['Shop/Workshop', 'Customer Home', 'Customer Office'], required: false, group: 'details', order: 3 }
  ],
  statuses: [
    { key: 'received', label: 'Complaint Logged', type: 'initial', color: '#3B82F6', cssClass: 'status-received' },
    { key: 'diagnosis', label: 'Under Diagnosis', type: 'progress', color: '#8B5CF6', cssClass: 'status-diagnosis' },
    { key: 'waiting_for_parts', label: 'Waiting for Parts', type: 'progress', color: '#F59E0B', cssClass: 'status-waiting' },
    { key: 'in_progress', label: 'Repair in Progress', type: 'progress', color: '#6366F1', cssClass: 'status-repairing' },
    { key: 'ready_for_pickup', label: 'Completed', type: 'ready', color: '#22C55E', cssClass: 'status-ready' },
    { key: 'delivered_closed', label: 'Closed', type: 'terminal', color: '#10B981', cssClass: 'status-delivered' },
    { key: 'cannot_be_done', label: 'Cannot be Repaired', type: 'terminal', color: '#EF4444', cssClass: 'status-cannot' },
    { key: 'on_hold', label: 'On Hold', type: 'hold', color: '#6B7280', cssClass: 'status-hold' }
  ],
  messageTemplates: {
    received: "Hello {{customerName}}! \n\nYour complaint for *{{applianceType}}* ({{brand}}) has been logged.\n\n Request ID: *{{jobId}}*\n Date: {{date}}\n\nWe'll keep you updated.\n\nTrack status: {{trackingUrl}} — *{{shopName}}*",
    diagnosis: "Hi {{customerName}}! \n\nOur technician is diagnosing your *{{applianceType}}*.\n\n Request ID: *{{jobId}}*\n\nWe'll share the findings shortly. — *{{shopName}}*",
    waiting_for_parts: "Hi {{customerName}}! \n\nA replacement part is needed for your *{{applianceType}}*. It has been ordered.\n\n Request ID: *{{jobId}}*\n\nThank you for your patience!\n\nTrack status: {{trackingUrl}} — *{{shopName}}*",
    in_progress: "Hi {{customerName}}! \n\nRepair work has started on your *{{applianceType}}*.\n\n Request ID: *{{jobId}}*\n\nAlmost there!\n\nTrack status: {{trackingUrl}} — *{{shopName}}*",
    ready_for_pickup: "Hi {{customerName}}! \n\nYour *{{applianceType}}* service is complete!\n\n Request ID: *{{jobId}}*\n Amount: ₹{{amount}}\n\nPlease collect or we'll arrange delivery.\n\nTrack status: {{trackingUrl}} — *{{shopName}}* ",
    delivered_closed: "Thank you {{customerName}}! \n\nYour *{{applianceType}}* service is closed. Hope it works perfectly!\n\nSee you next time! — *{{shopName}}* ⭐",
    cannot_be_done: "Hi {{customerName}}.\n\nUnfortunately, your *{{applianceType}}* cannot be repaired.\n\n Request ID: *{{jobId}}*\n\nPlease contact us to discuss options. — *{{shopName}}*",
    on_hold: "Hi {{customerName}}.\n\nYour service request (*{{jobId}}*) is on hold.\n\nPlease contact us to proceed.\n\nTrack status: {{trackingUrl}} — *{{shopName}}*"
  },
  financials: { showEstimatedCost: true, showFinalCost: true, showAdvancePaid: true, currency: '₹', pricingModel: 'flat' },
  itemSummary: (details) => `${details.applianceType || 'Appliance'} - ${details.brand || ''}`.trim(),
  itemIcon: () => 'fan'
};
