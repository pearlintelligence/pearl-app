import { useConvexAuth, useQuery } from "convex/react";
import { Navigate, Outlet } from "react-router-dom";
import { api } from "../../convex/_generated/api";

function PearlLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-pearl-void flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="relative size-16 mx-auto">
          <div className="absolute inset-0 rounded-full bg-pearl-gold/10 blur-xl sacred-breathe" />
          <div className="absolute inset-[25%] rounded-full bg-pearl-gold/20 animate-pulse" />
        </div>
        <p className="text-pearl-muted font-body text-sm">Loading Inner Pearl...</p>
      </div>
    </div>
  );
}

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const onboardingComplete = useQuery(
    api.profiles.isOnboardingComplete,
    isAuthenticated ? {} : "skip"
  );

  if (isLoading) {
    return <PearlLoadingSkeleton />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Wait for onboarding status to load
  if (onboardingComplete === undefined) {
    return <PearlLoadingSkeleton />;
  }

  // Redirect to onboarding if not complete
  if (!onboardingComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}
