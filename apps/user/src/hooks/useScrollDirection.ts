"use client";

import { useState, useEffect } from "react";

/**
 * Custom hook to detect scroll direction.
 * Returns `true` when scrolling down past a threshold (nav should hide).
 * Returns `false` when scrolling up or near the top of the page (nav should show).
 */
export function useScrollDirection() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastScrollY = window.pageYOffset;
    let ticking = false;

    const updateScrollDirection = () => {
      const scrollY = window.pageYOffset;
      const diff = scrollY - lastScrollY;

      // Always show nav when near the top of the page
      if (scrollY <= 60) {
        setHidden(false);
      } else if (diff > 8) {
        // Scrolled down past threshold -> hide
        setHidden(true);
      } else if (diff < -8) {
        // Scrolled up -> show
        setHidden(false);
      }

      lastScrollY = scrollY > 0 ? scrollY : 0;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDirection);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return hidden;
}

export default useScrollDirection;
