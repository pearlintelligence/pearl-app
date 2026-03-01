import { useQuery } from "convex/react";
import {
  Activity,
  Flag,
  MessageCircle,
  ScrollText,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accent = false,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: boolean;
}) {
  return (
    <Card className={`bg-pearl-deep border-pearl-gold/10 ${accent ? "ring-1 ring-pearl-gold/20" : ""}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-body text-pearl-muted font-normal">
          {title}
        </CardTitle>
        <Icon className={`size-4 ${accent ? "text-pearl-gold" : "text-pearl-muted"}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-heading font-semibold ${accent ? "text-pearl-gold" : "text-pearl-warm"}`}>
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-pearl-muted mt-1 font-body">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

export function AdminDashboardPage() {
  const stats = useQuery(api.admin.getDashboardStats);

  if (!stats) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-heading text-pearl-warm">Admin Dashboard</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="bg-pearl-deep border-pearl-gold/10">
              <CardContent className="p-6">
                <div className="h-16 shimmer rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading text-pearl-warm">Admin Dashboard</h1>
        <p className="text-pearl-muted font-body text-sm mt-1">
          Platform overview and key metrics
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          subtitle={`+${stats.last7Days.newUsers} this week`}
          icon={Users}
          accent
        />
        <StatCard
          title="Onboarding Rate"
          value={`${stats.onboardingRate}%`}
          subtitle={`${stats.completedOnboarding} completed`}
          icon={TrendingUp}
        />
        <StatCard
          title="Cosmic Profiles"
          value={stats.cosmicProfilesGenerated}
          subtitle="Full profiles generated"
          icon={Sparkles}
        />
        <StatCard
          title="Feature Flags"
          value={`${stats.activeFlags}/${stats.totalFlags}`}
          subtitle="Active flags"
          icon={Flag}
        />
      </div>

      {/* Engagement */}
      <div>
        <h2 className="text-lg font-heading text-pearl-warm mb-3">Engagement</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Total Readings"
            value={stats.totalReadings}
            subtitle={`+${stats.last7Days.readings} this week`}
            icon={ScrollText}
          />
          <StatCard
            title="Oracle Conversations"
            value={stats.totalConversations}
            subtitle={`+${stats.last7Days.conversations} this week`}
            icon={MessageCircle}
          />
          <StatCard
            title="Total Messages"
            value={stats.totalMessages}
            subtitle="Oracle chat messages"
            icon={Activity}
          />
        </div>
      </div>

      {/* Last 24h */}
      <div>
        <h2 className="text-lg font-heading text-pearl-warm mb-3">Last 24 Hours</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="bg-pearl-deep border-pearl-gold/10">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-heading text-pearl-gold">{stats.last24h.newUsers}</div>
              <p className="text-xs text-pearl-muted font-body mt-1">New signups</p>
            </CardContent>
          </Card>
          <Card className="bg-pearl-deep border-pearl-gold/10">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-heading text-pearl-warm">{stats.last24h.readings}</div>
              <p className="text-xs text-pearl-muted font-body mt-1">Readings generated</p>
            </CardContent>
          </Card>
          <Card className="bg-pearl-deep border-pearl-gold/10">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-heading text-pearl-warm">{stats.last24h.conversations}</div>
              <p className="text-xs text-pearl-muted font-body mt-1">Oracle conversations</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
