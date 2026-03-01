import {
  CreditCard,
  DollarSign,
  Package,
  Receipt,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";

export function BillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading text-pearl-warm">Billing</h1>
        <p className="text-pearl-muted font-body text-sm mt-1">
          Manage subscriptions, revenue, and payment settings
        </p>
      </div>

      {/* Current Plan */}
      <Card className="bg-pearl-deep border-pearl-gold/20 ring-1 ring-pearl-gold/10">
        <CardHeader>
          <CardTitle className="text-sm font-body text-pearl-muted font-normal flex items-center gap-2">
            <Package className="size-4 text-pearl-gold" />
            Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-heading text-pearl-warm">Launch Phase</h2>
                <Badge className="bg-pearl-gold/15 text-pearl-gold border-pearl-gold/20">
                  Active
                </Badge>
              </div>
              <p className="text-pearl-muted font-body text-sm mt-1">
                Free tier — building community before monetization
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-heading text-pearl-gold">$0</div>
              <p className="text-xs text-pearl-muted font-body">per month</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue / Cost Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-pearl-deep border-pearl-gold/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-pearl-gold/10">
              <DollarSign className="size-5 text-pearl-gold" />
            </div>
            <div>
              <p className="text-2xl font-heading text-pearl-warm">$0</p>
              <p className="text-xs text-pearl-muted font-body">Monthly Revenue</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-pearl-deep border-pearl-gold/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <Zap className="size-5 text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-heading text-pearl-warm">—</p>
              <p className="text-xs text-pearl-muted font-body">API Costs (AI)</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-pearl-deep border-pearl-gold/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <TrendingUp className="size-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-heading text-pearl-warm">—</p>
              <p className="text-xs text-pearl-muted font-body">MRR Growth</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Future Pricing Tiers */}
      <Card className="bg-pearl-deep border-pearl-gold/10">
        <CardHeader>
          <CardTitle className="text-sm font-body text-pearl-muted font-normal flex items-center gap-2">
            <CreditCard className="size-4" />
            Planned Pricing Tiers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="p-4 rounded-lg bg-pearl-surface/50 border border-pearl-gold/10">
              <h3 className="font-heading text-pearl-warm">Free</h3>
              <p className="text-2xl font-heading text-pearl-muted mt-1">$0</p>
              <ul className="mt-3 space-y-1.5 text-sm text-pearl-muted font-body">
                <li>• Basic cosmic profile</li>
                <li>• 1 reading per week</li>
                <li>• 5 Oracle messages/day</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg bg-pearl-surface/50 border border-pearl-gold/20 ring-1 ring-pearl-gold/10">
              <h3 className="font-heading text-pearl-gold">Premium</h3>
              <p className="text-2xl font-heading text-pearl-gold mt-1">TBD</p>
              <ul className="mt-3 space-y-1.5 text-sm text-pearl-muted font-body">
                <li>• Full 5-system profile</li>
                <li>• Unlimited readings</li>
                <li>• Unlimited Oracle</li>
                <li>• Daily briefs</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg bg-pearl-surface/50 border border-pearl-gold/10">
              <h3 className="font-heading text-pearl-warm">Enterprise</h3>
              <p className="text-2xl font-heading text-pearl-muted mt-1">TBD</p>
              <ul className="mt-3 space-y-1.5 text-sm text-pearl-muted font-body">
                <li>• Team compatibility</li>
                <li>• API access</li>
                <li>• Custom integrations</li>
                <li>• Priority support</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Integration */}
      <Card className="bg-pearl-deep border-pearl-gold/10">
        <CardHeader>
          <CardTitle className="text-sm font-body text-pearl-muted font-normal flex items-center gap-2">
            <Receipt className="size-4" />
            Payment Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 space-y-3">
            <div className="p-3 rounded-full bg-pearl-gold/10 inline-block">
              <CreditCard className="size-8 text-pearl-gold/50" />
            </div>
            <p className="text-pearl-muted font-body">
              Stripe integration not yet configured
            </p>
            <p className="text-pearl-muted/60 font-body text-sm">
              Connect Stripe to start accepting payments
            </p>
            <Button
              disabled
              className="bg-pearl-gold/50 text-pearl-void font-body cursor-not-allowed"
            >
              Connect Stripe (Coming Soon)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
