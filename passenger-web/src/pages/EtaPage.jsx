import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import {
  Clock,
  MapPin,
  Bus,
  AlertCircle,
  Radio,
  Shuffle,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { busApi } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import DisclaimerBanner from '../components/common/DisclaimerBanner';
import StatusBadge from '../components/common/StatusBadge';

export const EtaPage = () => {
  const { id } = useParams();
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const destinationQuery = searchParams.get('destination') || '';

  const [etaData, setEtaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEta = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await busApi.getETA(id, destinationQuery);
        if (res.success && res.data) {
          setEtaData(res.data);
        } else {
          setError(res.message || 'Unable to compute ETA for this trip.');
        }
      } catch (err) {
        setError(
          err.response?.data?.message || 'Server error while calculating ETA.'
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEta();
    }
  }, [id, destinationQuery]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  const encodedId = encodeURIComponent(id);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top back navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <Link
          to={`/buses/${encodedId}`}
          className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-orange-700 transition"
        >
          <ArrowLeft className="w-4 h-4 text-orange-600" />
          <span>{t('eta.backToDetails')}</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to={`/tracking/${encodedId}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 hover:bg-emerald-100 text-xs font-bold transition"
          >
            <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>{t('eta.simulateLiveTracking')}</span>
          </Link>
        </div>
      </div>

      {/* Main ETA Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded bg-orange-50 text-orange-800 font-mono text-xs font-bold border border-orange-200">
              Trip: {id}
            </span>
            <StatusBadge status={(etaData?.etaStatus === 'AVAILABLE' || etaData?.etaStatus === 'OK') ? 'active' : 'unavailable'} />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t('eta.pageTitle')}
          </h1>

          {/* Large ETA Callout */}
          <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xs">
            <div>
              <p className="text-[11px] uppercase font-bold text-slate-500">{t('eta.arrivalForecastLabel')}</p>
              <div className="flex items-center gap-3 mt-1">
                <Clock className="w-8 h-8 text-orange-600" />
                <span className="text-3xl sm:text-4xl font-black text-slate-900 font-mono">
                  {etaData?.estimatedArrivalTime || etaData?.eta || etaData?.arrivalTime || 'UNAVAILABLE'}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                {t('eta.targetDestinationLabel')} <strong className="text-slate-900 font-semibold">{destinationQuery || etaData?.destination || t('eta.terminusStopFallback')}</strong>
              </p>
            </div>

            <div className="text-right sm:border-l border-slate-200 sm:pl-6 w-full sm:w-auto">
              <p className="text-[11px] uppercase font-bold text-slate-500">{t('eta.calcStatusLabel')}</p>
              <p
                className={`text-lg font-black font-mono mt-0.5 ${
                  (etaData?.etaStatus === 'AVAILABLE' || etaData?.etaStatus === 'OK') ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                {etaData?.etaStatus || 'UNAVAILABLE'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {etaData?.estimatedMinutesRemaining
                  ? `${t('eta.timeRemainingLabel')} ${etaData.estimatedMinutesRemaining} ${t('common.minutes')}`
                  : etaData?.totalDurationMinutes
                  ? `${t('eta.durationLabel')} ${etaData.totalDurationMinutes} ${t('common.minutes')}`
                  : t('eta.segmentDataMissing')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <DisclaimerBanner type="eta" />

      {/* Segment Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-orange-600" />
          <span>{t('eta.gtfsSegmentsTitle')}</span>
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          {t('eta.gtfsSegmentsDesc')}
        </p>

        {etaData?.segments && etaData.segments.length > 0 ? (
          <div className="space-y-2.5">
            {etaData.segments.map((seg, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs hover:border-orange-300 transition"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-800 flex items-center justify-center font-bold text-[10px]">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="font-bold text-slate-900">
                      {seg.fromStop || `Stop #${idx + 1}`} → {seg.toStop || `Stop #${idx + 2}`}
                    </p>
                    <p className="text-[11px] text-slate-500">{t('eta.highwaySegment')}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono font-bold text-orange-700">
                    {seg.duration_seconds ? `${Math.round(seg.duration_seconds / 60)} ${t('common.minutes')}` : 'Unknown'}
                  </span>
                  <p className="text-[10px] text-slate-400">
                    {seg.duration_seconds ? `${seg.duration_seconds}s` : 'Not in crawl'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-lg bg-amber-50/60 border border-amber-200 text-center space-y-2">
            <AlertTriangle className="w-8 h-8 text-amber-600 mx-auto" />
            <p className="text-sm font-bold text-slate-800">
              {t('eta.noSegmentDataTitle')}
            </p>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              {t('eta.noSegmentDataDesc')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EtaPage;
