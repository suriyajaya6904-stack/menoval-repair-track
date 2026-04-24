import { useState } from 'react';
import { X, CheckCircle2, ChevronRight, PlusCircle } from 'lucide-react';
import { useBusinessType } from '../context/BusinessTypeContext';
import DynamicField from './DynamicField';
import ItemListEditor from './ItemListEditor';

export default function NewJobModal({ onClose, onSubmit }) {
  const { config } = useBusinessType();
  const [loading, setLoading] = useState(false);
  const [itemDetails, setItemDetails] = useState({});
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');

  const terminology = config?.terminology || { job: 'Job', item: 'Item', createButton: 'New Job', registerButton: 'Register' };
  const itemFields = config?.getFieldsByGroup?.('item') || [];
  const detailFields = config?.getFieldsByGroup?.('details') || [];
  const financials = config?.financials || { showEstimatedCost: true, currency: '₹' };

  const updateItemDetail = (key, value) => {
    setItemDetails(prev => ({ ...prev, [key]: value }));
  };

  // Auto-compute estimated cost from item_list subtotals for per-item types
  const computedTotal = () => {
    if (!config?.isPerItem) return null;
    for (const f of itemFields) {
      if (f.type === 'item_list' && Array.isArray(itemDetails[f.key])) {
        return itemDetails[f.key].reduce((sum, i) => sum + (i.subtotal || 0), 0);
      }
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const autoTotal = computedTotal();
    const jobData = {
      customerInfo: { name: customerName, phone: customerPhone },
      itemDetails,
      estimatedCost: autoTotal !== null ? autoTotal : (estimatedCost ? Number(estimatedCost) : 0),
      estimatedDelivery: estimatedDelivery || null
    };

    await onSubmit(jobData);
    setLoading(false);
  };

  const renderField = (field) => {
    if (field.type === 'item_list') {
      return (
        <div key={field.key} className="col-span-1 sm:col-span-2">
          <ItemListEditor field={field} value={itemDetails[field.key] || []} onChange={(val) => updateItemDetail(field.key, val)} />
        </div>
      );
    }
    return (
      <DynamicField key={field.key} field={field} value={itemDetails[field.key]} onChange={(val) => updateItemDetail(field.key, val)} allValues={itemDetails} />
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-0 md:p-4 animate-in fade-in duration-200">
      <div className="bg-surface-card md:border border-surface-border rounded-none md:rounded-2xl shadow-xl w-full h-full md:h-auto md:max-h-[90vh] md:w-[90vw] lg:max-w-4xl overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-5 border-b border-surface-border bg-surface-elevated shrink-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent-primary/5 rounded-full blur-3xl pointer-events-none -mt-32 -mr-32"></div>
          <div className="relative z-10">
            <h3 className="font-bold text-lg md:text-xl text-text-primary flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-accent-primary" /> {terminology.createButton}
            </h3>
            <p className="text-text-muted text-xs md:text-sm mt-1">Register and automatically notify the customer via WhatsApp.</p>
          </div>
          <button onClick={onClose} className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-border rounded-xl transition-colors shrink-0 z-10 relative">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-4 md:p-6 lg:p-8 scrollbar-hide flex-1 bg-surface-bg custom-scrollbar">
          <form id="new-job-form" onSubmit={handleSubmit} className="space-y-10 max-w-3xl mx-auto">

            {/* 1. Item/Service Details */}
            <div className="relative pl-6 md:pl-8">
              <div className="absolute left-0 top-0 bottom-0 w-px bg-surface-border"></div>
              <div className="absolute left-[-11px] top-0 w-6 h-6 bg-surface-bg border-2 border-accent-primary rounded-full flex items-center justify-center text-[10px] font-bold text-accent-primary z-10">1</div>
              <h4 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4 flex items-center gap-2">{terminology.item} Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 bg-surface-card rounded-2xl border border-surface-border shadow-sm">
                {itemFields.map(renderField)}
              </div>
            </div>

            {/* 2. Customer Details */}
            <div className="relative pl-6 md:pl-8">
              <div className="absolute left-0 top-0 bottom-0 w-px bg-surface-border"></div>
              <div className="absolute left-[-11px] top-0 w-6 h-6 bg-surface-bg border-2 border-accent-blue rounded-full flex items-center justify-center text-[10px] font-bold text-accent-blue z-10">2</div>
              <h4 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4">Customer Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 bg-surface-card rounded-2xl border border-surface-border shadow-sm">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-text-muted mb-2">Full Name *</label>
                  <input type="text" required className="input-field bg-surface-bg placeholder-text-muted/50" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="e.g. John Doe" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-text-muted mb-2">WhatsApp Number *</label>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-2.5 bg-surface-elevated border border-surface-border rounded-xl text-sm font-medium text-text-muted shrink-0">+91</span>
                    <input type="tel" required className="input-field bg-surface-bg placeholder-text-muted/50 flex-1" value={customerPhone} onChange={e => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="98XXXXXXXX" maxLength={10} />
                  </div>
                  <p className="text-[10px] text-text-muted mt-1.5 ml-1">10-digit number. Used for WhatsApp notifications.</p>
                </div>
              </div>
            </div>

            {/* 3. Additional Details (if any detail fields exist) */}
            {detailFields.length > 0 && (
              <div className="relative pl-6 md:pl-8">
                <div className="absolute left-0 top-0 bottom-0 w-px bg-surface-border"></div>
                <div className="absolute left-[-11px] top-0 w-6 h-6 bg-surface-bg border-2 border-accent-amber rounded-full flex items-center justify-center text-[10px] font-bold text-accent-amber z-10">3</div>
                <h4 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4">Additional Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 bg-surface-card rounded-2xl border border-surface-border shadow-sm">
                  {detailFields.map(renderField)}
                </div>
              </div>
            )}

            {/* 4. Cost & Delivery */}
            <div className="relative pl-6 md:pl-8">
              <div className="absolute left-[-11px] top-0 w-6 h-6 bg-surface-bg border-2 border-emerald-500 rounded-full flex items-center justify-center text-[10px] font-bold text-emerald-500 z-10">{detailFields.length > 0 ? 4 : 3}</div>
              <h4 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4">Estimates (Optional)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 bg-surface-card rounded-2xl border border-surface-border shadow-sm">
                {config?.isPerItem ? (
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-text-muted mb-2">Auto-Computed Total</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted font-medium">₹</span>
                      <input type="number" readOnly className="input-field pl-8 bg-surface-elevated font-bold cursor-not-allowed" value={computedTotal() || 0} />
                    </div>
                    <p className="text-[10px] text-text-muted mt-1.5">Calculated from items above</p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-text-muted mb-2">Estimated Cost</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted font-medium">{financials.currency}</span>
                      <input type="number" min="0" className="input-field pl-8 bg-surface-bg font-bold" value={estimatedCost} onChange={e => setEstimatedCost(e.target.value)} placeholder="0" />
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-text-muted mb-2">Target Delivery Date</label>
                  <input type="date" className="input-field bg-surface-bg text-text-primary" value={estimatedDelivery} onChange={e => setEstimatedDelivery(e.target.value)} />
                </div>
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-4 md:p-5 border-t border-surface-border bg-surface-elevated flex flex-col-reverse sm:flex-row justify-end gap-3 shrink-0">
          <button type="button" onClick={onClose} className="btn-secondary w-full sm:w-auto px-6 py-3 md:py-2.5 font-bold" disabled={loading}>Cancel</button>
          <button type="submit" form="new-job-form" className="btn-primary w-full sm:w-auto px-8 py-3 md:py-2.5 font-bold flex flex-row justify-center items-center shadow-lg shadow-accent-primary/20" disabled={loading}>
            {loading ? (
              <span className="items-center flex">
                 <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                 Processing...
              </span>
             ) : (
              <span className="flex items-center gap-2">{terminology.registerButton} <ChevronRight className="w-4 h-4" /></span>
             )}
          </button>
        </div>
      </div>
    </div>
  );
}
