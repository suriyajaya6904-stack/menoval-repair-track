import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBusinessType } from '../context/BusinessTypeContext';
import { X, IndianRupee, Save, Clock, Target, AlertCircle, Info, Hash } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function JobCardModal({ job, onClose, onStatusUpdate, onDetailsUpdate }) {
  const { user } = useAuth();
  const { config } = useBusinessType();

  const [status, setStatus] = useState(job.status);
  const [internalNotes, setInternalNotes] = useState(job.internalNotes || job.technicianNotes || '');
  const [finalCost, setFinalCost] = useState(job.finalCost || job.estimatedCost || 0);
  const [paymentStatus, setPaymentStatus] = useState(job.paymentStatus || 'Pending');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isSavingDetails, setIsSavingDetails] = useState(false);

  const statusLabels = config?.statusLabels || ['Received', 'Ready for Pickup', 'Delivered / Closed'];
  const getStatusClass = config?.getStatusClass || ((s) => 'badge bg-surface-border text-text-muted');
  const terminology = config?.terminology || { job: 'Job', item: 'Item' };

  const handleStatusChange = async (newStatus) => {
    if (newStatus === job.status) return;
    setIsUpdatingStatus(true);
    try {
      await onStatusUpdate(job._id, newStatus);
      setStatus(newStatus);
    } catch (error) {
      setStatus(job.status);
    }
    setIsUpdatingStatus(false);
  };

  const handleSaveDetails = async () => {
    setIsSavingDetails(true);
    try {
      await onDetailsUpdate(job._id, {
        internalNotes,
        technicianNotes: internalNotes, // backward compat
        finalCost: Number(finalCost),
        paymentStatus
      });
      toast.success('Details saved successfully');
    } catch (error) {
      toast.error('Failed to save details');
    }
    setIsSavingDetails(false);
  };

  // Build item details display from itemDetails or legacy fields
  const details = job.itemDetails || {};
  const hasLegacyRepair = job.brand || job.deviceType;

  // Render dynamic item details based on business type
  const renderItemDetails = () => {
    const entries = [];
    if (config?.fields) {
      for (const field of config.fields.filter(f => f.group === 'item' && f.type !== 'item_list')) {
        const val = details[field.key] || (hasLegacyRepair ? job[field.key] : null);
        if (val && typeof val !== 'object') {
          entries.push({ label: field.label, value: val });
        }
      }
    }
    // Fallback for legacy repair data
    if (entries.length === 0 && hasLegacyRepair) {
      if (job.brand) entries.push({ label: 'Brand & Model', value: `${job.brand} ${job.model || ''}` });
      if (job.deviceType) entries.push({ label: 'Device Type', value: job.deviceType });
      if (job.color) entries.push({ label: 'Color', value: job.color });
      if (job.identifier) entries.push({ label: 'ID/IMEI', value: job.identifier });
    }
    return entries;
  };

  // Render item list (laundry, tailoring, printing)
  const renderItemList = () => {
    const itemListField = config?.fields?.find(f => f.type === 'item_list');
    if (!itemListField) return null;
    const items = details[itemListField.key];
    if (!Array.isArray(items) || items.length === 0) return null;

    const total = items.reduce((s, i) => s + (i.subtotal || 0), 0);
    return (
      <div className="card p-4 md:p-5 bg-surface-card shadow-sm hover:border-accent-blue/30 transition-colors">
        <h4 className="text-xs font-bold text-accent-blue uppercase tracking-wider mb-4 border-b border-surface-border pb-3 flex items-center gap-2">
          <Target className="w-4 h-4" /> Items
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-text-muted border-b border-surface-border">
                <th className="text-left py-2 pr-4">Type</th>
                <th className="text-center py-2 px-2">Qty</th>
                <th className="text-center py-2 px-2">Rate</th>
                <th className="text-right py-2 pl-2">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/50">
              {items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-2 pr-4 font-medium text-text-primary">{item.type}</td>
                  <td className="py-2 px-2 text-center text-text-secondary">{item.qty}</td>
                  <td className="py-2 px-2 text-center text-text-secondary">₹{item.rate}</td>
                  <td className="py-2 pl-2 text-right font-semibold text-text-primary">₹{item.subtotal}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-surface-border">
                <td colSpan="3" className="py-2 text-right font-bold text-text-muted text-xs uppercase">Total</td>
                <td className="py-2 text-right font-bold text-text-primary">₹{total}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  };

  // Render tags/issues
  const renderTags = () => {
    const tagValues = details.reportedIssue || job.reportedIssue || job.tags || details.tags || [];
    if (!tagValues.length) return null;
    const tagField = config?.fields?.find(f => f.type === 'tags');
    return (
      <div className="mb-5 border-b border-surface-border/50 pb-5">
        <p className="text-[10px] text-text-muted font-bold tracking-widest uppercase mb-3">{tagField?.label || 'Tags'}</p>
        <div className="flex flex-wrap gap-2">
          {tagValues.map((tag, idx) => (
            <span key={idx} className="bg-surface-bg border border-surface-border px-3 py-1.5 text-sm font-medium rounded-lg text-text-primary">{tag}</span>
          ))}
        </div>
      </div>
    );
  };

  const itemEntries = renderItemDetails();

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-0 md:p-4 animate-in fade-in duration-200">
      <div className="bg-surface-card md:border border-surface-border rounded-none md:rounded-2xl shadow-xl w-full h-full md:h-auto md:max-h-[90vh] md:w-[90vw] lg:max-w-5xl overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-5 border-b border-surface-border bg-surface-elevated shrink-0">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-bold text-lg md:text-xl text-text-primary flex items-center gap-2">
                <Hash className="w-5 h-5 text-accent-primary" />
                {job.jobId}
              </h3>
              <span className={getStatusClass(status)}>{status}</span>
            </div>
            <p className="text-text-muted text-xs md:text-sm flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Created on {new Date(job.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-border rounded-xl transition-colors shrink-0">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-4 md:p-6 flex-1 bg-surface-bg w-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                {/* Customer Card */}
                <div className="card p-4 md:p-5 bg-surface-card h-full shadow-sm hover:border-accent-primary/30 transition-colors">
                  <h4 className="text-xs font-bold text-accent-primary uppercase tracking-wider mb-4 border-b border-surface-border pb-3 flex items-center gap-2">
                    <Target className="w-4 h-4" /> Customer
                  </h4>
                  <div className="space-y-4">
                    <div><p className="text-[10px] text-text-muted font-bold tracking-widest uppercase mb-1">Name</p><p className="font-semibold text-lg text-text-primary">{job.customer?.name || 'Unknown'}</p></div>
                    <div><p className="text-[10px] text-text-muted font-bold tracking-widest uppercase mb-1">Phone</p><p className="font-medium text-text-secondary">{job.customer?.phone || 'N/A'}</p></div>
                  </div>
                </div>

                {/* Item Details Card */}
                {itemEntries.length > 0 && (
                  <div className="card p-4 md:p-5 bg-surface-card h-full shadow-sm hover:border-accent-blue/30 transition-colors">
                    <h4 className="text-xs font-bold text-accent-blue uppercase tracking-wider mb-4 border-b border-surface-border pb-3 flex items-center gap-2">
                      {terminology.item} Info
                    </h4>
                    <div className="space-y-4">
                      {itemEntries.map((e, i) => (
                        <div key={i}><p className="text-[10px] text-text-muted font-bold tracking-widest uppercase mb-1">{e.label}</p><p className="font-semibold text-text-primary">{e.value}</p></div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Item List table (laundry/tailoring/printing) */}
              {renderItemList()}

              {/* Tags/Issues Card */}
              {(renderTags() || (details.deviceCondition || job.deviceCondition)) && (
                <div className="card p-4 md:p-5 bg-surface-card shadow-sm hover:border-accent-amber/30 transition-colors">
                  <h4 className="text-xs font-bold text-accent-amber uppercase tracking-wider mb-4 border-b border-surface-border pb-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> Details
                  </h4>
                  {renderTags()}
                  {(details.deviceCondition || job.deviceCondition) && (
                    <div><p className="text-[10px] text-text-muted font-bold tracking-widest uppercase mb-2">Condition on Receipt</p><p className="text-sm font-medium text-text-secondary bg-surface-bg p-3.5 rounded-xl border border-surface-border/50 leading-relaxed">{details.deviceCondition || job.deviceCondition}</p></div>
                  )}
                </div>
              )}

              {/* Internal Notes */}
              <div className="card p-4 md:p-5 bg-surface-card border-accent-green/30 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent-green/5 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 border-b border-accent-green/20 pb-3 gap-2">
                  <h4 className="text-xs font-bold text-accent-green uppercase tracking-wider flex items-center gap-2"><Info className="w-4 h-4" /> Internal Notes</h4>
                  <span className="text-[10px] font-bold tracking-wider uppercase bg-accent-green/10 text-accent-green px-2 py-0.5 rounded">Not shared externally</span>
                </div>
                <textarea className="input-field w-full h-32 resize-y bg-surface-bg/50 border-surface-border/80 focus:ring-accent-green/30 focus:border-accent-green"
                  placeholder="Record notes, findings, instructions..."
                  value={internalNotes} onChange={e => setInternalNotes(e.target.value)} />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Status Control */}
              <div className="card p-4 md:p-5 bg-surface-elevated shadow-lg border-surface-border ring-1 ring-white/5">
                <h4 className="font-bold mb-4 text-text-primary flex items-center gap-2 border-b border-surface-border pb-3">
                  <div className={`shrink-0 w-2.5 h-2.5 rounded-full ${user?.whatsappConnected ? 'bg-accent-green animate-pulse' : 'bg-accent-red'}`}></div>
                  Status
                </h4>
                {!user?.whatsappConnected && (
                  <div className="mb-5 bg-accent-red/10 text-accent-red border border-accent-red/20 p-3.5 rounded-xl text-xs font-medium leading-relaxed">
                    <strong> Action Required:</strong> WhatsApp is disconnected. Connect from Dashboard to send automated updates.
                  </div>
                )}
                <div className="space-y-2 relative z-10">
                  <label className="text-[10px] text-text-muted font-bold tracking-widest uppercase mb-1 block">Update Status (Notifies Customer)</label>
                  <select className="select-field text-base font-semibold p-3.5 bg-surface-bg border-surface-border shadow-inner"
                    value={status} onChange={e => handleStatusChange(e.target.value)}
                    disabled={isUpdatingStatus || !user?.whatsappConnected}>
                    {statusLabels.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div className="mt-6 pt-5 border-t border-surface-border">
                  <label className="text-[10px] text-text-muted font-bold tracking-widest uppercase mb-3 block">Timeline</label>
                  <div className="max-h-56 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                    {[...job.statusHistory].reverse().map((sh, idx) => (
                      <div key={idx} className="flex flex-col text-sm relative pl-4 border-l-2 border-surface-border/50">
                        <div className="absolute w-2.5 h-2.5 bg-surface-elevated border-2 border-accent-primary rounded-full -left-[6px] top-1"></div>
                        <span className="font-semibold text-text-primary">{sh.status}</span>
                        <span className="text-xs text-text-muted font-medium mt-0.5">{new Date(sh.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Financials */}
              <div className="card p-4 md:p-5 bg-surface-card shadow-sm">
                <h4 className="font-bold mb-4 text-text-primary flex items-center gap-2 border-b border-surface-border pb-3">
                  <IndianRupee className="w-5 h-5 text-emerald-500" /> Payment
                </h4>
                <div className="space-y-5">
                  <div className="flex items-center justify-between text-sm bg-surface-bg p-3 rounded-lg border border-surface-border border-dashed">
                    <span className="text-text-muted font-medium">Initial Estimate:</span>
                    <span className="font-bold text-text-primary">₹{job.estimatedCost || 0}</span>
                  </div>
                  <div>
                    <label className="text-[10px] text-text-muted font-bold tracking-widest uppercase mb-2 block">Final Amount</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-bold">₹</span>
                      <input type="number" className="input-field pl-9 font-bold text-xl text-text-primary bg-surface-bg" value={finalCost} onChange={e => setFinalCost(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-text-muted font-bold tracking-widest uppercase mb-2 block">Payment Status</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => setPaymentStatus('Pending')}
                        className={`py-2.5 rounded-xl text-sm font-bold border transition-colors ${paymentStatus === 'Pending' ? 'bg-accent-amber/10 text-accent-amber border-accent-amber/40 shadow-sm' : 'bg-surface-bg border-surface-border text-text-muted hover:bg-surface-border'}`}>Pending</button>
                      <button onClick={() => setPaymentStatus('Paid')}
                        className={`py-2.5 rounded-xl text-sm font-bold border transition-colors ${paymentStatus === 'Paid' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/40 shadow-sm' : 'bg-surface-bg border-surface-border text-text-muted hover:bg-surface-border'}`}>Paid</button>
                    </div>
                  </div>
                </div>
                <button onClick={handleSaveDetails} disabled={isSavingDetails}
                  className="btn-primary w-full mt-6 bg-accent-blue hover:bg-blue-600 shadow-lg shadow-accent-blue/20 flex items-center justify-center gap-2">
                  <Save className="w-5 h-5" /> {isSavingDetails ? 'Saving...' : 'Update Details'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
