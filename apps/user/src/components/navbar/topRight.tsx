import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { Search, Heart, User as UserIcon, Sparkles } from "lucide-react";
import { RouterPush } from "../RouterPush";

const AppPrefrence = dynamic(
  () => import("../menubar").then((mod) => ({ default: mod.AppPrefrence })),
  {
    ssr: false,
  },
);

const TopRight = ({ isMobile }: { isMobile: boolean }) => {
  const pathname = usePathname();
  const router = useRouter();
  const isFindPage = pathname.includes("/find");

  const { data: user } = useCurrentUser();
  const isLoggedIn = !!user?.data;

  return (
    <div className="flex items-center gap-1 sm:gap-2 px-1 h-full shrink-0">
      {/* MOBILE ONLY ICONS (Matching Image 2) */}
      <button
        onClick={() => {
          RouterPush(router, isFindPage ? "/" : "/hotels/find");
        }}
        className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-200 transition-colors cursor-pointer md:hidden"
        aria-label="Search"
      >
        <Search className="w-4 h-4" />
      </button>

      {/* Wishlist Heart Icon - mobile, ONLY IF LOGGED IN */}
      {isLoggedIn && (
        <button
          onClick={() => {
            RouterPush(router, "/profile?tab=wishlist");
          }}
          className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-200 transition-colors cursor-pointer md:hidden"
          aria-label="Wishlist"
        >
          <Heart className="w-4 h-4" />
        </button>
      )}

      {/* User Avatar - mobile, ONLY IF LOGGED IN */}
      {isLoggedIn && (
        <div className="md:hidden flex items-center">
          <button
            onClick={() => RouterPush(router, "/profile")}
            className="relative h-7 w-7 rounded-full overflow-hidden border border-border/80 p-0 transition-transform active:scale-95 cursor-pointer block"
            aria-label="Profile"
          >
            <Image
              src={user?.data?.avatar || "/icons/traveler_avatar.jpg"}
              alt="Profile"
              fill
              className="object-cover"
            />
          </button>
        </div>
      )}

      {/* DESKTOP ONLY ICONS (PC View Unchanged) */}
      {!isMobile && !isFindPage && (
        <button
          onClick={() => {
            window.scrollTo({ top: 120, behavior: "smooth" });
          }}
          className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-200 transition-colors cursor-pointer"
          aria-label="Search"
        >
          <Search className="w-4 h-4" />
        </button>
      )}

      {/* Wishlist Heart Icon - desktop only, ONLY if logged in */}
      {isLoggedIn && !isMobile && (
        <button
          onClick={() => {
            RouterPush(router, "/profile?tab=wishlist");
          }}
          className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-200 transition-colors cursor-pointer"
          aria-label="Wishlist"
        >
          <Heart className="w-4 h-4" />
        </button>
      )}

      {/* User Profile / Avatar - desktop only, ONLY if logged in */}
      {isLoggedIn && !isMobile && (
        <Suspense
          fallback={
            <div className="w-8 h-8 rounded-full bg-zinc-200 animate-pulse" />
          }
        >
          <ProfilePic />
        </Suspense>
      )}

      {/* Get Listed Button - visible on desktop only (hidden on mobile in Image 2) */}
      <Button
        asChild
        className="hidden md:inline-flex bg-[#0c3926] hover:bg-[#072619] text-white font-bold text-xs h-8 sm:h-9 px-3 sm:px-4 rounded-full shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
      >
        <a
          href={
            process.env.NEXT_PUBLIC_PARTNER_URL ||
            "https://partner.trivllo.com/login"
          }
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 cursor-pointer text-white"
        >
          <span>Get Listed</span>
        </a>
      </Button>

      {/* App Preferences / Hamburger Menu */}
      <Suspense>
        <AppPrefrence />
      </Suspense>
    </div>
  );
};

export default TopRight;

import Image from "next/image";
import { useCurrentUser } from "@/services/hotel/querys";
import { Skeleton } from "../ui/skeleton";

const ProfilePic = () => {
  const { data: user, isLoading } = useCurrentUser();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading) {
    return <Skeleton className="h-8 w-8 shrink-0 rounded-full" />;
  }

  if (!user || !user?.data) {
    return null;
  }

  return (
    <Button
      onClick={() => RouterPush(router, "/profile")}
      variant="ghost"
      className="relative h-8 w-8 rounded-full border border-border p-0 transition-transform hover:scale-105 cursor-pointer"
    >
      <div className="relative h-full w-full overflow-hidden rounded-full">
        <Image
          src={user?.data?.avatar || "/icons/user.png"}
          alt="Profile"
          fill
          className="object-cover"
        />
      </div>
    </Button>
  );
};
