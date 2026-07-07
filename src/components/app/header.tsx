"use client";

import { HardDrive } from "lucide-react";
import { SignInModal } from "./sign-in-modal";
import { Badge } from "@/components/ui/badge";

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-5 backdrop-blur">
      <div className="flex items-center gap-3">
        <Badge variant="neutral" className="gap-1.5 py-1">
          <HardDrive className="h-3.5 w-3.5" />
          Saved on this device
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <SignInModal />
      </div>
    </header>
  );
}
