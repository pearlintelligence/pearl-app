import { useAction, useQuery } from "convex/react";
import { Activity, RefreshCw, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "../../convex/_generated/api";

const SIGN_SYMBOLS: Record<string, string> = {
  Aries: "♈", Taurus: "♉", Gemini: "♊", Cancer: "♋",
  Leo: "♌", Virgo: "♍", Libra: "♎", Scorpio: "♏",
  Sagittarius: "♐", Capricorn: "♑", Aquarius: "♒", Pisces: "♓",
};

const PLANET_SYMBOLS: Record<string, string> = {
  sun: "☉", moon: "☽", mercury: "☿", venus: "♀", mars: "♂",
  jupiter: "♃", saturn: "♄", uranus: "♅", neptune: "♆", pluto: "♇",
};

const ASPECT_SYMBOLS: Record<string, { symbol: string; color: string; meaning: string }> = {
  conjunction: { symbol: "☌", color: "text-pearl-gold", meaning: "Fusion of energies — intensification" },
  sextile: { symbol: "⚹", color: "text-emerald-400", meaning: "Opportunity — harmonious flow" },
  square: { symbol: "□", color: "text-rose-400", meaning: "Tension — growth through challenge" },
  trine: { symbol: "△", color: "text-blue-400", meaning: "Grace — natural ease and talent" },
  opposition: { symbol: "☍", color: "text-amber-400", meaning: "Polarity — integration needed" },
};

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function TransitsPage() {
  const profile = useQuery(api.profiles.getUserProfile);
  const natalChart = useQuery(api.profiles.getNatalChart);
  const getTransits = useAction(api.pearl.getTransits);
  const [transits, setTransits] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-load transits when chart is available
  useEffect(() => {
    if (natalChart && !transits && !loading) {
      loadTransits();
    }
  }, [natalChart]);

  const loadTransits = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getTransits();
      setTransits(result);
    } catch (e: any) {
      setError(e.message || "Failed to calculate transits");
    }
    setLoading(false);
  };

  if (!natalChart) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <div className="relative size-20 mx-auto mb-4">
          <div className="absolute inset-0 rounded-full bg-pearl-gold/10 blur-xl sacred-breathe" />
          <div className="absolute inset-[25%] rounded-full bg-pearl-gold/20 animate-pulse" />
        </div>
        <h2 className="text-xl font-heading text-pearl-warm mb-2">
          Natal Chart Required
        </h2>
        <p className="text-pearl-muted font-body text-sm">
          Your natal chart must be generated first to see current transits.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-pearl-gold tracking-[0.15em] uppercase font-body mb-1">
            What's Happening Now
          </p>
          <h1 className="text-2xl md:text-3xl font-heading text-pearl-warm">
            Current Transits
          </h1>
          <p className="text-sm text-pearl-muted font-body mt-1">
            Real-time planetary positions and their aspects to {profile?.displayName || "your"} natal chart
          </p>
        </div>
        <Button
          size="sm"
          onClick={loadTransits}
          disabled={loading}
          className="bg-pearl-gold/10 hover:bg-pearl-gold/20 text-pearl-gold border border-pearl-gold/20 font-body text-xs rounded-full shrink-0"
        >
          {loading ? (
            <RefreshCw className="size-3 animate-spin mr-1" />
          ) : (
            <RefreshCw className="size-3 mr-1" />
          )}
          Refresh
        </Button>
      </div>

      {loading && !transits && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="shimmer rounded-lg p-6">
              <div className="h-4 bg-pearl-gold/5 rounded w-1/3 mb-3" />
              <div className="h-3 bg-pearl-gold/5 rounded w-2/3" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <Card className="bg-rose-500/10 border-rose-500/20">
          <CardContent className="p-4">
            <p className="text-rose-400 text-sm font-body">{error}</p>
          </CardContent>
        </Card>
      )}

      {transits && (
        <>
          {/* Current Planetary Positions */}
          <Card className="bg-pearl-deep/80 border-pearl-gold/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <Activity className="size-5 text-pearl-gold" />
                <h3 className="font-heading text-lg text-pearl-warm">Current Sky</h3>
                <span className="text-xs text-pearl-muted font-body ml-auto">
                  {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {transits.positions &&
                  Object.entries(transits.positions).map(([planet, pos]: [string, any]) => (
                    <div
                      key={planet}
                      className="p-3 rounded-lg bg-pearl-surface/30 border border-pearl-gold/5 text-center"
                    >
                      <div className="text-lg text-pearl-gold mb-1">
                        {PLANET_SYMBOLS[planet] || "•"}
                      </div>
                      <div className="text-xs text-pearl-muted font-body">{capitalize(planet)}</div>
                      <div className="text-sm font-heading text-pearl-gold-light mt-1">
                        {SIGN_SYMBOLS[pos.sign] || ""} {pos.sign}
                      </div>
                      <div className="text-xs text-pearl-muted font-body">
                        {pos.degreeInSign?.toFixed(1)}°
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Transit Aspects to Natal */}
          {transits.aspects && transits.aspects.length > 0 && (
            <Card className="bg-pearl-deep/80 border-pearl-gold/10">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-5">
                  <Sparkles className="size-5 text-pearl-gold" />
                  <h3 className="font-heading text-lg text-pearl-warm">Active Aspects to Your Chart</h3>
                </div>
                <div className="space-y-3">
                  {transits.aspects.map((aspect: any, i: number) => {
                    const aspectInfo = ASPECT_SYMBOLS[aspect.aspect] || {
                      symbol: "•", color: "text-pearl-muted", meaning: "",
                    };
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 rounded-lg bg-pearl-surface/20 hover:bg-pearl-surface/40 transition-colors"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="text-pearl-gold text-sm">
                            {PLANET_SYMBOLS[aspect.transitPlanet] || "•"}
                          </span>
                          <span className="text-sm text-pearl-warm font-body">
                            Transit {capitalize(aspect.transitPlanet)}
                          </span>
                          <span className={`text-lg ${aspectInfo.color}`}>
                            {aspectInfo.symbol}
                          </span>
                          <span className="text-sm text-pearl-warm font-body">
                            Natal {capitalize(aspect.natalPlanet)}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <div className={`text-xs font-body ${aspectInfo.color}`}>
                            {capitalize(aspect.aspect)}
                          </div>
                          <div className="text-xs text-pearl-muted font-body">
                            {aspect.orb}° orb
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 pt-4 border-t border-pearl-gold/5">
                  <h4 className="text-xs text-pearl-muted font-body mb-2 uppercase tracking-wider">Aspect Meanings</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {Object.entries(ASPECT_SYMBOLS).map(([name, info]) => (
                      <div key={name} className="flex items-center gap-2 text-xs">
                        <span className={`${info.color}`}>{info.symbol}</span>
                        <span className="text-pearl-muted font-body">
                          {capitalize(name)} — {info.meaning}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {transits.aspects && transits.aspects.length === 0 && (
            <Card className="bg-pearl-surface/30 border-pearl-gold/5">
              <CardContent className="p-6 text-center">
                <p className="oracle-voice text-pearl-warm/60 text-sm">
                  No major transit aspects are active at this moment. The sky is holding space
                  for integration — a rare and valuable pause.
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
