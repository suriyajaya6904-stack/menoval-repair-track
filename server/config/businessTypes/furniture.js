module.exports = {
  key: 'furniture',
  label: 'Furniture & Carpentry',
  icon: 'armchair',
  terminology: {
    job: 'Furniture Order', jobPlural: 'Furniture Orders',
    item: 'Furniture', itemPlural: 'Furniture Items',
    actionVerb: 'Build', jobIdPrefix: 'FRN',
    createButton: 'New Furniture Order', registerButton: 'Register Order'
  },
  fields: [
    { key: 'furnitureType', label: 'Furniture Type', type: 'select', options: ['Sofa/Couch', 'Bed/Cot', 'Wardrobe/Cupboard', 'Dining Table', 'Chair', 'Modular Kitchen', 'TV Unit', 'Bookshelf', 'Office Desk', 'Door/Window Frame', 'Custom Item', 'Other'], required: true, group: 'item', order: 1 },
    { key: 'material', label: 'Material', type: 'select', options: ['Teak Wood', 'Plywood', 'MDF', 'Particle Board', 'Pine Wood', 'Rosewood', 'Metal', 'Mixed', 'Other'], required: false, group: 'item', order: 2 },
    { key: 'dimensions', label: 'Dimensions / Size', type: 'text', required: false, group: 'item', order: 3, placeholder: 'e.g. 6x5 ft, King Size' },
    { key: 'quantity', label: 'Quantity', type: 'number', required: true, group: 'item', order: 4 },
    { key: 'designNotes', label: 'Design / Reference Notes', type: 'textarea', required: false, group: 'details', order: 1, placeholder: 'Describe design, attach references, color preferences' },
    { key: 'deliveryAddress', label: 'Delivery Address', type: 'textarea', required: false, group: 'details', order: 2, placeholder: 'Delivery location if applicable' }
  ],
  statuses: [
    { key: 'received', label: 'Order Placed', type: 'initial', color: '#3B82F6', cssClass: 'status-received' },
    { key: 'design', label: 'Design Phase', type: 'progress', color: '#8B5CF6', cssClass: 'status-diagnosis' },
    { key: 'in_progress', label: 'Production', type: 'progress', color: '#6366F1', cssClass: 'status-repairing' },
    { key: 'finishing', label: 'Polishing / Finishing', type: 'progress', color: '#14B8A6', cssClass: 'status-quality' },
    { key: 'ready_for_pickup', label: 'Ready for Delivery', type: 'ready', color: '#22C55E', cssClass: 'status-ready' },
    { key: 'delivered_closed', label: 'Delivered', type: 'terminal', color: '#10B981', cssClass: 'status-delivered' },
    { key: 'on_hold', label: 'On Hold', type: 'hold', color: '#6B7280', cssClass: 'status-hold' }
  ],
  messageTemplates: {
    received: "Hello {{customerName}}! \n\nYour furniture order (*{{furnitureType}}*) has been placed.\n\n Order ID: *{{jobId}}*\n Date: {{date}}\n\nWe'll keep you updated!\n\nTrack status: {{trackingUrl}} — *{{shopName}}* ",
    design: "Hi {{customerName}}! \n\nDesign work has started for your *{{furnitureType}}*.\n\n Order ID: *{{jobId}}*\n\nWe'll share designs soon! — *{{shopName}}*",
    in_progress: "Hi {{customerName}}! \n\nProduction has started on your *{{furnitureType}}*.\n\n Order ID: *{{jobId}}*\n\nWe're building it with care!\n\nTrack status: {{trackingUrl}} — *{{shopName}}*",
    finishing: "Hi {{customerName}}! \n\nYour *{{furnitureType}}* is in the finishing/polishing stage.\n\n Order ID: *{{jobId}}*\n\nAlmost ready! — *{{shopName}}*",
    ready_for_pickup: "Hi {{customerName}}! \n\nYour *{{furnitureType}}* is READY!\n\n Order ID: *{{jobId}}*\n Amount: ₹{{amount}}\n\nWe'll arrange delivery or please collect.\n\nTrack status: {{trackingUrl}} — *{{shopName}}* ",
    delivered_closed: "Thank you {{customerName}}! \n\nEnjoy your new *{{furnitureType}}*! — *{{shopName}}* ⭐",
    on_hold: "Hi {{customerName}}.\n\nYour furniture order (*{{jobId}}*) is on hold.\n\nPlease contact us to proceed.\n\nTrack status: {{trackingUrl}} — *{{shopName}}*"
  },
  financials: { showEstimatedCost: true, showFinalCost: true, showAdvancePaid: true, currency: '₹', pricingModel: 'flat' },
  itemSummary: (details) => `${details.furnitureType || 'Furniture'} (${details.material || 'N/A'})`,
  itemIcon: () => 'armchair'
};
