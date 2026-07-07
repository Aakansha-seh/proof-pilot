import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary/15 text-primary",
        neutral: "border-border bg-secondary text-secondary-foreground",
        proven: "border-transparent bg-[hsl(var(--proven)/0.15)] text-[hsl(var(--proven))]",
        risk: "border-transparent bg-[hsl(var(--risk)/0.15)] text-[hsl(var(--risk))]",
        warn: "border-transparent bg-[hsl(var(--warn)/0.15)] text-[hsl(var(--warn))]",
        future: "border-transparent bg-[hsl(var(--future)/0.15)] text-[hsl(var(--future))]",
        outline: "border-border text-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
