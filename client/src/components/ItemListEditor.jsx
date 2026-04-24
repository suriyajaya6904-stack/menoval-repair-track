import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

/**
 * Item list editor for per-item pricing business types (laundry, tailoring, printing).
 * Renders an add/remove table of items with type, quantity, rate, and auto-calculated subtotal.
 */
export default function ItemListEditor({ field, value, onChange }) {
  const items = Array.isArray(value) ? value : [];
  const itemTypes = field.itemTypes || ['Item'];

  const addItem = () => {
    onChange([...items, { type: itemTypes[0], qty: 1, rate: 0, subtotal: 0 }]);
  };

  const removeItem = (idx) => {
    onChange(items.filter((_, i) => i !== idx));
  };

  const updateItem = (idx, key, val) => {
    const updated = items.map((item, i) => {
      if (i !== idx) return item;
      const newItem = { ...item, [key]: val };
      // Auto-compute subtotal
      if (key === 'qty' || key === 'rate') {
        newItem.subtotal = (Number(newItem.qty) || 0) * (Number(newItem.rate) || 0);
      }
      return newItem;
    });
    onChange(updated);
  };

  const total = items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  const totalQty = items.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="text-[10px] uppercase tracking-widest font-bold text-text-muted">
          {field.label}{field.required && ' *'}
        </label>
        <button type="button" onClick={addItem}
          className="flex items-center gap-1.5 text-xs font-bold text-accent-primary hover:text-accent-primary/80 transition-colors px-3 py-1.5 rounded-lg bg-accent-primary/5 border border-accent-primary/20 hover:bg-accent-primary/10"
        >
          <Plus className="w-3.5 h-3.5" /> Add Item
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8 bg-surface-bg rounded-xl border border-dashed border-surface-border">
          <p className="text-sm text-text-muted mb-3">No items added yet</p>
          <button type="button" onClick={addItem}
            className="btn-secondary text-sm px-5 py-2 inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add First Item
          </button>
        </div>
      ) : (
        <div className="bg-surface-bg rounded-xl border border-surface-border overflow-hidden">
          {/* Header - hidden on very small screens */}
          <div className="hidden sm:grid sm:grid-cols-12 gap-2 px-4 py-2.5 bg-surface-elevated border-b border-surface-border text-[10px] uppercase tracking-widest font-bold text-text-muted">
            <div className="col-span-4">Type</div>
            <div className="col-span-2 text-center">Qty</div>
            <div className="col-span-2 text-center">Rate (₹)</div>
            <div className="col-span-3 text-right">Subtotal</div>
            <div className="col-span-1"></div>
          </div>

          {/* Items */}
          <div className="divide-y divide-surface-border/50">
            {items.map((item, idx) => (
              <div key={idx} className="px-3 sm:px-4 py-3 grid grid-cols-2 sm:grid-cols-12 gap-2 sm:gap-2 items-center">
                {/* Type */}
                <div className="col-span-2 sm:col-span-4">
                  <label className="sm:hidden text-[9px] uppercase tracking-widest font-bold text-text-muted mb-1 block">Type</label>
                  <select
                    className="w-full px-2.5 py-2 text-sm bg-surface-card border border-surface-border rounded-lg text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-primary/50"
                    value={item.type} onChange={e => updateItem(idx, 'type', e.target.value)}
                  >
                    {itemTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                {/* Qty */}
                <div className="sm:col-span-2">
                  <label className="sm:hidden text-[9px] uppercase tracking-widest font-bold text-text-muted mb-1 block">Qty</label>
                  <input type="number" min="1"
                    className="w-full px-2.5 py-2 text-sm text-center bg-surface-card border border-surface-border rounded-lg text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-primary/50"
                    value={item.qty} onChange={e => updateItem(idx, 'qty', e.target.value)}
                  />
                </div>
                {/* Rate */}
                <div className="sm:col-span-2">
                  <label className="sm:hidden text-[9px] uppercase tracking-widest font-bold text-text-muted mb-1 block">Rate</label>
                  <input type="number" min="0"
                    className="w-full px-2.5 py-2 text-sm text-center bg-surface-card border border-surface-border rounded-lg text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-primary/50"
                    value={item.rate} onChange={e => updateItem(idx, 'rate', e.target.value)}
                  />
                </div>
                {/* Subtotal */}
                <div className="sm:col-span-3 text-right">
                  <label className="sm:hidden text-[9px] uppercase tracking-widest font-bold text-text-muted mb-1 block">Subtotal</label>
                  <span className="font-bold text-sm text-text-primary">₹{item.subtotal || 0}</span>
                </div>
                {/* Delete */}
                <div className="sm:col-span-1 flex justify-end">
                  <button type="button" onClick={() => removeItem(idx)}
                    className="p-1.5 text-text-muted hover:text-accent-red hover:bg-accent-red/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Footer totals */}
          <div className="px-4 py-3 bg-surface-elevated border-t border-surface-border flex items-center justify-between">
            <span className="text-xs font-medium text-text-muted">
              {totalQty} item{totalQty !== 1 ? 's' : ''}
            </span>
            <span className="font-bold text-base text-text-primary">
              Total: ₹{total}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
