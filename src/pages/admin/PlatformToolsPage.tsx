import { useQuery } from "convex/react";
import {
  Database,
  Globe,
  RefreshCw,
  Server,
  Shield,
  Terminal,
  Wrench,
} from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

function SystemStatusCard({
  name,
  status,
  icon: Icon,
  details,
}: {
  name: string;
  status: "healthy" | "degraded" | "down";
  icon: React.ComponentType<{ className?: string }>;
  details: string;
}) {
  const statusColors = {
    healthy: "bg-green-500/15 text-green-400 border-green-500/20",
    degraded: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
    down: "bg-red-500/15 text-red-400 border-red-500/20",
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-pearl-surface/30">
      <div className="flex items-center gap-3">
        <Icon className="size-4 text-pearl-muted" />
        <div>
          <p className="text-sm font-body text-pearl-warm">{name}</p>
          <p className="text-xs font-body text-pearl-muted">{details}</p>
        </div>
      </div>
      <Badge className={statusColors[status]}>{status}</Badge>
    </div>
  );
}

export function PlatformToolsPage() {
  const stats = useQuery(api.admin.getDashboardStats);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading text-pearl-warm">Platform Tools</h1>
        <p className="text-pearl-muted font-body text-sm mt-1">
          System health, database tools, and admin utilities
        </p>
      </div>

      {/* System Status */}
      <Card className="bg-pearl-deep border-pearl-gold/10">
        <CardHeader>
          <CardTitle className="text-sm font-body text-pearl-muted font-normal flex items-center gap-2">
            <Server className="size-4" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <SystemStatusCard
            name="Convex Database"
            status="healthy"
            icon={Database}
            details="Real-time backend running"
          />
          <SystemStatusCard
            name="Authentication"
            status="healthy"
            icon={Shield}
            details="Email/password auth active"
          />
          <SystemStatusCard
            name="AI Oracle"
            status="healthy"
            icon={Terminal}
            details="Viktor Tools gateway connected"
          />
          <SystemStatusCard
            name="Frontend (Vercel)"
            status="healthy"
            icon={Globe}
            details="app.innerpearl.ai"
          />
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-pearl-deep border-pearl-gold/10">
        <CardHeader>
          <CardTitle className="text-sm font-body text-pearl-muted font-normal flex items-center gap-2">
            <Wrench className="size-4" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              variant="outline"
              className="justify-start border-pearl-gold/15 text-pearl-warm font-body h-auto py-3"
              onClick={() =>
                window.open(
                  "https://dashboard.convex.dev",
                  "_blank"
                )
              }
            >
              <Database className="size-4 mr-2 text-pearl-gold" />
              <div className="text-left">
                <div className="text-sm">Convex Dashboard</div>
                <div className="text-xs text-pearl-muted">
                  View database, logs, functions
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="justify-start border-pearl-gold/15 text-pearl-warm font-body h-auto py-3"
              onClick={() =>
                window.open("https://vercel.com/pearl-intelligence", "_blank")
              }
            >
              <Globe className="size-4 mr-2 text-pearl-gold" />
              <div className="text-left">
                <div className="text-sm">Vercel Dashboard</div>
                <div className="text-xs text-pearl-muted">
                  Deployments, domains, analytics
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="justify-start border-pearl-gold/15 text-pearl-warm font-body h-auto py-3"
              onClick={() =>
                window.open(
                  "https://github.com/pearlintelligence/innerpearl",
                  "_blank"
                )
              }
            >
              <Terminal className="size-4 mr-2 text-pearl-gold" />
              <div className="text-left">
                <div className="text-sm">GitHub Repository</div>
                <div className="text-xs text-pearl-muted">
                  Source code, issues, PRs
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="justify-start border-pearl-gold/15 text-pearl-warm font-body h-auto py-3"
              disabled
            >
              <RefreshCw className="size-4 mr-2 text-pearl-muted" />
              <div className="text-left">
                <div className="text-sm text-pearl-muted">Run Cleanup</div>
                <div className="text-xs text-pearl-muted/60">
                  Remove orphaned data (coming soon)
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Database Stats */}
      <Card className="bg-pearl-deep border-pearl-gold/10">
        <CardHeader>
          <CardTitle className="text-sm font-body text-pearl-muted font-normal flex items-center gap-2">
            <Database className="size-4" />
            Database Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center p-3 rounded-lg bg-pearl-surface/30">
                <p className="text-2xl font-heading text-pearl-warm">{stats.totalUsers}</p>
                <p className="text-xs text-pearl-muted font-body">Users</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-pearl-surface/30">
                <p className="text-2xl font-heading text-pearl-warm">
                  {stats.cosmicProfilesGenerated}
                </p>
                <p className="text-xs text-pearl-muted font-body">Cosmic Profiles</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-pearl-surface/30">
                <p className="text-2xl font-heading text-pearl-warm">{stats.totalReadings}</p>
                <p className="text-xs text-pearl-muted font-body">Readings</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-pearl-surface/30">
                <p className="text-2xl font-heading text-pearl-warm">{stats.totalMessages}</p>
                <p className="text-xs text-pearl-muted font-body">Messages</p>
              </div>
            </div>
          ) : (
            <div className="h-20 shimmer rounded" />
          )}
        </CardContent>
      </Card>

      {/* Environment Info */}
      <Card className="bg-pearl-deep border-pearl-gold/10">
        <CardHeader>
          <CardTitle className="text-sm font-body text-pearl-muted font-normal flex items-center gap-2">
            <Shield className="size-4" />
            Environment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 font-mono text-sm">
            <div className="flex justify-between p-2 rounded bg-pearl-surface/30">
              <span className="text-pearl-muted">Domain</span>
              <span className="text-pearl-warm">app.innerpearl.ai</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-pearl-surface/30">
              <span className="text-pearl-muted">Database</span>
              <span className="text-pearl-warm">Convex (Production)</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-pearl-surface/30">
              <span className="text-pearl-muted">Hosting</span>
              <span className="text-pearl-warm">Vercel (Pro)</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-pearl-surface/30">
              <span className="text-pearl-muted">Admin Domain</span>
              <span className="text-pearl-gold">@innerpearl.ai</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
