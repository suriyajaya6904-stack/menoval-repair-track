module.exports = {
  key: 'rental',
  label: 'Rental Services',
  icon: 'repeat',
  terminology: {
    job: 'Rental Booking', jobPlural: 'Rental Bookings',
    item: 'Rental Item', itemPlural: 'Rental Items',
    actionVerb: 'Rent', jobIdPrefix: 'RNT',
    createButton: 'New Rental Booking', registerButton: 'Register Booking'
  },
  fields: [
    { key: 'itemCategory', label: 'Item Category', type: 'select', options: ['Bike/Scooter', 'Car', 'Camera/Photography', 'Audio/Sound System', 'Projector', 'Construction Tools', 'Event/Party Supplies', 'Furniture (Temp)', 'Generator', 'Laptop/Computer', 'Other'], required: true, group: 'item', order: 1 },
    { key: 'itemName', label: 'Item Name / Description', type: 'text', required: true, group: 'item', order: 2, placeholder: 'e.g. Canon EOS R5, Royal Enfield Classic' },
    { key: 'serialNumber', label: 'Serial / ID Number', type: 'text', required: false, group: 'item', order: 3 },
    { key: 'quantity', label: 'Quantity', type: 'number', required: true, group: 'item', order: 4 },
    { key: 'rentalStartDate', label: 'Rental Start Date', type: 'date', required: true, group: 'details', order: 1 },
    { key: 'rentalEndDate', label: 'Expected Return Date', type: 'date', required: true, group: 'details', order: 2 },
    { key: 'depositAmount', label: 'Security Deposit (₹)', type: 'number', required: false, group: 'details', order: 3 },
    { key: 'conditionOnIssue', label: 'Condition on Issue', type: 'textarea', required: false, group: 'details', order: 4, placeholder: 'Note any existing damage or wear' }
  ],
  statuses: [
    { key: 'received', label: 'Booked', type: 'initial', color: '#3B82F6', cssClass: 'status-received' },
    { key: 'issued', label: 'Item Issued', type: 'progress', color: '#8B5CF6', cssClass: 'status-diagnosis' },
    { key: 'in_use', label: 'In Use', type: 'progress', color: '#6366F1', cssClass: 'status-repairing' },
    { key: 'return_due', label: 'Return Due', type: 'progress', color: '#F59E0B', cssClass: 'status-waiting' },
    { key: 'ready_for_pickup', label: 'Returned', type: 'ready', color: '#22C55E', cssClass: 'status-ready' },
    { key: 'delivered_closed', label: 'Closed', type: 'terminal', color: '#10B981', cssClass: 'status-delivered' },
    { key: 'on_hold', label: 'Overdue', type: 'hold', color: '#EF4444', cssClass: 'status-cannot' }
  ],
  messageTemplates: {
    received: "Hello {{customerName}}! \n\nYour rental booking for *{{itemName}}* is confirmed!\n\n Booking ID: *{{jobId}}*\n Start: {{rentalStartDate}}\n Return by: {{rentalEndDate}}\n\n\n\nTrack status: {{trackingUrl}}— *{{shopName}}* ",
    issued: "Hi {{customerName}}! \n\nYour *{{itemName}}* has been issued.\n\n Booking ID: *{{jobId}}*\n Return by: {{rentalEndDate}}\n\nPlease return on time. — *{{shopName}}*",
    in_use: "Hi {{customerName}}! ℹ\n\nReminder: Your *{{itemName}}* rental is active.\n\n Booking ID: *{{jobId}}*\n Return by: {{rentalEndDate}}\n\n— *{{shopName}}*",
    return_due: "Hi {{customerName}}! \n\nYour *{{itemName}}* is DUE FOR RETURN.\n\n Booking ID: *{{jobId}}*\n Due: {{rentalEndDate}}\n\nPlease return at your earliest convenience. — *{{shopName}}*",
    ready_for_pickup: "Hi {{customerName}}! \n\n*{{itemName}}* has been returned successfully!\n\n Booking ID: *{{jobId}}*\n Final Amount: ₹{{amount}}\n\nThank you!\n\nTrack status: {{trackingUrl}} — *{{shopName}}* ",
    delivered_closed: "Thank you {{customerName}}! \n\nYour rental booking is closed. See you next time! — *{{shopName}}* ⭐",
    on_hold: "Hi {{customerName}}! \n\nYour *{{itemName}}* rental is OVERDUE.\n\n Booking ID: *{{jobId}}*\n Was due: {{rentalEndDate}}\n\nPlease return immediately or contact us.\n\nTrack status: {{trackingUrl}} — *{{shopName}}*"
  },
  financials: { showEstimatedCost: true, showFinalCost: true, showAdvancePaid: true, currency: '₹', pricingModel: 'flat' },
  itemSummary: (details) => details.itemName || details.itemCategory || 'Rental Item',
  itemIcon: () => 'repeat'
};
