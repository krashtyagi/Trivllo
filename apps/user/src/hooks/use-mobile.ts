'use client'

import * as React from "react";

const DEFAULT_MOBILE_BREAKPOINT = 768;

export function useIsMobile(
  { breakpoint = DEFAULT_MOBILE_BREAKPOINT }: { breakpoint?: number } = {}
) {
  const [isMobile, setIsMobile] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    // Re-create the MediaQueryList whenever the breakpoint changes
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);

    const onChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(e.matches);
    };

    // Set initial value
    setIsMobile(mql.matches);

    // Add listener
    mql.addEventListener("change", onChange);

    return () => {
      mql.removeEventListener("change", onChange);
    };
  }, [breakpoint]);   // ← Key fix: depend on breakpoint

  return isMobile;
}