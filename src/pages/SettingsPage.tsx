import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "../../convex/_generated/api";

export function SettingsPage() {
  const user = useQuery(api.auth.currentUser);
  const profile = useQuery(api.profiles.getUserProfile);
  const cosmic = useQuery(api.profiles.getCosmicProfile);
  const { signOut } = useAuthActions();

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-heading text-pearl-warm">Settings</h1>
        <p className="text-sm text-pearl-muted font-body mt-1">
          Your account and cosmic profile
        </p>
      </div>

      <Card className="bg-pearl-deep/80 border-pearl-gold/10">
        <CardHeader>
          <CardTitle className="font-heading text-pearl-warm">Profile</CardTitle>
          <CardDescription className="font-body text-pearl-muted">
            Your birth data and account details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-pearl-muted font-body">Name</span>
            <span className="text-sm text-pearl-warm font-body">{profile?.displayName || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-pearl-muted font-body">Email</span>
            <span className="text-sm text-pearl-warm font-body">{user?.email || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-pearl-muted font-body">Birth Date</span>
            <span className="text-sm text-pearl-warm font-body">{profile?.birthDate || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-pearl-muted font-body">Birth Time</span>
            <span className="text-sm text-pearl-warm font-body">{profile?.birthTime || "Unknown"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-pearl-muted font-body">Birth Place</span>
            <span className="text-sm text-pearl-warm font-body">
              {profile ? `${profile.birthCity}, ${profile.birthCountry}` : "—"}
            </span>
          </div>
        </CardContent>
      </Card>

      {cosmic && (
        <Card className="bg-pearl-deep/80 border-pearl-gold/10">
          <CardHeader>
            <CardTitle className="font-heading text-pearl-warm">Cosmic Design</CardTitle>
            <CardDescription className="font-body text-pearl-muted">
              Summary of your five-system profile
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-pearl-muted font-body">Sun / Moon / Rising</span>
              <span className="text-sm text-pearl-gold-light font-body">
                {cosmic.sunSign} / {cosmic.moonSign} / {cosmic.risingSign}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-pearl-muted font-body">Human Design</span>
              <span className="text-sm text-pearl-gold-light font-body">{cosmic.hdType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-pearl-muted font-body">Life Path</span>
              <span className="text-sm text-pearl-gold-light font-body">{cosmic.lifePathNumber}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-pearl-deep/80 border-pearl-gold/10">
        <CardHeader>
          <CardTitle className="font-heading text-pearl-warm">Account</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={() => signOut()}
            className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 font-body"
          >
            <LogOut className="size-4 mr-2" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
