import { useAction, useQuery } from "convex/react";
import { MessageCircle, Sparkles, Sun, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "../../convex/_generated/api";

function CosmicSystemCard({
  icon,
  system,
  values,
  color,
}: {
  icon: string;
  system: string;
  values: { label: string; value: string }[];
  color: string;
}) {
  return (
    <Card className="bg-pearl-deep/80 border-pearl-gold/10 hover:border-pearl-gold/25 transition-all duration-500 group">
      <CardContent className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`text-lg ${color} group-hover:scale-110 transition-transform duration-300`}
          >
            {icon}
          </div>
          <h3 className="font-heading text-base font-medium text-pearl-warm">
            {system}
          </h3>
        </div>
        <div className="space-y-2.5">
          {values.map((v) => (
            <div key={v.label} className="flex justify-between items-center">
              <span className="text-xs text-pearl-muted font-body">
                {v.label}
              </span>
              <span className="text-sm text-pearl-gold-light font-body font-medium">
                {v.value}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function DailyBriefCard() {
  const brief = useQuery(api.readings.getTodaysBrief);
  const generateBrief = useAction(api.pearl.generateDailyBrief);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await generateBrief();
    } catch (e) {
      console.error(e);
    }
    setGenerating(false);
  };

  return (
    <Card className="bg-pearl-deep/80 border-pearl-gold/10 pearl-glow col-span-full">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Sun className="size-5 text-pearl-gold" />
            <h3 className="font-heading text-lg text-pearl-warm">
              Morning Cosmic Brief
            </h3>
          </div>
          {!brief && (
            <Button
              size="sm"
              onClick={handleGenerate}
              disabled={generating}
              className="bg-pearl-gold/10 hover:bg-pearl-gold/20 text-pearl-gold border border-pearl-gold/20 font-body text-xs rounded-full"
            >
              {generating ? (
                <RefreshCw className="size-3 animate-spin mr-1" />
              ) : (
                <Sparkles className="size-3 mr-1" />
              )}
              {generating ? "Generating..." : "Generate Today's Brief"}
            </Button>
          )}
        </div>
        {brief ? (
          <div className="oracle-voice text-pearl-warm/85 text-sm leading-relaxed whitespace-pre-line">
            {brief.content}
          </div>
        ) : !generating ? (
          <p className="text-pearl-muted font-body text-sm">
            Your daily cosmic weather awaits. Tap to receive today's guidance.
          </p>
        ) : (
          <div className="space-y-2 shimmer rounded-lg p-4">
            <div className="h-3 bg-pearl-gold/5 rounded w-full" />
            <div className="h-3 bg-pearl-gold/5 rounded w-4/5" />
            <div className="h-3 bg-pearl-gold/5 rounded w-3/5" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const profile = useQuery(api.profiles.getUserProfile);
  const cosmic = useQuery(api.profiles.getCosmicProfile);
  const user = useQuery(api.auth.currentUser);

  const displayName =
    profile?.displayName || user?.name?.split(" ")[0] || "Seeker";

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center md:text-left">
        <p className="text-sm text-pearl-gold tracking-[0.15em] uppercase font-body mb-1">
          Welcome back
        </p>
        <h1 className="text-2xl md:text-3xl font-heading text-pearl-warm">
          {displayName}'s Cosmic Dashboard
        </h1>
      </div>

      {/* Daily Brief */}
      <DailyBriefCard />

      {/* Five-System Cosmic Fingerprint */}
      {cosmic && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-heading text-pearl-warm">
                Your Cosmic Fingerprint
              </h2>
              <p className="text-xs text-pearl-muted font-body mt-0.5">
                Five ancient systems, one unified design
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <CosmicSystemCard
              icon="✦"
              system="Astrology"
              color="text-pearl-gold"
              values={[
                { label: "Sun", value: cosmic.sunSign },
                { label: "Moon", value: cosmic.moonSign },
                { label: "Rising", value: cosmic.risingSign },
              ]}
            />
            <CosmicSystemCard
              icon="◇"
              system="Human Design"
              color="text-chart-2"
              values={[
                { label: "Type", value: cosmic.hdType },
                { label: "Authority", value: cosmic.hdAuthority },
                { label: "Profile", value: cosmic.hdProfile },
              ]}
            />
            <CosmicSystemCard
              icon="❋"
              system="Gene Keys"
              color="text-chart-3"
              values={[
                { label: "Life Purpose", value: cosmic.lifePurpose },
                { label: "Evolution", value: cosmic.evolution },
                { label: "Radiance", value: cosmic.radiance },
              ]}
            />
            <CosmicSystemCard
              icon="✡"
              system="Kabbalah"
              color="text-chart-4"
              values={[
                { label: "Tree of Life", value: cosmic.lifePathTree },
                { label: "Soul Urge", value: cosmic.soulUrge },
              ]}
            />
            <CosmicSystemCard
              icon="∞"
              system="Numerology"
              color="text-chart-5"
              values={[
                {
                  label: "Life Path",
                  value: cosmic.lifePathNumber.toString(),
                },
                {
                  label: "Expression",
                  value: cosmic.expressionNumber.toString(),
                },
                { label: "Soul", value: cosmic.soulNumber.toString() },
              ]}
            />

            {/* Ask Pearl CTA */}
            <Card className="bg-gradient-to-br from-pearl-gold/10 to-pearl-gold/5 border-pearl-gold/20 hover:border-pearl-gold/40 transition-all duration-500 group flex items-center justify-center">
              <CardContent className="p-5 text-center">
                <MessageCircle className="size-8 text-pearl-gold mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-heading text-base text-pearl-warm mb-2">
                  Ask Pearl
                </h3>
                <p className="text-xs text-pearl-muted font-body mb-4">
                  Got a question? Pearl sees through the lens of your design.
                </p>
                <Button
                  size="sm"
                  className="bg-pearl-gold hover:bg-pearl-gold-light text-pearl-void rounded-full font-body text-xs"
                  asChild
                >
                  <Link to="/oracle">Ask a Question</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Fingerprint Summary */}
      {cosmic?.summary && (
        <Card className="bg-pearl-deep/80 border-pearl-gold/10 pearl-glow">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="size-5 text-pearl-gold" />
              <h3 className="font-heading text-lg text-pearl-warm">
                Your Unified Reading
              </h3>
            </div>
            <div className="oracle-voice text-pearl-warm/85 text-sm leading-relaxed whitespace-pre-line">
              {cosmic.summary}
            </div>
          </CardContent>
        </Card>
      )}

      {!cosmic && (
        <div className="text-center py-12">
          <div className="relative size-20 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full bg-pearl-gold/10 blur-xl sacred-breathe" />
            <div className="absolute inset-[25%] rounded-full bg-pearl-gold/20 animate-pulse" />
          </div>
          <h2 className="text-xl font-heading text-pearl-warm mb-2">
            Your Cosmic Fingerprint is Being Woven
          </h2>
          <p className="text-pearl-muted font-body text-sm">
            This may take a moment. Refresh to check.
          </p>
        </div>
      )}
    </div>
  );
}
