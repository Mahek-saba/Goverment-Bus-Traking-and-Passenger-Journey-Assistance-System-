import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bus, Mail, Lock, AlertCircle, ArrowRight, CheckCircle2, UserCheck, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export const Login = () => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState(
    location.state?.registered ? 'Registration successful! You can now log in.' : ''
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Unable to connect to server. Ensure backend is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await login(demoEmail, demoPassword);
      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.message || 'Demo login failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login request failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand Banner */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#ea580c] to-[#c2410c] shadow-md shadow-orange-500/20 mb-4 border border-orange-400">
            <Bus className="w-8 h-8 text-white font-bold" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t('auth.welcomeBack')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            {t('auth.signInSubtitle')}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-md p-6 sm:p-8">
          {error && (
            <div className="mb-5 flex items-start gap-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 flex items-start gap-3 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                {t('auth.emailAddressLabel')}
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. aarav.demo@example.test"
                  required
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#ea580c] focus:ring-1 focus:ring-[#ea580c] text-sm transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  {t('auth.passwordLabel')}
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-[#ea580c] hover:text-orange-700 font-semibold transition"
                >
                  {t('auth.forgotPasswordLink')}
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#ea580c] focus:ring-1 focus:ring-[#ea580c] text-sm transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-govt-orange py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 mt-2 shadow-sm disabled:opacity-50"
            >
              {loading ? (
                <span>{t('auth.authenticatingBtn')}</span>
              ) : (
                <>
                  <span>{t('auth.signInBtn')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Logins for Fast Review */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-xs font-bold text-slate-600 mb-3 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-[#ea580c]" />
              <span>{t('auth.instantDemoAccounts')}</span>
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleDemoLogin('aarav.demo@example.test', 'DemoPassword123!')}
                className="text-left p-2.5 rounded-xl bg-slate-50 hover:bg-orange-50/70 border border-slate-200 hover:border-orange-300 transition group shadow-xs"
              >
                <p className="text-xs font-black text-slate-900 group-hover:text-[#ea580c]">
                  Aarav Patil
                </p>
                <p className="text-[10px] text-slate-500 truncate">{t('auth.passengerRole')}</p>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('sana.demo@example.test', 'DemoPassword123!')}
                className="text-left p-2.5 rounded-xl bg-slate-50 hover:bg-orange-50/70 border border-slate-200 hover:border-orange-300 transition group shadow-xs"
              >
                <p className="text-xs font-black text-slate-900 group-hover:text-[#ea580c]">
                  Sana Shaikh
                </p>
                <p className="text-[10px] text-slate-500 truncate">{t('auth.passengerRole')}</p>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-600">
            {t('auth.noAccount')}{' '}
            <Link to="/register" className="text-[#ea580c] hover:text-orange-700 font-bold underline underline-offset-4">
              {t('auth.registerHere')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;