import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAddress(address: unknown): string {
  if (!address) return "";
  if (typeof address === "string") return address;
  if (typeof address === "object" && address !== null) {
    const addr = address as Record<string, any>;
    if (typeof addr.formattedAddress === "string" && addr.formattedAddress.trim()) {
      return addr.formattedAddress.trim();
    }
    const parts = [
      addr.doorNumber,
      addr.buildingName,
      addr.streetAddress,
      addr.landmark,
      addr.areaName,
      addr.city,
      addr.district,
      addr.state,
      addr.postalCode,
      addr.country,
    ].filter((p): p is string => typeof p === "string" && p.trim().length > 0);

    if (parts.length > 0) {
      return Array.from(new Set(parts)).join(", ");
    }
    return addr.city || "";
  }
  return String(address);
}

