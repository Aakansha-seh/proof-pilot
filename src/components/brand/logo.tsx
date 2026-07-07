import { cn } from "@/lib/utils";

export function Logo({
  className,
  showWord = true,
}: {
  className?: string;
  showWord?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="relative grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-[hsl(199_89%_55%)] shadow-lg shadow-primary/30">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-[18px] w-[18px] text-white"
          aria-hidden
        >
          <path
            d="M12 2.5 4 6v5.2c0 4.6 3.2 8.4 8 9.8 4.8-1.4 8-5.2 8-9.8V6l-8-3.5Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="m8.5 12 2.4 2.4L15.7 9.6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {showWord && (
        <span className="text-[15px] font-semibold tracking-tight">
          Proof<span className="text-muted-foreground">Pilot</span>
        </span>
      )}
    </span>
  );
}
