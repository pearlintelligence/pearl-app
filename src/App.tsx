import { Navigate, Route, Routes } from "react-router-dom";
import { AdminRoute } from "./components/AdminRoute";
import { AppLayout } from "./components/AppLayout";
import ErrorBoundary from "./components/ErrorBoundary";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PublicLayout } from "./components/PublicLayout";
import { PublicOnlyRoute } from "./components/PublicOnlyRoute";
import { Toaster } from "./components/ui/sonner";
import { ThemeProvider } from "./contexts/ThemeContext";
import {
  DashboardPage,
  LandingPage,
  LoginPage,
  OnboardingPage,
  OraclePage,
  ReadingPage,
  SettingsPage,
  SignupPage,
} from "./pages";
import {
  AdminDashboardPage,
  AnalyticsPage,
  BillingPage,
  FeatureFlagsPage,
  PlatformToolsPage,
  UserManagementPage,
} from "./pages/admin";

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <Toaster />
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route element={<PublicOnlyRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
            </Route>
          </Route>

          {/* Onboarding — protected but no sidebar */}
          <Route path="/onboarding" element={<OnboardingPage />} />

          {/* Main app routes — protected with sidebar */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/oracle" element={<OraclePage />} />
              <Route path="/reading" element={<ReadingPage />} />
              <Route path="/settings" element={<SettingsPage />} />

              {/* Admin routes — additional admin check */}
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/admin/flags" element={<FeatureFlagsPage />} />
                <Route path="/admin/users" element={<UserManagementPage />} />
                <Route path="/admin/analytics" element={<AnalyticsPage />} />
                <Route path="/admin/billing" element={<BillingPage />} />
                <Route path="/admin/tools" element={<PlatformToolsPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
