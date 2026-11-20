import React from 'react';
import {
  HelpCircle,
  Phone,
  ShieldCheck,
  MapPin,
  Info,
  Server,
  Database,
  Compass,
  FileText,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import DisclaimerBanner from '../components/common/DisclaimerBanner';
import { useLanguage } from '../context/LanguageContext';

export const HelpAboutPage = () => {
  const { t } = useLanguage();

  const faqs = [
    {
      q: t('help.faq1Q'),
      a: t('help.faq1A')
    },
    {
      q: t('help.faq2Q'),
      a: t('help.faq2A')
    },
    {
      q: t('help.faq3Q'),
      a: t('help.faq3A')
    },
    {
      q: t('help.faq4Q'),
      a: t('help.faq4A')
    },
    {
      q: t('help.faq5Q'),
      a: t('help.faq5A')
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center shadow-xs">
            <HelpCircle className="w-5 h-5 text-[#ea580c]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {t('help.pageTitle')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              {t('help.pageSubtitle')}
            </p>
          </div>
        </div>
      </div>

      <DisclaimerBanner type="simulated" />

      {/* Emergency Helplines Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
        <h2 className="text-base font-black text-slate-900 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Phone className="w-5 h-5 text-[#ea580c]" />
          <span>{t('help.emergencyHelplinesTitle')}</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/90 space-y-1">
            <p className="text-[10px] uppercase font-bold text-amber-800">{t('footer.helpline')}</p>
            <p className="text-lg font-black text-[#7f1d1d] font-mono">1800-22-1250</p>
            <p className="text-[11px] text-slate-600">{t('help.tollFreeDesc')}</p>
          </div>

          <div className="p-4 rounded-xl bg-orange-50/60 border border-orange-200/90 space-y-1">
            <p className="text-[10px] uppercase font-bold text-orange-800">{t('help.centralControlTitle')}</p>
            <p className="text-lg font-black text-[#ea580c] font-mono">{t('help.centralControlPhone')}</p>
            <p className="text-[11px] text-slate-600">{t('help.centralControlDesc')}</p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/90 space-y-1">
            <p className="text-[10px] uppercase font-bold text-emerald-800">{t('help.nationalEmergencyTitle')}</p>
            <p className="text-lg font-black text-emerald-700 font-mono">{t('help.nationalEmergencyPhone')}</p>
            <p className="text-[11px] text-slate-600">{t('help.nationalEmergencyDesc')}</p>
          </div>

          <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200/90 space-y-1">
            <p className="text-[10px] uppercase font-bold text-rose-800">{t('help.womenHelplineTitle')}</p>
            <p className="text-lg font-black text-rose-700 font-mono">{t('help.womenHelplinePhone')}</p>
            <p className="text-[11px] text-slate-600">{t('help.womenHelplineDesc')}</p>
          </div>
        </div>
      </div>

      {/* System Technical Architecture Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-4">
        <h2 className="text-base font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Server className="w-5 h-5 text-[#ea580c]" />
          <span>{t('help.techArchitectureTitle')}</span>
        </h2>

        <p className="text-xs text-slate-600 leading-relaxed">
          {t('help.techArchitectureIntro')}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <span className="text-xs font-black text-[#ea580c]">{t('help.frontendCardTitle')}</span>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t('help.frontendCardDesc')}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <span className="text-xs font-black text-[#7f1d1d]">{t('help.backendCardTitle')}</span>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t('help.backendCardDesc')}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <span className="text-xs font-black text-emerald-700">{t('help.dbCardTitle')}</span>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t('help.dbCardDesc')}
            </p>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-4">
        <h2 className="text-base font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Info className="w-5 h-5 text-[#ea580c]" />
          <span>{t('help.faqTitle')}</span>
        </h2>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="text-sm font-bold text-slate-900 flex items-start gap-2">
                <span className="text-[#ea580c] font-mono font-black">Q{idx + 1}.</span>
                <span>{faq.q}</span>
              </h4>
              <p className="text-xs text-slate-600 pl-6 leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HelpAboutPage;