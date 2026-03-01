import * as Sentry from "@sentry/react";

/**
 * Initialize Sentry error tracking & performance monitoring.
 * Call this BEFORE React renders (in main.tsx).
 */
export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;

  if (!dsn) {
    console.warn("⚠️ Sentry DSN not configured — error tracking disabled");
    return;
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE, // "development" | "production"

    // Performance monitoring — 100% in dev, 20% in production
    tracesSampleRate: import.meta.env.DEV ? 1.0 : 0.2,

    // Session replay — capture 10% of sessions, 100% on error
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
      Sentry.httpClientIntegration(),
    ],

    // Don't send PII by default
    sendDefaultPii: false,

    // Filter out noisy errors
    beforeSend(event) {
      // Ignore ResizeObserver errors (browser noise)
      if (event.exception?.values?.[0]?.value?.includes("ResizeObserver")) {
        return null;
      }
      return event;
    },

    // Set release for source map matching
    release: `pearl-app@${import.meta.env.VITE_VERCEL_GIT_COMMIT_SHA ?? "dev"}`,
  });

  console.log("✦ Sentry initialized —", import.meta.env.MODE);
}

/**
 * Set user context after authentication
 */
export function setSentryUser(id: string, name?: string, email?: string) {
  Sentry.setUser({ id, username: name, email });
}

/**
 * Clear user context on logout
 */
export function clearSentryUser() {
  Sentry.setUser(null);
}

/**
 * Capture a non-fatal error with optional context
 */
export function captureError(error: Error, context?: Record<string, unknown>) {
  Sentry.captureException(error, { extra: context });
}

/**
 * Capture a message (for important events that aren't errors)
 */
export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = "info",
) {
  Sentry.captureMessage(message, level);
}

/**
 * Add a breadcrumb for debugging
 */
export function addBreadcrumb(
  category: string,
  message: string,
  data?: Record<string, unknown>,
) {
  Sentry.addBreadcrumb({ category, message, data, level: "info" });
}

// Re-export ErrorBoundary for use in App
export const SentryErrorBoundary = Sentry.ErrorBoundary;
