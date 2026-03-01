import { useMutation, useQuery } from "convex/react";
import { Flag, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Textarea } from "../../components/ui/textarea";
import { toast } from "sonner";

function CreateFlagDialog() {
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const createFlag = useMutation(api.featureFlags.create);

  const handleCreate = async () => {
    if (!key || !name) {
      toast.error("Key and name are required");
      return;
    }
    try {
      await createFlag({ key, name, description, enabled: false });
      toast.success(`Flag "${name}" created`);
      setOpen(false);
      setKey("");
      setName("");
      setDescription("");
    } catch (e: any) {
      toast.error(e.message || "Failed to create flag");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-pearl-gold text-pearl-void hover:bg-pearl-gold-light font-body">
          <Plus className="size-4 mr-2" />
          New Flag
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-pearl-deep border-pearl-gold/15 text-pearl-warm">
        <DialogHeader>
          <DialogTitle className="font-heading text-pearl-warm">
            Create Feature Flag
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="font-body text-pearl-muted">Key</Label>
            <Input
              placeholder="e.g. oracle_v2"
              value={key}
              onChange={(e) => setKey(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"))}
              className="bg-pearl-surface border-pearl-gold/15 text-pearl-warm font-body font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-body text-pearl-muted">Name</Label>
            <Input
              placeholder="e.g. Oracle V2 Chat"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-pearl-surface border-pearl-gold/15 text-pearl-warm font-body"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-body text-pearl-muted">Description</Label>
            <Textarea
              placeholder="What does this flag control?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-pearl-surface border-pearl-gold/15 text-pearl-warm font-body"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="border-pearl-gold/20 text-pearl-muted font-body"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            className="bg-pearl-gold text-pearl-void hover:bg-pearl-gold-light font-body"
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function FeatureFlagsPage() {
  const flags = useQuery(api.featureFlags.list);
  const toggleFlag = useMutation(api.featureFlags.toggle);
  const removeFlag = useMutation(api.featureFlags.remove);

  const handleToggle = async (id: Id<"featureFlags">, name: string) => {
    try {
      const result = await toggleFlag({ id });
      toast.success(`${name} ${result.enabled ? "enabled" : "disabled"}`);
    } catch (e: any) {
      toast.error(e.message || "Failed to toggle flag");
    }
  };

  const handleDelete = async (id: Id<"featureFlags">, name: string) => {
    if (!confirm(`Delete flag "${name}"? This cannot be undone.`)) return;
    try {
      await removeFlag({ id });
      toast.success(`Flag "${name}" deleted`);
    } catch (e: any) {
      toast.error(e.message || "Failed to delete flag");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading text-pearl-warm">Feature Flags</h1>
          <p className="text-pearl-muted font-body text-sm mt-1">
            Control feature rollout across the platform
          </p>
        </div>
        <CreateFlagDialog />
      </div>

      <Card className="bg-pearl-deep border-pearl-gold/10">
        <CardHeader>
          <CardTitle className="text-sm font-body text-pearl-muted font-normal flex items-center gap-2">
            <Flag className="size-4" />
            {flags?.length ?? 0} flag{flags?.length !== 1 ? "s" : ""} configured
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!flags ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 shimmer rounded" />
              ))}
            </div>
          ) : flags.length === 0 ? (
            <div className="text-center py-12">
              <Flag className="size-10 mx-auto text-pearl-muted/30 mb-3" />
              <p className="text-pearl-muted font-body">No feature flags yet</p>
              <p className="text-pearl-muted/60 font-body text-sm mt-1">
                Create one to start controlling features
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-pearl-gold/10 hover:bg-transparent">
                  <TableHead className="text-pearl-muted font-body">Status</TableHead>
                  <TableHead className="text-pearl-muted font-body">Key</TableHead>
                  <TableHead className="text-pearl-muted font-body">Name</TableHead>
                  <TableHead className="text-pearl-muted font-body hidden md:table-cell">
                    Description
                  </TableHead>
                  <TableHead className="text-pearl-muted font-body text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flags.map((flag) => (
                  <TableRow key={flag._id} className="border-pearl-gold/5 hover:bg-pearl-surface/50">
                    <TableCell>
                      <Switch
                        checked={flag.enabled}
                        onCheckedChange={() => handleToggle(flag._id, flag.name)}
                      />
                    </TableCell>
                    <TableCell>
                      <code className="text-sm text-pearl-gold/80 bg-pearl-surface px-2 py-0.5 rounded font-mono">
                        {flag.key}
                      </code>
                    </TableCell>
                    <TableCell className="font-body text-pearl-warm">
                      {flag.name}
                      <Badge
                        variant={flag.enabled ? "default" : "secondary"}
                        className={`ml-2 text-xs ${
                          flag.enabled
                            ? "bg-green-500/15 text-green-400 border-green-500/20"
                            : "bg-pearl-surface text-pearl-muted border-pearl-gold/10"
                        }`}
                      >
                        {flag.enabled ? "ON" : "OFF"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-body text-pearl-muted text-sm hidden md:table-cell max-w-xs truncate">
                      {flag.description || "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(flag._id, flag.name)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
