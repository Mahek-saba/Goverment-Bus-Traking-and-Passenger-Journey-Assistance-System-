import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Bus,
  MapPin,
  Clock,
  Radio,
  Shuffle,
  ArrowLeft,
  Calendar,
  AlertCircle,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { busApi } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import DisclaimerBanner from '../components/common/DisclaimerBanner';
import StatusBadge from '../components/common/StatusBadge';

export const BusDetails = () => {
  const { id } = useParams();
  const { t } = useLanguage();
  const [busDetails, setBusDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await busApi.getBusDetails(id);
        if (res.success && res.data) {
          setBusDetails(res.data);
        } else {
          setError(res.message || t('details.tripNotFoundDesc'));
        }
      } catch (err) {
        setError(
          err.response?.data?.message || 'Server error while fetching bus details.'
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDetails();
    }
  }, [id, t]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error || !busDetails) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">{t('details.tripNotFoundTitle')}</h2>
        <p className="text-sm text-slate-600">{error || t('details.tripNotFoundDesc')}</p>
        <Link to="/search" className="btn-govt-orange px-4 py-2 rounded-lg text-xs font-bold inline-block">
          {t('details.returnToSearch')}
        </Link>
      </div>
    );
  }

  const encodedId = encodeURIComponent(id);
  const stops = busDetails.stops || [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top back navigation & actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <Link
          to={`/search?source=${encodeURIComponent(busDetails.source)}&destination=${encodeURIComponent(busDetails.destination)}`}
          className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-orange-700 transition"
        >
          <ArrowLeft className="w-4 h-4 text-orange-600" />
          <span>{t('details.backToSearch')}</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to={`/tracking/${encodedId}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 hover:bg-emerald-100 text-xs font-bold transition"
          >
            <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>{t('details.liveGpsTracking')}</span>
          </Link>

          <Link
            to={`/eta/${encodedId}?destination=${encodeURIComponent(busDetails.destination)}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 border border-sky-300 text-sky-800 hover:bg-sky-100 text-xs font-bold transition"
          >
            <Clock className="w-3.5 h-3.5 text-sky-600" />
            <span>{t('details.checkEta')}</span>
          </Link>

          <Link
            to={`/alternatives?source=${encodeURIComponent(busDetails.source)}&destination=${encodeURIComponent(busDetails.destination)}&selectedTripId=${encodedId}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 hover:bg-amber-100 text-xs font-bold transition"
          >
            <Shuffle className="w-3.5 h-3.5 text-amber-700" />
            <span>{t('details.alternatives')}</span>
          </Link>
        </div>
      </div>

      {/* Main Bus Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded bg-orange-50 text-orange-800 font-mono text-xs font-bold border border-orange-200">
                {busDetails.routeCode}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {t('details.tripIdLabel')}: <strong className="font-mono text-slate-800">{id}</strong>
              </span>
              <StatusBadge status="scheduled" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {busDetails.source} <span className="text-orange-600">⇄</span> {busDetails.destination}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
              <span className="flex items-center gap-1.5 font-semibold">
                <Clock className="w-4 h-4 text-orange-600" />
                {t('details.departureTimeLabel')}: <strong className="text-slate-900 font-mono">{busDetails.departureTime || 'Scheduled'}</strong>
              </span>

              {busDetails.arrivalTime && (
                <span className="flex items-center gap-1.5 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {t('details.estimatedArrivalLabel')}: <strong className="text-slate-900 font-mono">{busDetails.arrivalTime}</strong>
                </span>
              )}

              <span className="flex items-center gap-1.5 text-slate-500">
                <MapPin className="w-4 h-4 text-slate-500" />
                {t('details.totalStopsLabel')}: <strong className="text-slate-800">{stops.length}</strong>
              </span>
            </div>
          </div>

          {/* Quick review CTA */}
          <div className="flex flex-col items-start md:items-end justify-center pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
            <Link
              to={`/feedback?tripId=${encodedId}&busNumber=${busDetails.busNumber || ''}`}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-orange-50 text-slate-700 hover:text-orange-700 text-xs font-bold border border-slate-300 transition"
            >
              <MessageSquare className="w-4 h-4 text-orange-600" />
              <span>{t('details.leaveReview')}</span>
            </Link>
          </div>
        </div>
      </div>

      <DisclaimerBanner type="dataset" />

      {/* Ordered Stop Timeline */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-orange-600" />
              <span>{t('details.stopSequenceTitle')}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('details.stopSequenceDesc')}
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-orange-800 bg-orange-50 border border-orange-200 px-3 py-1 rounded">
            {stops.length} {t('details.stopsTotal')}
          </span>
        </div>

        {/* Timeline Items */}
        <div className="relative pl-6 sm:pl-8 space-y-5">
          {/* Vertical line through timeline */}
          <div className="absolute left-2.5 sm:left-3.5 top-3 bottom-3 w-0.5 bg-gradient-to-b from-[#ea580c] via-[#f59e0b] to-[#7f1d1d]" />

          {stops.map((stop, idx) => {
            const isOrigin = idx === 0;
            const isDestination = idx === stops.length - 1;

            return (
              <div key={`${stop.stopId || stop.sequence}-${idx}`} className="relative group">
                {/* Timeline node */}
                <div
                  className={`absolute -left-6 sm:-left-8 top-1.5 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-black transition shadow-xs ${
                    isOrigin
                      ? 'bg-emerald-600 border-white text-white'
                      : isDestination
                      ? 'bg-[#7f1d1d] border-white text-white'
                      : 'bg-white border-orange-500 text-orange-700'
                  }`}
                >
                  {stop.sequence}
                </div>

                {/* Stop Content Card */}
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 group-hover:border-orange-300 group-hover:bg-white transition flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 group-hover:text-orange-700 transition">
                        {stop.stopName}
                      </span>
                      {isOrigin && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {t('details.originStopBadge')}
                        </span>
                      )}
                      {isDestination && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-100 text-red-800 border border-red-300">
                          {t('details.terminusStopBadge')}
                        </span>
                      )}
                    </div>

                    {stop.stopNameDevanagari && (
                      <p className="text-xs text-slate-500 font-sans">
                        {stop.stopNameDevanagari}
                      </p>
                    )}

                    {stop.stopCode && (
                      <p className="text-[11px] font-mono text-slate-400">
                        {t('details.codeLabel')} {stop.stopCode}
                      </p>
                    )}
                  </div>

                  <div className="text-right sm:text-right shrink-0">
                    <span className="text-xs text-slate-500 font-mono font-semibold">
                      {t('details.sequenceLabel')}{stop.sequence}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BusDetails;
