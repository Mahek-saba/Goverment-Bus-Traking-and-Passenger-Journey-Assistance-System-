import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  ArrowRightLeft,
  MapPin,
  Clock,
  Bus,
  Radio,
  Shuffle,
  ChevronRight,
  Filter,
  AlertCircle,
  Calendar,
  Compass,
  ArrowUpRight
} from 'lucide-react';
import { busApi } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import DisclaimerBanner from '../components/common/DisclaimerBanner';
import StatusBadge from '../components/common/StatusBadge';

export const BusSearch = () => {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSource = searchParams.get('source') || 'Solapur';
  const initialDestination = searchParams.get('destination') || 'Pune';

  const [source, setSource] = useState(initialSource);
  const [destination, setDestination] = useState(initialDestination);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeFilter, setTimeFilter] = useState('all'); // all, morning, afternoon, night
  const [disclaimer, setDisclaimer] = useState('');

  const executeSearch = async (src, dst) => {
    if (!src || !dst) return;
    setLoading(true);
    setError('');

    try {
      const res = await busApi.searchBuses(src, dst);
      if (res.success) {
        setBuses(res.data || []);
        setDisclaimer(res.disclaimer || '');
        if (res.data && res.data.length === 0) {
          setError(t('search.noBusesDesc'));
        }
      } else {
        setError(res.message || t('search.noBusesDesc'));
        setBuses([]);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Server error while searching buses.'
      );
      setBuses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialSource && initialDestination) {
      executeSearch(initialSource, initialDestination);
    }
  }, [initialSource, initialDestination]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSearchParams({ source, destination });
    executeSearch(source, destination);
  };

  const handleSwap = () => {
    const temp = source;
    setSource(destination);
    setDestination(temp);
    setSearchParams({ source: destination, destination: temp });
    executeSearch(destination, temp);
  };

  // Filter buses by departure time
  const filteredBuses = buses.filter((bus) => {
    if (timeFilter === 'all') return true;
    if (!bus.departureTime) return true;
    const hour = parseInt(bus.departureTime.split(':')[0], 10);
    if (timeFilter === 'morning') return hour >= 4 && hour < 12;
    if (timeFilter === 'afternoon') return hour >= 12 && hour < 18;
    if (timeFilter === 'night') return hour >= 18 || hour < 4;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <Bus className="w-6 h-6 text-orange-600" />
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t('search.pageTitle')}
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          {t('search.pageSubtitle')}
        </p>
      </div>

      {/* Search Bar Panel (Government Portal Card) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Source Input */}
          <div className="md:col-span-5 relative">
            <label className="block text-[11px] uppercase font-bold text-slate-600 mb-1">
              {t('search.departureLabel')} *
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

          {/* Swap Button */}
          <div className="md:col-span-1 flex justify-center py-1 md:py-0">
            <button
              type="button"
              onClick={handleSwap}
              title={t('common.swap')}
              className="p-2.5 rounded-full bg-slate-100 hover:bg-orange-100 text-slate-700 hover:text-orange-700 border border-slate-300 transition"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Destination Input */}
          <div className="md:col-span-4 relative">
            <label className="block text-[11px] uppercase font-bold text-slate-600 mb-1">
              {t('search.arrivalLabel')} *
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

          {/* Search Button */}
          <div className="md:col-span-2 pt-5">
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-govt-orange py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              <span>{t('common.search')}</span>
            </button>
          </div>
        </form>

        {/* Quick Corridor Suggestions */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 font-bold">{t('common.quickRoutes')}</span>
          {[
            ['Solapur', 'Pune'],
            ['Pune', 'Solapur'],
            ['Pune', 'Mumbai'],
            ['Nashik', 'Pune'],
            ['Kolhapur', 'Pune'],
          ].map(([s, d]) => (
            <button
              key={`${s}-${d}`}
              type="button"
              onClick={() => {
                setSource(s);
                setDestination(d);
                setSearchParams({ source: s, destination: d });
                executeSearch(s, d);
              }}
              className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-orange-50 hover:text-orange-700 border border-slate-200 text-slate-700 font-medium transition"
            >
              {s} → {d}
            </button>
          ))}
        </div>
      </div>

      <DisclaimerBanner type="dataset" />

      {/* Filter and Count Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <Bus className="w-5 h-5 text-orange-600" />
          <span className="text-sm font-bold text-slate-900">
            {t('search.availableBuses')} ({filteredBuses.length} {t('search.of')} {buses.length})
          </span>
          <span className="text-xs text-slate-500 font-semibold ml-1">
            • {source} → {destination}
          </span>
        </div>

        {/* Time filters */}
        <div className="flex items-center gap-1.5 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-500 mr-1" />
          {[
            { id: 'all', label: t('common.allTimes') },
            { id: 'morning', label: t('common.morning') },
            { id: 'afternoon', label: t('common.afternoon') },
            { id: 'night', label: t('common.night') },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setTimeFilter(f.id)}
              className={`px-2.5 py-1 rounded-md font-bold transition ${
                timeFilter === f.id
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Section */}
      {loading ? (
        <LoadingSpinner size="large" />
      ) : error && buses.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">{t('search.noBusesTitle')}</h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
            {error || t('search.noBusesDesc')}
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                setSource('Solapur');
                setDestination('Pune');
                setSearchParams({ source: 'Solapur', destination: 'Pune' });
                executeSearch('Solapur', 'Pune');
              }}
              className="btn-govt-orange px-4 py-2 rounded-lg text-xs font-bold"
            >
              {t('search.loadVerifiedCorridor')}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBuses.map((bus, idx) => {
            const tripId = bus.id || bus.tripId;
            const encodedTripId = encodeURIComponent(tripId);

            return (
              <div
                key={`${tripId}-${idx}`}
                className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 hover:border-orange-400 hover:shadow-md transition group"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Timing & Route Info */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded bg-orange-50 border border-orange-200 text-orange-800 font-mono text-xs font-bold">
                        {bus.routeCode || 'MSRTC-CORRIDOR'}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {t('details.tripIdLabel')}: <strong className="font-mono text-slate-800">{tripId}</strong>
                      </span>
                      <StatusBadge status="scheduled" />
                    </div>

                    <div className="flex items-center gap-4 sm:gap-6 pt-1">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">{t('common.departure')}</p>
                        <p className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-1.5 font-mono">
                          <Clock className="w-4 h-4 text-orange-600" />
                          {bus.departureTime || t('search.scheduledDeparture')}
                        </p>
                      </div>

                      <div className="text-slate-400 font-light text-xl">→</div>

                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">{t('search.corridorLabel')}</p>
                        <p className="text-sm sm:text-base font-bold text-slate-800">
                          {bus.source} to {bus.destination}
                        </p>
                      </div>

                      {bus.stopsBetween !== undefined && (
                        <div className="hidden sm:block pl-4 border-l border-slate-200">
                          <p className="text-[10px] text-slate-400 uppercase font-bold">{t('search.stopsLabel')}</p>
                          <p className="text-sm font-bold text-slate-700">
                            {bus.stopsBetween} {t('common.intermediateStops')}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    {/* Live Tracking */}
                    <Link
                      to={`/tracking/${encodedTripId}`}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 hover:bg-emerald-100 text-xs font-bold transition"
                      title={t('common.liveTrack')}
                    >
                      <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                      <span>{t('common.liveTrack')}</span>
                    </Link>

                    {/* ETA */}
                    <Link
                      to={`/eta/${encodedTripId}?destination=${encodeURIComponent(destination)}`}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 border border-sky-300 text-sky-800 hover:bg-sky-100 text-xs font-bold transition"
                      title={t('common.checkEta')}
                    >
                      <Clock className="w-3.5 h-3.5 text-sky-600" />
                      <span>{t('common.eta')}</span>
                    </Link>

                    {/* Alternatives */}
                    <Link
                      to={`/alternatives?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}&selectedTripId=${encodedTripId}`}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 hover:bg-amber-100 text-xs font-bold transition"
                      title={t('common.alternatives')}
                    >
                      <Shuffle className="w-3.5 h-3.5 text-amber-700" />
                      <span>{t('common.nextBuses')}</span>
                    </Link>

                    {/* Full Details */}
                    <Link
                      to={`/buses/${encodedTripId}`}
                      className="btn-govt-orange px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-xs"
                    >
                      <span>{t('search.detailsBtn')}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BusSearch;
