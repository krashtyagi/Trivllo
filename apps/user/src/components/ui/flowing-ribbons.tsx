"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

export interface FlowingRibbonsProps {
  /** Primary color as RGB, e.g. "74, 222, 128" */
  color?: string;
  /** Secondary color as RGB for variety */
  colorSecondary?: string;
  /** Number of ribbon bundles */
  ribbonCount?: number;
  /** Lines per ribbon (creates thickness) */
  linesPerRibbon?: number;
  /** Base opacity 0–1 */
  opacity?: number;
  /** Animation speed multiplier */
  speed?: number;
  /** Line thickness */
  lineWidth?: number;
  /** Overall diagonal tilt in degrees */
  tilt?: number;
  /** Wave amplitude (height of curves) */
  amplitude?: number;
  /** How tightly lines are packed within a ribbon */
  spread?: number;
  /** Additional className */
  className?: string;
}

export function FlowingRibbons({
  color = "74, 222, 128",
  colorSecondary = "52, 211, 153",
  ribbonCount = 3,
  linesPerRibbon = 14,
  opacity = 0.12,
  speed = 0.25,
  lineWidth = 1.2,
  tilt = 12,
  amplitude = 90,
  spread = 2.8,
  className,
}: FlowingRibbonsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const dimensionsRef = useRef({ w: 0, h: 0 });

  // Seeded pseudo-random for consistent ribbon shapes
  const sr = useCallback((seed: number) => {
    const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
    return x - Math.floor(x);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let resizeObserver: ResizeObserver;

    const setupCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dimensionsRef.current = { w: rect.width, h: rect.height };
    };

    setupCanvas();
    resizeObserver = new ResizeObserver(setupCanvas);
    resizeObserver.observe(canvas);

    // Pre-compute ribbon configurations
    const ribbons = Array.from({ length: ribbonCount }, (_, ri) => {
      const verticalSpread = ribbonCount > 1 ? ri / (ribbonCount - 1) : 0.5;
      return {
        // Vertical center of this ribbon (0–1 relative to canvas height)
        yCenter: 0.15 + verticalSpread * 0.7,
        // Unique amplitude for each ribbon
        amp: amplitude * (0.7 + sr(ri * 7 + 1) * 0.6),
        // Phase offset for variety
        phase: sr(ri * 13 + 5) * Math.PI * 2,
        // Speed variation
        speedMod: 0.7 + sr(ri * 19 + 3) * 0.6,
        // Whether to use primary or secondary color
        useSecondary: ri % 2 === 1,
        // Extra frequency harmonics
        harmonic2: 0.2 + sr(ri * 29 + 11) * 0.3,
        harmonic3: 0.05 + sr(ri * 37 + 17) * 0.15,
      };
    });

    const tiltRad = (tilt * Math.PI) / 180;

    const draw = (timestamp: number) => {
      const t = timestamp * 0.001 * speed;
      const { w, h } = dimensionsRef.current;
      if (w === 0 || h === 0) {
        animationRef.current = requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, w, h);

      for (let ri = 0; ri < ribbons.length; ri++) {
        const ribbon = ribbons[ri];
        const ribbonColor = ribbon.useSecondary ? colorSecondary : color;
        const ribbonTime = t * ribbon.speedMod + ribbon.phase;

        for (let li = 0; li < linesPerRibbon; li++) {
          // Position of this line within the ribbon (-0.5 to 0.5)
          const linePos = (li / (linesPerRibbon - 1)) - 0.5;
          // Lines near edges are fainter
          const edgeFade = 1 - Math.pow(Math.abs(linePos) * 2, 1.5);
          const lineOpacity = opacity * edgeFade * 0.9;

          if (lineOpacity < 0.005) continue;

          ctx.beginPath();
          ctx.strokeStyle = `rgba(${ribbonColor}, ${lineOpacity})`;
          ctx.lineWidth = lineWidth * (0.6 + edgeFade * 0.6);
          ctx.lineJoin = "round";
          ctx.lineCap = "round";

          const segments = 150;
          // Offset each line within the ribbon
          const yLineOffset = linePos * spread * ribbon.amp * 0.35;
          // Slight phase shift per line for a twist effect
          const linePhase = linePos * 0.8;

          for (let i = 0; i <= segments; i++) {
            const progress = i / segments;
            // Extend beyond canvas for smooth entry/exit
            const px = progress * (w + 100) - 50;

            // Main flowing wave (S-curve using sin)
            const wave1 =
              Math.sin(progress * Math.PI * 2.5 + ribbonTime + linePhase) *
              ribbon.amp;
            // Second harmonic for organic complexity
            const wave2 =
              Math.sin(
                progress * Math.PI * 5 + ribbonTime * 1.3 + linePhase * 0.7 + 2
              ) *
              ribbon.amp *
              ribbon.harmonic2;
            // Third subtle harmonic
            const wave3 =
              Math.sin(
                progress * Math.PI * 8 + ribbonTime * 0.6 + linePhase * 0.4 + 4
              ) *
              ribbon.amp *
              ribbon.harmonic3;

            // Combine waves + ribbon tilt
            const py =
              h * ribbon.yCenter +
              wave1 +
              wave2 +
              wave3 +
              yLineOffset +
              px * Math.tan(tiltRad) * 0.5;

            if (i === 0) {
              ctx.moveTo(px, py);
            } else {
              ctx.lineTo(px, py);
            }
          }

          ctx.stroke();
        }
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    animationRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationRef.current);
      resizeObserver?.disconnect();
    };
  }, [
    color,
    colorSecondary,
    ribbonCount,
    linesPerRibbon,
    opacity,
    speed,
    lineWidth,
    tilt,
    amplitude,
    spread,
    sr,
  ]);

  return (
    <div
      className={cn(
        "absolute inset-0 pointer-events-none overflow-hidden",
        className
      )}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: "block" }}
      />
    </div>
  );
}
