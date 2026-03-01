import { useAction, useQuery } from "convex/react";
import { Compass, Globe2, Moon, Sun, Orbit, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "../../convex/_generated/api";

// Zodiac sign symbols
const SIGN_SYMBOLS: Record<string, string> = {
  Aries: "♈", Taurus: "♉", Gemini: "♊", Cancer: "♋",
  Leo: "♌", Virgo: "♍", Libra: "♎", Scorpio: "♏",
  Sagittarius: "♐", Capricorn: "♑", Aquarius: "♒", Pisces: "♓",
};

const PLANET_ICONS: Record<string, string> = {
  sun: "☉", moon: "☽", mercury: "☿", venus: "♀", mars: "♂",
  jupiter: "♃", saturn: "♄", uranus: "♅", neptune: "♆", pluto: "♇",
  northNode: "☊", southNode: "☋", ascendant: "ASC", midheaven: "MC",
};

const PLANET_LABELS: Record<string, string> = {
  sun: "Sun", moon: "Moon", mercury: "Mercury", venus: "Venus",
  mars: "Mars", jupiter: "Jupiter", saturn: "Saturn", uranus: "Uranus",
  neptune: "Neptune", pluto: "Pluto", northNode: "North Node",
  southNode: "South Node", ascendant: "Ascendant", midheaven: "Midheaven",
};

const PLANET_MEANINGS: Record<string, string> = {
  sun: "Core identity & vitality",
  moon: "Emotional nature & instincts",
  mercury: "Communication & thinking",
  venus: "Love, beauty & values",
  mars: "Drive, energy & desire",
  jupiter: "Growth, abundance & wisdom",
  saturn: "Discipline, structure & mastery",
  uranus: "Innovation & awakening",
  neptune: "Intuition, dreams & spirituality",
  pluto: "Transformation & power",
  northNode: "Soul's evolutionary direction",
  southNode: "Past life gifts & patterns",
  ascendant: "How the world sees you",
  midheaven: "Public calling & career",
};

interface PlanetData {
  sign: string;
  degreeInSign?: number;
  degree?: number;
  house: number;
}

function PlanetRow({ name, data }: { name: string; data: PlanetData }) {
  const symbol = PLANET_ICONS[name] || "•";
  const label = PLANET_LABELS[name] || name;
  const meaning = PLANET_MEANINGS[name] || "";
  const signSymbol = SIGN_SYMBOLS[data.sign] || "";
  const deg = data.degreeInSign ?? (data.degree != null ? data.degree % 30 : null);

  return (
    <div className="flex items-center gap-4 py-3 px-4 rounded-lg hover:bg-pearl-surface/50 transition-colors group">
      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-pearl-gold/10 text-pearl-gold text-lg font-heading group-hover:bg-pearl-gold/20 transition-colors">
        {symbol}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-pearl-warm font-body">{label}</span>
          <span className="text-xs text-pearl-muted font-body hidden sm:inline">{meaning}</span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-pearl-gold-light font-heading text-base">
            {signSymbol} {data.sign}
          </span>
          {deg != null && (
            <span className="text-xs text-pearl-muted font-body">
              {deg.toFixed(1)}°
            </span>
          )}
        </div>
      </div>
      <div className="text-right">
        <span className="text-xs text-pearl-muted font-body">House</span>
        <div className="text-lg font-heading text-pearl-gold">{data.house}</div>
      </div>
    </div>
  );
}

// Convert ecliptic degree to sign name
function signFromDeg(lon: number): string {
  const signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
  const normalized = ((lon % 360) + 360) % 360;
  return signs[Math.floor(normalized / 30)];
}

function HousesGrid({ chartData }: { chartData: any }) {
  if (!chartData?.houses) return null;

  // houses is number[] (raw ecliptic degrees)
  const houses: number[] = chartData.houses;

  return (
    <Card className="bg-pearl-deep/80 border-pearl-gold/10">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <Globe2 className="size-5 text-pearl-gold" />
          <h3 className="font-heading text-lg text-pearl-warm">The 12 Houses</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {houses.map((degree: number, i: number) => {
            const sign = signFromDeg(degree);
            const degInSign = degree % 30;
            return (
              <div
                key={i}
                className="p-3 rounded-lg bg-pearl-surface/30 border border-pearl-gold/5 hover:border-pearl-gold/15 transition-colors"
              >
                <div className="text-xs text-pearl-muted font-body mb-1">House {i + 1}</div>
                <div className="text-sm font-heading text-pearl-gold-light">
                  {SIGN_SYMBOLS[sign] || ""} {sign}
                </div>
                <div className="text-xs text-pearl-muted font-body mt-0.5">
                  {degInSign.toFixed(1)}°
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export function BlueprintPage() {
  const natalChart = useQuery(api.profiles.getNatalChart);
  const profile = useQuery(api.profiles.getUserProfile);
  const generateFingerprint = useAction(api.pearl.generateCosmicFingerprint);
  const [generating, setGenerating] = useState(false);

  if (!natalChart) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <div className="relative size-20 mx-auto mb-4">
          <div className="absolute inset-0 rounded-full bg-pearl-gold/10 blur-xl sacred-breathe" />
          <div className="absolute inset-[25%] rounded-full bg-pearl-gold/20 animate-pulse" />
        </div>
        {generating ? (
          <>
            <h2 className="text-xl font-heading text-pearl-warm mb-2">
              Calculating Your Blueprint
            </h2>
            <p className="text-pearl-muted font-body text-sm">
              Your natal chart is being calculated from the precise positions of the stars at your birth…
            </p>
          </>
        ) : (
          <>
            <h2 className="text-xl font-heading text-pearl-warm mb-2">
              Your Blueprint Awaits
            </h2>
            <p className="text-pearl-muted font-body text-sm mb-6">
              Generate your full natal chart from the precise positions of the celestial bodies at your birth.
            </p>
            <Button
              onClick={async () => {
                setGenerating(true);
                try { await generateFingerprint(); } catch (e) { console.error(e); }
                setGenerating(false);
              }}
              className="bg-pearl-gold/20 hover:bg-pearl-gold/30 text-pearl-gold border border-pearl-gold/30 font-body rounded-full px-6"
            >
              <RefreshCw className="size-4 mr-2" />
              Generate Natal Chart
            </Button>
          </>
        )}
      </div>
    );
  }

  // Parse full chart JSON
  let chartData: any = null;
  try {
    chartData = JSON.parse(natalChart.fullChartJson);
  } catch {
    // fallback to basic fields
  }

  // Build planet list from chart data
  const planets: { name: string; data: PlanetData }[] = [];

  if (chartData) {
    // Core luminaries
    planets.push({ name: "sun", data: chartData.sun });
    planets.push({ name: "moon", data: chartData.moon });

    // Angles
    planets.push({
      name: "ascendant",
      data: { sign: chartData.ascendant.sign, degreeInSign: chartData.ascendant.degreeInSign, house: 1 },
    });
    planets.push({
      name: "midheaven",
      data: { sign: chartData.midheaven.sign, degreeInSign: chartData.midheaven.degreeInSign, house: 10 },
    });

    // Personal planets
    planets.push({ name: "mercury", data: chartData.mercury });
    planets.push({ name: "venus", data: chartData.venus });
    planets.push({ name: "mars", data: chartData.mars });

    // Social planets
    planets.push({ name: "jupiter", data: chartData.jupiter });
    planets.push({ name: "saturn", data: chartData.saturn });

    // Outer planets
    planets.push({ name: "uranus", data: chartData.uranus });
    planets.push({ name: "neptune", data: chartData.neptune });
    planets.push({ name: "pluto", data: chartData.pluto });

    // Nodes
    planets.push({ name: "northNode", data: chartData.northNode });
    planets.push({ name: "southNode", data: chartData.southNode });
  } else {
    // Fallback to basic fields from natalCharts table
    planets.push({
      name: "sun",
      data: { sign: natalChart.sunSign, degreeInSign: 0, house: natalChart.sunHouse },
    });
    planets.push({
      name: "moon",
      data: { sign: natalChart.moonSign, degreeInSign: 0, house: natalChart.moonHouse },
    });
    planets.push({
      name: "ascendant",
      data: { sign: natalChart.ascendantSign, degreeInSign: 0, house: 1 },
    });
    planets.push({
      name: "midheaven",
      data: { sign: natalChart.midheavenSign, degreeInSign: 0, house: 10 },
    });
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center md:text-left">
        <p className="text-sm text-pearl-gold tracking-[0.15em] uppercase font-body mb-1">
          Your Blueprint
        </p>
        <h1 className="text-2xl md:text-3xl font-heading text-pearl-warm">
          Natal Chart
        </h1>
        <p className="text-sm text-pearl-muted font-body mt-1">
          The precise positions of the celestial bodies at the moment of {profile?.displayName || "your"} birth
        </p>
      </div>

      {/* Big Three */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: <Sun className="size-5" />, label: "Sun Sign", value: natalChart.sunSign, desc: "Your core identity" },
          { icon: <Moon className="size-5" />, label: "Moon Sign", value: natalChart.moonSign, desc: "Your emotional nature" },
          { icon: <Compass className="size-5" />, label: "Rising Sign", value: natalChart.ascendantSign, desc: "Your outer expression" },
        ].map((item) => (
          <Card key={item.label} className="bg-pearl-deep/80 border-pearl-gold/10 pearl-glow">
            <CardContent className="p-5 text-center">
              <div className="text-pearl-gold mx-auto mb-2 flex justify-center">{item.icon}</div>
              <div className="text-xs text-pearl-muted font-body mb-1">{item.label}</div>
              <div className="text-2xl font-heading text-pearl-gold-light">
                {SIGN_SYMBOLS[item.value]} {item.value}
              </div>
              <div className="text-xs text-pearl-muted font-body mt-1">{item.desc}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* All Planets */}
      <Card className="bg-pearl-deep/80 border-pearl-gold/10">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <Orbit className="size-5 text-pearl-gold" />
            <h3 className="font-heading text-lg text-pearl-warm">Planetary Positions</h3>
            <span className="text-xs text-pearl-muted font-body ml-auto">{natalChart.houseSystem} Houses</span>
          </div>
          <div className="divide-y divide-pearl-gold/5">
            {planets.map((p) => (
              <PlanetRow key={p.name} name={p.name} data={p.data} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Houses */}
      <HousesGrid chartData={chartData} />

      {/* Sacred note */}
      <div className="text-center py-4">
        <p className="text-xs text-pearl-muted/60 font-body italic">
          Calculated using Swiss Ephemeris-grade astronomical algorithms (VSOP87 / ELP2000)
        </p>
      </div>
    </div>
  );
}
