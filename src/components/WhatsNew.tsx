import { ChevronDown, ChevronUp, Megaphone, Sparkles, Wrench, X, Zap } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  type ChangelogCategory,
  type ChangelogEntry,
  changelog,
} from "@/data/changelog";

/* ── helpers ─────────────────────────────────────────────────────────── */

const COLLAPSED_COUNT = 3; // entries visible when collapsed

function categoryMeta(cat: ChangelogCategory) {
  switch (cat) {
    case "new":
      return {
        label: "New",
        icon: Sparkles,
        classes: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
      };
    case "improved":
      return {
        label: "Improved",
        icon: Zap,
        classes: "bg-pearl-gold/15 text-pearl-gold border-pearl-gold/20",
      };
    case "fixed":
      return {
        label: "Fixed",
        icon: Wrench,
        classes: "bg-sky-500/15 text-sky-400 border-sky-500/20",
      };
  }
}

function formatDate(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/* ── single entry ────────────────────────────────────────────────────── */

function Entry({ entry }: { entry: ChangelogEntry }) {
  const meta = categoryMeta(entry.category);
  const Icon = meta.icon;

  return (
    <div className="flex gap-3 py-3 group">
      {/* timeline dot */}
      <div className="flex flex-col items-center pt-1">
        <div className="size-2 rounded-full bg-pearl-gold/40 group-hover:bg-pearl-gold transition-colors" />
        <div className="w-px flex-1 bg-pearl-gold/10" />
      </div>

      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className={`text-[10px] tracking-wide uppercase font-body px-1.5 py-0 ${meta.classes}`}
          >
            <Icon className="size-3 mr-0.5" />
            {meta.label}
          </Badge>
          <span className="text-[11px] text-pearl-muted font-body">
            {formatDate(entry.date)}
          </span>
        </div>

        <h4 className="text-sm font-medium text-pearl-warm font-body leading-snug">
          {entry.title}
        </h4>
        <p className="text-xs text-pearl-muted font-body leading-relaxed">
          {entry.description}
        </p>
      </div>
    </div>
  );
}

/* ── main component ──────────────────────────────────────────────────── */

const STORAGE_KEY = "pearl-whats-new-dismissed";

export function WhatsNew() {
  const [dismissed, setDismissed] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored || !changelog.length) return false;
      // Re-show when there's a newer entry than the one they last dismissed
      return stored >= changelog[0].date;
    } catch {
      return false;
    }
  });

  const [expanded, setExpanded] = useState(false);

  if (dismissed || changelog.length === 0) return null;

  const visible = expanded ? changelog : changelog.slice(0, COLLAPSED_COUNT);
  const hasMore = changelog.length > COLLAPSED_COUNT;

  function handleDismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, changelog[0].date);
    } catch {
      /* no-op */
    }
    setDismissed(true);
  }

  return (
    <Card className="bg-pearl-deep/80 border-pearl-gold/15 relative overflow-hidden">
      {/* subtle accent gradient */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-pearl-gold/40 to-transparent" />

      <CardContent className="p-5">
        {/* header row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <Megaphone className="size-4 text-pearl-gold" />
            <h3 className="font-heading text-base font-medium text-pearl-warm tracking-wide">
              What's New
            </h3>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="size-7 text-pearl-muted hover:text-pearl-warm hover:bg-pearl-gold/10 rounded-full"
            onClick={handleDismiss}
            aria-label="Dismiss changelog"
          >
            <X className="size-3.5" />
          </Button>
        </div>

        {/* entries */}
        <div className="space-y-0">
          {visible.map((entry) => (
            <Entry key={`${entry.date}-${entry.title}`} entry={entry} />
          ))}
        </div>

        {/* expand / collapse toggle */}
        {hasMore && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-1 text-pearl-gold hover:text-pearl-gold-light hover:bg-pearl-gold/5 font-body text-xs rounded-full"
            onClick={() => setExpanded((e) => !e)}
          >
            {expanded ? (
              <>
                Show less <ChevronUp className="size-3 ml-1" />
              </>
            ) : (
              <>
                View all updates ({changelog.length}){" "}
                <ChevronDown className="size-3 ml-1" />
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
