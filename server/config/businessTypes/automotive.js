module.exports = {
  key: 'automotive',
  label: 'Automotive Services',
  icon: 'car',
  terminology: {
    job: 'Service Job', jobPlural: 'Service Jobs',
    item: 'Vehicle', itemPlural: 'Vehicles',
    actionVerb: 'Service', jobIdPrefix: 'AUT',
    createButton: 'New Service Job', registerButton: 'Register Vehicle'
  },
  fields: [
    { key: 'vehicleType', label: 'Vehicle Type', type: 'select', options: ['Two-Wheeler', 'Car', 'Three-Wheeler', 'Commercial Vehicle'], required: true, group: 'item', order: 1 },
    { key: 'brand', label: 'Brand', type: 'text', required: true, group: 'item', order: 2, placeholder: 'e.g. Honda, Hyundai, TVS' },
    { key: 'model', label: 'Model', type: 'text', required: true, group: 'item', order: 3, placeholder: 'e.g. Activa 6G, i20, Apache' },
    { key: 'regNumber', label: 'Registration Number', type: 'text', required: false, group: 'item', order: 4, placeholder: 'e.g. TN 09 AB 1234' },
    { key: 'odometerReading', label: 'Odometer (km)', type: 'number', required: false, group: 'item', order: 5 },
    { key: 'serviceType', label: 'Service Type', type: 'select', options: ['General Service', 'Oil Change', 'Brake Service', 'Tyre/Puncture', 'Engine Repair', 'Electrical', 'Body Work/Denting', 'AC Service', 'Full Detailing', 'Other'], required: true, group: 'details', order: 1 },
    { key: 'reportedIssue', label: 'Reported Issues', type: 'tags', required: false, group: 'details', order: 2, presetTags: ['Strange Noise', 'Vibration', 'Starting Problem', 'Brake Issue', 'Oil Leak', 'Overheating', 'AC Not Cooling', 'Tyre Wear'] },
    { key: 'vehicleCondition', label: 'Vehicle Condition on Receipt', type: 'textarea', required: false, group: 'details', order: 3, placeholder: 'e.g. Scratches on left panel, dent on bumper' }
  ],
  statuses: [
    { key: 'received', label: 'Checked In', type: 'initial', color: '#3B82F6', cssClass: 'status-received' },
    { key: 'inspection', label: 'Under Inspection', type: 'progress', color: '#8B5CF6', cssClass: 'status-diagnosis' },
    { key: 'waiting_for_parts', label: 'Waiting for Parts', type: 'progress', color: '#F59E0B', cssClass: 'status-waiting' },
    { key: 'in_progress', label: 'Service in Progress', type: 'progress', color: '#6366F1', cssClass: 'status-repairing' },
    { key: 'testing', label: 'Testing / QC', type: 'progress', color: '#14B8A6', cssClass: 'status-quality' },
    { key: 'ready_for_pickup', label: 'Ready for Pickup', type: 'ready', color: '#22C55E', cssClass: 'status-ready' },
    { key: 'delivered_closed', label: 'Delivered', type: 'terminal', color: '#10B981', cssClass: 'status-delivered' },
    { key: 'cannot_be_done', label: 'Cannot be Serviced', type: 'terminal', color: '#EF4444', cssClass: 'status-cannot' },
    { key: 'on_hold', label: 'On Hold', type: 'hold', color: '#6B7280', cssClass: 'status-hold' }
  ],
  messageTemplates: {
    received: "Hello {{customerName}}! \n\nYour {{vehicleType}} (*{{brand}} {{model}}*) has been checked in for service.\n\n Service ID: *{{jobId}}*\n Date: {{date}}\n\nWe'll keep you updated!\n\nTrack status: {{trackingUrl}} — *{{shopName}}*",
    inspection: "Hi {{customerName}}! \n\nOur technician is inspecting your *{{brand}} {{model}}*.\n\n Service ID: *{{jobId}}*\n\nWe'll update you with findings soon. — *{{shopName}}*",
    waiting_for_parts: "Hi {{customerName}}! \n\nWe need a part for your *{{brand}} {{model}}*. It has been ordered.\n\n Service ID: *{{jobId}}*\n\nThank you for your patience!\n\nTrack status: {{trackingUrl}} — *{{shopName}}*",
    in_progress: "Hi {{customerName}}! \n\nService work has started on your *{{brand}} {{model}}*.\n\n Service ID: *{{jobId}}*\n\nWe'll notify you when done!\n\nTrack status: {{trackingUrl}} — *{{shopName}}*",
    testing: "Hi {{customerName}}! \n\nYour *{{brand}} {{model}}* service is complete. Running final checks.\n\n Service ID: *{{jobId}}*\n\nAlmost ready! — *{{shopName}}*",
    ready_for_pickup: "Hi {{customerName}}! \n\nYour *{{brand}} {{model}}* is READY FOR PICKUP!\n\n Service ID: *{{jobId}}*\n Amount: ₹{{amount}}\n\nThank you for trusting *{{shopName}}*! ",
    delivered_closed: "Thank you {{customerName}}! \n\nWe hope your *{{brand}} {{model}}* runs great! See you next time! — *{{shopName}}* ⭐",
    cannot_be_done: "Hi {{customerName}}.\n\nUnfortunately, we cannot complete the service on your *{{brand}} {{model}}*.\n\n Service ID: *{{jobId}}*\n\nPlease visit us to collect your vehicle. — *{{shopName}}*",
    on_hold: "Hi {{customerName}}.\n\nYour service job (*{{jobId}}*) is on hold.\n\nPlease contact us to proceed.\n\nTrack status: {{trackingUrl}} — *{{shopName}}*"
  },
  financials: { showEstimatedCost: true, showFinalCost: true, showAdvancePaid: true, currency: '₹', pricingModel: 'flat' },
  itemSummary: (details) => `${details.brand || ''} ${details.model || ''}`.trim() || 'Vehicle',
  itemIcon: (details) => details.vehicleType === 'Car' ? 'car' : 'bike'
};
