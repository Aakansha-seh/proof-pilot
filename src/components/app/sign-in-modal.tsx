"use client";

import { useState } from "react";
import { CloudOff, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

export function SignInModal({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? (
          <Button variant="subtle" size="sm">
            Sign in to sync
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <div className="mb-2 grid h-11 w-11 place-items-center rounded-xl bg-primary/15 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <DialogTitle>Cloud sync is coming soon</DialogTitle>
          <DialogDescription>
            ProofPilot runs fully in Guest Mode today — your audits are saved on
            this device. Account sync across devices is on the roadmap.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/50 p-3 text-sm text-muted-foreground">
          <CloudOff className="h-4 w-4 shrink-0" />
          Nothing you audit leaves your browser in this preview.
        </div>
        <Button onClick={() => setOpen(false)}>Continue in Guest Mode</Button>
      </DialogContent>
    </Dialog>
  );
}
