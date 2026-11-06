'use client';

import { CometCard } from "@/components/ui/comet-card";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { RouterPush } from "./RouterPush";

interface HotelGalleryCardProps {
  images: string[];
  label?: string;
  onClick?: () => void;
}

export function HotelGalleryCard({
  images = [
    "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800",
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
    "https://images.unsplash.com/photo-1611892440504-42a79208f8e6?w=800",
  ],
  label = "See all",
  onClick,
}: HotelGalleryCardProps) {
  const displayImages = images.slice(0, 3);

  return (
    <CometCard
      className="
        group w-[200px] sm:w-[220px] cursor-pointer 
        rounded-2xl border border-white/10 
        backdrop-blur-md 
        transition-all duration-300 
        hover:shadow-2xl hover:scale-[1.04]
      "
    >
      <button
        type="button"
        onClick={onClick}
        className="relative flex h-full w-full flex-col items-center justify-end p-3 sm:p-4 text-center"
        aria-label={label}
      >
        {/* Smaller stacked images container */}
        <div className="relative mb-4 sm:mb-5 h-[140px] w-[110px] sm:h-[160px] sm:w-[130px] perspective-[800px]">
          {displayImages.map((src, idx) => (
            <div
              key={idx}
              className={`
                absolute inset-0 h-full w-full rounded-xl sm:rounded-2xl 
                transition-transform duration-400 
                group-hover:scale-110
              `}
              style={{
                transform: `
                  rotate(${idx === 0 ? -10 : idx === 1 ? 0 : 10}deg)
                  translateX(${idx === 0 ? -14 : idx === 1 ? 0 : 14}px)
                  translateY(${idx === 0 || idx === 2 ? -8 : 0}px)
                `,
                zIndex: 2 - idx,
              }}
            >
              <Image
                src={src}
                alt={`Hotel room ${idx + 1}`}
                fill
                className="rounded-xl sm:rounded-2xl object-cover brightness-90 contrast-[1.08]"
                sizes="(max-width: 640px) 110px, 130px"
                priority={idx === 0}
              />
            </div>
          ))}
        </div>

        {/* Text overlay – smaller on mobile */}
        <div className="relative z-10 mt-auto pb-2 sm:pb-3">
          <p className="
            rounded-full bg-black/60 px-4 py-1.5 sm:px-5 sm:py-2 
            text-sm sm:text-base font-medium text-white 
            backdrop-blur-sm drop-shadow-md
            transition-colors group-hover:bg-black/80
          ">
            {label}
          </p>
        </div>
      </button>
    </CometCard>
  );
}





























interface GalleryCardProps {
  images: string[];
  label?: string;
  className?: string;
  handleTouchMove?: (e: React.TouchEvent) => void;
}

export function GalleryCard({
  images = [],
  label = "See all",
  className = "",
  handleTouchMove,
}: GalleryCardProps) {
  const displayImages = images.slice(0, 3);
  const router = useRouter()

  return (
    <div
      className={`
        group relative min-w-[200px]  overflow-hidden rounded-2xl border bg-gradient-to-b from-neutral-900/60 to-black/80
        shadow-lg transition-all hover:shadow-2xl hover:scale-[1.02] ${className}
      `}
    >
      <div className="relative md:h-52 h-42 w-full">
        {/* Background blurred image */}
        {displayImages[0] && (
          <Image
            src={displayImages[0]}
            alt="Background"
            fill
            className="object-cover blur-sm brightness-50"
          />
        )}

        {/* Stacked sharp images */}
        <div className="absolute inset-0 flex items-center justify-center gap-4 px-6">
          {displayImages.map((src, idx) => (
            <div
              key={idx}
              className={`
                relative aspect-[4/5] w-1/3 overflow-hidden rounded-xl border border-white/20 shadow-xl
                transition-transform duration-300 group-hover:scale-105
              `}
              style={{
                transform: `rotate(${idx === 0 ? -10 : idx === 2 ? 10 : 0}deg)`,
                // zIndex: 10 - idx,
              }}
            >
              <Image
                src={src}
                alt={`Room view ${idx + 1}`}
                fill
                className="object-cove "
              />
            </div>
          ))}
        </div>
      </div>

      {/* Label */}
      <div className="absolute bottom-5 left-0 right-0 text-center" onClick={() => {
        RouterPush(router, "/hotels/find")
      }}>
        <span className="rounded-full bg-black/60 px-5 py-2 text-sm font-medium text-white backdrop-blur-md">
          {label}
        </span>
      </div>
    </div>
  );
}