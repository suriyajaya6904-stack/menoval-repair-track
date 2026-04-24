module.exports = {
  key: 'tailoring',
  label: 'Tailoring & Custom Clothing',
  icon: 'scissors',
  terminology: {
    job: 'Tailoring Order', jobPlural: 'Tailoring Orders',
    item: 'Garment', itemPlural: 'Garments',
    actionVerb: 'Stitch', jobIdPrefix: 'TLR',
    createButton: 'New Tailoring Order', registerButton: 'Register Order'
  },
  fields: [
    { key: 'orderType', label: 'Order Type', type: 'select', options: ['New Stitching', 'Alteration', 'Embroidery', 'Blouse Work', 'Uniform Stitching', 'Bridal/Designer', 'Other'], required: true, group: 'item', order: 1 },
    { key: 'items', label: 'Garment Items', type: 'item_list', required: true, group: 'item', order: 2,
      itemTypes: ['Shirt', 'Pant', 'Kurta', 'Salwar', 'Blouse', 'Lehenga', 'Sherwani', 'Saree Fall/Pico', 'Dress', 'Uniform Set', 'Coat/Blazer', 'Other'],
      columns: ['type', 'qty', 'rate', 'subtotal']
    },
    { key: 'fabricProvided', label: 'Fabric Provided By', type: 'select', options: ['Customer', 'Shop', 'Partially Customer'], required: false, group: 'details', order: 1 },
    { key: 'designNotes', label: 'Design / Style Notes', type: 'textarea', required: false, group: 'details', order: 2, placeholder: 'e.g. Collar style, sleeve length, reference image notes' },
    { key: 'eventDate', label: 'Event / Need-by Date', type: 'date', required: false, group: 'details', order: 3 }
  ],
  statuses: [
    { key: 'received', label: 'Order Placed', type: 'initial', color: '#3B82F6', cssClass: 'status-received' },
    { key: 'measurement', label: 'Measurement Done', type: 'progress', color: '#8B5CF6', cssClass: 'status-diagnosis' },
    { key: 'in_progress', label: 'Stitching', type: 'progress', color: '#6366F1', cssClass: 'status-repairing' },
    { key: 'trial', label: 'Trial / Fitting', type: 'progress', color: '#14B8A6', cssClass: 'status-quality' },
    { key: 'ready_for_pickup', label: 'Ready for Pickup', type: 'ready', color: '#22C55E', cssClass: 'status-ready' },
    { key: 'delivered_closed', label: 'Delivered', type: 'terminal', color: '#10B981', cssClass: 'status-delivered' },
    { key: 'on_hold', label: 'On Hold', type: 'hold', color: '#6B7280', cssClass: 'status-hold' }
  ],
  messageTemplates: {
    received: "Hello {{customerName}}! \n\nYour tailoring order has been placed.\n\n Order ID: *{{jobId}}*\n Items: {{itemsSummary}}\n Date: {{date}}\n\nWe'll update you at each step!\n\nTrack status: {{trackingUrl}} — *{{shopName}}* ",
    measurement: "Hi {{customerName}}! \n\nMeasurements have been taken for your order.\n\n Order ID: *{{jobId}}*\n\nStitching will begin soon! — *{{shopName}}*",
    in_progress: "Hi {{customerName}}! \n\nYour garments are being stitched.\n\n Order ID: *{{jobId}}*\n\nWe'll notify you for trial/fitting!\n\nTrack status: {{trackingUrl}} — *{{shopName}}*",
    trial: "Hi {{customerName}}! \n\nYour garments are ready for trial/fitting!\n\n Order ID: *{{jobId}}*\n\nPlease visit us at your convenience. — *{{shopName}}*",
    ready_for_pickup: "Hi {{customerName}}! \n\nYour tailoring order is READY!\n\n Order ID: *{{jobId}}*\n Amount: ₹{{amount}}\n\nPlease collect at your convenience.\n\nTrack status: {{trackingUrl}} — *{{shopName}}* ",
    delivered_closed: "Thank you {{customerName}}! \n\nEnjoy your new garments! See you next time! — *{{shopName}}* ⭐",
    on_hold: "Hi {{customerName}}.\n\nYour tailoring order (*{{jobId}}*) is on hold.\n\nPlease contact us to proceed.\n\nTrack status: {{trackingUrl}} — *{{shopName}}*"
  },
  financials: { showEstimatedCost: true, showFinalCost: true, showAdvancePaid: true, currency: '₹', pricingModel: 'per_item' },
  itemSummary: (details) => {
    if (!details.items || !details.items.length) return 'Garments';
    const total = details.items.reduce((s, i) => s + (i.qty || 0), 0);
    return `${total} garment${total !== 1 ? 's' : ''}`;
  },
  itemIcon: () => 'scissors'
};
