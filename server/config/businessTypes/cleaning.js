module.exports = {
  key: 'cleaning',
  label: 'Cleaning Services',
  icon: 'sparkles',
  terminology: {
    job: 'Cleaning Job', jobPlural: 'Cleaning Jobs',
    item: 'Service', itemPlural: 'Services',
    actionVerb: 'Clean', jobIdPrefix: 'CLN',
    createButton: 'New Cleaning Job', registerButton: 'Register Booking'
  },
  fields: [
    { key: 'cleaningType', label: 'Cleaning Type', type: 'select', options: ['Deep Cleaning - Home', 'Deep Cleaning - Office', 'Sofa/Carpet Cleaning', 'Water Tank Cleaning', 'Kitchen Deep Clean', 'Bathroom Deep Clean', 'Post-Construction Cleaning', 'Move-in/Move-out Cleaning', 'Other'], required: true, group: 'item', order: 1 },
    { key: 'location', label: 'Service Location', type: 'textarea', required: true, group: 'item', order: 2, placeholder: 'Full address' },
    { key: 'propertySize', label: 'Property Size', type: 'select', options: ['1 BHK', '2 BHK', '3 BHK', '4+ BHK', 'Villa', 'Office - Small', 'Office - Large', 'Commercial Space', 'Other'], required: false, group: 'item', order: 3 },
    { key: 'scheduledDate', label: 'Scheduled Date', type: 'date', required: false, group: 'details', order: 1 },
    { key: 'specialRequests', label: 'Special Requests', type: 'textarea', required: false, group: 'details', order: 2, placeholder: 'Any specific areas or requirements' }
  ],
  statuses: [
    { key: 'received', label: 'Booking Confirmed', type: 'initial', color: '#3B82F6', cssClass: 'status-received' },
    { key: 'assigned', label: 'Team Assigned', type: 'progress', color: '#8B5CF6', cssClass: 'status-diagnosis' },
    { key: 'in_progress', label: 'Cleaning in Progress', type: 'progress', color: '#6366F1', cssClass: 'status-repairing' },
    { key: 'ready_for_pickup', label: 'Completed', type: 'ready', color: '#22C55E', cssClass: 'status-ready' },
    { key: 'delivered_closed', label: 'Closed', type: 'terminal', color: '#10B981', cssClass: 'status-delivered' },
    { key: 'on_hold', label: 'On Hold', type: 'hold', color: '#6B7280', cssClass: 'status-hold' }
  ],
  messageTemplates: {
    received: "Hello {{customerName}}! \n\nYour *{{cleaningType}}* booking is confirmed!\n\n Booking ID: *{{jobId}}*\n Date: {{date}}\n\nWe'll assign a team shortly!\n\nTrack status: {{trackingUrl}} — *{{shopName}}* ",
    assigned: "Hi {{customerName}}! \n\nA cleaning team has been assigned for your *{{cleaningType}}*.\n\n Booking ID: *{{jobId}}*\n\nThey'll arrive as scheduled. — *{{shopName}}*",
    in_progress: "Hi {{customerName}}! \n\nCleaning is in progress at your location.\n\n Booking ID: *{{jobId}}*\n\nWe'll update on completion!\n\nTrack status: {{trackingUrl}} — *{{shopName}}*",
    ready_for_pickup: "Hi {{customerName}}! \n\nYour *{{cleaningType}}* is COMPLETE!\n\n Booking ID: *{{jobId}}*\n Amount: ₹{{amount}}\n\nThank you for choosing us!\n\nTrack status: {{trackingUrl}} — *{{shopName}}* ",
    delivered_closed: "Thank you {{customerName}}! \n\nHope your space is sparkling clean! See you next time! — *{{shopName}}* ⭐",
    on_hold: "Hi {{customerName}}.\n\nYour cleaning booking (*{{jobId}}*) is on hold.\n\nPlease contact us for details.\n\nTrack status: {{trackingUrl}} — *{{shopName}}*"
  },
  financials: { showEstimatedCost: true, showFinalCost: true, showAdvancePaid: false, currency: '₹', pricingModel: 'flat' },
  itemSummary: (details) => details.cleaningType || 'Cleaning Service',
  itemIcon: () => 'sparkles'
};
