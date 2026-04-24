module.exports = {
  key: 'home_maintenance',
  label: 'Home Maintenance Services',
  icon: 'home',
  terminology: {
    job: 'Service Request', jobPlural: 'Service Requests',
    item: 'Service', itemPlural: 'Services',
    actionVerb: 'Fix', jobIdPrefix: 'HMS',
    createButton: 'New Service Request', registerButton: 'Register Request'
  },
  fields: [
    { key: 'serviceCategory', label: 'Service Category', type: 'select', options: ['Electrician', 'Plumber', 'Carpenter', 'Painter', 'AC Installation', 'CCTV/Security', 'Pest Control', 'General Maintenance', 'Other'], required: true, group: 'item', order: 1 },
    { key: 'issueDescription', label: 'Issue / Work Description', type: 'textarea', required: true, group: 'item', order: 2, placeholder: 'Describe the work needed...' },
    { key: 'location', label: 'Service Location', type: 'textarea', required: true, group: 'item', order: 3, placeholder: 'Full address for service' },
    { key: 'preferredDate', label: 'Preferred Date', type: 'date', required: false, group: 'details', order: 1 },
    { key: 'urgency', label: 'Urgency', type: 'select', options: ['Normal', 'Urgent', 'Emergency'], required: false, group: 'details', order: 2 }
  ],
  statuses: [
    { key: 'received', label: 'Request Logged', type: 'initial', color: '#3B82F6', cssClass: 'status-received' },
    { key: 'assigned', label: 'Technician Assigned', type: 'progress', color: '#8B5CF6', cssClass: 'status-diagnosis' },
    { key: 'in_progress', label: 'Work in Progress', type: 'progress', color: '#6366F1', cssClass: 'status-repairing' },
    { key: 'ready_for_pickup', label: 'Completed', type: 'ready', color: '#22C55E', cssClass: 'status-ready' },
    { key: 'delivered_closed', label: 'Closed', type: 'terminal', color: '#10B981', cssClass: 'status-delivered' },
    { key: 'on_hold', label: 'On Hold', type: 'hold', color: '#6B7280', cssClass: 'status-hold' }
  ],
  messageTemplates: {
    received: "Hello {{customerName}}! \n\nYour service request has been logged.\n\n Request ID: *{{jobId}}*\n Type: {{serviceCategory}}\n Date: {{date}}\n\nWe'll assign a technician soon!\n\nTrack status: {{trackingUrl}} — *{{shopName}}*",
    assigned: "Hi {{customerName}}! \n\nA technician has been assigned for your *{{serviceCategory}}* work.\n\n Request ID: *{{jobId}}*\n\nThey'll arrive as scheduled. — *{{shopName}}*",
    in_progress: "Hi {{customerName}}! \n\nWork is in progress at your location.\n\n Request ID: *{{jobId}}*\n\nWe'll update you on completion.\n\nTrack status: {{trackingUrl}} — *{{shopName}}*",
    ready_for_pickup: "Hi {{customerName}}! \n\nThe *{{serviceCategory}}* work is completed!\n\n Request ID: *{{jobId}}*\n Amount: ₹{{amount}}\n\nThank you!\n\nTrack status: {{trackingUrl}} — *{{shopName}}* ",
    delivered_closed: "Thank you {{customerName}}! \n\nYour service request is closed. Hope everything is working well!\n\n— *{{shopName}}* ⭐",
    on_hold: "Hi {{customerName}}.\n\nYour service request (*{{jobId}}*) is on hold.\n\nPlease contact us for details.\n\nTrack status: {{trackingUrl}} — *{{shopName}}*"
  },
  financials: { showEstimatedCost: true, showFinalCost: true, showAdvancePaid: false, currency: '₹', pricingModel: 'flat' },
  itemSummary: (details) => details.serviceCategory || 'Maintenance Service',
  itemIcon: () => 'home'
};
