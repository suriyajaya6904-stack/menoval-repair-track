module.exports = {
  key: 'diagnostic_lab',
  label: 'Diagnostic Labs & Clinics',
  icon: 'flask',
  terminology: {
    job: 'Test Report', jobPlural: 'Test Reports',
    item: 'Test', itemPlural: 'Tests',
    actionVerb: 'Process', jobIdPrefix: 'LAB',
    createButton: 'New Test Entry', registerButton: 'Register Test'
  },
  fields: [
    { key: 'testType', label: 'Test / Procedure Type', type: 'select', options: ['Blood Test', 'Urine Test', 'X-Ray', 'Ultrasound', 'ECG', 'MRI', 'CT Scan', 'Dental Procedure', 'Eye Checkup', 'General Checkup', 'COVID Test', 'Other'], required: true, group: 'item', order: 1 },
    { key: 'testName', label: 'Specific Test Name', type: 'text', required: false, group: 'item', order: 2, placeholder: 'e.g. CBC, Lipid Profile, HbA1c' },
    { key: 'referredBy', label: 'Referred By (Doctor)', type: 'text', required: false, group: 'item', order: 3, placeholder: 'Dr. Name (optional)' },
    { key: 'patientAge', label: 'Patient Age', type: 'number', required: false, group: 'details', order: 1 },
    { key: 'patientGender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'], required: false, group: 'details', order: 2 },
    { key: 'sampleCollected', label: 'Sample Collected?', type: 'select', options: ['Yes - At Lab', 'Yes - Home Collection', 'Pending'], required: false, group: 'details', order: 3 },
    { key: 'notes', label: 'Clinical Notes', type: 'textarea', required: false, group: 'details', order: 4, placeholder: 'Any relevant medical notes...' }
  ],
  statuses: [
    { key: 'received', label: 'Sample Taken', type: 'initial', color: '#3B82F6', cssClass: 'status-received' },
    { key: 'in_progress', label: 'Processing', type: 'progress', color: '#6366F1', cssClass: 'status-repairing' },
    { key: 'ready_for_pickup', label: 'Report Ready', type: 'ready', color: '#22C55E', cssClass: 'status-ready' },
    { key: 'delivered_closed', label: 'Collected', type: 'terminal', color: '#10B981', cssClass: 'status-delivered' },
    { key: 'on_hold', label: 'On Hold', type: 'hold', color: '#6B7280', cssClass: 'status-hold' }
  ],
  messageTemplates: {
    received: "Hello {{customerName}}! \n\nYour sample for *{{testType}}* has been collected.\n\n Report ID: *{{jobId}}*\n Date: {{date}}\n\nWe'll notify you when the report is ready.\n\nTrack status: {{trackingUrl}} — *{{shopName}}* ",
    in_progress: "Hi {{customerName}}! \n\nYour *{{testType}}* is being processed.\n\n Report ID: *{{jobId}}*\n\nReport will be ready soon!\n\nTrack status: {{trackingUrl}} — *{{shopName}}*",
    ready_for_pickup: "Hi {{customerName}}! \n\nYour *{{testType}}* report is READY!\n\n Report ID: *{{jobId}}*\n Amount: ₹{{amount}}\n\nPlease collect from the lab.\n\nTrack status: {{trackingUrl}} — *{{shopName}}* ",
    delivered_closed: "Thank you {{customerName}}! \n\nYour report has been collected. Wishing you good health!\n\n— *{{shopName}}* ⭐",
    on_hold: "Hi {{customerName}}.\n\nYour test (*{{jobId}}*) is on hold.\n\nPlease contact us for details.\n\nTrack status: {{trackingUrl}} — *{{shopName}}*"
  },
  financials: { showEstimatedCost: true, showFinalCost: true, showAdvancePaid: false, currency: '₹', pricingModel: 'flat' },
  itemSummary: (details) => details.testType || 'Lab Test',
  itemIcon: () => 'flask'
};
