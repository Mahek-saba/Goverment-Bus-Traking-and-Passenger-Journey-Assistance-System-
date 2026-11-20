import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Radio,
  Bus,
  MapPin,
  Clock,
  Compass,
  RefreshCw,
  AlertCircle,
  Activity,
  CheckCircle2,
  Navigation,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { busApi } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import DisclaimerBanner from '../components/common/DisclaimerBanner';
import StatusBadge from '../components/common/StatusBadge';

export const TrackingPage = () => {
  const { id } = useParams();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Fallback default trip if no id in URL: DEMO-TRIP-002 (Solapur-Pune)
  const activeTripId = id || 'DEMO-TRIP-002';
  const [tripInput, setTripInput] = useState(activeTripId);
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const fetchTracking = async (tripIdToFetch, isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const res = await busApi.getTracking(tripIdToFetch);
      if (res.success && res.data) {
        setTrackingData(res.data);
        setLastRefreshed(new Date());
      } else {
        setError(res.message || t('tracking.trackingUnavailableDesc'));
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Server error while retrieving GPS tracking.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTracking(activeTripId);
  }, [activeTripId]);

  const handleTripSearch = (e) => {
    e.preventDefault();
    if (tripInput.trim()) {
      navigate(`/tracking/${encodeURIComponent(tripInput.trim())}`);
    }
  };

  const handleSelectSample = (sampleId) => {
    setTripInput(sampleId);
    navigate(`/tracking/${encodeURIComponent(sampleId)}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Title & Search Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-600 animate-pulse" />
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {t('tracking.pageTitle')}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            {t('tracking.pageSubtitle')}
          </p>
        </div>

        {/* Quick Trip ID Search */}
        <form onSubmit={handleTripSearch} className="flex items-center gap-2 max-w-sm w-full">
          <div className="relative flex-1">
            <Radio className="w-4 h-4 text-orange-600 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={tripInput}
              onChange={(e) => setTripInput(e.target.value)}
              placeholder={t('tracking.tripInputPlaceholder')}
              required
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 text-xs font-mono font-bold shadow-2xs"
            />
          </div>
          <button
            type="submit"
            className="btn-govt-orange px-3.5 py-2 rounded-lg text-xs font-bold shrink-0"
          >
            {t('common.track')}
          </button>
        </form>
      </div>

      {/* Preset demo trip chips */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-500 font-bold">{t('tracking.quickLiveTrips')}</span>
        <button
          onClick={() => handleSelectSample('DEMO-TRIP-002')}
          className={`px-3 py-1 rounded-md border text-xs font-semibold transition ${
            activeTripId === 'DEMO-TRIP-002'
              ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-300'
          }`}
        >
          DEMO-TRIP-002 {t('tracking.activeCorridorSuffix')}
        </button>
        <button
          onClick={() => handleSelectSample('DEMO-TRIP-001')}
          className={`px-3 py-1 rounded-md border text-xs font-semibold transition ${
            activeTripId === 'DEMO-TRIP-001'
              ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-300'
          }`}
        >
          DEMO-TRIP-001 {t('tracking.scheduledCorridorSuffix')}
        </button>
        <button
          onClick={() => handleSelectSample('DEMO-TRIP-003')}
          className={`px-3 py-1 rounded-md border text-xs font-semibold transition ${
            activeTripId === 'DEMO-TRIP-003'
              ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-300'
          }`}
        >
          DEMO-TRIP-003 {t('tracking.puneSolapurSuffix')}
        </button>
      </div>

      <DisclaimerBanner type="simulated" />

      {/* Main Tracking Content */}
      {loading ? (
        <LoadingSpinner size="large" />
      ) : error || !trackingData ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">{t('tracking.trackingUnavailableTitle')}</h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
            {error || t('tracking.trackingUnavailableDesc')}
          </p>
          <button
            onClick={() => handleSelectSample('DEMO-TRIP-002')}
            className="btn-govt-orange px-4 py-2 rounded-lg text-xs font-bold"
          >
            {t('tracking.trackActiveDemoBtn')}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Telemetry Status Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded bg-orange-50 text-orange-800 font-mono text-xs font-bold border border-orange-200">
                    Trip: {trackingData.tripId || activeTripId}
                  </span>
                  <StatusBadge status={trackingData.status || 'in-transit'} />
                  <span className="text-xs text-slate-500 font-mono">
                    {t('tracking.refreshedLabel')} {lastRefreshed.toLocaleTimeString()}
                  </span>
                </div>

                <h2 className="text-2xl font-black text-slate-900">
                  {trackingData.originStop || trackingData.source || 'Solapur'} <span className="text-orange-600">⇄</span> {trackingData.terminusStop || trackingData.destination || 'Pune'}
                </h2>

                <p className="text-xs text-slate-600 flex items-center gap-2">
                  <Bus className="w-4 h-4 text-orange-600" />
                  <span>{t('tracking.busRegistrationLabel')} <strong className="text-slate-800 font-mono">{trackingData.busRegistration || 'MH-13-AZ-1001'}</strong></span>
                  <span>•</span>
                  <span>{t('tracking.fleetTypeLabel')} <strong className="text-slate-800">{trackingData.busType || 'Ordinary Express'}</strong></span>
                </p>
              </div>

              {/* Live metrics cards */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-center min-w-[110px]">
                  <p className="text-[10px] uppercase font-bold text-slate-500">{t('tracking.currentSpeedLabel')}</p>
                  <p className="text-xl font-black text-emerald-700 font-mono">
                    {trackingData.currentSpeed || '52'} {t('common.kmh')}
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-center min-w-[130px]">
                  <p className="text-[10px] uppercase font-bold text-slate-500">{t('tracking.latitudeLabel')}</p>
                  <p className="text-sm font-bold text-slate-800 font-mono">
                    {(trackingData.simulatedCoordinates?.latitude || trackingData.currentLocation?.latitude || 18.0645).toFixed(4)}° N
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-center min-w-[130px]">
                  <p className="text-[10px] uppercase font-bold text-slate-500">{t('tracking.longitudeLabel')}</p>
                  <p className="text-sm font-bold text-slate-800 font-mono">
                    {(trackingData.simulatedCoordinates?.longitude || trackingData.currentLocation?.longitude || 75.1837).toFixed(4)}° E
                  </p>
                </div>

                <button
                  onClick={() => fetchTracking(activeTripId, true)}
                  disabled={refreshing}
                  className="p-3 rounded-lg bg-slate-100 hover:bg-orange-50 text-slate-700 hover:text-orange-700 border border-slate-300 transition disabled:opacity-50"
                  title={t('tracking.refreshTitle')}
                >
                  <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin text-orange-600' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Graphical Live Radar & Corridor Visual Map */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-orange-600" />
                  <span>{t('tracking.corridorProgressionTitle')}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t('tracking.corridorProgressionDesc')}
                </p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold animate-pulse">
                {t('tracking.gpsFeedLive')}
              </span>
            </div>

            {/* Visual Route Corridor Card */}
            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 relative">
              {/* Progress Track */}
              <div className="relative pt-6 pb-4">
                <div className="h-3 w-full bg-slate-200 rounded-full relative overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-600 via-orange-500 to-[#7f1d1d] rounded-full"
                    style={{
                      width: `${Math.min(100, Math.max(15, (trackingData.progressPercentage || 65)))}%`,
                    }}
                  />
                </div>

                {/* Animated Bus Icon Marker */}
                <div
                  className="absolute -top-1 -translate-x-1/2 flex flex-col items-center z-10 transition-all duration-500"
                  style={{
                    left: `${Math.min(95, Math.max(10, (trackingData.progressPercentage || 65)))}%`,
                  }}
                >
                  <div className="p-2 rounded-full bg-[#ea580c] text-white font-bold shadow-md border-2 border-white animate-bounce">
                    <Bus className="w-5 h-5" />
                  </div>
                  <span className="mt-1 px-2 py-0.5 rounded bg-white border border-orange-500 text-[10px] font-mono font-black text-orange-800 shadow-xs">
                    {t('tracking.busCurrentMarker')}
                  </span>
                </div>
              </div>

              {/* Waypoint details below bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-4 border-t border-slate-200 text-xs">
                <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{t('tracking.departedStopLabel')}</span>
                  </div>
                  <p className="text-sm font-black text-slate-900">
                    {trackingData.currentStop?.stopName || trackingData.lastPassedStop || trackingData.originStop || trackingData.source || 'Origin Station'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{t('tracking.passedOnSchedule')}</p>
                </div>

                <div className="p-3.5 rounded-lg bg-orange-50/60 border border-orange-200 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-orange-800 font-bold mb-1">
                    <Activity className="w-4 h-4 text-orange-600 animate-spin" />
                    <span>{t('tracking.nextApproachingLabel')}</span>
                  </div>
                  <p className="text-sm font-black text-slate-900">
                    {trackingData.nextStop?.stopName || (typeof trackingData.nextStop === 'string' ? trackingData.nextStop : null) || 'In Transit'}
                  </p>
                  <p className="text-[11px] text-orange-800 mt-0.5 font-semibold">
                    {t('tracking.currentSpeedLabel')}: {trackingData.currentSpeed || 52} {t('common.kmh')} • {t('tracking.trackingActive')}
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-slate-600 font-bold mb-1">
                    <MapPin className="w-4 h-4 text-slate-500" />
                    <span>{t('tracking.finalDestinationLabel')}</span>
                  </div>
                  <p className="text-sm font-black text-slate-900">
                    {trackingData.terminusStop || trackingData.destination || 'Terminus Station'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{t('tracking.destinationTerminus')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Links Footer */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to={`/buses/${encodeURIComponent(activeTripId)}`}
              className="p-4 rounded-xl bg-white border border-slate-200 hover:border-orange-500 shadow-2xs transition flex items-center justify-between text-xs group"
            >
              <div>
                <p className="font-bold text-slate-900 group-hover:text-orange-700 transition">{t('tracking.viewAllStopsTitle')}</p>
                <p className="text-slate-500 mt-0.5">{t('tracking.viewAllStopsDesc')}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-orange-600" />
            </Link>

            <Link
              to={`/eta/${encodeURIComponent(activeTripId)}?destination=${encodeURIComponent(trackingData.destination || 'Pune')}`}
              className="p-4 rounded-xl bg-white border border-slate-200 hover:border-orange-500 shadow-2xs transition flex items-center justify-between text-xs group"
            >
              <div>
                <p className="font-bold text-slate-900 group-hover:text-orange-700 transition">{t('tracking.calcEtaTitle')}</p>
                <p className="text-slate-500 mt-0.5">{t('tracking.calcEtaDesc')}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-orange-600" />
            </Link>

            <Link
              to={`/alternatives?source=${encodeURIComponent(trackingData.source || 'Solapur')}&destination=${encodeURIComponent(trackingData.destination || 'Pune')}&selectedTripId=${encodeURIComponent(activeTripId)}`}
              className="p-4 rounded-xl bg-white border border-slate-200 hover:border-orange-500 shadow-2xs transition flex items-center justify-between text-xs group"
            >
              <div>
                <p className="font-bold text-slate-900 group-hover:text-orange-700 transition">{t('tracking.findAltTitle')}</p>
                <p className="text-slate-500 mt-0.5">{t('tracking.findAltDesc')}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-orange-600" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackingPage;
