import { useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { Plus, Search, Filter, ClipboardList } from 'lucide-react';
import { useBusinessType } from '../context/BusinessTypeContext';
import NewJobModal from '../components/NewJobModal';
import JobCardModal from '../components/JobCardModal';

export default function Jobs() {
  const { config } = useBusinessType();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isNewJobModalOpen, setIsNewJobModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const terminology = config?.terminology || { jobPlural: 'Jobs', createButton: 'New Job' };
  const statusLabels = config?.statusLabels || [];
  const getStatusClass = config?.getStatusClass || (() => 'badge bg-surface-border text-text-muted');

  useEffect(() => { fetchJobs(); }, [statusFilter]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const url = statusFilter ? `/api/jobs?status=${encodeURIComponent(statusFilter)}` : '/api/jobs';
      const res = await api.get(url);
      setJobs(res.data);
    } catch (error) {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async (jobData) => {
    try {
      const res = await api.post('/api/jobs', jobData);
      const newJob = res.data.job || res.data;
      setJobs([newJob, ...jobs]);
      setIsNewJobModalOpen(false);
      toast.success(`${terminology.jobPlural?.slice(0, -1) || 'Job'} created! WhatsApp notification sending...`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create job');
    }
  };

  const handleUpdateStatus = async (jobId, newStatus) => {
    try {
      const res = await api.put(`/api/jobs/${jobId}/status`, { status: newStatus });
      setJobs(jobs.map(j => j._id === jobId ? res.data : j));
      setSelectedJob(res.data);
      toast.success('Status updated. WhatsApp notification sending...');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update status');
      throw error;
    }
  };

  const handleUpdateDetails = async (jobId, details) => {
    try {
      const res = await api.put(`/api/jobs/${jobId}`, details);
      setJobs(jobs.map(j => j._id === jobId ? res.data : j));
      setSelectedJob(res.data);
    } catch (error) { throw error; }
  };

  // Build item summary for display in job cards
  const getItemSummary = (job) => {
    const d = job.itemDetails || {};
    // Try config fields to find meaningful display values
    if (d.brand && d.model) return `${d.brand} ${d.model}`;
    if (d.itemName) return d.itemName;
    if (d.applianceType) return `${d.applianceType}${d.brand ? ' - ' + d.brand : ''}`;
    if (d.vehicleType) return `${d.brand || ''} ${d.model || ''}`.trim() || d.vehicleType;
    if (d.furnitureType) return d.furnitureType;
    if (d.serviceCategory) return d.serviceCategory;
    if (d.cleaningType) return d.cleaningType;
    if (d.printType) return d.printType;
    if (d.testType) return d.testType;
    if (d.itemCategory) return d.itemCategory;
    // Per-item summary
    if (Array.isArray(d.items) && d.items.length > 0) {
      const totalQty = d.items.reduce((s, i) => s + (i.qty || 0), 0);
      return `${totalQty} items`;
    }
    // Legacy repair fallback
    if (job.brand) return `${job.brand} ${job.model || ''}`;
    return terminology.item || 'Item';
  };

  const getItemSubline = (job) => {
    const d = job.itemDetails || {};
    if (d.reportedIssue?.length) return d.reportedIssue.join(', ');
    if (job.reportedIssue?.length) return job.reportedIssue.join(', ');
    if (d.serviceType) return d.serviceType;
    if (d.orderType) return d.orderType;
    if (d.complaint) return d.complaint.slice(0, 60);
    if (d.issueDescription) return d.issueDescription.slice(0, 60);
    if (d.specialInstructions) return d.specialInstructions.slice(0, 60);
    return '';
  };

  const filteredJobs = jobs.filter(job => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (
      job.jobId.toLowerCase().includes(s) ||
      job.customer?.name?.toLowerCase().includes(s) ||
      job.customer?.phone?.includes(s) ||
      getItemSummary(job).toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 pb-20 md:pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-primary to-accent-blue inline-block">{terminology.jobPlural}</h1>
          <p className="text-text-muted mt-1 text-sm sm:text-base">Manage all active and past {terminology.jobPlural?.toLowerCase()}.</p>
        </div>
        <button onClick={() => setIsNewJobModalOpen(true)} className="btn-primary w-full md:w-auto shadow-lg shadow-accent-primary/20">
          <Plus className="w-5 h-5" /> {terminology.createButton}
        </button>
      </div>

      {/* Search & Filter */}
      <div className="card p-3 sm:p-4 flex flex-col md:flex-row gap-4 shadow-sm border-t-2 border-t-accent-primary/20">
        <div className="relative flex-1 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5 group-focus-within:text-accent-primary transition-colors" />
          <input type="text" placeholder={`Search by ID, Customer, or ${terminology.item}...`}
            className="input-field pl-11 bg-surface-bg border-surface-border focus:ring-accent-primary/50 focus:border-accent-primary w-full"
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <div className="relative w-full md:w-64 group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Filter className="h-4 w-4 text-text-muted group-focus-within:text-accent-primary transition-colors" />
          </div>
          <select className="input-field pl-10 appearance-none bg-surface-bg border-surface-border w-full"
            value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            {statusLabels.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-accent-primary"></div>
        </div>
      ) : filteredJobs.length > 0 ? (
        <>
          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {filteredJobs.map(job => (
              <div key={job._id} className="bg-surface-elevated border border-surface-border rounded-2xl p-4 flex flex-col gap-3 active:scale-[0.98] transition-all relative overflow-hidden shadow-sm"
                onClick={() => setSelectedJob(job)}>
                <div className="absolute top-0 left-0 w-1 h-full bg-accent-primary"></div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-semibold font-mono text-sm text-accent-primary">{job.jobId}</span>
                    <div className="text-xs text-text-muted mt-1">{new Date(job.createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</div>
                  </div>
                  <span className={getStatusClass(job.status)}>{job.status}</span>
                </div>
                <div className="pt-2 border-t border-surface-border/50">
                  <div className="font-semibold text-text-primary">{job.customer?.name}</div>
                  <div className="text-sm text-text-secondary">{job.customer?.phone}</div>
                </div>
                <div className="flex items-center gap-3 bg-surface-bg p-3 rounded-xl border border-surface-border/50">
                  <div>
                    <div className="font-medium text-text-primary text-sm">{getItemSummary(job)}</div>
                    <div className="text-xs text-text-muted truncate max-w-[200px]">{getItemSubline(job) || ''}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block bg-surface-card border border-surface-border rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-elevated border-b border-surface-border text-text-muted text-xs uppercase tracking-wider font-semibold">
                    <th className="px-6 py-4 hidden xl:table-cell">ID</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4 pl-6 lg:pl-10">{terminology.item}</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {filteredJobs.map(job => (
                    <tr key={job._id} className="hover:bg-surface-elevated/50 transition-colors cursor-pointer group"
                      onClick={() => setSelectedJob(job)}>
                      <td className="px-6 py-4 hidden xl:table-cell">
                        <span className="font-semibold font-mono text-sm text-text-primary group-hover:text-accent-primary transition-colors">{job.jobId}</span>
                        <div className="text-xs text-text-muted mt-1">{new Date(job.createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-text-primary group-hover:text-accent-primary transition-colors">{job.customer?.name}</div>
                        <div className="text-sm text-text-secondary">{job.customer?.phone}</div>
                        <div className="xl:hidden text-xs font-mono text-accent-primary mt-1">{job.jobId}</div>
                      </td>
                      <td className="px-6 py-4 pl-6 lg:pl-10">
                        <div className="font-medium text-text-primary text-sm">{getItemSummary(job)}</div>
                        <div className="text-xs text-text-muted truncate max-w-[150px]">{getItemSubline(job)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-start gap-2">
                          <span className={getStatusClass(job.status)}>{job.status}</span>
                          {job.paymentStatus === 'Paid' ? (
                            <div className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider">Paid</div>
                          ) : config?.terminalStatuses?.includes(job.status) ? (
                            <div className="text-[10px] uppercase font-bold text-accent-amber tracking-wider">Payment Pending</div>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="card flex flex-col items-center justify-center py-20 text-center border-dashed border-2">
          <div className="w-20 h-20 bg-accent-primary/5 text-accent-primary rounded-full flex items-center justify-center mb-6">
            <ClipboardList className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold mb-2 text-text-primary">No {terminology.jobPlural?.toLowerCase()} found</h3>
          <p className="text-text-muted max-w-md mb-8 text-sm">
            {searchTerm ? "We couldn't find any matching results." : `Get started by creating your first ${(terminology.job || 'job').toLowerCase()}.`}
          </p>
          <button onClick={() => setIsNewJobModalOpen(true)} className="btn-primary px-8 shadow-lg shadow-accent-primary/20">
            {terminology.createButton}
          </button>
        </div>
      )}

      {isNewJobModalOpen && <NewJobModal onClose={() => setIsNewJobModalOpen(false)} onSubmit={handleCreateJob} />}
      {selectedJob && <JobCardModal job={selectedJob} onClose={() => setSelectedJob(null)} onStatusUpdate={handleUpdateStatus} onDetailsUpdate={handleUpdateDetails} />}
    </div>
  );
}
