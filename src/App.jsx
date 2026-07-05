import { useCallback, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Analytics } from '@vercel/analytics/react'
import axios from "axios";
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import LeaderboardPage from './pages/LeaderboardPage'
import ProfilePage from './pages/ProfilePage'
import SpeedGamePage from './pages/SpeedGamePage'
import AllLevelsPage from "./pages/LevelPage";
import HallOfFamePage from "./pages/HallOfFrame";
import MissionsPage from "./pages/MissionPage";
import NotFoundPage from "./pages/NotFoundPage";
import PublicProfilePage from "./pages/PublicProfilePage";
import BackendDownPage from "./pages/BackendDownPage";
import ForgotPasswordEmailPage from "./pages/ForgotPasswordEmailPage";
import ForgotPasswordOtpPage from "./pages/ForgotPasswordOtpPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import AboutUsPage from "./pages/AboutUsPage";
import ContactUsPage from "./pages/ContactUsPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import Footer from "./components/Reuseable/Footer";

import AdminLoginPage from "./pages/Admin/AdminLogin";
import AdminLayout, { DashboardPage, PlaceholderPage } from "./components/Admin/AdminLayout";
import AdminDashboardPage from "./pages/Admin/AdminDashboardPage";
import AdminUsersPage from "./pages/Admin/AdminUserPage";
import AdminListPage from "./pages/Admin/AdminListPage";
import AdminContactPage from "./pages/Admin/AdminContactPage";

function ProtectedRoute({ children }) {
  const location = useLocation();
  const token = localStorage.getItem("accessToken");

  if (!token) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  return children;
}

function AdminProtectedRoute({ children }) {
  const token = localStorage.getItem("adminToken");

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

function App() {
  const [dark, setDark] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });
  const [healthStatus, setHealthStatus] = useState("checking");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const handleToggleDark = () => {
    setDark(prev => {
      const next = !prev;
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  };

  const checkHealth = useCallback(async () => {
    setHealthStatus("checking");
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/health`, {
        timeout: 5000,
      });
      const isOk = res?.data?.status === "ok";
      setHealthStatus(isOk ? "ok" : "down");
    } catch {
      setHealthStatus("down");
    }
  }, []);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  if (healthStatus !== "ok") {
    return (
      <BackendDownPage
        dark={dark}
        onToggleDark={handleToggleDark}
        status={healthStatus}
        onRetry={checkHealth}
      />
    );
  }

  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col">
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1A1A1B',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: '600',
              borderRadius: '8px',
              padding: '10px 16px',
            },
            success: {
              iconTheme: { primary: '#6AAA64', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#E24B4A', secondary: '#fff' },
            },
          }}
        />
        <Analytics />
        <div className="flex-1">
          <Routes>

            <Route path="/" element={<HomePage dark={dark} onToggleDark={handleToggleDark} />} />
            <Route path="/login" element={<LoginPage dark={dark} onToggleDark={handleToggleDark} />} />
            <Route path="/forgot-password" element={<ForgotPasswordEmailPage dark={dark} onToggleDark={handleToggleDark} />} />
            <Route path="/forgot-password/verify" element={<ForgotPasswordOtpPage dark={dark} onToggleDark={handleToggleDark} />} />
            <Route path="/forgot-password/reset" element={<ResetPasswordPage dark={dark} onToggleDark={handleToggleDark} />} />
            <Route path="/register" element={<RegisterPage dark={dark} onToggleDark={handleToggleDark} />} />
            <Route path="/leaderboard" element={<LeaderboardPage dark={dark} onToggleDark={handleToggleDark} />} />
            <Route path="/profile" element={<ProfilePage dark={dark} onToggleDark={handleToggleDark} />} />
            <Route path="/profile/:username" element={<PublicProfilePage dark={dark} onToggleDark={handleToggleDark} />} />
            <Route
              path="/speed-game"
              element={
                <ProtectedRoute>
                  <SpeedGamePage dark={dark} onToggleDark={handleToggleDark} />
                </ProtectedRoute>
              }
            />
            <Route path="/levels" element={<AllLevelsPage dark={dark} onToggleDark={handleToggleDark} />} />
            <Route path="/hall-of-fame" element={<HallOfFamePage dark={dark} onToggleDark={handleToggleDark} />} />
            <Route path="/missions" element={<MissionsPage dark={dark} onToggleDark={handleToggleDark} />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage dark={dark} onToggleDark={handleToggleDark} />} />
            <Route path="/about-us" element={<AboutUsPage dark={dark} onToggleDark={handleToggleDark} />} />
            <Route path="/contact-us" element={<ContactUsPage dark={dark} onToggleDark={handleToggleDark} />} />
            <Route path="/terms-of-service" element={<TermsOfServicePage dark={dark} onToggleDark={handleToggleDark} />} />

            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route
              path="/admin"
              element={
                <AdminProtectedRoute>
                  <AdminLayout />
                </AdminProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route
                path="users"
                element={<AdminUsersPage />}
              />
              <Route
                path="admin-list"
                element={<AdminListPage />}
              />
              <Route
                path="contact"
                element={<AdminContactPage />}
              />
              <Route
                path="settings"
                element={<PlaceholderPage title="Settings" description="Configure platform-wide preferences and controls." />}
              />
            </Route>

            <Route path="*" element={<NotFoundPage dark={dark} onToggleDark={handleToggleDark} />} />

          </Routes>
        </div>

        <FooterWrapper dark={dark} />

      </div>
    </BrowserRouter>
  )
}

function FooterWrapper({ dark }) {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  if (isAdmin) return null;
  return <Footer dark={dark} />;
}

export default App