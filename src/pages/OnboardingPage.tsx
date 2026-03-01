import { useMutation, useAction } from "convex/react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "../../convex/_generated/api";

const STEPS = ["name", "birthDate", "birthTime", "birthPlace", "generating"] as const;
type Step = (typeof STEPS)[number];

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-0.5 w-8 rounded-full transition-all duration-500 ${
            i <= current ? "bg-pearl-gold" : "bg-pearl-gold/15"
          }`}
        />
      ))}
    </div>
  );
}

function GeneratingAnimation({ name: _name }: { name: string }) {
  const [dots, setDots] = useState("");
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 500);
    return () => clearInterval(dotInterval);
  }, []);

  useEffect(() => {
    const phases = [0, 1, 2, 3, 4];
    let i = 0;
    const phaseInterval = setInterval(() => {
      i++;
      if (i < phases.length) setPhase(phases[i]);
    }, 2000);
    return () => clearInterval(phaseInterval);
  }, []);

  const messages = [
    "Reading the celestial configurations at your moment of birth",
    "Mapping your Human Design energy type",
    "Synthesizing your Life Purpose Engine",
    "Tracing your path through the Tree of Life",
    "Computing your numerological signature",
  ];

  return (
    <div className="text-center space-y-8 py-8">
      {/* Animated orb */}
      <div className="relative size-32 mx-auto">
        <div className="absolute inset-0 rounded-full bg-pearl-gold/10 blur-2xl scale-150 sacred-breathe" />
        <div className="absolute inset-0 rounded-full border border-pearl-gold/30 animate-spin" style={{ animationDuration: "8s" }} />
        <div className="absolute inset-3 rounded-full border border-pearl-gold/20 animate-spin" style={{ animationDuration: "12s", animationDirection: "reverse" }} />
        <div className="absolute inset-6 rounded-full border border-pearl-gold/15 animate-spin" style={{ animationDuration: "6s" }} />
        <div className="absolute inset-[35%] rounded-full bg-gradient-to-br from-pearl-gold/40 to-pearl-gold-light/30 blur-sm animate-pulse" />
      </div>

      <div className="space-y-3">
        <h2 className="text-2xl md:text-3xl font-heading text-pearl-warm">
          Generating your Cosmic Fingerprint{dots}
        </h2>
        <p className="text-pearl-muted font-body text-sm transition-all duration-700">
          {messages[phase]}
        </p>
      </div>

      <div className="max-w-xs mx-auto">
        <div className="h-1 bg-pearl-gold/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-pearl-gold to-pearl-gold-light rounded-full transition-all duration-[2000ms] ease-out"
            style={{ width: `${Math.min(20 + phase * 20, 95)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export function OnboardingPage() {
  const [step, setStep] = useState<Step>("name");
  const [formData, setFormData] = useState({
    displayName: "",
    birthDate: "",
    birthTime: "",
    birthTimeKnown: true,
    birthCity: "",
    birthCountry: "",
  });
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const saveOnboarding = useMutation(api.profiles.saveOnboarding);
  const generateFingerprint = useAction(api.pearl.generateCosmicFingerprint);

  const currentStepIndex = STEPS.indexOf(step);

  const handleNext = () => {
    setError("");
    const idx = STEPS.indexOf(step);
    if (idx < STEPS.length - 1) {
      setStep(STEPS[idx + 1]);
    }
  };

  const handleBack = () => {
    const idx = STEPS.indexOf(step);
    if (idx > 0) {
      setStep(STEPS[idx - 1]);
    }
  };

  const handleSubmit = async () => {
    setStep("generating");
    try {
      await saveOnboarding({
        displayName: formData.displayName,
        birthDate: formData.birthDate,
        birthTime: formData.birthTimeKnown ? formData.birthTime : undefined,
        birthTimeKnown: formData.birthTimeKnown,
        birthCity: formData.birthCity,
        birthCountry: formData.birthCountry,
      });
      await generateFingerprint();
      navigate("/reading");
    } catch (e: any) {
      setError(e.message || "Something went wrong");
      setStep("birthPlace");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 star-field relative">
      {/* Ambient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-pearl-gold/5 blur-[120px]" />
      </div>

      <div className="w-full max-w-md">
        {step !== "generating" && (
          <StepIndicator current={currentStepIndex} total={4} />
        )}

        {/* Step: Name */}
        {step === "name" && (
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <p className="text-sm text-pearl-gold tracking-[0.15em] uppercase font-body">
                Welcome, Seeker
              </p>
              <h1 className="text-3xl md:text-4xl font-heading text-pearl-warm">
                What shall I call you?
              </h1>
              <p className="text-pearl-muted font-body text-sm">
                The name you carry holds its own frequency
              </p>
            </div>
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Your name"
                value={formData.displayName}
                onChange={(e) =>
                  setFormData({ ...formData, displayName: e.target.value })
                }
                className="h-12 text-center bg-pearl-deep border-pearl-gold/15 text-pearl-warm placeholder:text-pearl-muted/50 font-body focus:border-pearl-gold/40 focus:ring-pearl-gold/20"
                autoFocus
              />
              <Button
                onClick={handleNext}
                disabled={!formData.displayName.trim()}
                className="w-full h-11 bg-pearl-gold hover:bg-pearl-gold-light text-pearl-void font-body rounded-full"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step: Birth Date */}
        {step === "birthDate" && (
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <p className="text-sm text-pearl-gold tracking-[0.15em] uppercase font-body">
                The Day You Arrived
              </p>
              <h1 className="text-3xl md:text-4xl font-heading text-pearl-warm">
                When were you born?
              </h1>
              <p className="text-pearl-muted font-body text-sm">
                The stars held a specific configuration for you
              </p>
            </div>
            <div className="space-y-4">
              <Input
                type="date"
                value={formData.birthDate}
                onChange={(e) =>
                  setFormData({ ...formData, birthDate: e.target.value })
                }
                className="h-12 text-center bg-pearl-deep border-pearl-gold/15 text-pearl-warm font-body focus:border-pearl-gold/40 focus:ring-pearl-gold/20 [color-scheme:dark]"
              />
              <div className="flex gap-3">
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="flex-1 h-11 border-pearl-gold/20 text-pearl-gold hover:bg-pearl-gold/5 rounded-full font-body"
                >
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!formData.birthDate}
                  className="flex-1 h-11 bg-pearl-gold hover:bg-pearl-gold-light text-pearl-void font-body rounded-full"
                >
                  Continue
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step: Birth Time */}
        {step === "birthTime" && (
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <p className="text-sm text-pearl-gold tracking-[0.15em] uppercase font-body">
                The Precise Moment
              </p>
              <h1 className="text-3xl md:text-4xl font-heading text-pearl-warm">
                What time were you born?
              </h1>
              <p className="text-pearl-muted font-body text-sm">
                This determines your rising sign and Human Design type
              </p>
            </div>
            <div className="space-y-4">
              {formData.birthTimeKnown ? (
                <Input
                  type="time"
                  value={formData.birthTime}
                  onChange={(e) =>
                    setFormData({ ...formData, birthTime: e.target.value })
                  }
                  className="h-12 text-center bg-pearl-deep border-pearl-gold/15 text-pearl-warm font-body focus:border-pearl-gold/40 focus:ring-pearl-gold/20 [color-scheme:dark]"
                />
              ) : (
                <div className="py-4 sacred-border rounded-xl px-4">
                  <p className="text-pearl-warm oracle-voice text-sm">
                    That's perfectly alright. Pearl will use the wisdom available
                    from your date and place of birth.
                  </p>
                </div>
              )}
              <button
                onClick={() =>
                  setFormData({
                    ...formData,
                    birthTimeKnown: !formData.birthTimeKnown,
                    birthTime: "",
                  })
                }
                className="text-sm text-pearl-gold/70 hover:text-pearl-gold underline font-body transition-colors"
              >
                {formData.birthTimeKnown
                  ? "I don't know my birth time"
                  : "I do know my birth time"}
              </button>
              <div className="flex gap-3">
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="flex-1 h-11 border-pearl-gold/20 text-pearl-gold hover:bg-pearl-gold/5 rounded-full font-body"
                >
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={formData.birthTimeKnown && !formData.birthTime}
                  className="flex-1 h-11 bg-pearl-gold hover:bg-pearl-gold-light text-pearl-void font-body rounded-full"
                >
                  Continue
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step: Birth Place */}
        {step === "birthPlace" && (
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <p className="text-sm text-pearl-gold tracking-[0.15em] uppercase font-body">
                Where It All Began
              </p>
              <h1 className="text-3xl md:text-4xl font-heading text-pearl-warm">
                Where were you born?
              </h1>
              <p className="text-pearl-muted font-body text-sm">
                The place of your arrival holds its own energy
              </p>
            </div>
            <div className="space-y-4">
              <div className="space-y-3">
                <Input
                  type="text"
                  placeholder="City (e.g., San Francisco)"
                  value={formData.birthCity}
                  onChange={(e) =>
                    setFormData({ ...formData, birthCity: e.target.value })
                  }
                  className="h-12 text-center bg-pearl-deep border-pearl-gold/15 text-pearl-warm placeholder:text-pearl-muted/50 font-body focus:border-pearl-gold/40 focus:ring-pearl-gold/20"
                />
                <Input
                  type="text"
                  placeholder="Country (e.g., United States)"
                  value={formData.birthCountry}
                  onChange={(e) =>
                    setFormData({ ...formData, birthCountry: e.target.value })
                  }
                  className="h-12 text-center bg-pearl-deep border-pearl-gold/15 text-pearl-warm placeholder:text-pearl-muted/50 font-body focus:border-pearl-gold/40 focus:ring-pearl-gold/20"
                />
              </div>
              {error && (
                <p className="text-sm text-red-400 bg-red-400/10 rounded-lg px-3 py-2 font-body">
                  {error}
                </p>
              )}
              <div className="flex gap-3">
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="flex-1 h-11 border-pearl-gold/20 text-pearl-gold hover:bg-pearl-gold/5 rounded-full font-body"
                >
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!formData.birthCity.trim() || !formData.birthCountry.trim()}
                  className="flex-1 h-11 bg-pearl-gold hover:bg-pearl-gold-light text-pearl-void font-body rounded-full"
                >
                  Reveal My Design ✦
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Generating */}
        {step === "generating" && (
          <GeneratingAnimation name={formData.displayName} />
        )}
      </div>
    </div>
  );
}
