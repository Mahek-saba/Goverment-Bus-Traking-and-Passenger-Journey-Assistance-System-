import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Shuffle,
  Bus,
  Clock,
  ArrowRight,
  Radio,
  Search,
  MapPin,
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { busApi } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import DisclaimerBanner from '../components/common/DisclaimerBanner';
import StatusBadge from '../components/common/StatusBadge';

export const AlternativesPage = () => {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSource = searchParams.get('source') || 'Solapur';
  const initialDestination = searchParams.get('destination') || 'Pune';
  const initialSelectedTripId = searchParams.get('selectedTripId') || '';

  const [source, setSource] = useState(initialSource);
  const [destination, setDestination] = useState(initialDestination);
  const [selectedTripId, setSelectedTripId] = useState(initialSelectedTripId);
  const [alternatives, setAlternatives] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchAlternatives = async (src, dst, tripId) => {
    if (!src || !dst) return;
    setLoading(true);
    setError('');

    try {
      const res = await busApi.getAlternatives(src, dst, tripId);
      if (res.success) {
        setAlternatives(res.data || []);
        if (res.data && res.data.length === 0) {
          setError(t('alternatives.noAlternativesDesc'));
        }
      } else {
        setError(res.message || t('alternatives.noAlternativesDesc'));
        setAlternatives([]);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Server error while finding alternatives.'
      );
      setAlternatives([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialSource && initialDestination) {
      fetchAlternatives(initialSource, initialDestination, initialSelectedTripId);
    }
  }, [initialSource, initialDestination, initialSelectedTripId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSearchParams({
      source,
      destination,
      ...(selectedTripId ? { selectedTripId } : {}),
    });
    fetchAlternatives(source, destination, selectedTripId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <Shuffle className="w-6 h-6 text-orange-600" />
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t('alternatives.pageTitle')}
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          {t('alternatives.pageSubtitle')}
        </p>
      </div>

      {/* Query Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-4 relative">
            <label className="block text-[11px] uppercase font-bold text-slate-600 mb-1">
              {t('alternatives.originLabel')} *
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-orange-600 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="e.g. Solapur"
                required
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white text-sm font-semibold transition"
              />
            </div>
          </div>

          <div className="md:col-span-4 relative">
            <label className="block text-[11px] uppercase font-bold text-slate-600 mb-1">
              {t('alternatives.destLabel')} *
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-orange-600 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Pune"
                required
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white text-sm font-semibold transition"
              />
            </div>
          </div>

          <div className="md:col-span-2 relative">
            <label className="block text-[11px] uppercase font-bold text-slate-600 mb-1">
              {t('alternatives.excludeTripLabel')}
            </label>
            <input
              type="text"
              value={selectedTripId}
              onChange={(e) => setSelectedTripId(e.target.value)}
              placeholder="e.g. DEMO-TRIP-001"
              className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 text-xs font-mono font-semibold"
            />
          </div>

          <div className="md:col-span-2 pt-5">
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-govt-orange py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              <span>{t('alternatives.findBtn')}</span>
            </button>
          </div>
        </form>
      </div>

      <DisclaimerBanner type="dataset" />

      {/* Result list */}
      {loading ? (
        <LoadingSpinner size="large" />
      ) : error && alternatives.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">{t('alternatives.noAlternativesTitle')}</h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
            {error || t('alternatives.noAlternativesDesc')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-600 px-2 font-medium">
            <span>
              {t('alternatives.foundAlternativesPrefix')} <strong className="text-orange-700">{alternatives.length}</strong> {t('alternatives.foundAlternativesMid')}{' '}
              <strong className="text-slate-900">{source} ⇄ {destination}</strong> {t('alternatives.corridorSuffix')}
            </span>
            {selectedTripId && (
              <span className="font-mono text-slate-700 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {t('alternatives.excludedLabel')} {selectedTripId}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alternatives.map((alt, idx) => {
              const tripId = alt.id || alt.tripId;
              const encodedId = encodeURIComponent(tripId);

              return (
                <div
                  key={`${tripId}-${idx}`}
                  className="bg-white rounded-xl border border-slate-200 p-5 hover:border-orange-400 hover:shadow-md transition group flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded bg-orange-50 border border-orange-200 text-orange-800 font-mono text-xs font-bold">
                        {alt.routeCode || 'MSRTC-CORRIDOR'}
                      </span>
                      <StatusBadge status="scheduled" />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">{t('alternatives.departureTimeLabel')}</p>
                        <p className="text-xl font-black text-slate-900 font-mono flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-orange-600" />
                          {alt.departureTime || 'Scheduled'}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-[10px] uppercase font-bold text-slate-400">{t('alternatives.tripIdentifierLabel')}</p>
                        <p className="text-xs font-mono text-slate-700 font-bold">{tripId}</p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600">
                      Corridor: <strong className="text-slate-800">{alt.source}</strong> to <strong className="text-slate-800">{alt.destination}</strong>
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <Link
                      to={`/tracking/${encodedId}`}
                      className="flex items-center gap-1.5 text-xs text-emerald-700 hover:text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200"
                    >
                      <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                      <span>{t('common.liveTrack')}</span>
                    </Link>

                    <Link
                      to={`/buses/${encodedId}`}
                      className="btn-secondary px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1"
                    >
                      <span>{t('alternatives.viewRouteStopsBtn')}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AlternativesPage;
