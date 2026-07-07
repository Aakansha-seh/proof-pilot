"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FilePlus2, LayoutGrid, FileText, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/app/new", label: "New", icon: FilePlus2 },
  { href: "/app/audits", label: "Audits", icon: LayoutGrid },
  { href: "/app/pack", label: "Pack", icon: FileText },
  { href: "/app/demo", label: "Demo", icon: PlayCircle },
];

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-border bg-background/95 px-2 py-2 backdrop-blur md:hidden">
      {NAV.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 rounded-md px-3 py-1 text-[11px]",
              active ? "text-primary" : "text-muted-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
