'use client'

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function ScrollToTop() {
  const location = useRouter()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location]);

  return null;
}
