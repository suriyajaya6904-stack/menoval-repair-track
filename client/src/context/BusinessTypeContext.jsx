import React, { createContext, useState, useContext, useEffect, useMemo, useRef } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const BusinessTypeContext = createContext({ config: null, configLoading: true });

export const useBusinessType = () => useContext(BusinessTypeContext);

/**
 * Provides business type config to the entire app.
 * Fetches fresh on every login. Clears on logout. Never serves stale config.
 */
export const BusinessTypeProvider = ({ children }) => {
  const { user } = useAuth();
  const [config, setConfig] = useState(null);
  const [configLoading, setConfigLoading] = useState(true);
  const prevUserIdRef = useRef(null);

  useEffect(() => {
    // User logged out or changed — immediately clear stale config
    if (!user) {
      setConfig(null);
      setConfigLoading(false);
      prevUserIdRef.current = null;
      return;
    }

    // If user changed (different ID), force-clear before fetching new config
    if (prevUserIdRef.current && prevUserIdRef.current !== user._id) {
      setConfig(null); // Clear immediately so UI doesn't show stale data
    }
    prevUserIdRef.current = user._id;

    let cancelled = false;
    const fetchConfig = async () => {
      setConfigLoading(true);
      try {
        // Add cache-busting timestamp to prevent browser HTTP cache from serving stale config
        const res = await api.get(`/api/config/business-type?_t=${Date.now()}`);
        if (!cancelled) {
          setConfig(res.data);
        }
      } catch (err) {
        console.error('[BusinessTypeContext] Failed to load config:', err?.response?.status, err?.message);
      } finally {
        if (!cancelled) setConfigLoading(false);
      }
    };

    fetchConfig();
    return () => { cancelled = true; };
  }, [user?._id]);

  // Pre-compute useful derived values for O(1) access in components
  const derived = useMemo(() => {
    if (!config) return null;
    
    const statusLabels = config.statuses.map(s => s.label);
    const statusByLabel = {};
    const terminalStatuses = [];
    let initialStatus = null;

    for (const s of config.statuses) {
      statusByLabel[s.label] = s;
      if (s.type === 'terminal') terminalStatuses.push(s.label);
      if (s.type === 'initial') initialStatus = s;
    }

    return {
      ...config,
      statusLabels,
      statusByLabel,
      terminalStatuses,
      initialStatus,
      getStatusClass: (label) => {
        const s = statusByLabel[label];
        return s ? `badge ${s.cssClass}` : 'badge bg-surface-border text-text-muted';
      },
      getStatusColor: (label) => {
        const s = statusByLabel[label];
        return s?.color || '#6B7280';
      },
      isPerItem: config.financials?.pricingModel === 'per_item',
      hasField: (fieldKey) => config.fields.some(f => f.key === fieldKey),
      getFieldsByGroup: (group) => config.fields.filter(f => f.group === group).sort((a, b) => a.order - b.order)
    };
  }, [config]);

  return (
    <BusinessTypeContext.Provider value={{ config: derived, configLoading }}>
      {children}
    </BusinessTypeContext.Provider>
  );
};
