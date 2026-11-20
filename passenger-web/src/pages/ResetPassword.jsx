import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, AlertCircle, ArrowRight, CheckCircle2, ShieldCheck, Key } from 'lucide-react';
import { authApi } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export const ResetPassword = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const [resetToken, setResetToken] = useState(location.state?.token || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError(t('auth.validationPasswordMatch'));
      return;
    }

    if (newPassword.length < 6) {
      setError(t('auth.validationPasswordLength'));
      return;
    }

    if (!resetToken.trim()) {
      setError(t('auth.validationTokenRequired'));
      return;
    }

    setLoading(true);

    try {
      const res = await authApi.resetPassword(resetToken.trim(), newPassword);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login', { state: { registered: true } });
        }, 2000);
      } else {
        setError(res.message || 'Password reset failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired reset token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#ea580c] to-[#c2410c] shadow-md shadow-orange-500/20 mb-4 border border-orange-400">
            <Lock className="w-8 h-8 text-white font-bold" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t('auth.setNewPasswordTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            {t('auth.setNewPasswordSubtitle')}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-md p-6 sm:p-8">
          {error && (
            <div className="mb-5 flex items-start gap-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="text-center py-6 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
              <h3 className="text-lg font-black text-slate-900">{t('auth.resetSuccessTitle')}</h3>
              <p className="text-xs text-slate-600">
                {t('auth.resetSuccessDesc')}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  {t('auth.tokenInputLabel')}
                </label>
                <div className="relative">
                  <Key className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    placeholder={t('auth.tokenInputPlaceholder')}
                    required
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#ea580c] focus:ring-1 focus:ring-[#ea580c] text-xs font-mono transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  {t('auth.newPasswordLabel')}
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={t('auth.passwordMinCharsPlaceholder')}
                    required
                    minLength={6}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#ea580c] focus:ring-1 focus:ring-[#ea580c] text-sm transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  {t('auth.confirmPasswordLabel')}
                </label>
                <div className="relative">
                  <ShieldCheck className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t('auth.repeatPasswordPlaceholder')}
                    required
                    minLength={6}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#ea580c] focus:ring-1 focus:ring-[#ea580c] text-sm transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-govt-orange py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 mt-4 shadow-sm disabled:opacity-50"
              >
                {loading ? (
                  <span>{t('auth.updatingPasswordBtn')}</span>
                ) : (
                  <>
                    <span>{t('auth.confirmResetPasswordBtn')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-xs text-slate-600">
            {t('auth.backToSignIn')}{' '}
            <Link to="/login" className="text-[#ea580c] hover:text-orange-700 font-bold underline underline-offset-4">
              {t('auth.signInBtn')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;