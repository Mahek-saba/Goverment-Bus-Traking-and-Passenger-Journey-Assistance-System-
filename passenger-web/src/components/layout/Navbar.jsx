import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Bus,
  Home,
  Search,
  Clock,
  Radio,
  Shuffle,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  MessageSquare,
  HelpCircle,
  ChevronDown,
  Phone,
  ShieldCheck,
  Share2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import LanguageSelector from '../common/LanguageSelector';

export const Navbar = () => {
  const { user, isAuthenticated, logout, unreadNotifications } = useAuth();
  const { t, fontSize, increaseFontSize, decreaseFontSize, resetFontSize } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/login');
  };

  const navLinks = [
    { nameKey: 'nav.home', path: '/dashboard', icon: Home },
    { nameKey: 'nav.busSearch', path: '/search', icon: Search },
    { nameKey: 'nav.timetable', path: '/timetable', icon: Clock },
    { nameKey: 'nav.liveTracking', path: '/tracking', icon: Radio },
    { nameKey: 'nav.alternatives', path: '/alternatives', icon: Shuffle },
    { nameKey: 'nav.notifications', path: '/notifications', icon: Bell, badge: unreadNotifications },
    { nameKey: 'nav.feedbackMenu', path: '/feedback', icon: MessageSquare },
    { nameKey: 'nav.help', path: '/help', icon: HelpCircle },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 shadow-md">
      {/* 1. Official Government Top Information Bar (Saffron / Deep Orange) */}
      <div className="bg-[#ea580c] text-white text-[11px] sm:text-xs py-1.5 px-4 sm:px-6 lg:px-8 border-b border-orange-700/40">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Left: Official Welcome & Helpline info */}
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <span className="font-semibold tracking-wide">
              {t('nav.welcomeMsg')}
            </span>
            <span className="hidden md:inline-block text-orange-200">|</span>
            <div className="hidden sm:flex items-center gap-1.5 font-medium text-orange-100">
              <Phone className="w-3.5 h-3.5 text-white" />
              <span>{t('nav.helplineShort')}</span>
            </div>
            <div className="hidden lg:flex items-center gap-1 text-orange-100">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>{t('dashboard.womenHelplineBadge')}</span>
            </div>
          </div>

          {/* Right: Accessibility Font Size + Social + Language Selector */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Accessibility text size controls (A- / A / A+) */}
            <div className="flex items-center bg-orange-700/60 rounded px-1.5 py-0.5 border border-orange-400/40" title="Text Size Accessibility">
              <span className="text-[10px] text-orange-100 font-bold mr-1 hidden sm:inline">A:</span>
              <button
                type="button"
                onClick={decreaseFontSize}
                className={`px-1 text-[11px] font-bold rounded hover:bg-orange-600 transition ${fontSize === 'small' ? 'bg-white text-orange-800' : 'text-white'}`}
                title="Decrease Font Size (A-)"
              >
                A-
              </button>
              <button
                type="button"
                onClick={resetFontSize}
                className={`px-1 text-[11px] font-bold rounded hover:bg-orange-600 transition ${fontSize === 'normal' ? 'bg-white text-orange-800' : 'text-white'}`}
                title="Default Font Size (A)"
              >
                A
              </button>
              <button
                type="button"
                onClick={increaseFontSize}
                className={`px-1 text-[11px] font-bold rounded hover:bg-orange-600 transition ${fontSize === 'large' ? 'bg-white text-orange-800' : 'text-white'}`}
                title="Increase Font Size (A+)"
              >
                A+
              </button>
            </div>

            {/* Language Selector Dropdown */}
            <LanguageSelector variant="navbar" />
          </div>
        </div>
      </div>

      {/* 2. Official Main Branding Header (Clean White Portal Banner) */}
      <div className="bg-white border-b border-slate-200 py-3 sm:py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Portal Name */}
          <Link to="/" className="flex items-center gap-3.5 group shrink-0">
            {/* Government State Transport Emblem Badge */}
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl bg-gradient-to-tr from-[#7f1d1d] via-[#991b1b] to-[#ea580c] flex items-center justify-center shadow-md border-2 border-amber-400 group-hover:scale-105 transition-transform duration-200">
              <Bus className="w-6 h-6 sm:w-7 sm:h-7 text-white drop-shadow" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-xs font-extrabold text-[#7f1d1d] uppercase tracking-wider bg-orange-100/80 px-2 py-0.5 rounded border border-orange-200">
                  {t('nav.deptName')}
                </span>
              </div>
              <h1 className="text-base sm:text-xl lg:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                {t('nav.portalTitle')}
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium hidden sm:block">
                {t('nav.portalSubtitle')}
              </p>
            </div>
          </Link>

          {/* Right: Quick State Helpline badges */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <div className="text-right border-r border-slate-200 pr-3">
              <p className="text-[10px] uppercase font-bold text-slate-400">24x7 State Helpline</p>
              <p className="text-base font-black text-orange-700 font-mono">1800-22-1250</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase font-bold text-slate-400">Central Control Room</p>
              <p className="text-sm font-black text-[#7f1d1d] font-mono">022-23077395</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Navigation Ribbon (MSRTC Deep Maroon `#7f1d1d` with Gold Accent Border) */}
      <nav className="bg-[#7f1d1d] text-white border-b-3 border-amber-400 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-1 xl:space-x-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs xl:text-sm font-bold transition relative ${
                      active
                        ? 'bg-amber-400 text-slate-950 shadow-sm'
                        : 'text-amber-100 hover:text-white hover:bg-red-900/80'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-slate-950' : 'text-amber-300'}`} />
                    <span>{t(link.nameKey)}</span>
                    {link.badge > 0 && (
                      <span className="w-4 h-4 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center ml-0.5">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* User Account / Citizen Profile Button */}
            <div className="hidden lg:flex items-center space-x-2">
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded bg-red-950/70 hover:bg-red-950 text-white text-xs font-bold border border-amber-400/40 transition"
                  >
                    <div className="w-5 h-5 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center text-[10px] font-black uppercase">
                      {user?.name ? user.name.charAt(0) : 'P'}
                    </div>
                    <span className="max-w-[120px] truncate">{user?.name}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-amber-300" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-1 w-48 rounded-lg bg-white border border-slate-200 shadow-xl py-1 text-slate-800 z-50">
                      <div className="px-3 py-1.5 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                        <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-700"
                      >
                        <User className="w-3.5 h-3.5 text-orange-600" />
                        <span>{t('nav.profile')}</span>
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 border-t border-slate-100"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>{t('nav.signOut')}</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-3.5 py-1.5 rounded bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold shadow-sm transition flex items-center gap-1.5"
                  >
                    <User className="w-3.5 h-3.5 text-slate-950" />
                    <span>{t('nav.signIn')}</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle Button */}
            <div className="flex items-center justify-between w-full lg:hidden py-1">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                MSRTC Passenger Portal
              </span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 rounded bg-red-950/80 text-white hover:text-amber-300 focus:outline-none"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#881337] border-t border-amber-400 px-4 pt-3 pb-5 space-y-2 text-white animate-in slide-in-from-top-2 duration-150">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded text-xs font-bold transition ${
                    active ? 'bg-amber-400 text-slate-950 font-black' : 'text-amber-100 hover:bg-red-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span>{t(link.nameKey)}</span>
                  </div>
                  {link.badge > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-orange-500 text-white text-[10px]">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            <div className="pt-2 border-t border-red-900/80 flex items-center justify-between">
              {isAuthenticated ? (
                <div className="flex items-center justify-between w-full">
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 text-xs font-bold text-amber-300"
                  >
                    <User className="w-4 h-4" />
                    <span>{user?.name}</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="text-xs text-rose-300 font-bold hover:underline"
                  >
                    {t('nav.signOut')}
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 rounded bg-amber-400 text-slate-950 text-xs font-bold"
                >
                  {t('nav.signIn')}
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
