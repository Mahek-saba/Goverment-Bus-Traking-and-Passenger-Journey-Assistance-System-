import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  MessageSquare,
  Star,
  Bus,
  CheckCircle2,
  AlertCircle,
  Send,
  User,
  Clock,
  Sparkles
} from 'lucide-react';
import { passengerApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useLanguage } from '../context/LanguageContext';

export const FeedbackPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [busNumber, setBusNumber] = useState(searchParams.get('busNumber') || '');
  const [tripId, setTripId] = useState(searchParams.get('tripId') || '');
  const [message, setMessage] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbacksLoading, setFeedbacksLoading] = useState(true);

  const fetchReviews = async () => {
    setFeedbacksLoading(true);
    try {
      const res = await passengerApi.getFeedbackList('all');
      if (res.success && res.data) {
        setFeedbacks(res.data);
      }
    } catch (err) {
      // Quiet fail
    } finally {
      setFeedbacksLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!rating || rating < 1 || rating > 5) {
      setErrorMsg('Please select a star rating between 1 and 5.');
      return;
    }

    if (!message.trim()) {
      setErrorMsg('Please write a short review or journey feedback.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await passengerApi.submitFeedback({
        rating,
        message,
        busNumber: busNumber.trim() || undefined,
        tripId: tripId.trim() || undefined,
      });

      if (res.success) {
        setSuccessMsg(t('feedback.feedbackSavedSuccess'));
        setMessage('');
        fetchReviews();
      } else {
        setErrorMsg(res.message || 'Failed to submit feedback.');
      }
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || 'Server error while submitting feedback.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center shadow-xs">
            <MessageSquare className="w-5 h-5 text-[#ea580c]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {t('feedback.pageTitle')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              {t('feedback.pageSubtitle')}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Submit Review (5 cols) */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-7 sticky top-24">
            <div className="border-b border-slate-100 pb-3 mb-5">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#ea580c]" />
                <span>{t('feedback.writeReviewTitle')}</span>
              </h3>
            </div>

            {successMsg && (
              <div className="mb-4 flex items-center gap-2 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="mb-4 flex items-center gap-2 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Star Rating */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  {t('feedback.overallRatingLabel')}
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 hover:scale-125 transition transform focus:outline-none"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          (hoverRating || rating) >= star
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-xs font-black text-amber-800 font-mono bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200">
                    {rating} {t('feedback.ofFiveStars')}
                  </span>
                </div>
              </div>

              {/* Optional Bus Registration */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {t('feedback.busRegOptional')}
                </label>
                <input
                  type="text"
                  value={busNumber}
                  onChange={(e) => setBusNumber(e.target.value)}
                  placeholder="e.g. DEMO-SOL-001 or MH-13-AZ-1001"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs font-mono uppercase placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#ea580c] focus:ring-1 focus:ring-[#ea580c] transition"
                />
              </div>

              {/* Optional Trip ID */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {t('feedback.tripIdOptional')}
                </label>
                <input
                  type="text"
                  value={tripId}
                  onChange={(e) => setTripId(e.target.value)}
                  placeholder="e.g. DEMO-TRIP-001 or M8902\\1"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs font-mono placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#ea580c] focus:ring-1 focus:ring-[#ea580c] transition"
                />
              </div>

              {/* Review Message */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {t('feedback.feedbackMessageLabel')}
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t('feedback.feedbackPlaceholder')}
                  required
                  className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#ea580c] focus:ring-1 focus:ring-[#ea580c] resize-none transition"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-govt-orange py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? t('feedback.submittingBtn') : t('feedback.submitBtn')}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Col: Recent Community Reviews (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              <span>{t('feedback.verifiedReviewsTitle')} ({feedbacks.length})</span>
            </h3>
            <span className="text-xs font-medium text-slate-500">{t('feedback.recordedInMongo')}</span>
          </div>

          {feedbacksLoading ? (
            <LoadingSpinner text={t('common.loading')} size="default" />
          ) : feedbacks.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500 shadow-sm">
              {t('feedback.noReviewsYet')}
            </div>
          ) : (
            <div className="space-y-3">
              {feedbacks.map((fb) => (
                <div key={fb._id} className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-2 hover:border-orange-300 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-orange-100 text-[#ea580c] flex items-center justify-center text-xs font-black uppercase border border-orange-200 shadow-xs">
                        {fb.user?.name ? fb.user.name.charAt(0) : 'P'}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">
                          {fb.user?.name || t('feedback.verifiedPassengerFallback')}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {fb.createdAt ? new Date(fb.createdAt).toLocaleDateString() : t('feedback.recentFallback')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            fb.rating >= s
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed pl-10">
                    "{fb.message}"
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pl-10 pt-2 border-t border-slate-100">
                    <span className="font-mono font-semibold text-[#ea580c]">
                      {fb.bus?.busNumber ? `Bus: ${fb.bus.busNumber}` : t('feedback.passengerFleetFallback')}
                    </span>
                    <span className="text-emerald-700 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Verified
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;