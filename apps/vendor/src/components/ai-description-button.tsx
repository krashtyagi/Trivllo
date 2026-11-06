"use client";

import React, { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AiDescriptionButtonProps {
  name?: string;
  serviceType?: string;
  city?: string;
  state?: string;
  amenities?: string[];
  context?: string;
  currentDescription?: string;
  onGenerated: (text: string) => void;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "outline" | "secondary" | "ghost";
  label?: string;
}

export function AiDescriptionButton({
  name = "",
  serviceType = "hotel",
  city = "",
  state = "",
  amenities = [],
  context = "",
  currentDescription = "",
  onGenerated,
  className,
  size = "sm",
  variant = "outline",
  label,
}: AiDescriptionButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    setLoading(true);
    try {
      const res = await fetch("/api/ai/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          serviceType,
          city,
          state,
          amenities,
          context,
          currentDescription,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.description) {
        onGenerated(data.description);
        toast.success("AI description generated successfully!");
      } else {
        toast.error(data.message || "Failed to generate AI description.");
      }
    } catch (err: any) {
      toast.error(err.message || "Network error while generating description.");
    } finally {
      setLoading(false);
    }
  };

  const buttonText = label || (currentDescription ? "Regenerate with AI" : "Generate with AI");

  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      disabled={loading}
      onClick={handleGenerate}
      className={cn(
        "rounded-xl text-xs h-8 gap-1.5 font-medium transition-all duration-200 border-primary/30 text-primary hover:bg-primary/10 shadow-xs",
        className
      )}
      title="Generate listing description using Gemini 3.8 Flash"
    >
      {loading ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
          <span>Generating...</span>
        </>
      ) : (
        <>
          <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
          <span>{buttonText}</span>
        </>
      )}
    </Button>
  );
}
