"use client";

import { useEffect, useState } from "react";

/** Guards against SSR/localStorage hydration mismatches for persisted state. */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
