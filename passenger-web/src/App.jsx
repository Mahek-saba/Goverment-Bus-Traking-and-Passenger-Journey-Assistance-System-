import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import Dashboard from './pages/Dashboard';
import BusSearch from './pages/BusSearch';
import BusDetails from './pages/BusDetails';
import TimetablePage from './pages/TimetablePage';
import TrackingPage from './pages/TrackingPage';
import EtaPage from './pages/EtaPage';
import AlternativesPage from './pages/AlternativesPage';
import Profile from './pages/Profile';
import NotificationsPage from './pages/NotificationsPage';
import FeedbackPage from './pages/FeedbackPage';
import HelpAboutPage from './pages/HelpAboutPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

export const App = () => {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-800 selection:bg-orange-500/20 selection:text-orange-900">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Default redirects to Dashboard */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />

                {/* Bus & Journey Routes */}
                <Route path="/search" element={<BusSearch />} />
                <Route path="/buses/:id" element={<BusDetails />} />
                <Route path="/timetable" element={<TimetablePage />} />
                <Route path="/tracking" element={<TrackingPage />} />
                <Route path="/tracking/:id" element={<TrackingPage />} />
                <Route path="/eta/:id" element={<EtaPage />} />
                <Route path="/alternatives" element={<AlternativesPage />} />

                {/* Information & Feedback */}
                <Route path="/feedback" element={<FeedbackPage />} />
                <Route path="/help" element={<HelpAboutPage />} />

                {/* Authentication */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Protected Passenger Account Routes */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <ProtectedRoute>
                      <NotificationsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
};

export default App;
