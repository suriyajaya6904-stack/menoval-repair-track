import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import SearchableDropdown from './SearchableDropdown';
import { MOBILE_BRANDS_MODELS, LAPTOP_BRANDS_MODELS } from '../utils/deviceData';

/**
 * Renders a single form field dynamically based on its config definition.
 * Supports: text, number, select, textarea, date, tags, searchable_dropdown, item_list
 */
export default function DynamicField({ field, value, onChange, allValues = {} }) {
  const [customTag, setCustomTag] = useState('');

  switch (field.type) {
    case 'text':
      return (
        <div>
          <label className="block text-[10px] uppercase tracking-widest font-bold text-text-muted mb-2">{field.label}{field.required && ' *'}</label>
          <input
            type="text" required={field.required}
            className="input-field bg-surface-bg placeholder-text-muted/50"
            value={value || ''} onChange={e => onChange(e.target.value)}
            placeholder={field.placeholder || ''}
          />
        </div>
      );

    case 'number':
      return (
        <div>
          <label className="block text-[10px] uppercase tracking-widest font-bold text-text-muted mb-2">{field.label}{field.required && ' *'}</label>
          <input
            type="number" min="0" required={field.required}
            className="input-field bg-surface-bg placeholder-text-muted/50"
            value={value || ''} onChange={e => onChange(e.target.value)}
            placeholder={field.placeholder || '0'}
          />
        </div>
      );

    case 'date':
      return (
        <div>
          <label className="block text-[10px] uppercase tracking-widest font-bold text-text-muted mb-2">{field.label}{field.required && ' *'}</label>
          <input
            type="date" required={field.required}
            className="input-field bg-surface-bg text-text-primary"
            value={value || ''} onChange={e => onChange(e.target.value)}
          />
        </div>
      );

    case 'select':
      return (
        <div>
          <label className="block text-[10px] uppercase tracking-widest font-bold text-text-muted mb-2">{field.label}{field.required && ' *'}</label>
          <select
            className="select-field bg-surface-bg border-surface-border"
            value={value || ''} onChange={e => onChange(e.target.value)}
            required={field.required}
          >
            <option value="" disabled>Select {field.label.toLowerCase()}</option>
            {(field.options || []).map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      );

    case 'textarea':
      return (
        <div>
          <label className="block text-[10px] uppercase tracking-widest font-bold text-text-muted mb-2">{field.label}{field.required && ' *'}</label>
          <textarea
            className="input-field h-24 resize-none bg-surface-bg placeholder-text-muted/50"
            value={value || ''} onChange={e => onChange(e.target.value)}
            placeholder={field.placeholder || ''} required={field.required}
          />
        </div>
      );

    case 'searchable_dropdown': {
      // Handle device brand/model data sources for repair type
      let options = field.options || [];
      if (field.dependsOnValue) {
        const depVal = allValues[field.dependsOnValue.field];
        const dataSourceKey = field.dependsOnValue.mapping?.[depVal];
        if (dataSourceKey === 'MOBILE_BRANDS_MODELS') options = Object.keys(MOBILE_BRANDS_MODELS);
        else if (dataSourceKey === 'LAPTOP_BRANDS_MODELS') options = Object.keys(LAPTOP_BRANDS_MODELS);
      } else if (field.dependsOn) {
        // Model depends on brand
        const brandVal = allValues[field.dependsOn];
        const devType = allValues.deviceType;
        const source = devType === 'Laptop' ? LAPTOP_BRANDS_MODELS : MOBILE_BRANDS_MODELS;
        options = brandVal && source[brandVal] ? source[brandVal] : [];
      }

      return (
        <div>
          <label className="block text-[10px] uppercase tracking-widest font-bold text-text-muted mb-2">{field.label}{field.required && ' *'}</label>
          <SearchableDropdown
            value={value || ''} onChange={onChange}
            options={options} placeholder={field.placeholder || `Select ${field.label}`}
            labelName={field.label}
            localStorageKey={`custom-${field.key}-${allValues[field.dependsOn] || 'all'}`}
          />
        </div>
      );
    }

    case 'tags': {
      const currentTags = Array.isArray(value) ? value : [];
      // Determine which preset tags to show based on config
      let presetTags = [];
      if (Array.isArray(field.presetTags)) {
        presetTags = field.presetTags;
      } else if (field.presetTags && field.presetTagKey) {
        const tagKey = allValues[field.presetTagKey];
        presetTags = field.presetTags[tagKey] || Object.values(field.presetTags).flat();
      }
      const allTags = [...new Set([...presetTags, ...currentTags])];

      const toggleTag = (tag) => {
        onChange(currentTags.includes(tag) ? currentTags.filter(t => t !== tag) : [...currentTags, tag]);
      };
      const addCustom = () => {
        if (customTag.trim() && !currentTags.includes(customTag.trim())) {
          onChange([...currentTags, customTag.trim()]);
          setCustomTag('');
        }
      };

      return (
        <div>
          <label className="block text-[10px] uppercase tracking-widest font-bold text-text-muted mb-3">{field.label}</label>
          <div className="flex flex-wrap gap-2 mb-4">
            {allTags.map(tag => (
              <button key={tag} type="button" onClick={() => toggleTag(tag)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                  currentTags.includes(tag)
                    ? 'bg-accent-amber/10 text-accent-amber border-accent-amber/40 shadow-sm'
                    : 'bg-surface-bg text-text-secondary border-surface-border hover:border-text-muted'
                }`}
              >{tag}</button>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="text" className="input-field flex-1 text-sm bg-surface-bg" value={customTag}
              onChange={e => setCustomTag(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addCustom())}
              placeholder="Or type a custom issue..." />
            <button type="button" onClick={addCustom} className="btn-secondary text-sm px-5 font-bold">+</button>
          </div>
        </div>
      );
    }

    default:
      return null;
  }
}
