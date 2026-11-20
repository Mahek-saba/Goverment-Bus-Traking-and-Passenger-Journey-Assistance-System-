import React from 'react';
import { AlertCircle, Radio, Info } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const DisclaimerBanner = ({ type = 'simulated', customText = null }) => {
  const { t } = useLanguage();

  if (type === 'simulated') {
    return (
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-300 rounded-lg p-3 sm:p-3.5 text-xs sm:text-sm text-amber-900 shadow-xs">
        <Radio className="w-5 h-5 text-orange-600 shrink-0 mt-0.5 animate-pulse" />
        <div className="leading-relaxed">
          {customText || t('common.simulatedNotice')}
        </div>
      </div>
    );
  }

  if (type === 'dataset') {
    return (
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs sm:text-sm text-blue-900 shadow-xs">
        <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          {customText || t('common.datasetNotice')}
        </div>
      </div>
    );
  }

  if (type === 'eta') {
    return (
      <div className="flex items-start gap-3 bg-orange-50 border border-orange-200 rounded-lg p-3 text-xs sm:text-sm text-orange-950 shadow-xs">
        <AlertCircle className="w-4 h-4 text-orange-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          {customText || t('common.etaNotice')}
        </div>
      </div>
    );
  }

  return null;
};

export default DisclaimerBanner;
