import { useAction, useQuery } from "convex/react";
import { Clock, MoveRight, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "../../convex/_generated/api";

const SIGN_SYMBOLS: Record<string, string> = {
  Aries: "♈", Taurus: "♉", Gemini: "♊", Cancer: "♋",
  Leo: "♌", Virgo: "♍", Libra: "♎", Scorpio: "♏",
  Sagittarius: "♐", Capricorn: "♑", Aquarius: "♒", Pisces: "♓",
};

const PROGRESSED_MEANINGS: Record<string, Record<string, string>> = {
  sun: {
    Aries: "A period of new beginnings, asserting your identity, and discovering personal courage. You are being asked to lead.",
    Taurus: "A period of grounding, building material security, and reconnecting with your senses. Patience becomes your superpower.",
    Gemini: "A period of intellectual expansion, communication, and versatility. New ideas and connections are flowing.",
    Cancer: "A period of emotional deepening, nurturing, and creating home. Your inner world is calling for attention.",
    Leo: "A period of creative self-expression, joy, and visibility. You are learning to shine unapologetically.",
    Virgo: "A period of refinement, service, and practical mastery. Your attention to detail becomes sacred.",
    Libra: "A period of partnership, beauty, and finding balance. Relationships become your greatest teacher.",
    Scorpio: "A period of transformation, depth, and confronting shadow. Profound power is being forged.",
    Sagittarius: "A period of expansion, adventure, and philosophical seeking. Your worldview is broadening dramatically.",
    Capricorn: "A period of ambition, structure, and building legacy. You are being called to your highest authority.",
    Aquarius: "A period of innovation, community, and breaking free from convention. Your unique vision matters now.",
    Pisces: "A period of spiritual deepening, compassion, and creative dissolution. Surrender is the path forward.",
  },
  moon: {
    Aries: "Your emotional landscape is fiery and urgent. You need independence and action to process feelings.",
    Taurus: "Your emotional landscape is calm and grounded. Comfort, nature, and sensory pleasure soothe you now.",
    Gemini: "Your emotional landscape is curious and restless. Talking, writing, and social connection bring emotional relief.",
    Cancer: "Your emotional landscape is deeply sensitive. Home, family, and emotional safety are paramount right now.",
    Leo: "Your emotional landscape is warm and expressive. You need creative outlets and generous recognition.",
    Virgo: "Your emotional landscape is analytical and service-oriented. Routine and usefulness bring emotional stability.",
    Libra: "Your emotional landscape craves harmony and beauty. Partnership and aesthetic environment matter deeply.",
    Scorpio: "Your emotional landscape is intense and transformative. Deep feelings are surfacing for integration.",
    Sagittarius: "Your emotional landscape is optimistic and freedom-seeking. Travel, learning, and adventure feed your soul.",
    Capricorn: "Your emotional landscape is serious and ambitious. Emotional maturity and responsible self-care are the path.",
    Aquarius: "Your emotional landscape is detached and future-oriented. Community and intellectual stimulation feel nourishing.",
    Pisces: "Your emotional landscape is deeply empathic and fluid. Art, music, and spiritual practice are essential.",
  },
};

export function ProgressionsPage() {
  const profile = useQuery(api.profiles.getUserProfile);
  const natalChart = useQuery(api.profiles.getNatalChart);
  const getProgressions = useAction(api.pearl.getProgressions);
  const [progressions, setProgressions] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (natalChart && !progressions && !loading) {
      loadProgressions();
    }
  }, [natalChart]);

  const loadProgressions = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getProgressions();
      setProgressions(result);
    } catch (e: any) {
      setError(e.message || "Failed to calculate progressions");
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
          Your natal chart must be generated first to see secondary progressions.
        </p>
      </div>
    );
  }

  const birthYear = profile?.birthDate ? new Date(profile.birthDate).getFullYear() : null;
  const currentYear = new Date().getFullYear();
  const yearsElapsed = birthYear ? currentYear - birthYear : null;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-pearl-gold tracking-[0.15em] uppercase font-body mb-1">
            Your Current Life Phase
          </p>
          <h1 className="text-2xl md:text-3xl font-heading text-pearl-warm">
            Secondary Progressions
          </h1>
          <p className="text-sm text-pearl-muted font-body mt-1">
            Your inner evolution — one day after birth = one year of life
          </p>
          {yearsElapsed && (
            <p className="text-xs text-pearl-gold/60 font-body mt-1">
              Day {yearsElapsed} after birth = Year {currentYear} of your life
            </p>
          )}
        </div>
        <Button
          size="sm"
          onClick={loadProgressions}
          disabled={loading}
          className="bg-pearl-gold/10 hover:bg-pearl-gold/20 text-pearl-gold border border-pearl-gold/20 font-body text-xs rounded-full shrink-0"
        >
          {loading ? (
            <RefreshCw className="size-3 animate-spin mr-1" />
          ) : (
            <Clock className="size-3 mr-1" />
          )}
          Recalculate
        </Button>
      </div>

      {loading && !progressions && (
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

      {progressions && (
        <>
          {/* Natal → Progressed comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Progressed Sun */}
            <Card className="bg-pearl-deep/80 border-pearl-gold/10 pearl-glow">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl text-pearl-gold">☉</span>
                  <div>
                    <h3 className="font-heading text-lg text-pearl-warm">Progressed Sun</h3>
                    <p className="text-xs text-pearl-muted font-body">Your evolving identity</p>
                  </div>
                </div>

                {/* Natal → Progressed */}
                <div className="flex items-center gap-3 mb-4 py-3 px-4 bg-pearl-surface/30 rounded-lg">
                  <div className="text-center">
                    <div className="text-xs text-pearl-muted font-body mb-1">Natal</div>
                    <div className="text-sm font-heading text-pearl-warm/60">
                      {SIGN_SYMBOLS[natalChart.sunSign]} {natalChart.sunSign}
                    </div>
                  </div>
                  <MoveRight className="size-4 text-pearl-gold/40" />
                  <div className="text-center">
                    <div className="text-xs text-pearl-gold font-body mb-1">Now</div>
                    <div className="text-lg font-heading text-pearl-gold-light">
                      {SIGN_SYMBOLS[progressions.progressedSun?.sign] || ""}{" "}
                      {progressions.progressedSun?.sign || "—"}
                    </div>
                    <div className="text-xs text-pearl-muted font-body">
                      {progressions.progressedSun?.degreeInSign?.toFixed(1)}°
                    </div>
                  </div>
                </div>

                <div className="oracle-voice text-pearl-warm/75 text-sm leading-relaxed">
                  {PROGRESSED_MEANINGS.sun[progressions.progressedSun?.sign] ||
                    "Your progressed Sun illuminates your current life chapter."}
                </div>
              </CardContent>
            </Card>

            {/* Progressed Moon */}
            <Card className="bg-pearl-deep/80 border-pearl-gold/10 pearl-glow">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl text-pearl-gold">☽</span>
                  <div>
                    <h3 className="font-heading text-lg text-pearl-warm">Progressed Moon</h3>
                    <p className="text-xs text-pearl-muted font-body">Your emotional evolution</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-4 py-3 px-4 bg-pearl-surface/30 rounded-lg">
                  <div className="text-center">
                    <div className="text-xs text-pearl-muted font-body mb-1">Natal</div>
                    <div className="text-sm font-heading text-pearl-warm/60">
                      {SIGN_SYMBOLS[natalChart.moonSign]} {natalChart.moonSign}
                    </div>
                  </div>
                  <MoveRight className="size-4 text-pearl-gold/40" />
                  <div className="text-center">
                    <div className="text-xs text-pearl-gold font-body mb-1">Now</div>
                    <div className="text-lg font-heading text-pearl-gold-light">
                      {SIGN_SYMBOLS[progressions.progressedMoon?.sign] || ""}{" "}
                      {progressions.progressedMoon?.sign || "—"}
                    </div>
                    <div className="text-xs text-pearl-muted font-body">
                      {progressions.progressedMoon?.degreeInSign?.toFixed(1)}°
                    </div>
                  </div>
                </div>

                <div className="oracle-voice text-pearl-warm/75 text-sm leading-relaxed">
                  {PROGRESSED_MEANINGS.moon[progressions.progressedMoon?.sign] ||
                    "Your progressed Moon reveals the emotional texture of this life phase."}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progressed Ascendant */}
          {progressions.progressedAscendant && (
            <Card className="bg-pearl-deep/80 border-pearl-gold/10">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xl text-pearl-gold">ASC</span>
                  <div>
                    <h3 className="font-heading text-lg text-pearl-warm">Progressed Ascendant</h3>
                    <p className="text-xs text-pearl-muted font-body">How your public persona is evolving</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 py-3 px-4 bg-pearl-surface/30 rounded-lg">
                  <div className="text-center">
                    <div className="text-xs text-pearl-muted font-body mb-1">Natal</div>
                    <div className="text-sm font-heading text-pearl-warm/60">
                      {SIGN_SYMBOLS[natalChart.ascendantSign]} {natalChart.ascendantSign}
                    </div>
                  </div>
                  <MoveRight className="size-4 text-pearl-gold/40" />
                  <div className="text-center">
                    <div className="text-xs text-pearl-gold font-body mb-1">Now</div>
                    <div className="text-lg font-heading text-pearl-gold-light">
                      {SIGN_SYMBOLS[progressions.progressedAscendant?.sign] || ""}{" "}
                      {progressions.progressedAscendant?.sign || "—"}
                    </div>
                    <div className="text-xs text-pearl-muted font-body">
                      {progressions.progressedAscendant?.degreeInSign?.toFixed(1)}°
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* How progressions work */}
          <Card className="bg-pearl-surface/30 border-pearl-gold/5">
            <CardContent className="p-5">
              <h4 className="text-sm font-heading text-pearl-warm mb-2">How Secondary Progressions Work</h4>
              <p className="text-xs text-pearl-muted font-body leading-relaxed">
                Secondary progressions use the principle of "a day for a year" — the position of the planets
                on the {yearsElapsed ? `${yearsElapsed}th` : "Nth"} day after your birth reveals the themes
                of your {yearsElapsed ? `${yearsElapsed}th` : "current"} year of life. The progressed Sun moves
                roughly 1° per year (changing signs every ~30 years), while the progressed Moon moves much faster,
                cycling through all 12 signs every ~27 years. Together they paint a picture of your inner evolution
                — the person you are becoming.
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
