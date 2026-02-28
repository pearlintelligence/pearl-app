import { useConvexAuth } from "convex/react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

function PearlOrb() {
  return (
    <div className="relative size-28 sm:size-32 mx-auto mb-8 gentle-float">
      {/* Outer glow */}
      <div className="absolute inset-0 rounded-full bg-pearl-gold/10 blur-2xl scale-150" />
      {/* Middle ring */}
      <div className="absolute inset-2 rounded-full border border-pearl-gold/20 sacred-breathe" />
      {/* Inner orb */}
      <div className="absolute inset-4 rounded-full bg-gradient-to-br from-pearl-gold/20 via-pearl-gold/10 to-transparent" />
      {/* Core */}
      <div className="absolute inset-8 rounded-full bg-gradient-to-br from-pearl-gold/30 to-pearl-gold-light/20 blur-sm" />
      {/* Center pearl */}
      <div className="absolute inset-[38%] rounded-full bg-gradient-to-br from-pearl-gold-light to-pearl-gold shadow-lg shadow-pearl-gold/30" />
    </div>
  );
}

function SacredDivider() {
  return (
    <div className="flex items-center justify-center gap-3 my-8">
      <div className="h-px w-12 bg-gradient-to-r from-transparent to-pearl-gold/30" />
      <div className="size-1.5 rounded-full bg-pearl-gold/40" />
      <div className="h-px w-12 bg-gradient-to-l from-transparent to-pearl-gold/30" />
    </div>
  );
}

export function LandingPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Hero */}
      <section className="relative flex-1 flex flex-col items-center justify-center px-4 py-20 md:py-32 star-field">
        {/* Ambient glow */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-pearl-gold/5 blur-[120px]" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-pearl-gold/3 blur-[100px]" />
        </div>

        <div className="max-w-2xl mx-auto text-center space-y-6">
          <PearlOrb />

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight leading-[1.1] text-pearl-gradient">
            Know Thyself
          </h1>

          <p className="text-base md:text-lg text-pearl-muted max-w-lg mx-auto leading-relaxed font-body">
            Inner Pearl synthesizes astrology, Human Design, Gene Keys, Kabbalah, and
            Numerology into one unified map of your soul. Not a horoscope.{" "}
            <span className="text-pearl-warm">A revelation.</span>
          </p>

          <SacredDivider />

          {!isAuthenticated && !isLoading && (
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button
                size="lg"
                className="text-base h-12 px-8 bg-pearl-gold hover:bg-pearl-gold-light text-pearl-void font-medium rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-pearl-gold/20"
                asChild
              >
                <Link to="/signup">
                  Discover Your Design
                  <ArrowRight className="size-4 ml-1" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-base h-12 px-8 border-pearl-gold/20 text-pearl-gold hover:bg-pearl-gold/5 rounded-full"
                asChild
              >
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          )}
          {isAuthenticated && (
            <div className="pt-2">
              <Button
                size="lg"
                className="text-base h-12 px-8 bg-pearl-gold hover:bg-pearl-gold-light text-pearl-void font-medium rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-pearl-gold/20"
                asChild
              >
                <Link to="/dashboard">
                  Enter Inner Pearl
                  <ArrowRight className="size-4 ml-1" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Five Systems */}
      <section className="py-20 md:py-28 border-t border-pearl-gold/10">
        <div className="container">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-pearl-gold tracking-[0.2em] uppercase mb-3 font-body">
              Five Ancient Systems, One Truth
            </p>
            <h2 className="text-3xl md:text-4xl font-light tracking-tight mb-4 text-pearl-warm">
              Your Cosmic Fingerprint
            </h2>
            <p className="text-pearl-muted max-w-xl mx-auto text-base font-body leading-relaxed">
              No two souls carry the same design. Inner Pearl weaves five wisdom
              traditions into a unified map that reveals why you are exactly who
              you are.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
            {[
              { name: "Astrology", icon: "✦", desc: "Celestial blueprint" },
              { name: "Human Design", icon: "◇", desc: "Energy architecture" },
              { name: "Gene Keys", icon: "❋", desc: "Evolutionary path" },
              { name: "Kabbalah", icon: "✡", desc: "Soul's tree of life" },
              { name: "Numerology", icon: "∞", desc: "Vibrational code" },
            ].map((system) => (
              <div
                key={system.name}
                className="group sacred-border rounded-xl p-5 text-center transition-all duration-500 hover:border-pearl-gold/30 hover:bg-pearl-gold/5"
              >
                <div className="text-2xl mb-3 text-pearl-gold sacred-breathe">
                  {system.icon}
                </div>
                <h3 className="font-heading text-sm font-medium text-pearl-warm mb-1">
                  {system.name}
                </h3>
                <p className="text-xs text-pearl-muted font-body">
                  {system.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Oracle Voice Preview */}
      <section className="py-20 md:py-28 border-t border-pearl-gold/10 relative">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-pearl-gold/3 blur-[150px]" />
        </div>
        <div className="container max-w-2xl text-center">
          <p className="text-sm font-medium text-pearl-gold tracking-[0.2em] uppercase mb-6 font-body">
            Pearl Speaks
          </p>
          <blockquote className="oracle-voice text-xl md:text-2xl text-pearl-warm leading-relaxed">
            "You did not arrive here by accident. Every system in your design
            points to the same truth — you are here to illuminate what others
            cannot yet see. The question was never whether you belong. The
            question is whether you're ready to remember."
          </blockquote>
          <SacredDivider />
          {!isAuthenticated && !isLoading && (
            <Button
              className="bg-pearl-gold hover:bg-pearl-gold-light text-pearl-void rounded-full px-8 h-11 font-body"
              asChild
            >
              <Link to="/signup">
                Begin Your Journey
                <ArrowRight className="size-4 ml-1" />
              </Link>
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-pearl-gold/10 py-8">
        <div className="container text-center">
          <p className="text-xs text-pearl-muted font-body">
            © {new Date().getFullYear()} InnerPearl · Sacred wisdom, modern
            technology
          </p>
        </div>
      </footer>
    </div>
  );
}
