import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Clock, AlertCircle, Package, MapPin, Phone } from 'lucide-react';

/**
 * Public Customer Tracking Page — No login required.
 * Customers open this from a WhatsApp link to see their job progress.
 * Amazon/Flipkart-style progress stepper + timeline.
 */
export default function TrackingPage() {
  const { jobId } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTracking = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
        const res = await fetch(`${baseUrl}/api/track/${jobId}?token=${token}`);
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to load tracking data');
        }
        setData(await res.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (jobId && token) {
      fetchTracking();
    } else {
      setError('Invalid tracking link');
      setLoading(false);
    }
  }, [jobId, token]);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p style={{ color: '#A0B3C6', marginTop: 16 }}>Loading tracking info...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.loadingContainer}>
        <AlertCircle size={48} color="#EF4444" />
        <h2 style={{ color: '#fff', marginTop: 16 }}>Unable to load tracking</h2>
        <p style={{ color: '#A0B3C6', marginTop: 8 }}>{error}</p>
      </div>
    );
  }

  // Build progress data
  const allStatuses = data.statuses || [];
  const completedStatuses = (data.statusHistory || []).map(h => h.status);
  const currentStatusIndex = allStatuses.findIndex(s => s.label === data.status);

  // Find the timestamp for each completed status
  const getTimestamp = (statusLabel) => {
    const entry = [...(data.statusHistory || [])].reverse().find(h => h.status === statusLabel);
    return entry?.timestamp ? new Date(entry.timestamp) : null;
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatDateTime = (date) => {
    if (!date) return '';
    return `${formatDate(date)}, ${formatTime(date)}`;
  };

  const terminology = data.terminology || {};

  return (
    <div style={styles.pageContainer}>
      {/* Banner */}
      {data.banner && (
        <div style={styles.bannerContainer}>
          <img src={data.banner} alt={data.shopName} style={styles.bannerImage} />
        </div>
      )}

      {/* Shop Header */}
      <div style={styles.headerCard}>
        <div style={styles.shopInitial}>
          {(data.shopName || 'S').charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 style={styles.shopName}>{data.shopName}</h1>
          {data.shopCity && (
            <p style={styles.shopCity}>
              <MapPin size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
              {data.shopCity}
            </p>
          )}
        </div>
      </div>

      {/* Job Info Card */}
      <div style={styles.card}>
        <div style={styles.jobIdRow}>
          <span style={styles.jobIdLabel}>{terminology.job || 'Job'} ID</span>
          <span style={styles.jobIdValue}>{data.jobId}</span>
        </div>
        <div style={styles.divider} />
        <div style={styles.infoGrid}>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>Customer</span>
            <span style={styles.infoValue}>{data.customerName}</span>
          </div>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>Registered</span>
            <span style={styles.infoValue}>{formatDate(data.receivedDate)}</span>
          </div>
          {data.estimatedDelivery && (
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Est. Delivery</span>
              <span style={styles.infoValue}>{formatDate(data.estimatedDelivery)}</span>
            </div>
          )}
          {data.estimatedCost > 0 && (
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Est. Cost</span>
              <span style={styles.infoValue}>Rs. {data.estimatedCost}</span>
            </div>
          )}
        </div>
      </div>

      {/* Current Status Badge */}
      <div style={styles.card}>
        <div style={styles.currentStatusContainer}>
          <span style={styles.currentStatusLabel}>Current Status</span>
          <div style={{
            ...styles.currentStatusBadge,
            backgroundColor: allStatuses[currentStatusIndex]?.color || '#26C666',
          }}>
            {data.status}
          </div>
        </div>
      </div>

      {/* Progress Stepper */}
      <div style={styles.card}>
        <h3 style={styles.sectionTitle}>Progress</h3>
        <div style={styles.stepperContainer}>
          {allStatuses.map((status, index) => {
            const isCompleted = index < currentStatusIndex;
            const isCurrent = index === currentStatusIndex;
            const isTerminal = status.type === 'terminal';
            const isHold = status.type === 'hold';
            const isUpcoming = index > currentStatusIndex;
            const timestamp = getTimestamp(status.label);

            // Skip hold status from progress bar unless it's current
            if (isHold && !isCurrent) return null;

            return (
              <div key={status.key} style={styles.stepItem}>
                {/* Connector line (not for first item) */}
                {index > 0 && !isHold && (
                  <div style={{
                    ...styles.stepConnector,
                    backgroundColor: isCompleted || isCurrent ? (status.color || '#26C666') : '#1E3A52',
                  }} />
                )}

                {/* Step circle */}
                <div style={{
                  ...styles.stepCircle,
                  backgroundColor: isCompleted || isCurrent ? (status.color || '#26C666') : '#1E3A52',
                  borderColor: isCompleted || isCurrent ? (status.color || '#26C666') : '#2D4A63',
                  transform: isCurrent ? 'scale(1.2)' : 'scale(1)',
                  boxShadow: isCurrent ? `0 0 12px ${status.color || '#26C666'}40` : 'none',
                }}>
                  {isCompleted ? (
                    <CheckCircle2 size={16} color="#fff" />
                  ) : isCurrent ? (
                    <div style={styles.stepPulse} />
                  ) : (
                    <div style={styles.stepEmpty} />
                  )}
                </div>

                {/* Step label */}
                <div style={styles.stepContent}>
                  <span style={{
                    ...styles.stepLabel,
                    color: isCompleted || isCurrent ? '#fff' : '#6B7C93',
                    fontWeight: isCurrent ? 700 : 500,
                  }}>
                    {status.label}
                  </span>
                  {timestamp && (
                    <span style={styles.stepTime}>
                      {formatDateTime(timestamp)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Timeline */}
      <div style={styles.card}>
        <h3 style={styles.sectionTitle}>Timeline</h3>
        <div style={styles.timeline}>
          {[...(data.statusHistory || [])].reverse().map((entry, index) => {
            const statusConfig = allStatuses.find(s => s.label === entry.status);
            const color = statusConfig?.color || '#6B7C93';
            const ts = new Date(entry.timestamp);

            return (
              <div key={index} style={styles.timelineItem}>
                {/* Timeline dot + line */}
                <div style={styles.timelineDotContainer}>
                  <div style={{
                    ...styles.timelineDot,
                    backgroundColor: color,
                    boxShadow: index === 0 ? `0 0 8px ${color}60` : 'none',
                  }} />
                  {index < data.statusHistory.length - 1 && (
                    <div style={styles.timelineLine} />
                  )}
                </div>

                {/* Timeline content */}
                <div style={styles.timelineContent}>
                  <span style={{
                    ...styles.timelineStatus,
                    color: index === 0 ? '#fff' : '#A0B3C6',
                    fontWeight: index === 0 ? 600 : 400,
                  }}>
                    {entry.status}
                  </span>
                  <span style={styles.timelineDate}>
                    {formatDateTime(ts)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <p style={styles.footerText}>Powered by Menoval Technology Solutions</p>
      </div>
    </div>
  );
}

// ── Inline Styles (mobile-first, dark theme) ──
const styles = {
  pageContainer: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #0A1628 0%, #0D1F35 50%, #0A1628 100%)',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    maxWidth: 480,
    margin: '0 auto',
    paddingBottom: 40,
  },
  loadingContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0A1628',
  },
  spinner: {
    width: 40,
    height: 40,
    border: '3px solid #1E3A52',
    borderTop: '3px solid #26C666',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  bannerContainer: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: '0 0 16px 16px',
  },
  bannerImage: {
    width: '100%',
    height: 'auto',
    display: 'block',
    objectFit: 'cover',
  },
  headerCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '20px 16px',
  },
  shopInitial: {
    width: 48,
    height: 48,
    borderRadius: 14,
    background: 'linear-gradient(135deg, #26C666, #1E9E52)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 22,
    fontWeight: 800,
    color: '#fff',
    flexShrink: 0,
  },
  shopName: {
    fontSize: 20,
    fontWeight: 700,
    color: '#fff',
    margin: 0,
  },
  shopCity: {
    fontSize: 13,
    color: '#6B7C93',
    margin: '4px 0 0',
    display: 'flex',
    alignItems: 'center',
  },
  card: {
    background: '#0F2438',
    border: '1px solid #1E3A52',
    borderRadius: 16,
    padding: 20,
    margin: '0 12px 12px',
  },
  jobIdRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  jobIdLabel: {
    fontSize: 13,
    color: '#6B7C93',
    fontWeight: 500,
  },
  jobIdValue: {
    fontSize: 16,
    fontWeight: 700,
    color: '#26C666',
    letterSpacing: '0.5px',
  },
  divider: {
    height: 1,
    background: '#1E3A52',
    margin: '14px 0',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
  },
  infoItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7C93',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  infoValue: {
    fontSize: 14,
    color: '#E0E7EF',
    fontWeight: 600,
  },
  currentStatusContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currentStatusLabel: {
    fontSize: 14,
    color: '#6B7C93',
    fontWeight: 500,
  },
  currentStatusBadge: {
    padding: '8px 20px',
    borderRadius: 50,
    fontSize: 14,
    fontWeight: 700,
    color: '#fff',
    letterSpacing: '0.3px',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: '#fff',
    margin: '0 0 16px',
  },
  stepperContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
  },
  stepItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 14,
    position: 'relative',
    minHeight: 52,
  },
  stepConnector: {
    position: 'absolute',
    left: 15,
    top: -26,
    width: 2,
    height: 26,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    border: '2px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'all 0.3s ease',
  },
  stepPulse: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    backgroundColor: '#fff',
  },
  stepEmpty: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: '#2D4A63',
  },
  stepContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    paddingTop: 5,
  },
  stepLabel: {
    fontSize: 14,
    transition: 'color 0.2s',
  },
  stepTime: {
    fontSize: 11,
    color: '#6B7C93',
  },
  timeline: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
  },
  timelineItem: {
    display: 'flex',
    gap: 14,
    position: 'relative',
    minHeight: 52,
  },
  timelineDotContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flexShrink: 0,
    width: 20,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: '50%',
    flexShrink: 0,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#1E3A52',
    marginTop: 4,
  },
  timelineContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    paddingBottom: 16,
  },
  timelineStatus: {
    fontSize: 14,
  },
  timelineDate: {
    fontSize: 12,
    color: '#6B7C93',
  },
  footer: {
    textAlign: 'center',
    padding: '24px 16px 0',
  },
  footerText: {
    fontSize: 12,
    color: '#3D5068',
    fontWeight: 500,
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
};
