import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bus, Mail, ArrowRight, CheckCircle2, AlertCircle, KeyRound, Copy, Check } from 'lucide-react';
import { authApi } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export const ForgotPassword = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetToken, setResetToken] = useState(null);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authApi.forgotPassword(email);
      if (res.success) {
        if (res.resetToken) {
          setResetToken(res.resetToken);
        } else {
          setError('No user account with that email was found.');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process request.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (resetToken) {
      navigator.clipboard.writeText(resetToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleProceedToReset = () => {
    navigate('/reset-password', { state: { token: resetToken, email } });
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#ea580c] to-[#c2410c] shadow-md shadow-orange-500/20 mb-4 border border-orange-400">
            <KeyRound className="w-8 h-8 text-white font-bold" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t('auth.resetPasswordTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            {t('auth.resetPasswordSubtitle')}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-md p-6 sm:p-8">
          {error && (
            <div className="mb-5 flex items-start gap-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {!resetToken ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  {t('auth.registeredEmailLabel')}
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

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-govt-orange py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 mt-4 shadow-sm disabled:opacity-50"
              >
                {loading ? (
                  <span>{t('auth.generatingTokenBtn')}</span>
                ) : (
                  <>
                    <span>{t('auth.generateResetTokenBtn')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
                <div className="flex items-center gap-2 font-bold text-emerald-900 mb-1">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  {t('auth.tokenGeneratedTitle')}
                </div>
                <p className="text-xs text-slate-600">
                  {t('auth.tokenGeneratedDescPrefix')} <strong>{email}</strong>.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  {t('auth.tokenLabel')}
                </label>
                <div className="relative">
                  <textarea
                    readOnly
                    rows={3}
                    value={resetToken}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono text-slate-800 select-all focus:outline-none focus:border-[#ea580c]"
                  />
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    className="absolute right-2.5 bottom-3 p-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-medium flex items-center gap-1 border border-slate-300 shadow-xs"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
                    <span>{copied ? t('auth.copiedBtn') : t('auth.copyBtn')}</span>
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleProceedToReset}
                className="w-full btn-govt-orange py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm"
              >
                <span>{t('auth.continueToSetNewPassword')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="mt-6 text-center text-xs text-slate-600">
            {t('auth.rememberedPassword')}{' '}
            <Link to="/login" className="text-[#ea580c] hover:text-orange-700 font-bold underline underline-offset-4">
              {t('auth.returnToLogin')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;