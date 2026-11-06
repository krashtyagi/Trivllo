"use client";
import { motion, useInView } from "motion/react";
import React, { useRef } from "react";
import { ImagesSlider } from "../ui/images-slider";
import { RouterPush } from "../RouterPush";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

export function ImagesSliderDemo({
  images,
  title,
  subtitle,
  description,
  link,
}: {
  images: string[];
  title: string;
  subtitle: string;
  description: string;
  link: string;
}) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <div ref={containerRef}>
      <ImagesSlider
        className="h-[12rem] sm:h-[18rem] md:h-[22rem] lg:h-[28rem] rounded-2xl my-2 md:my-3 w-full"
        images={images}
        interval={6000}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="z-0 flex flex-col justify-center items-center px-6 text-center max-w-2xl mx-auto"
        >
          {/* Animated title with stagger per character */}
          <div className="overflow-hidden">
            <motion.h2
              initial={{ y: "100%", opacity: 0, filter: "blur(10px)" }}
              animate={
                isInView
                  ? { y: "0%", opacity: 1, filter: "blur(0px)" }
                  : {}
              }
              transition={{
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1],
                delay: 0.3,
              }}
              className="font-extrabold text-2xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white via-white/95 to-white/60 pb-1"
            >
              {title}
            </motion.h2>
          </div>

          {/* Animated line separator */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
            transition={{
              duration: 1,
              ease: [0.16, 1, 0.3, 1],
              delay: 0.6,
            }}
            className="h-px w-32 md:w-48 my-3 md:my-5 bg-gradient-to-r from-transparent via-white/50 to-transparent origin-center"
          />

          {/* Description */}
          <motion.p
            initial={{ y: 20, opacity: 0, filter: "blur(6px)" }}
            animate={
              isInView ? { y: 0, opacity: 1, filter: "blur(0px)" } : {}
            }
            transition={{
              duration: 0.7,
              ease: [0.16, 1, 0.3, 1],
              delay: 0.7,
            }}
            className="text-sm sm:text-base md:text-lg text-white/70 font-medium max-w-md leading-relaxed"
          >
            {description}
          </motion.p>

          {/* CTA Button */}
          <motion.button
            initial={{ y: 30, opacity: 0, scale: 0.9 }}
            animate={
              isInView ? { y: 0, opacity: 1, scale: 1 } : {}
            }
            transition={{
              duration: 0.6,
              ease: [0.16, 1, 0.3, 1],
              delay: 0.9,
            }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => RouterPush(router, link)}
            className="group relative mt-5 md:mt-8 px-6 md:px-8 py-2.5 md:py-3 rounded-full overflow-hidden border border-white/20 backdrop-blur-md bg-white/10 text-white font-semibold text-sm md:text-base transition-all duration-300 hover:border-white/40 hover:bg-white/15 flex items-center gap-2"
          >
            {/* Shine effect on hover */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <span className="relative z-10">{subtitle}</span>
            <ArrowRight className="relative z-10 w-4 h-4 transition-transform group-hover:translate-x-1" />

            {/* Bottom glow line */}
            <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />
          </motion.button>
        </motion.div>
      </ImagesSlider>
    </div>
  );
}
