import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Lock,
  ShieldCheck,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Save,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export const Profile = () => {
  const { user, updateUser } = useAuth();
  const { t } = useLanguage();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg('');
    setProfileError('');
    setProfileLoading(true);

    try {
      const res = await authApi.updateProfile({ name, phone });
      if (res.success && res.user) {
        updateUser(res.user);
        setProfileMsg(t('profile.profileUpdatedSuccess'));
      } else {
        setProfileError(res.message || 'Failed to update profile.');
      }
    } catch (err) {
      setProfileError(
        err.response?.data?.message || 'Server error while updating profile.'
      );
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg('');
    setPasswordError('');

    if (newPassword !== confirmPassword) {
      setPasswordError(t('auth.validationPasswordMatch'));
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError(t('auth.validationPasswordLength'));
      return;
    }

    setPasswordLoading(true);

    try {
      const res = await authApi.updateProfile({
        currentPassword,
        newPassword,
      });

      if (res.success) {
        setPasswordMsg(t('profile.passwordChangedSuccess'));
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordError(res.message || 'Failed to change password.');
      }
    } catch (err) {
      setPasswordError(
        err.response?.data?.message || 'Failed to change password. Check current password.'
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Title */}
      <div className="border-b border-slate-200 pb-3">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {t('profile.pageTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          {t('profile.pageSubtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Col: Account Identity Summary */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col items-center text-center space-y-4 shadow-sm">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#7f1d1d] to-[#ea580c] text-white flex items-center justify-center text-3xl font-black uppercase shadow-md border-2 border-amber-400">
            {user?.name ? user.name.charAt(0) : 'P'}
          </div>

          <div>
            <h3 className="text-lg font-black text-slate-900">{user?.name}</h3>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <div className="mt-2 inline-block px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-100 border border-orange-200 text-orange-800">
              {t('profile.roleLabel')} {user?.role || 'passenger'}
            </div>
          </div>

          <div className="w-full pt-4 border-t border-slate-100 text-left text-xs space-y-2 text-slate-600">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Status: <strong className="text-emerald-700">{t('profile.statusActive')}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
              <span>
                {t('profile.joinedLabel')}{' '}
                <strong className="text-slate-800">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : t('profile.activeFallback')}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* Right 2 Cols: Profile Edit & Password Change */}
        <div className="md:col-span-2 space-y-6">
          {/* Form 1: Personal Info */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-black text-slate-900 mb-4 flex items-center gap-2 uppercase tracking-wide border-b border-slate-100 pb-2">
              <User className="w-4 h-4 text-orange-600" />
              <span>{t('profile.personalDetailsTitle')}</span>
            </h3>

            {profileMsg && (
              <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{profileMsg}</span>
              </div>
            )}

            {profileError && (
              <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-rose-50 border border-rose-300 text-rose-800 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('profile.fullNameLabel')} *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-sm font-semibold focus:outline-none focus:border-orange-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('profile.emailPrimaryLabel')}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 text-sm cursor-not-allowed font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('profile.phoneLabel')}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91-98XXXXXXXX"
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-sm font-semibold focus:outline-none focus:border-orange-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="btn-govt-orange px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{profileLoading ? t('profile.savingChanges') : t('profile.saveProfileChangesBtn')}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Form 2: Password Change */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-black text-slate-900 mb-4 flex items-center gap-2 uppercase tracking-wide border-b border-slate-100 pb-2">
              <KeyRound className="w-4 h-4 text-orange-600" />
              <span>{t('profile.changePasswordTitle')}</span>
            </h3>

            {passwordMsg && (
              <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{passwordMsg}</span>
              </div>
            )}

            {passwordError && (
              <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-rose-50 border border-rose-300 text-rose-800 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('profile.currentPasswordLabel')}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-orange-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('profile.newPasswordLabel')}
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder={t('auth.passwordMinCharsPlaceholder')}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-orange-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('profile.confirmNewPasswordLabel')}
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder={t('auth.repeatPasswordPlaceholder')}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-orange-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="btn-secondary px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Lock className="w-4 h-4 text-orange-600" />
                  <span>{passwordLoading ? t('profile.updatingPassword') : t('profile.updatePasswordBtn')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
