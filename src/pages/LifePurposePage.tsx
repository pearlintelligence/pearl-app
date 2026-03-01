import { useQuery } from "convex/react";
import { Compass, Briefcase, Crown, Heart, Mountain } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "../../convex/_generated/api";

const SIGN_SYMBOLS: Record<string, string> = {
  Aries: "♈", Taurus: "♉", Gemini: "♊", Cancer: "♋",
  Leo: "♌", Virgo: "♍", Libra: "♎", Scorpio: "♏",
  Sagittarius: "♐", Capricorn: "♑", Aquarius: "♒", Pisces: "♓",
};

function PurposeSection({
  icon,
  title,
  subtitle,
  content,
  accentColor,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  content: string;
  accentColor: string;
}) {
  return (
    <Card className="bg-pearl-deep/80 border-pearl-gold/10 hover:border-pearl-gold/20 transition-all duration-500">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl ${accentColor} shrink-0`}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-heading text-lg text-pearl-warm mb-0.5">{title}</h3>
            <p className="text-xs text-pearl-gold/70 font-body mb-4">{subtitle}</p>
            <div className="oracle-voice text-pearl-warm/80 text-sm leading-relaxed whitespace-pre-line">
              {content}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function LifePurposePage() {
  const lifePurpose = useQuery(api.profiles.getLifePurpose);

  if (!lifePurpose) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <div className="relative size-20 mx-auto mb-4">
          <div className="absolute inset-0 rounded-full bg-pearl-gold/10 blur-xl sacred-breathe" />
          <div className="absolute inset-[25%] rounded-full bg-pearl-gold/20 animate-pulse" />
        </div>
        <h2 className="text-xl font-heading text-pearl-warm mb-2">
          Synthesizing Your Life Purpose
        </h2>
        <p className="text-pearl-muted font-body text-sm">
          Pearl is weaving together the threads of your natal chart into a unified purpose narrative.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center md:text-left">
        <p className="text-sm text-pearl-gold tracking-[0.15em] uppercase font-body mb-1">
          Your Life Purpose
        </p>
        <h1 className="text-2xl md:text-3xl font-heading text-pearl-warm">
          Why You Are Here
        </h1>
        <p className="text-sm text-pearl-muted font-body mt-1">
          Synthesized from your North Node, Midheaven, Sun, and Saturn
        </p>
      </div>

      {/* Source Planets */}
      <div className="flex flex-wrap gap-3 justify-center md:justify-start">
        {[
          { label: "North Node", sign: lifePurpose.northNodeSign, house: lifePurpose.northNodeHouse },
          { label: "Midheaven", sign: lifePurpose.midheavenSign, house: null },
          { label: "Sun", sign: lifePurpose.sunSign, house: lifePurpose.sunHouse },
          { label: "Saturn", sign: lifePurpose.saturnSign, house: lifePurpose.saturnHouse },
        ].map((p) => (
          <div
            key={p.label}
            className="px-3 py-1.5 rounded-full bg-pearl-gold/10 border border-pearl-gold/15 flex items-center gap-2"
          >
            <span className="text-xs text-pearl-muted font-body">{p.label}</span>
            <span className="text-sm text-pearl-gold-light font-heading">
              {SIGN_SYMBOLS[p.sign]} {p.sign}
            </span>
            {p.house !== null && (
              <span className="text-xs text-pearl-muted font-body">H{p.house}</span>
            )}
          </div>
        ))}
      </div>

      {/* Five Dimensions */}
      <div className="space-y-5">
        <PurposeSection
          icon={<Compass className="size-5 text-pearl-gold" />}
          title="Purpose Direction"
          subtitle="Your soul's evolutionary path — where you are growing toward"
          content={lifePurpose.purposeDirection}
          accentColor="bg-pearl-gold/10"
        />

        <PurposeSection
          icon={<Briefcase className="size-5 text-emerald-400" />}
          title="Career Alignment"
          subtitle="How your purpose wants to express through work and public contribution"
          content={lifePurpose.careerAlignment}
          accentColor="bg-emerald-500/10"
        />

        <PurposeSection
          icon={<Crown className="size-5 text-amber-400" />}
          title="Leadership Style"
          subtitle="Your natural way of influencing and guiding others"
          content={lifePurpose.leadershipStyle}
          accentColor="bg-amber-500/10"
        />

        <PurposeSection
          icon={<Heart className="size-5 text-rose-400" />}
          title="Fulfillment Drivers"
          subtitle="What genuinely lights you up and makes you feel aligned"
          content={lifePurpose.fulfillmentDrivers}
          accentColor="bg-rose-500/10"
        />

        <PurposeSection
          icon={<Mountain className="size-5 text-blue-400" />}
          title="Long-Term Path"
          subtitle="Your Saturn mastery — the wisdom you're building over a lifetime"
          content={lifePurpose.longTermPath}
          accentColor="bg-blue-500/10"
        />
      </div>

      {/* Sacred note */}
      <Card className="bg-pearl-surface/30 border-pearl-gold/5">
        <CardContent className="p-5 text-center">
          <p className="oracle-voice text-pearl-warm/60 text-sm italic">
            This is not a prediction. It is a map — drawn from the precise positions of the celestial
            bodies at your birth, interpreted through Pearl's own framework of understanding. The territory
            is yours to explore.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
