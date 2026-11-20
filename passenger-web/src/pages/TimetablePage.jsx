import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Clock,
  MapPin,
  Search,
  Bus,
  ArrowRightLeft,
  AlertCircle,
  Radio,
  ChevronRight,
  Filter
} from 'lucide-react';
import { busApi } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import DisclaimerBanner from '../components/common/DisclaimerBanner';
import { useLanguage } from '../context/LanguageContext';

export const TimetablePage = () => {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSource = searchParams.get('source') || 'Solapur';
  const initialDestination = searchParams.get('destination') || 'Pune';

  const [source, setSource] = useState(initialSource);
  const [destination, setDestination] = useState(initialDestination);
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');

  const fetchTimetable = async (src, dst) => {
    if (!src || !dst) return;
    setLoading(true);
    setError('');

    try {
      const res = await busApi.getTimetable(src, dst);
      if (res.success) {
        setTimetable(res.data || []);
        if (res.data && res.data.length === 0) {
          setError('No timetable schedules found for this corridor.');
        }
      } else {
        setError(res.message || 'Timetable lookup failed.');
        setTimetable([]);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Server error while fetching timetable.'
      );
      setTimetable([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialSource && initialDestination) {
      fetchTimetable(initialSource, initialDestination);
    }
  }, [initialSource, initialDestination]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSearchParams({ source, destination });
    fetchTimetable(source, destination);
  };

  const handleSwap = () => {
    const temp = source;
    setSource(destination);
    setDestination(temp);
    setSearchParams({ source: destination, destination: temp });
    fetchTimetable(destination, temp);
  };

  const filteredTimetable = timetable.filter((item) => {
    if (timeFilter === 'all') return true;
    if (!item.departureTime) return true;
    const hour = parseInt(item.departureTime.split(':')[0], 10);
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
          <Clock className="w-6 h-6 text-orange-600" />
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t('timetable.pageTitle')}
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          {t('timetable.pageSubtitle')}
        </p>
      </div>

      {/* Query Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-5 relative">
            <label className="block text-[11px] uppercase font-bold text-slate-600 mb-1">
              {t('timetable.originLabel')} *
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

          <div className="md:col-span-1 flex justify-center py-1 md:py-0">
            <button
              type="button"
              onClick={handleSwap}
              className="p-2.5 rounded-full bg-slate-100 hover:bg-orange-100 text-slate-700 hover:text-orange-700 border border-slate-300 transition"
              title={t('common.swap')}
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          <div className="md:col-span-4 relative">
            <label className="block text-[11px] uppercase font-bold text-slate-600 mb-1">
              {t('timetable.destLabel')} *
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

          <div className="md:col-span-2 pt-5">
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-govt-orange py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              <span>{t('timetable.lookupBtn')}</span>
            </button>
          </div>
        </form>
      </div>

      <DisclaimerBanner type="dataset" />

      {/* Filter and Count Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
        <span className="text-sm font-bold text-slate-900">
          {t('timetable.scheduledDepartures')} ({filteredTimetable.length} {t('timetable.of')} {timetable.length})
        </span>

        <div className="flex items-center gap-1.5 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-500 mr-1" />
          {[
            { id: 'all', label: t('timetable.allDeparturesTab') },
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

      {/* Timetable Table */}
      {loading ? (
        <LoadingSpinner text={t('common.loading')} size="large" />
      ) : error && timetable.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">{t('timetable.noTimetableTitle')}</h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
            {error || t('timetable.noTimetableDesc')}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#7f1d1d] text-white uppercase text-[11px] tracking-wider font-bold">
                <tr>
                  <th className="py-3 px-4">{t('timetable.tableHeaderDepTime')}</th>
                  <th className="py-3 px-4">{t('timetable.tableHeaderRouteCode')}</th>
                  <th className="py-3 px-4">{t('timetable.tableHeaderTripId')}</th>
                  <th className="py-3 px-4">{t('timetable.tableHeaderCorridor')}</th>
                  <th className="py-3 px-4 text-right">{t('timetable.tableHeaderActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredTimetable.map((item, idx) => {
                  const tripId = item.id || item.tripId;
                  const encodedId = encodeURIComponent(tripId);

                  return (
                    <tr key={`${tripId}-${idx}`} className="hover:bg-orange-50/60 transition">
                      <td className="py-3 px-4 font-mono font-black text-orange-700">
                        {item.departureTime || t('common.scheduled')}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-800 text-xs">
                          {item.routeCode || 'MSRTC'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 text-xs">
                        {tripId}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {item.source} → {item.destination}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/tracking/${encodedId}`}
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300"
                            title={t('search.simulateTracking')}
                          >
                            <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
                          </Link>
                          <Link
                            to={`/buses/${encodedId}`}
                            className="btn-secondary px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1"
                          >
                            <span>{t('timetable.stopsBtn')}</span>
                            <ChevronRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimetablePage;
