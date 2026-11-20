import React from 'react';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const LoadingSpinner = ({ text = null, size = 'default' }) => {
  const { t } = useLanguage();
  const displayText = text !== null ? text : t('common.loading');

  const sizeClasses = {
    small: 'w-4 h-4',
    default: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-orange-600">
      <Loader2 className={`${sizeClasses[size] || sizeClasses.default} animate-spin mb-3`} />
      {displayText && <p className="text-sm text-slate-600 font-semibold">{displayText}</p>}
    </div>
  );
};

export default LoadingSpinner;
