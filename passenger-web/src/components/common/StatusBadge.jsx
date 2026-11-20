import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export const StatusBadge = ({ status = 'scheduled' }) => {
  const { t } = useLanguage();
  const norm = String(status).toLowerCase();

  const config = {
    'scheduled': {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      labelKey: 'common.scheduled',
    },
    'in-transit': {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-300',
      labelKey: 'common.inTransit',
      dot: true,
    },
    'running': {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-300',
      labelKey: 'common.running',
      dot: true,
    },
    'completed': {
      bg: 'bg-slate-100',
      text: 'text-slate-600',
      border: 'border-slate-200',
      labelKey: 'common.completed',
    },
    'delayed': {
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-300',
      labelKey: 'common.delayed',
    },
    'active': {
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      border: 'border-orange-200',
      labelKey: 'common.active',
    },
    'unavailable': {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      labelKey: 'common.unavailable',
    },
  };

  const current = config[norm] || {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    labelKey: null,
  };

  const label = current.labelKey ? t(current.labelKey) : status;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wide border ${current.bg} ${current.text} ${current.border}`}
    >
      {current.dot && (
        <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse shrink-0" />
      )}
      <span>{label}</span>
    </span>
  );
};

export default StatusBadge;
