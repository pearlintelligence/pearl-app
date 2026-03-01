import { Megaphone } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { changelog } from "@/data/changelog";

const STORAGE_KEY = "pearl-whats-new-dismissed";

/**
 * A compact "What's New" button for the dashboard header.
 * Shows a gold dot indicator when there are unseen updates.
 * Links to /changelog.
 */
export function WhatsNewButton() {
  const [hasNew] = useState(() => {
    try {
      if (!changelog.length) return false;
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return true; // never viewed
      return changelog[0].date > stored; // newer entries exist
    } catch {
      return false;
    }
  });

  if (changelog.length === 0) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      asChild
      className="text-pearl-muted hover:text-pearl-gold hover:bg-pearl-gold/5 font-body text-xs rounded-full gap-1.5 relative"
    >
      <Link to="/changelog">
        <Megaphone className="size-3.5" />
        <span>What's New</span>
        {hasNew && (
          <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-pearl-gold animate-pulse" />
        )}
      </Link>
    </Button>
  );
}
