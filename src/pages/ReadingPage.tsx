import { useAction, useQuery } from "convex/react";
import { ArrowRight, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { api } from "../../convex/_generated/api";

export function ReadingPage() {
  const reading = useQuery(api.readings.getLatestReading, { type: "life_purpose" });
  const generateReading = useAction(api.pearl.generateLifePurposeReading);
  const [generating, setGenerating] = useState(false);
  const [displayText, setDisplayText] = useState("");
  const [isRevealing, setIsRevealing] = useState(false);

  // Auto-generate reading if none exists
  useEffect(() => {
    if (reading === null && !generating) {
      setGenerating(true);
      generateReading()
        .catch(console.error)
        .finally(() => setGenerating(false));
    }
  }, [reading, generating, generateReading]);

  // Typewriter reveal effect
  useEffect(() => {
    if (reading?.content && !isRevealing && displayText === "") {
      setIsRevealing(true);
      const text = reading.content;
      let i = 0;
      const interval = setInterval(() => {
        if (i < text.length) {
          setDisplayText(text.slice(0, i + 1));
          i++;
        } else {
          clearInterval(interval);
          setIsRevealing(false);
        }
      }, 15);
      return () => clearInterval(interval);
    }
  }, [reading?.content, isRevealing, displayText]);

  if (!reading && !generating) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 star-field">
        <div className="text-center space-y-4">
          <div className="size-16 rounded-full bg-pearl-gold/10 flex items-center justify-center mx-auto">
            <Sparkles className="size-7 text-pearl-gold" />
          </div>
          <h1 className="text-2xl font-heading text-pearl-warm">
            Preparing Your Reading
          </h1>
          <p className="text-pearl-muted font-body text-sm">
            Pearl is weaving the threads of your design...
          </p>
        </div>
      </div>
    );
  }

  if (generating || !reading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 star-field">
        <div className="text-center space-y-6">
          <div className="relative size-24 mx-auto">
            <div className="absolute inset-0 rounded-full bg-pearl-gold/10 blur-2xl scale-150 sacred-breathe" />
            <div className="absolute inset-0 rounded-full border border-pearl-gold/25 animate-spin" style={{ animationDuration: "8s" }} />
            <div className="absolute inset-[30%] rounded-full bg-pearl-gold/20 blur-sm animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-heading text-pearl-warm mb-2">
              Pearl is reading the stars...
            </h2>
            <p className="text-pearl-muted font-body text-sm">
              Synthesizing five ancient systems into your life purpose
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col star-field relative">
      {/* Ambient glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-pearl-gold/3 blur-[150px]" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 md:py-24">
        <div className="max-w-2xl w-full mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <p className="text-sm text-pearl-gold tracking-[0.2em] uppercase font-body mb-3">
              ✦ Your First Reading ✦
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading text-pearl-warm mb-2">
              Why Am I Here?
            </h1>
            <div className="flex items-center justify-center gap-3 mt-4">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-pearl-gold/30" />
              <div className="size-1.5 rounded-full bg-pearl-gold/40" />
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-pearl-gold/30" />
            </div>
          </div>

          {/* Reading content */}
          <div className="sacred-border rounded-2xl p-6 md:p-10 pearl-glow">
            <div className="oracle-voice text-base md:text-lg text-pearl-warm/90 whitespace-pre-line leading-relaxed">
              {displayText || reading.content}
              {isRevealing && (
                <span className="inline-block w-0.5 h-5 bg-pearl-gold/60 ml-0.5 animate-pulse" />
              )}
            </div>
          </div>

          {/* CTA */}
          {!isRevealing && (
            <div className="text-center mt-10 space-y-4 animate-in fade-in duration-1000">
              <Button
                className="bg-pearl-gold hover:bg-pearl-gold-light text-pearl-void rounded-full px-8 h-12 font-body"
                asChild
              >
                <Link to="/dashboard">
                  View Your Full Cosmic Fingerprint
                  <ArrowRight className="size-4 ml-1" />
                </Link>
              </Button>
              <p className="text-xs text-pearl-muted font-body">
                Your complete five-system profile awaits
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
