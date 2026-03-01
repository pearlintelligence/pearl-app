import { useQuery } from "convex/react";
import { BarChart3, MessageCircle, ScrollText, Users } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

function MiniBarChart({
  data,
  label,
  color = "pearl-gold",
}: {
  data: { date: string; count: number }[];
  label: string;
  color?: string;
}) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="space-y-2">
      <div className="flex items-end gap-[2px] h-24">
        {data.map((d, i) => {
          const height = Math.max((d.count / maxCount) * 100, 2);
          return (
            <div
              key={i}
              className="flex-1 group relative"
              title={`${d.date}: ${d.count}`}
            >
              <div
                className={`w-full rounded-t transition-all ${
                  color === "pearl-gold"
                    ? "bg-pearl-gold/60 group-hover:bg-pearl-gold"
                    : color === "green"
                      ? "bg-green-500/60 group-hover:bg-green-500"
                      : "bg-purple-500/60 group-hover:bg-purple-500"
                }`}
                style={{ height: `${height}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] text-pearl-muted font-body">
        <span>{data[0]?.date.slice(5)}</span>
        <span className="font-medium">{label}</span>
        <span>{data[data.length - 1]?.date.slice(5)}</span>
      </div>
    </div>
  );
}

function ReadingTypeBreakdown({
  types,
}: {
  types: { type: string; count: number }[];
}) {
  const total = types.reduce((sum, t) => sum + t.count, 0);
  const colors = [
    "bg-pearl-gold",
    "bg-green-500",
    "bg-purple-500",
    "bg-blue-500",
    "bg-orange-500",
  ];

  const typeLabels: Record<string, string> = {
    life_purpose: "Life Purpose",
    daily_brief: "Daily Brief",
    weekly: "Weekly",
    transit: "Transit",
  };

  return (
    <div className="space-y-3">
      {/* Bar */}
      <div className="flex h-3 rounded-full overflow-hidden bg-pearl-surface">
        {types.map((t, i) => (
          <div
            key={t.type}
            className={`${colors[i % colors.length]} transition-all`}
            style={{ width: `${(t.count / total) * 100}%` }}
          />
        ))}
      </div>
      {/* Legend */}
      <div className="grid grid-cols-2 gap-2">
        {types.map((t, i) => (
          <div key={t.type} className="flex items-center gap-2">
            <div className={`size-2.5 rounded-full ${colors[i % colors.length]}`} />
            <span className="text-sm font-body text-pearl-muted">
              {typeLabels[t.type] || t.type}
            </span>
            <span className="text-sm font-body text-pearl-warm ml-auto">{t.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AnalyticsPage() {
  const analytics = useQuery(api.admin.getAnalytics);
  const stats = useQuery(api.admin.getDashboardStats);

  if (!analytics || !stats) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-heading text-pearl-warm">Analytics</h1>
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="bg-pearl-deep border-pearl-gold/10">
              <CardContent className="p-6">
                <div className="h-32 shimmer rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const totalSignups30d = analytics.dailySignups.reduce(
    (sum, d) => sum + d.count,
    0
  );
  const totalReadings30d = analytics.dailyReadings.reduce(
    (sum, d) => sum + d.count,
    0
  );
  const totalConversations30d = analytics.dailyConversations.reduce(
    (sum, d) => sum + d.count,
    0
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading text-pearl-warm">Analytics</h1>
        <p className="text-pearl-muted font-body text-sm mt-1">
          Platform activity over the last 30 days
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Signups Chart */}
        <Card className="bg-pearl-deep border-pearl-gold/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-body text-pearl-muted font-normal flex items-center gap-2">
              <Users className="size-4" />
              User Signups
            </CardTitle>
            <span className="text-xl font-heading text-pearl-gold">
              {totalSignups30d}
            </span>
          </CardHeader>
          <CardContent>
            <MiniBarChart
              data={analytics.dailySignups}
              label="Last 30 days"
              color="pearl-gold"
            />
          </CardContent>
        </Card>

        {/* Readings Chart */}
        <Card className="bg-pearl-deep border-pearl-gold/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-body text-pearl-muted font-normal flex items-center gap-2">
              <ScrollText className="size-4" />
              Readings Generated
            </CardTitle>
            <span className="text-xl font-heading text-green-400">
              {totalReadings30d}
            </span>
          </CardHeader>
          <CardContent>
            <MiniBarChart
              data={analytics.dailyReadings}
              label="Last 30 days"
              color="green"
            />
          </CardContent>
        </Card>

        {/* Conversations Chart */}
        <Card className="bg-pearl-deep border-pearl-gold/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-body text-pearl-muted font-normal flex items-center gap-2">
              <MessageCircle className="size-4" />
              Oracle Conversations
            </CardTitle>
            <span className="text-xl font-heading text-purple-400">
              {totalConversations30d}
            </span>
          </CardHeader>
          <CardContent>
            <MiniBarChart
              data={analytics.dailyConversations}
              label="Last 30 days"
              color="purple"
            />
          </CardContent>
        </Card>

        {/* Reading Type Breakdown */}
        <Card className="bg-pearl-deep border-pearl-gold/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-body text-pearl-muted font-normal flex items-center gap-2">
              <BarChart3 className="size-4" />
              Reading Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.readingTypes.length > 0 ? (
              <ReadingTypeBreakdown types={analytics.readingTypes} />
            ) : (
              <div className="text-center py-6">
                <p className="text-pearl-muted font-body text-sm">
                  No readings generated yet
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
