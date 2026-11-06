"use client";

import React, { useState, useRef, useEffect } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useSearchCity, type CityResult } from "@/hooks/useSearchCity";
import { cn } from "@/lib/utils";

interface CitySearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function CitySearchInput({
  value,
  onChange,
  onBlur,
  placeholder = "Search city...",
  disabled = false,
  className,
}: CitySearchInputProps) {
  const [inputValue, setInputValue] = useState(value || "");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { results, loading } = useSearchCity(inputValue);

  // Sync external value changes
  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    onChange(val);
    setIsOpen(val.length >= 2);
  };

  const handleSelect = (city: CityResult) => {
    const cityName = city.properties.name;
    setInputValue(cityName);
    onChange(cityName);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => inputValue.length >= 2 && setIsOpen(true)}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          className="pl-9"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border bg-popover shadow-lg overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100">
          <ul className="max-h-[200px] overflow-y-auto py-1">
            {results.map((city, idx) => (
              <li key={city.properties.osm_id || idx}>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-sm hover:bg-accent transition-colors text-left cursor-pointer"
                  onMouseDown={(e) => {
                    e.preventDefault(); // Prevent input blur before selection
                    handleSelect(city);
                  }}
                >
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium truncate">{city.properties.name}</span>
                    {(city.properties.state || city.properties.country) && (
                      <span className="text-xs text-muted-foreground truncate">
                        {[city.properties.state, city.properties.country]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isOpen && inputValue.length >= 2 && !loading && results.length === 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border bg-popover shadow-lg p-3 text-sm text-muted-foreground text-center">
          No cities found
        </div>
      )}
    </div>
  );
}
