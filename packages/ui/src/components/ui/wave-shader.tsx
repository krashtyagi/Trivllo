"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

export interface WaveShaderProps {
  /** Base color in HSL format, e.g. "142, 72%, 50%" for green */
  color?: string;
  /** Secondary color for gradient blend, HSL format */
  colorSecondary?: string;
  /** Angle of the wave flow in degrees (0 = horizontal, 45 = diagonal, 90 = vertical) */
  angle?: number;
  /** Number of wave layers */
  waveCount?: number;
  /** Base amplitude of waves in pixels */
  amplitude?: number;
  /** Base wavelength multiplier (higher = wider waves) */
  wavelength?: number;
  /** Animation speed multiplier (lower = slower, more elegant) */
  speed?: number;
  /** Overall opacity of the shader (0-1) */
  opacity?: number;
  /** Randomness factor for wave variation (0-1) */
  randomness?: number;
  /** Height of the component */
  height?: string;
  /** Whether waves flow from bottom (like water) */
  flowFromBottom?: boolean;
  /** Blur amount for the glow effect */
  blur?: number;
  /** Additional className for the container */
  className?: string;
  /** Position: 'top', 'bottom', or 'full' */
  position?: "top" | "bottom" | "full";
}

interface WaveLayer {
  phase: number;
  amplitudeMod: number;
  speedMod: number;
  wavelengthMod: number;
  yOffset: number;
  opacityMod: number;
}

export function WaveShader({
  color = "142, 72%, 50%",
  colorSecondary = "158, 64%, 52%",
  angle = 0,
  waveCount = 4,
  amplitude = 20,
  wavelength = 1,
  speed = 0.3,
  opacity = 0.12,
  randomness = 0.5,
  height = "100%",
  flowFromBottom = false,
  blur = 40,
  className,
  position = "full",
}: WaveShaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const layersRef = useRef<WaveLayer[]>([]);
  const timeRef = useRef(0);

  // Seeded pseudo-random for deterministic layers
  const seededRandom = useCallback(
    (seed: number) => {
      const x = Math.sin(seed * 9301 + 49297) * 49297;
      return x - Math.floor(x);
    },
    []
  );

  // Generate wave layers once
  useEffect(() => {
    const layers: WaveLayer[] = [];
    for (let i = 0; i < waveCount; i++) {
      layers.push({
        phase: seededRandom(i * 17 + 3) * Math.PI * 2,
        amplitudeMod: 1 + (seededRandom(i * 31 + 7) - 0.5) * randomness * 1.6,
        speedMod: 0.6 + seededRandom(i * 53 + 11) * 0.8 * (1 + randomness * 0.5),
        wavelengthMod:
          0.7 + seededRandom(i * 71 + 13) * 0.6 * (1 + randomness * 0.4),
        yOffset: (i / (waveCount - 1 || 1)) * 0.6 + 0.2,
        opacityMod: 0.4 + seededRandom(i * 97 + 19) * 0.6,
      });
    }
    layersRef.current = layers;
  }, [waveCount, randomness, seededRandom]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let resizeObserver: ResizeObserver;

    const setupCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    setupCanvas();

    resizeObserver = new ResizeObserver(() => {
      setupCanvas();
    });
    resizeObserver.observe(canvas);

    const angleRad = (angle * Math.PI) / 180;
    const cosA = Math.cos(angleRad);
    const sinA = Math.sin(angleRad);

    const draw = (timestamp: number) => {
      const dt = timestamp * 0.001;
      timeRef.current = dt;

      const w = canvas.getBoundingClientRect().width;
      const h = canvas.getBoundingClientRect().height;

      ctx.clearRect(0, 0, w, h);

      const layers = layersRef.current;

      for (let li = 0; li < layers.length; li++) {
        const layer = layers[li];
        const layerAmplitude = amplitude * layer.amplitudeMod;
        const layerSpeed = speed * layer.speedMod;
        const layerWavelength = wavelength * layer.wavelengthMod;

        // Compute time-based offset
        const t = dt * layerSpeed + layer.phase;

        ctx.save();

        // Create wave path
        ctx.beginPath();

        const segments = Math.ceil(w / 2) + 1;

        for (let i = 0; i <= segments; i++) {
          const x = (i / segments) * w;

          // Project point along the angle
          const proj = x * cosA + (flowFromBottom ? h : 0) * sinA;

          // Compute wave y using multiple harmonics for organic feel
          const baseY =
            h * layer.yOffset +
            Math.sin(
              (proj / (100 * layerWavelength)) * Math.PI * 2 + t * 2
            ) *
              layerAmplitude +
            Math.sin(
              (proj / (60 * layerWavelength)) * Math.PI * 2 + t * 1.3 + 1.5
            ) *
              layerAmplitude *
              0.5 +
            Math.sin(
              (proj / (180 * layerWavelength)) * Math.PI * 2 + t * 0.7 + 3
            ) *
              layerAmplitude *
              0.3;

          // Shift based on angle
          const shiftedY = baseY + x * Math.tan(angleRad) * 0.1;

          if (i === 0) {
            ctx.moveTo(x, shiftedY);
          } else {
            ctx.lineTo(x, shiftedY);
          }
        }

        // Close the path to fill
        if (flowFromBottom) {
          ctx.lineTo(w, h + 10);
          ctx.lineTo(0, h + 10);
        } else {
          ctx.lineTo(w, -10);
          ctx.lineTo(0, -10);
        }
        ctx.closePath();

        // Create gradient fill
        const gradStartY = flowFromBottom ? h : 0;
        const gradEndY = flowFromBottom ? h * 0.3 : h * 0.7;
        const gradient = ctx.createLinearGradient(0, gradStartY, w * 0.5, gradEndY);

        const layerOpacity = opacity * layer.opacityMod;

        gradient.addColorStop(
          0,
          `hsla(${color}, ${layerOpacity * 1.2})`
        );
        gradient.addColorStop(
          0.4,
          `hsla(${colorSecondary}, ${layerOpacity * 0.8})`
        );
        gradient.addColorStop(
          0.7,
          `hsla(${color}, ${layerOpacity * 0.5})`
        );
        gradient.addColorStop(
          1,
          `hsla(${colorSecondary}, ${layerOpacity * 0.2})`
        );

        ctx.fillStyle = gradient;
        ctx.filter = `blur(${blur * (0.5 + li * 0.15)}px)`;
        ctx.fill();

        ctx.restore();
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    animationRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationRef.current);
      resizeObserver?.disconnect();
    };
  }, [
    angle,
    amplitude,
    wavelength,
    speed,
    opacity,
    blur,
    color,
    colorSecondary,
    flowFromBottom,
  ]);

  const positionClasses = {
    top: "top-0 left-0 right-0",
    bottom: "bottom-0 left-0 right-0",
    full: "inset-0",
  };

  return (
    <div
      className={cn(
        "absolute pointer-events-none overflow-hidden",
        positionClasses[position],
        className
      )}
      style={{ height }}
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
