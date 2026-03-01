import { useConvexAuth, useQuery } from "convex/react";
import { Navigate, Outlet } from "react-router-dom";
import { api } from "../../convex/_generated/api";

function AdminLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-pearl-void flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="relative size-16 mx-auto">
          <div className="absolute inset-0 rounded-full bg-pearl-gold/10 blur-xl sacred-breathe" />
          <div className="absolute inset-[25%] rounded-full bg-pearl-gold/20 animate-pulse" />
        </div>
        <p className="text-pearl-muted font-body text-sm">
          Verifying admin access...
        </p>
      </div>
    </div>
  );
}

export function AdminRoute() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const isAdmin = useQuery(api.admin.isAdmin, isAuthenticated ? {} : "skip");

  if (authLoading) return <AdminLoadingSkeleton />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (isAdmin === undefined) return <AdminLoadingSkeleton />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}
