import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wrench, UserPlus, LogIn, ChevronDown } from 'lucide-react';
import api from '../api/axios';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [shopName, setShopName] = useState('');
  const [businessType, setBusinessType] = useState('repair');
  const [businessTypes, setBusinessTypes] = useState([]);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  // Fetch available business types for registration
  useEffect(() => {
    api.get('/api/config/business-types')
      .then(res => setBusinessTypes(res.data))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isRegister) {
      if (password !== confirmPassword) {
        const toast = (await import('react-hot-toast')).default;
        toast.error('Passwords do not match');
        return;
      }
      if (!termsAccepted) {
        const toast = (await import('react-hot-toast')).default;
        toast.error('Please accept the Terms & Services');
        return;
      }
    }

    setIsSubmitting(true);

    let result;
    if (isRegister) {
      result = await register(name, email, password, shopName, businessType);
    } else {
      result = await login(email, password);
    }

    if (result.success) navigate('/dashboard');
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="card w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-accent-green/10 border border-accent-green/20 rounded-2xl flex items-center justify-center mb-4 text-accent-green">
            {isRegister ? <UserPlus className="w-8 h-8" /> : <Wrench className="w-8 h-8" />}
          </div>
          <h2 className="text-2xl font-bold">{isRegister ? 'Create Your Shop' : 'Welcome Back'}</h2>
          <p className="text-text-muted mt-2 text-sm text-center">
            {isRegister ? 'Start your 7-day free trial' : 'Login to your dashboard'}
          </p>
        </div>

        {/* Toggle Tabs */}
        <div className="flex mb-6 bg-surface-bg rounded-xl p-1 border border-surface-border">
          <button type="button" onClick={() => setIsRegister(false)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${!isRegister ? 'bg-surface-card text-text-primary shadow-sm' : 'text-text-muted hover:text-text-secondary'}`}>
            <LogIn className="w-4 h-4" /> Login
          </button>
          <button type="button" onClick={() => setIsRegister(true)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${isRegister ? 'bg-surface-card text-text-primary shadow-sm' : 'text-text-muted hover:text-text-secondary'}`}>
            <UserPlus className="w-4 h-4" /> Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Your Name</label>
                <input type="text" required className="input-field" value={name}
                  onChange={(e) => setName(e.target.value)} placeholder="e.g. Priya Kumar" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Shop / Business Name</label>
                <input type="text" required className="input-field" value={shopName}
                  onChange={(e) => setShopName(e.target.value)} placeholder="e.g. Sri Lakshmi Laundry" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Business Type</label>
                <div className="relative">
                  <select className="select-field appearance-none bg-surface-bg border-surface-border pr-10 text-base font-medium"
                    value={businessType} onChange={(e) => setBusinessType(e.target.value)}>
                    {businessTypes.map(bt => (
                      <option key={bt.key} value={bt.key}>
                        {bt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none" />
                </div>
                <p className="text-[10px] text-text-muted mt-1.5 ml-1">This determines your forms, statuses, and WhatsApp templates.</p>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-text-muted mb-1">Email Address</label>
            <input type="email" required className="input-field" value={email}
              onChange={(e) => setEmail(e.target.value)} placeholder="admin@shop.com" />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-muted mb-1">Password</label>
            <input type="password" required className="input-field" value={password}
              onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
              minLength={isRegister ? 6 : undefined} />
          </div>

          {isRegister && (
            <>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Confirm Password</label>
                <input type="password" required className="input-field" value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••"
                  minLength={6} />
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-accent-red mt-1 ml-1">Passwords do not match</p>
                )}
              </div>

              <label className="flex items-start gap-3 cursor-pointer mt-2">
                <input type="checkbox" checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-surface-border accent-accent-green" />
                <span className="text-xs text-text-muted leading-relaxed">
                  I agree to the <a href="#" className="text-accent-green hover:underline">Terms of Service</a> and <a href="#" className="text-accent-green hover:underline">Privacy Policy</a>
                </span>
              </label>
            </>
          )}

          <button type="submit" className="btn-primary w-full mt-6" disabled={isSubmitting || (isRegister && !termsAccepted)}>
            {isSubmitting ? 'Processing...' : isRegister ? 'Create Shop & Start Free Trial' : 'Login'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-text-muted border-t border-surface-border pt-6">
          {isRegister
            ? 'Already have an account? Click Login above.'
            : 'New here? Click Register to start your free trial.'}
        </div>
      </div>
    </div>
  );
}
