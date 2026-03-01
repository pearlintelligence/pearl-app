import { useMutation, useQuery } from "convex/react";
import {
  Crown,
  Search,
  Sparkles,
  Trash2,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { toast } from "sonner";

export function UserManagementPage() {
  const users = useQuery(api.admin.listUsers);
  const deleteUser = useMutation(api.admin.deleteUser);
  const [search, setSearch] = useState("");

  const filteredUsers = users?.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      (u.birthCity?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  const handleDelete = async (userId: Id<"users">, email: string) => {
    if (
      !confirm(
        `Delete user "${email}" and ALL their data?\n\nThis will remove their profile, readings, conversations, and cosmic profile. This cannot be undone.`
      )
    )
      return;
    try {
      await deleteUser({ userId });
      toast.success(`User ${email} deleted`);
    } catch (e: any) {
      toast.error(e.message || "Failed to delete user");
    }
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading text-pearl-warm">User Management</h1>
        <p className="text-pearl-muted font-body text-sm mt-1">
          View and manage all platform users
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-pearl-deep border-pearl-gold/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-pearl-gold/10">
              <Users className="size-5 text-pearl-gold" />
            </div>
            <div>
              <p className="text-2xl font-heading text-pearl-warm">{users?.length ?? "—"}</p>
              <p className="text-xs text-pearl-muted font-body">Total Users</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-pearl-deep border-pearl-gold/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <UserCheck className="size-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-heading text-pearl-warm">
                {users?.filter((u) => u.onboardingComplete).length ?? "—"}
              </p>
              <p className="text-xs text-pearl-muted font-body">Onboarded</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-pearl-deep border-pearl-gold/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Sparkles className="size-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-heading text-pearl-warm">
                {users?.filter((u) => u.hasCosmic).length ?? "—"}
              </p>
              <p className="text-xs text-pearl-muted font-body">Cosmic Profiles</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search + Table */}
      <Card className="bg-pearl-deep border-pearl-gold/10">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-pearl-muted" />
              <Input
                placeholder="Search by name, email, or city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-pearl-surface border-pearl-gold/15 text-pearl-warm font-body"
              />
            </div>
            <CardTitle className="text-sm font-body text-pearl-muted font-normal">
              {filteredUsers?.length ?? 0} user{filteredUsers?.length !== 1 ? "s" : ""}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {!users ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 shimmer rounded" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-pearl-gold/10 hover:bg-transparent">
                    <TableHead className="text-pearl-muted font-body">User</TableHead>
                    <TableHead className="text-pearl-muted font-body hidden md:table-cell">Status</TableHead>
                    <TableHead className="text-pearl-muted font-body hidden lg:table-cell">Sign</TableHead>
                    <TableHead className="text-pearl-muted font-body hidden lg:table-cell">Location</TableHead>
                    <TableHead className="text-pearl-muted font-body text-center">Readings</TableHead>
                    <TableHead className="text-pearl-muted font-body text-center hidden sm:table-cell">Convos</TableHead>
                    <TableHead className="text-pearl-muted font-body hidden md:table-cell">Joined</TableHead>
                    <TableHead className="text-pearl-muted font-body text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers?.map((user) => (
                    <TableRow
                      key={user._id}
                      className="border-pearl-gold/5 hover:bg-pearl-surface/50"
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="min-w-0">
                            <div className="font-body text-pearl-warm text-sm flex items-center gap-1.5">
                              {user.name}
                              {user.isAdmin && (
                                <Crown className="size-3.5 text-pearl-gold" />
                              )}
                            </div>
                            <div className="font-body text-pearl-muted text-xs truncate">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex gap-1.5">
                          {user.onboardingComplete ? (
                            <Badge className="bg-green-500/15 text-green-400 border-green-500/20 text-xs">
                              <UserCheck className="size-3 mr-1" />
                              Onboarded
                            </Badge>
                          ) : (
                            <Badge className="bg-pearl-surface text-pearl-muted border-pearl-gold/10 text-xs">
                              <UserX className="size-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                          {user.hasCosmic && (
                            <Badge className="bg-purple-500/15 text-purple-400 border-purple-500/20 text-xs">
                              <Sparkles className="size-3 mr-1" />
                              Cosmic
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span className="font-body text-pearl-muted text-sm">
                          {user.sunSign || "—"}
                        </span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span className="font-body text-pearl-muted text-sm">
                          {user.birthCity
                            ? `${user.birthCity}, ${user.birthCountry}`
                            : "—"}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-body text-pearl-warm text-sm">
                          {user.totalReadings}
                        </span>
                      </TableCell>
                      <TableCell className="text-center hidden sm:table-cell">
                        <span className="font-body text-pearl-warm text-sm">
                          {user.totalConversations}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="font-body text-pearl-muted text-sm">
                          {formatDate(user.createdAt)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {!user.isAdmin && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(user._id, user.email)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
