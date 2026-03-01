import { ArrowLeft, Sparkles, Wrench, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  type ChangelogCategory,
  type ChangelogEntry,
  changelog,
} from "@/data/changelog";

/* ── helpers ─────────────────────────────────────────────────────────── */

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

/* Group entries by month+year for visual sections */
function groupByMonth(entries: ChangelogEntry[]) {
  const groups: { label: string; entries: ChangelogEntry[] }[] = [];
  let current: (typeof groups)[0] | null = null;

  for (const entry of entries) {
    const d = new Date(`${entry.date}T12:00:00`);
    const label = d.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    if (!current || current.label !== label) {
      current = { label, entries: [] };
      groups.push(current);
    }
    current.entries.push(entry);
  }
  return groups;
}

/* ── single entry ────────────────────────────────────────────────────── */

function Entry({ entry }: { entry: ChangelogEntry }) {
  const meta = categoryMeta(entry.category);
  const Icon = meta.icon;

  return (
    <div className="flex gap-4 py-4 group">
      {/* timeline dot */}
      <div className="flex flex-col items-center pt-1.5">
        <div className="size-2.5 rounded-full bg-pearl-gold/40 group-hover:bg-pearl-gold transition-colors" />
        <div className="w-px flex-1 bg-pearl-gold/10" />
      </div>

      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex flex-wrap items-center gap-2.5">
          <Badge
            variant="outline"
            className={`text-[10px] tracking-wide uppercase font-body px-1.5 py-0 ${meta.classes}`}
          >
            <Icon className="size-3 mr-0.5" />
            {meta.label}
          </Badge>
          <span className="text-xs text-pearl-muted font-body">
            {formatDate(entry.date)}
          </span>
        </div>

        <h3 className="text-base font-medium text-pearl-warm font-body leading-snug">
          {entry.title}
        </h3>
        <p className="text-sm text-pearl-muted font-body leading-relaxed max-w-2xl">
          {entry.description}
        </p>
      </div>
    </div>
  );
}

/* ── page ─────────────────────────────────────────────────────────────── */

const STORAGE_KEY = "pearl-whats-new-dismissed";

export default function ChangelogPage() {
  // Mark as seen when user visits the changelog
  try {
    if (changelog.length > 0) {
      localStorage.setItem(STORAGE_KEY, changelog[0].date);
    }
  } catch {
    /* no-op */
  }

  const groups = groupByMonth(changelog);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="text-pearl-muted hover:text-pearl-warm hover:bg-pearl-gold/5 font-body text-xs -ml-2"
        >
          <Link to="/dashboard">
            <ArrowLeft className="size-3.5 mr-1.5" />
            Back to Dashboard
          </Link>
        </Button>

        <div>
          <h1 className="text-2xl md:text-3xl font-heading text-pearl-warm tracking-wide">
            What's New
          </h1>
          <p className="text-sm text-pearl-muted font-body mt-1.5">
            The latest updates and improvements to Pearl.
          </p>
        </div>
      </div>

      {/* Entries grouped by month */}
      {groups.map((group) => (
        <div key={group.label}>
          <h2 className="text-sm font-body text-pearl-gold/70 uppercase tracking-[0.15em] mb-2 border-b border-pearl-gold/10 pb-2">
            {group.label}
          </h2>
          <div className="space-y-0">
            {group.entries.map((entry) => (
              <Entry key={`${entry.date}-${entry.title}`} entry={entry} />
            ))}
          </div>
        </div>
      ))}

      {changelog.length === 0 && (
        <p className="text-center text-pearl-muted font-body py-12">
          No updates yet — stay tuned!
        </p>
      )}
    </div>
  );
}
