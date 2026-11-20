import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bus,
  Search,
  Radio,
  Clock,
  Shuffle,
  ArrowRight,
  ArrowRightLeft,
  MapPin,
  Calendar,
  AlertTriangle,
  TrendingUp,
  Shield,
  CheckCircle,
  Bell,
  ArrowUpRight,
  Compass,
  Phone,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Info,
  Award,
  Zap,
  Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { passengerApi } from '../services/api';
import DisclaimerBanner from '../components/common/DisclaimerBanner';

export const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [source, setSource] = useState('Solapur');
  const [destination, setDestination] = useState('Pune');
  const [journeyDate, setJourneyDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [busType, setBusType] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Carousel slide definitions
  const slides = [
    {
      id: 1,
      badge: 'Shivneri AC • Premium Intercity',
      titleKey: 'dashboard.bannerSlide1Title',
      descKey: 'dashboard.bannerSlide1Desc',
      themeBg: 'from-[#7f1d1d] via-[#991b1b] to-[#c2410c]',
      fleetType: 'Volvo B11R Multi-Axle AC',
      routeTag: 'Pune ⇄ Mumbai ⇄ Solapur Expressway',
      tagColor: 'bg-amber-400 text-slate-900',
      icon: Bus,
    },
    {
      id: 2,
      badge: 'Lal Pari / Parivartan • Lifeline',
      titleKey: 'dashboard.bannerSlide2Title',
      descKey: 'dashboard.bannerSlide2Desc',
      themeBg: 'from-[#991b1b] via-[#b91c1c] to-[#ea580c]',
      fleetType: 'Ordinary Express (BS-VI)',
      routeTag: 'Connecting 36 Districts & 43,335+ Stops',
      tagColor: 'bg-white text-red-900',
      icon: Award,
    },
    {
      id: 3,
      badge: 'Shivai E-Bus • 100% Electric Green',
      titleKey: 'dashboard.bannerSlide3Title',
      descKey: 'dashboard.bannerSlide3Desc',
      themeBg: 'from-[#14532d] via-[#166534] to-[#15803d]',
      fleetType: 'Zero-Emission High-Speed Electric',
      routeTag: 'Eco-Friendly State Highway Corridors',
      tagColor: 'bg-emerald-300 text-emerald-950',
      icon: Zap,
    },
    {
      id: 4,
      badge: 'Hirkani • Semi-Luxury Express',
      titleKey: 'dashboard.bannerSlide4Title',
      descKey: 'dashboard.bannerSlide4Desc',
      themeBg: 'from-[#0f172a] via-[#1e293b] to-[#881337]',
      fleetType: '2x2 Pushback Semi-Luxury Coach',
      routeTag: 'Swift Commercial & Pilgrimage Links',
      tagColor: 'bg-amber-300 text-slate-950',
      icon: Compass,
    },
  ];

  // Auto-advance banner carousel every 6 seconds
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused, slides.length]);

  useEffect(() => {
    const fetchRecentNotifications = async () => {
      if (isAuthenticated) {
        try {
          const res = await passengerApi.getNotifications();
          if (res.success && res.data) {
            setNotifications(res.data.slice(0, 3));
          }
        } catch (err) {
          // Non-blocking
        }
      }
    };

    fetchRecentNotifications();
  }, [isAuthenticated]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (source && destination) {
      navigate(
        `/search?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}&date=${encodeURIComponent(journeyDate)}&type=${encodeURIComponent(busType)}`
      );
    }
  };

  const handleSwap = () => {
    const temp = source;
    setSource(destination);
    setDestination(temp);
  };

  const handleQuickRoute = (s, d) => {
    setSource(s);
    setDestination(d);
    navigate(`/search?source=${encodeURIComponent(s)}&destination=${encodeURIComponent(d)}`);
  };

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Official Announcements & Ticker Bar */}
      <div className="bg-amber-100/90 border-y border-amber-300 text-amber-950 text-xs py-2 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider bg-[#ea580c] text-white px-2.5 py-0.5 rounded shrink-0 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            <span>{t('dashboard.announcementsTitle')}</span>
          </div>
          <div className="overflow-hidden whitespace-nowrap text-xs font-semibold text-slate-800 flex-1">
            <p className="inline-block animate-marquee sm:animate-none truncate">
              {t('dashboard.specialNotice')}
            </p>
          </div>
          <Link
            to="/notifications"
            className="hidden sm:inline-block text-orange-700 font-bold hover:underline shrink-0 text-[11px]"
          >
            {t('dashboard.viewAll')} →
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* 2. Main Hero Section (2-Column MSRTC Portal Layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Column: Large Bus Banner Slider (~65% width) */}
          <div
            className="lg:col-span-8 flex flex-col justify-between rounded-xl overflow-hidden shadow-md relative min-h-[380px] sm:min-h-[440px] text-white"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Active Slide Background & Artistic Gradient */}
            <div
              className={`absolute inset-0 bg-gradient-to-r ${slides[currentSlide].themeBg} transition-all duration-700 ease-in-out`}
            />

            {/* Pattern Overlay */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

            {/* Decorative Bus Silhouette / Vector Watermark */}
            <div className="absolute right-4 bottom-4 opacity-15 pointer-events-none">
              <Bus className="w-64 h-64 sm:w-80 sm:h-80 text-white" />
            </div>

            {/* Top Slide Header */}
            <div className="relative z-10 p-6 sm:p-8 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-sm ${slides[currentSlide].tagColor}`}
                >
                  {slides[currentSlide].badge}
                </span>
                <span className="text-xs text-orange-100 font-mono hidden sm:inline">
                  Slide {currentSlide + 1} of {slides.length}
                </span>
              </div>

              <div className="bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full text-[11px] font-semibold text-amber-300 border border-white/20">
                {slides[currentSlide].fleetType}
              </div>
            </div>

            {/* Slide Body Content */}
            <div className="relative z-10 px-6 sm:px-8 pb-4 max-w-2xl">
              <p className="text-xs sm:text-sm font-bold text-amber-300 uppercase tracking-widest mb-1">
                {slides[currentSlide].routeTag}
              </p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight drop-shadow-sm">
                {t(slides[currentSlide].titleKey)}
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-100 leading-relaxed font-medium line-clamp-3">
                {t(slides[currentSlide].descKey)}
              </p>

              {/* Action Buttons */}
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Link
                  to="/timetable"
                  className="px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition flex items-center gap-1.5"
                >
                  <Clock className="w-4 h-4" />
                  <span>{t('footer.corridorTimetables')}</span>
                </Link>
                <Link
                  to="/tracking"
                  className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white font-bold text-xs border border-white/30 backdrop-blur-sm transition flex items-center gap-1.5"
                >
                  <Radio className="w-4 h-4 text-emerald-300 animate-pulse" />
                  <span>{t('nav.liveTracking')}</span>
                </Link>
              </div>
            </div>

            {/* Slide Controls & Dots */}
            <div className="relative z-10 px-6 sm:px-8 py-4 bg-black/25 backdrop-blur-xs flex items-center justify-between border-t border-white/10">
              <div className="flex items-center gap-2">
                {slides.map((s, idx) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      currentSlide === idx ? 'w-8 bg-amber-400' : 'w-2.5 bg-white/40 hover:bg-white/70'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={prevSlide}
                  className="p-1.5 rounded-full bg-white/20 hover:bg-white/40 text-white transition"
                  title="Previous Slide"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  className="p-1.5 rounded-full bg-white/20 hover:bg-white/40 text-white transition"
                  title="Next Slide"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Official MSRTC Booking & Search Card (~35% width) */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-300 shadow-md flex flex-col overflow-hidden">
            {/* Card Header (Deep Maroon with Gold Trim) */}
            <div className="bg-[#7f1d1d] text-white p-4 border-b-2 border-amber-400 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bus className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-extrabold tracking-wide uppercase">
                  {t('dashboard.searchCardHeader')}
                </h3>
              </div>
              <span className="text-[10px] bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded">
                MSRTC
              </span>
            </div>

            {/* Booking Form Body */}
            <form onSubmit={handleSearch} className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5">
              {/* Origin / Source Input */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  {t('common.from')} *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-orange-600 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    placeholder={t('dashboard.searchPlaceholderFrom')}
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-xs sm:text-sm font-semibold focus:outline-none focus:border-orange-500 focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Swap Button */}
              <div className="flex justify-center -my-1">
                <button
                  type="button"
                  onClick={handleSwap}
                  className="p-1.5 rounded-full bg-slate-100 hover:bg-orange-100 text-slate-700 hover:text-orange-700 border border-slate-300 transition shadow-2xs"
                  title={t('common.swap')}
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Destination Input */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  {t('common.to')} *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-orange-600 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder={t('dashboard.searchPlaceholderTo')}
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-xs sm:text-sm font-semibold focus:outline-none focus:border-orange-500 focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Journey Date */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  {t('dashboard.journeyDate')}
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    value={journeyDate}
                    onChange={(e) => setJourneyDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-xs sm:text-sm font-semibold focus:outline-none focus:border-orange-500 focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Fleet Type Selector */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  {t('dashboard.busType')}
                </label>
                <select
                  value={busType}
                  onChange={(e) => setBusType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-xs sm:text-sm font-semibold focus:outline-none focus:border-orange-500 focus:bg-white transition"
                >
                  <option value="all">{t('dashboard.allBusTypes')}</option>
                  <option value="ordinary">{t('dashboard.ordinaryExpressOption')}</option>
                  <option value="shivneri">{t('dashboard.shivneriAcOption')}</option>
                  <option value="semiLuxury">{t('dashboard.semiLuxuryOption')}</option>
                  <option value="electric">{t('dashboard.shivaiElectricOption')}</option>
                </select>
              </div>

              {/* Primary Search CTA Button */}
              <button
                type="submit"
                className="w-full btn-govt-orange py-2.5 rounded-lg text-sm font-extrabold flex items-center justify-center gap-2 shadow-md transition"
              >
                <Search className="w-4 h-4" />
                <span>{t('common.search')}</span>
              </button>

              {/* Popular Corridor Quick Links */}
              <div className="pt-2 border-t border-slate-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  {t('dashboard.popularCorridors')}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { s: 'Solapur', d: 'Pune' },
                    { s: 'Mumbai', d: 'Nashik' },
                    { s: 'Pune', d: 'Kolhapur' },
                  ].map((pair, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleQuickRoute(pair.s, pair.d)}
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-orange-50 text-slate-700 hover:text-orange-700 border border-slate-200 text-[11px] font-semibold transition"
                    >
                      {pair.s} ⇄ {pair.d}
                    </button>
                  ))}
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* 3. Quick Service Cards (5 Cards matching Portal Specification) */}
        <div>
          <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
            <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-orange-600" />
              <span>{t('dashboard.quickServicesTitle')}</span>
            </h3>
            <span className="text-xs text-slate-500 hidden sm:inline">
              Citizen Transit Assistance
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* 1. Live Tracking */}
            <Link
              to="/tracking"
              className="bg-white p-4 rounded-xl border border-slate-200 hover:border-orange-500 hover:shadow-md transition group space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center mb-2 group-hover:scale-105 transition">
                  <Radio className="w-5 h-5 animate-pulse" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-orange-700 transition">
                  {t('dashboard.trackingCardTitle')}
                </h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {t('dashboard.trackingCardDesc')}
                </p>
              </div>
              <span className="text-xs font-bold text-orange-600 flex items-center gap-1 pt-2">
                <span>{t('dashboard.trackingCardAction')}</span>
                <span>→</span>
              </span>
            </Link>

            {/* 2. Timetable Schedules */}
            <Link
              to="/timetable"
              className="bg-white p-4 rounded-xl border border-slate-200 hover:border-orange-500 hover:shadow-md transition group space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-red-100 text-[#7f1d1d] flex items-center justify-center mb-2 group-hover:scale-105 transition">
                  <Clock className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#7f1d1d] transition">
                  {t('dashboard.timetableCardTitle')}
                </h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {t('dashboard.timetableCardDesc')}
                </p>
              </div>
              <span className="text-xs font-bold text-orange-600 flex items-center gap-1 pt-2">
                <span>{t('dashboard.timetableCardAction')}</span>
                <span>→</span>
              </span>
            </Link>

            {/* 3. Smart Alternatives */}
            <Link
              to="/alternatives"
              className="bg-white p-4 rounded-xl border border-slate-200 hover:border-orange-500 hover:shadow-md transition group space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2 group-hover:scale-105 transition">
                  <Shuffle className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition">
                  {t('dashboard.altCardTitle')}
                </h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {t('dashboard.altCardDesc')}
                </p>
              </div>
              <span className="text-xs font-bold text-orange-600 flex items-center gap-1 pt-2">
                <span>{t('dashboard.altCardAction')}</span>
                <span>→</span>
              </span>
            </Link>

            {/* 4. Bus Search */}
            <Link
              to="/search"
              className="bg-white p-4 rounded-xl border border-slate-200 hover:border-orange-500 hover:shadow-md transition group space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-2 group-hover:scale-105 transition">
                  <Search className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition">
                  {t('dashboard.searchCardTitle')}
                </h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {t('dashboard.searchCardDesc')}
                </p>
              </div>
              <span className="text-xs font-bold text-orange-600 flex items-center gap-1 pt-2">
                <span>{t('dashboard.searchCardAction')}</span>
                <span>→</span>
              </span>
            </Link>

            {/* 5. Feedback & Ratings */}
            <Link
              to="/feedback"
              className="bg-white p-4 rounded-xl border border-slate-200 hover:border-orange-500 hover:shadow-md transition group space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center mb-2 group-hover:scale-105 transition">
                  <Users className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-amber-800 transition">
                  {t('nav.feedback')}
                </h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {t('feedback.pageSubtitle')}
                </p>
              </div>
              <span className="text-xs font-bold text-orange-600 flex items-center gap-1 pt-2">
                <span>{t('footer.submitFeedback')}</span>
                <span>→</span>
              </span>
            </Link>
          </div>
        </div>

        {/* 4. Live Telemetry Spotlight Banner */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
              <span>{t('dashboard.spotlightTitle')}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900">
              {t('dashboard.spotlightSubtitle')}
            </h3>
            <p className="text-xs text-slate-500 max-w-xl">
              Active simulation: Bus <strong className="text-slate-800">DEMO-SOL-001</strong> progressing along NH-65 highway corridor with real-time waypoint progression.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-lg text-center">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Current Speed</span>
              <span className="text-base font-black text-slate-900 font-mono">52 km/h</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-lg text-center">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Current Position</span>
              <span className="text-base font-black text-orange-700">Near Tembhurni</span>
            </div>
            <Link
              to="/tracking/DEMO-TRIP-002"
              className="btn-govt-orange px-4 py-2.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 shadow-md"
            >
              <Radio className="w-4 h-4 text-white" />
              <span>{t('dashboard.fullTrackerBtn')}</span>
            </Link>
          </div>
        </div>

        {/* 5. Government Announcements, Passenger Concessions & Emergency Helplines (3-Column Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: Latest Circulars & Notices */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-2 flex items-center gap-2">
              <Bell className="w-4 h-4 text-orange-600" />
              <span>{t('dashboard.announcementsAndNotices')}</span>
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded bg-slate-50 border-l-3 border-[#ea580c] space-y-1">
                <span className="text-[10px] text-orange-700 font-bold uppercase">Corridor Notice</span>
                <p className="font-semibold text-slate-800">
                  Daily departures active on Solapur ⇄ Pune highway with 74+ scheduled timetable services.
                </p>
              </div>
              <div className="p-2.5 rounded bg-slate-50 border-l-3 border-[#7f1d1d] space-y-1">
                <span className="text-[10px] text-[#7f1d1d] font-bold uppercase">Night Express</span>
                <p className="font-semibold text-slate-800">
                  Late night semi-luxury bus operations connecting district transit centers.
                </p>
              </div>
              <div className="p-2.5 rounded bg-slate-50 border-l-3 border-emerald-600 space-y-1">
                <span className="text-[10px] text-emerald-700 font-bold uppercase">GTFS Verification</span>
                <p className="font-semibold text-slate-800">
                  All route stops verified against official Maharashtra State General Transit Feed Specifications.
                </p>
              </div>
            </div>
          </div>

          {/* Column 2: Passenger Concession Schemes */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-2 flex items-center gap-2">
              <Award className="w-4 h-4 text-[#7f1d1d]" />
              <span>{t('dashboard.passengerSchemes')}</span>
            </h4>
            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="flex items-start gap-2 p-2 rounded bg-orange-50/60 border border-orange-200">
                <ShieldCheck className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">{t('dashboard.mahilaSamman')}</p>
                  <p className="text-[11px] text-slate-500">Applicable on all ordinary and semi-luxury state buses.</p>
                </div>
              </div>

              <div className="flex items-start gap-2 p-2 rounded bg-amber-50/60 border border-amber-200">
                <CheckCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">{t('dashboard.seniorCitizenFree')}</p>
                  <p className="text-[11px] text-slate-500">Free travel with Aadhaar verification across Maharashtra.</p>
                </div>
              </div>

              <div className="flex items-start gap-2 p-2 rounded bg-emerald-50/60 border border-emerald-200">
                <Users className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">{t('dashboard.studentPasses')}</p>
                  <p className="text-[11px] text-slate-500">Monthly educational concession for school & college students.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Emergency & Safety Helplines */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-2 flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-700" />
              <span>{t('dashboard.emergencyHelplinesTitle')}</span>
            </h4>
            <div className="space-y-2 text-xs">
              <div className="p-2 rounded bg-slate-50 flex items-center justify-between border border-slate-200">
                <div>
                  <p className="font-bold text-slate-900">MSRTC Toll-Free</p>
                  <p className="text-[10px] text-slate-500">24x7 State Transit Inquiry</p>
                </div>
                <span className="font-mono font-bold text-orange-700 text-sm">1800-22-1250</span>
              </div>

              <div className="p-2 rounded bg-slate-50 flex items-center justify-between border border-slate-200">
                <div>
                  <p className="font-bold text-slate-900">Central Control Room</p>
                  <p className="text-[10px] text-slate-500">Mumbai Central HQ</p>
                </div>
                <span className="font-mono font-bold text-[#7f1d1d] text-sm">022-23077395</span>
              </div>

              <div className="p-2 rounded bg-slate-50 flex items-center justify-between border border-slate-200">
                <div>
                  <p className="font-bold text-slate-900">Women Helpline</p>
                  <p className="text-[10px] text-slate-500">Safety & Security Support</p>
                </div>
                <span className="font-mono font-bold text-rose-700 text-sm">1091</span>
              </div>

              <div className="p-2 rounded bg-slate-50 flex items-center justify-between border border-slate-200">
                <div>
                  <p className="font-bold text-slate-900">National Emergency</p>
                  <p className="text-[10px] text-slate-500">Police, Ambulance, Fire</p>
                </div>
                <span className="font-mono font-bold text-emerald-700 text-sm">112</span>
              </div>
            </div>
          </div>
        </div>

        {/* 6. Milestone Statistics Bar (Maharashtra State Network) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs text-center space-y-1">
            <span className="text-xl sm:text-2xl font-black text-orange-700 font-mono">19,768+</span>
            <p className="text-xs font-bold text-slate-800">{t('dashboard.verifiedRoutes')}</p>
            <p className="text-[10px] text-slate-400">{t('dashboard.activeCorridors')}</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs text-center space-y-1">
            <span className="text-xl sm:text-2xl font-black text-[#7f1d1d] font-mono">43,335+</span>
            <p className="text-xs font-bold text-slate-800">{t('dashboard.connectedStops')}</p>
            <p className="text-[10px] text-slate-400">{t('dashboard.acrossDistricts')}</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs text-center space-y-1">
            <span className="text-xl sm:text-2xl font-black text-emerald-700 font-mono">762,005+</span>
            <p className="text-xs font-bold text-slate-800">{t('dashboard.timetableRecords')}</p>
            <p className="text-[10px] text-slate-400">{t('dashboard.indexedSchedules')}</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs text-center space-y-1">
            <span className="text-xl sm:text-2xl font-black text-blue-700 font-mono">36</span>
            <p className="text-xs font-bold text-slate-800">Districts Connected</p>
            <p className="text-[10px] text-slate-400">Maharashtra State Network</p>
          </div>
        </div>

        {/* 7. Academic Integrity Disclaimer */}
        <DisclaimerBanner type="simulated" />
      </div>
    </div>
  );
};

export default Dashboard;
