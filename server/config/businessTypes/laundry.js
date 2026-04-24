module.exports = {
  key: 'laundry',
  label: 'Laundry & Dry Cleaning',
  icon: 'shirt',
  terminology: {
    job: 'Laundry Order', jobPlural: 'Laundry Orders',
    item: 'Clothes', itemPlural: 'Clothes',
    actionVerb: 'Clean', jobIdPrefix: 'LDR',
    createButton: 'New Laundry Order', registerButton: 'Register Clothes'
  },
  fields: [
    { key: 'serviceType', label: 'Service Type', type: 'select', options: ['Wash & Fold', 'Wash & Iron', 'Dry Clean', 'Steam Iron Only', 'Stain Removal', 'Blanket/Curtain Wash'], required: true, group: 'item', order: 1 },
    { key: 'items', label: 'Clothing Items', type: 'item_list', required: true, group: 'item', order: 2,
      itemTypes: ['Shirt', 'T-Shirt', 'Pant', 'Jeans', 'Saree', 'Kurta', 'Salwar', 'Blazer/Coat', 'Jacket', 'Bedsheet', 'Blanket', 'Curtain', 'Towel', 'Uniform', 'Other'],
      columns: ['type', 'qty', 'rate', 'subtotal']
    },
    { key: 'specialInstructions', label: 'Special Instructions', type: 'textarea', required: false, group: 'details', order: 1, placeholder: 'e.g. Handle silk saree carefully, remove stain on collar' },
    { key: 'deliveryPreference', label: 'Delivery Preference', type: 'select', options: ['Self Pickup', 'Home Delivery'], required: false, group: 'details', order: 2 }
  ],
  statuses: [
    { key: 'received', label: 'Registered', type: 'initial', color: '#3B82F6', cssClass: 'status-received' },
    { key: 'in_progress', label: 'Under Cleaning', type: 'progress', color: '#8B5CF6', cssClass: 'status-repairing' },
    { key: 'ready_for_pickup', label: 'Ready for Pickup', type: 'ready', color: '#22C55E', cssClass: 'status-ready' },
    { key: 'delivered_closed', label: 'Delivered', type: 'terminal', color: '#10B981', cssClass: 'status-delivered' },
    { key: 'on_hold', label: 'On Hold', type: 'hold', color: '#6B7280', cssClass: 'status-hold' }
  ],
  messageTemplates: {
    received: "Hello {{customerName}}! \n\nYour laundry order has been registered.\n\n Order ID: *{{jobId}}*\n Items: {{itemsSummary}}\n Date: {{date}}\n\nWe'll notify you when it's ready!\n\nTrack status: {{trackingUrl}} — *{{shopName}}* ",
    in_progress: "Hi {{customerName}}! \n\nYour clothes are now being cleaned.\n\n Order ID: *{{jobId}}*\n\nWe'll let you know once they're ready!\n\nTrack status: {{trackingUrl}} — *{{shopName}}*",
    ready_for_pickup: "Hi {{customerName}}! \n\nYour laundry is READY FOR PICKUP!\n\n Order ID: *{{jobId}}*\n Total: ₹{{amount}}\n\nPlease collect at your convenience.\n\nTrack status: {{trackingUrl}} — *{{shopName}}* ",
    delivered_closed: "Hi {{customerName}}! \n\nThank you for collecting your laundry.\n\nWe hope everything is fresh and clean! See you next time! — *{{shopName}}* ⭐",
    on_hold: "Hi {{customerName}}.\n\nYour laundry order (*{{jobId}}*) is currently on hold.\n\nPlease contact us for details.\n\nTrack status: {{trackingUrl}} — *{{shopName}}*"
  },
  financials: { showEstimatedCost: true, showFinalCost: true, showAdvancePaid: false, currency: '₹', pricingModel: 'per_item' },
  itemSummary: (details) => {
    if (!details.items || !details.items.length) return 'Clothes';
    const total = details.items.reduce((s, i) => s + (i.qty || 0), 0);
    return `${total} item${total !== 1 ? 's' : ''}`;
  },
  itemIcon: () => 'shirt'
};
