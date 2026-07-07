"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FilePlus2,
  LayoutGrid,
  FileText,
  PlayCircle,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/app/new", label: "New Audit", icon: FilePlus2 },
  { href: "/app/audits", label: "My Audits", icon: LayoutGrid },
  { href: "/app/pack", label: "Evidence Pack", icon: FileText },
  { href: "/app/demo", label: "Demo Mode", icon: PlayCircle },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card/40 md:flex">
      <div className="flex h-16 items-center px-5">
        <Link href="/">
          <Logo />
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-2">
        {NAV.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-primary/12 text-foreground"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              )}
            >
              <item.icon
                className={cn("h-4 w-4", active && "text-primary")}
                strokeWidth={2}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="m-3 rounded-xl border border-border bg-secondary/40 p-3">
        <div className="flex items-center gap-2 text-xs font-medium text-foreground">
          <ShieldCheck className="h-4 w-4 text-[hsl(var(--proven))]" />
          Guest Mode
        </div>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Audits are saved on this device. No account required.
        </p>
      </div>
    </aside>
  );
}
