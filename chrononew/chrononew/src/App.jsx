import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";
import { Route, Routes, Navigate } from "react-router-dom";

import PageNotFound from "./lib/PageNotFound";
import { AuthProvider, useAuth } from "@/lib/AuthContext";
import UserNotRegisteredError from "@/components/UserNotRegisteredError";
import ScrollToTop from "./components/ScrollToTop";
import ProtectedRoute from "@/components/ProtectedRoute";

// Auth pages
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";

// App layout
import AppLayout from "@/components/layout/AppLayout";

// App pages
import Dashboard from "@/pages/Dashboard";
import HealthProfile from "@/pages/HealthProfile";
import DiseasePrediction from "@/pages/DiseasePrediction";
import DigitalTwin from "@/pages/DigitalTwin";
import AIPredictions from "@/pages/AIPredictions";
import HealthScore from "@/pages/HealthScore";
import Forecasting from "@/pages/Forecasting";
import AIAssistant from "@/pages/AIAssistant";
import Reports from "@/pages/Reports";
import Analytics from "@/pages/Analytics";
import Admin from "@/pages/Admin";

// Wellness modules
import SleepTracker from "@/pages/SleepTracker";
import WaterTracker from "@/pages/WaterTracker";
import MentalWellness from "@/pages/MentalWellness";
import Medications from "@/pages/Medications";
import FamilyHistory from "@/pages/FamilyHistory";
import DietPlanner from "@/pages/DietPlanner";
import ExercisePlanner from "@/pages/ExercisePlanner";
import HealthSimulator from "@/pages/HealthSimulator";
import Trends from "@/pages/Trends";
import Timeline from "@/pages/Timeline";
import Achievements from "@/pages/Achievements";
import Notifications from "@/pages/Notifications";


const AuthenticatedApp = () => {
  const {
    isLoadingAuth,
    isLoadingPublicSettings,
    authError,
    navigateToLogin,
  } = useAuth();

  // Loading screen
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background gradient-mesh">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />

          <p className="text-sm text-muted-foreground font-medium">
            Loading ChronoTwin-X...
          </p>
        </div>
      </div>
    );
  }

  // Authentication error
  if (authError) {
    if (authError.type === "user_not_registered") {
      return <UserNotRegisteredError />;
    }

    if (authError.type === "auth_required") {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>

      {/* =========================
          AUTHENTICATION ROUTES
      ========================== */}

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      <Route
        path="/reset-password"
        element={<ResetPassword />}
      />


      {/* =========================
          PROTECTED ROUTES
      ========================== */}

      <Route
        element={
          <ProtectedRoute
            unauthenticatedElement={
              <Navigate to="/login" replace />
            }
          />
        }
      >

        {/* App Layout */}
        <Route element={<AppLayout />}>

          {/* Dashboard */}
          <Route
            path="/"
            element={<Navigate to="/dashboard" replace />}
          />

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          {/* Health Profile */}
          <Route
            path="/profile"
            element={<HealthProfile />}
          />

          {/* Disease Prediction */}
          <Route
            path="/disease-prediction"
            element={<DiseasePrediction />}
          />

          {/* Digital Twin */}
          <Route
            path="/digital-twin"
            element={<DigitalTwin />}
          />

          {/* AI Predictions */}
          <Route
            path="/predictions"
            element={<AIPredictions />}
          />

          {/* Health Score */}
          <Route
            path="/health-score"
            element={<HealthScore />}
          />

          {/* Forecasting */}
          <Route
            path="/forecasting"
            element={<Forecasting />}
          />

          {/* AI Assistant */}
          <Route
            path="/assistant"
            element={<AIAssistant />}
          />

          {/* Reports */}
          <Route
            path="/reports"
            element={<Reports />}
          />

          {/* Analytics */}
          <Route
            path="/analytics"
            element={<Analytics />}
          />

          {/* Admin */}
          <Route
            path="/admin"
            element={<Admin />}
          />

          {/* Wellness */}
          <Route
            path="/sleep"
            element={<SleepTracker />}
          />

          <Route
            path="/water"
            element={<WaterTracker />}
          />

          <Route
            path="/wellness"
            element={<MentalWellness />}
          />

          <Route
            path="/medications"
            element={<Medications />}
          />

          <Route
            path="/family-history"
            element={<FamilyHistory />}
          />

          <Route
            path="/diet-planner"
            element={<DietPlanner />}
          />

          <Route
            path="/exercise-planner"
            element={<ExercisePlanner />}
          />

          <Route
            path="/simulator"
            element={<HealthSimulator />}
          />

          <Route
            path="/trends"
            element={<Trends />}
          />

          <Route
            path="/timeline"
            element={<Timeline />}
          />

          <Route
            path="/achievements"
            element={<Achievements />}
          />

          <Route
            path="/notifications"
            element={<Notifications />}
          />

        </Route>

      </Route>


      {/* =========================
          404
      ========================== */}

      <Route
        path="*"
        element={<PageNotFound />}
      />

    </Routes>
  );
};


function App() {
  return (
    <AuthProvider>

      <QueryClientProvider client={queryClientInstance}>

        <ScrollToTop />

        <AuthenticatedApp />

        <Toaster />

        <SonnerToaster
          position="top-right"
          richColors
        />

      </QueryClientProvider>

    </AuthProvider>
  );
}


export default App;