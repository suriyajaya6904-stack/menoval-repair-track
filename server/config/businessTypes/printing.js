module.exports = {
  key: 'printing',
  label: 'Printing & Signage',
  icon: 'printer',
  terminology: {
    job: 'Print Order', jobPlural: 'Print Orders',
    item: 'Print Job', itemPlural: 'Print Jobs',
    actionVerb: 'Print', jobIdPrefix: 'PRT',
    createButton: 'New Print Order', registerButton: 'Register Order'
  },
  fields: [
    { key: 'printType', label: 'Print Type', type: 'select', options: ['Wedding Cards', 'Business Cards', 'Flex/Banner', 'T-Shirt Printing', 'Pamphlets/Brochures', 'Stickers/Labels', 'Photo Printing', 'ID Cards', 'Certificate Printing', 'Book/Thesis Binding', 'Other'], required: true, group: 'item', order: 1 },
    { key: 'items', label: 'Items & Quantities', type: 'item_list', required: true, group: 'item', order: 2,
      itemTypes: ['Piece', 'Sheet', 'Copy', 'Sq.ft', 'Page', 'Set'],
      columns: ['type', 'qty', 'rate', 'subtotal']
    },
    { key: 'paperSize', label: 'Paper / Material Size', type: 'select', options: ['A4', 'A3', 'A5', 'Letter', 'Custom Size', 'Flex Roll', 'Vinyl', 'N/A'], required: false, group: 'details', order: 1 },
    { key: 'designNotes', label: 'Design / Content Notes', type: 'textarea', required: false, group: 'details', order: 2, placeholder: 'e.g. Use blue theme, include logo, double-sided' },
    { key: 'designFileProvided', label: 'Design File Status', type: 'select', options: ['Customer Provided', 'Need Design', 'Draft Sent for Approval'], required: false, group: 'details', order: 3 }
  ],
  statuses: [
    { key: 'received', label: 'Order Received', type: 'initial', color: '#3B82F6', cssClass: 'status-received' },
    { key: 'design_approval', label: 'Design Approval', type: 'progress', color: '#8B5CF6', cssClass: 'status-diagnosis' },
    { key: 'in_progress', label: 'Printing', type: 'progress', color: '#6366F1', cssClass: 'status-repairing' },
    { key: 'finishing', label: 'Finishing / Binding', type: 'progress', color: '#14B8A6', cssClass: 'status-quality' },
    { key: 'ready_for_pickup', label: 'Ready for Pickup', type: 'ready', color: '#22C55E', cssClass: 'status-ready' },
    { key: 'delivered_closed', label: 'Delivered', type: 'terminal', color: '#10B981', cssClass: 'status-delivered' },
    { key: 'on_hold', label: 'On Hold', type: 'hold', color: '#6B7280', cssClass: 'status-hold' }
  ],
  messageTemplates: {
    received: "Hello {{customerName}}! \n\nYour print order has been received.\n\n Order ID: *{{jobId}}*\n Type: {{printType}}\n Date: {{date}}\n\nWe'll update you on progress!\n\nTrack status: {{trackingUrl}} — *{{shopName}}*",
    design_approval: "Hi {{customerName}}! \n\nThe design for your order is ready for approval.\n\n Order ID: *{{jobId}}*\n\nPlease review and confirm so we can start printing. — *{{shopName}}*",
    in_progress: "Hi {{customerName}}! \n\nYour order is now being printed.\n\n Order ID: *{{jobId}}*\n\nAlmost there!\n\nTrack status: {{trackingUrl}} — *{{shopName}}*",
    finishing: "Hi {{customerName}}! \n\nPrinting is done! We're now finishing/binding your order.\n\n Order ID: *{{jobId}}*\n\nReady soon! — *{{shopName}}*",
    ready_for_pickup: "Hi {{customerName}}! \n\nYour print order is READY!\n\n Order ID: *{{jobId}}*\n Amount: ₹{{amount}}\n\nPlease collect at your convenience.\n\nTrack status: {{trackingUrl}} — *{{shopName}}* ",
    delivered_closed: "Thank you {{customerName}}! \n\nHope you love the prints! See you next time! — *{{shopName}}* ⭐",
    on_hold: "Hi {{customerName}}.\n\nYour print order (*{{jobId}}*) is on hold.\n\nPlease contact us to proceed.\n\nTrack status: {{trackingUrl}} — *{{shopName}}*"
  },
  financials: { showEstimatedCost: true, showFinalCost: true, showAdvancePaid: true, currency: '₹', pricingModel: 'per_item' },
  itemSummary: (details) => details.printType || 'Print Order',
  itemIcon: () => 'printer'
};
