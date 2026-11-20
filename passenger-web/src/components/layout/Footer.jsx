import React from 'react';
import { Link } from 'react-router-dom';
import { Bus, Phone, ShieldCheck, MapPin, Activity, ExternalLink, Heart } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="mt-auto border-t border-slate-300">
      {/* Tricolor Government Border Strip */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#ea580c] via-[#f59e0b] to-[#15803d]" />

      {/* Main Footer Body */}
      <div className="bg-[#0f172a] text-slate-300 text-xs sm:text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Col 1: Portal & Ministry Identity */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-[#7f1d1d] to-[#ea580c] flex items-center justify-center border border-amber-400 shadow-sm">
                  <Bus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white tracking-tight leading-tight">
                    {t('nav.portalTitle')}
                  </h4>
                  <p className="text-[10px] text-amber-300 font-semibold uppercase">
                    {t('nav.deptName')}
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                {t('footer.description')}
              </p>

              <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1 rounded w-fit font-medium">
                <Activity className="w-3.5 h-3.5 animate-pulse" />
                <span>{t('common.statusOnline')} • MongoDB Connected</span>
              </div>
            </div>

            {/* Col 2: Passenger Quick Services */}
            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3.5 pb-1 border-b border-slate-700/80">
                {t('footer.passengerServices')}
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                <li>
                  <Link to="/search" className="hover:text-amber-300 transition flex items-center gap-1.5">
                    <span>›</span>
                    <span>{t('footer.routeSearch')}</span>
                  </Link>
                </li>
                <li>
                  <Link to="/timetable" className="hover:text-amber-300 transition flex items-center gap-1.5">
                    <span>›</span>
                    <span>{t('footer.corridorTimetables')}</span>
                  </Link>
                </li>
                <li>
                  <Link to="/tracking" className="hover:text-amber-300 transition flex items-center gap-1.5">
                    <span>›</span>
                    <span>{t('footer.simulatedTracking')}</span>
                  </Link>
                </li>
                <li>
                  <Link to="/alternatives" className="hover:text-amber-300 transition flex items-center gap-1.5">
                    <span>›</span>
                    <span>{t('footer.alternativeFinder')}</span>
                  </Link>
                </li>
                <li>
                  <Link to="/feedback" className="hover:text-amber-300 transition flex items-center gap-1.5">
                    <span>›</span>
                    <span>{t('footer.submitFeedback')}</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Emergency Helplines */}
            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3.5 pb-1 border-b border-slate-700/80">
                {t('footer.passengerHelplines')}
              </h4>
              <ul className="space-y-2.5 text-xs">
                <li className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-400">{t('footer.tollFreeLabel')}</span>
                  <span className="text-amber-300 font-mono font-bold">1800-22-1250</span>
                </li>
                <li className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-400">{t('footer.controlRoomLabel')}</span>
                  <span className="text-amber-300 font-mono font-bold">022-23077395</span>
                </li>
                <li className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-400">{t('footer.emergencyLabel')}</span>
                  <span className="text-emerald-400 font-mono font-bold">112</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-slate-400">Women Helpline</span>
                  <span className="text-rose-400 font-mono font-bold">1091</span>
                </li>
              </ul>
            </div>

            {/* Col 4: GTFS Transparency & Academic Disclaimer */}
            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3.5 pb-1 border-b border-slate-700/80">
                {t('footer.transparencyTitle')}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                {t('footer.transparencyDesc')}
              </p>
              <div className="p-2.5 rounded bg-slate-800/80 border border-slate-700 text-[11px] text-slate-300">
                <p className="font-semibold text-amber-300 mb-0.5">Academic Prototype Notice:</p>
                <p className="text-[10px] text-slate-400">
                  Developed for academic demonstration. Live GPS telemetry is simulated along verified Maharashtra highway corridors.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Sub-Footer Bar */}
        <div className="bg-[#020617] border-t border-slate-800 py-3.5 px-4 text-center text-[11px] text-slate-400">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>
              © 2026 Government Bus Tracking and Passenger Journey Assistance System. All rights reserved.
            </p>
            <p className="text-slate-500">
              Government Portal Design Inspired by Maharashtra State Road Transport Corporation (MSRTC)
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
