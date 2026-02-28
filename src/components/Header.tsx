import { useConvexAuth } from "convex/react";
import { ArrowRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";

export function Header() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const location = useLocation();
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/signup";

  return (
    <header className="sticky top-0 z-50 border-b border-pearl-gold/8 bg-pearl-void/90 backdrop-blur-xl">
      <div className="container">
        <div className="flex h-16 items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          >
            {/* Pearl orb logo */}
            <div className="relative size-8">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pearl-gold/20 to-transparent" />
              <div className="absolute inset-[30%] rounded-full bg-gradient-to-br from-pearl-gold-light to-pearl-gold" />
            </div>
            <span className="font-heading text-xl font-medium text-pearl-warm tracking-wide hidden sm:inline">
              Inner Pearl
            </span>
          </Link>

          <nav className="flex items-center gap-2">
            {isLoading ? null : isAuthenticated ? (
              <Button
                size="sm"
                className="bg-pearl-gold hover:bg-pearl-gold-light text-pearl-void font-body rounded-full"
                asChild
              >
                <Link to="/dashboard">
                  Open Inner Pearl
                  <ArrowRight className="size-3.5 ml-1" />
                </Link>
              </Button>
            ) : (
              !isAuthPage && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-pearl-muted hover:text-pearl-warm font-body"
                    asChild
                  >
                    <Link to="/login">Sign In</Link>
                  </Button>
                  <Button
                    size="sm"
                    className="bg-pearl-gold hover:bg-pearl-gold-light text-pearl-void font-body rounded-full"
                    asChild
                  >
                    <Link to="/signup">Get Started</Link>
                  </Button>
                </>
              )
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
