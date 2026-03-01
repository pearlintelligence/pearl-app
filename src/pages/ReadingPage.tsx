import { useAction, useQuery } from "convex/react";
import { ArrowRight, Sparkles } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { api } from "../../convex/_generated/api";

/**
 * Split reading content into progressive sections by wisdom system.
 * Each section is separated by double newlines in the generated text.
 * Groups:
 *   1. Name + Intro (before the stars...)
 *   2. Human Design (life force / guide / initiator / mirror)
 *   3. Astrology (Sun, Moon, Rising + North Node + Saturn)
 *   4. Kabbalah (Tree of Life + soul urge)
 *   5. Numerology + Closing (Life Path + "Are you ready to live it?")
 */
function splitIntoSections(content: string): string[][] {
  const paragraphs = content.split(/\n\n+/).filter((p) => p.trim());
  if (paragraphs.length <= 5) {
    return paragraphs.map((p) => [p]);
  }

  // Group paragraphs into 5 sections based on content structure
  const sections: string[][] = [];
  sections.push(paragraphs.slice(0, 2));        // Name + Intro
  sections.push(paragraphs.slice(2, 3));         // Human Design
  sections.push(paragraphs.slice(3, 6));         // Astrology (3 paragraphs)
  sections.push(paragraphs.slice(6, 7));         // Kabbalah
  sections.push(paragraphs.slice(7));            // Numerology + Closing

  return sections.filter((s) => s.length > 0);
}

/** Detect the whisper line */
function isWhisperLine(text: string): boolean {
  return text.trim() === "Are you ready to live it?";
}

/** Render a paragraph, applying italic whisper style to the key line */
function ReadingParagraph({ text }: { text: string }) {
  if (isWhisperLine(text)) {
    return (
      <p className="oracle-whisper text-lg md:text-xl text-pearl-gold/90 text-center my-8">
        {text}
      </p>
    );
  }
  return <p className="mb-8">{text}</p>;
}

export function ReadingPage() {
  const reading = useQuery(api.readings.getLatestReading, { type: "life_purpose" });
  const generateReading = useAction(api.pearl.generateLifePurposeReading);
  const [generating, setGenerating] = useState(false);
  const [revealedSections, setRevealedSections] = useState<Set<number>>(new Set());
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Auto-generate reading if none exists
  useEffect(() => {
    if (reading === null && !generating) {
      setGenerating(true);
      generateReading()
        .catch(console.error)
        .finally(() => setGenerating(false));
    }
  }, [reading, generating, generateReading]);

  // Intersection Observer for progressive reveal
  const observerCallback = useCallback((entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const index = Number(entry.target.getAttribute("data-section-index"));
        if (!isNaN(index)) {
          setRevealedSections((prev) => new Set([...prev, index]));
        }
      }
    });
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.15,
      rootMargin: "0px 0px -40px 0px",
    });

    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [reading?.content, observerCallback]);

  // Reveal first section immediately after a brief pause
  useEffect(() => {
    if (reading?.content) {
      const timer = setTimeout(() => {
        setRevealedSections(new Set([0]));
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [reading?.content]);

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

  const sections = splitIntoSections(reading.content);

  return (
    <div className="min-h-screen flex flex-col star-field relative">
      {/* Ambient glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-pearl-gold/3 blur-[150px]" />
      </div>

      <div className="flex-1 flex flex-col items-center px-6 py-16 md:py-24">
        <div className="w-full max-w-[640px] mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
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

          {/* Reading content — no card, words float on darkness */}
          <div className="oracle-voice text-base md:text-lg text-pearl-warm/90 leading-relaxed">
            {sections.map((paragraphs, sectionIdx) => (
              <div key={sectionIdx}>
                <div
                  ref={(el) => { sectionRefs.current[sectionIdx] = el; }}
                  data-section-index={sectionIdx}
                  className={`reading-section${revealedSections.has(sectionIdx) ? " revealed" : ""}`}
                >
                  {paragraphs.map((paragraph, pIdx) => (
                    <ReadingParagraph key={pIdx} text={paragraph} />
                  ))}
                </div>

                {/* Thin centered rule between sections + scroll prompt */}
                {sectionIdx < sections.length - 1 && (
                  <div className={`my-12 flex flex-col items-center gap-3 reading-section${revealedSections.has(sectionIdx) ? " revealed" : ""}`}>
                    <div className="sacred-rule" />
                    {!revealedSections.has(sectionIdx + 1) && (
                      <p className="text-xs text-pearl-muted/50 font-body tracking-widest uppercase animate-pulse">
                        ↓
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA — only after all sections revealed */}
          {revealedSections.size >= sections.length && (
            <div className="text-center mt-16 space-y-4 animate-in fade-in duration-1000">
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
