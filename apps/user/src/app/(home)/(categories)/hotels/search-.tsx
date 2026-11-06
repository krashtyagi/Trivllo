"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Users } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { Pages } from "@/constants/constants";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { TabsNav } from "@/components/ui/tabs-nav-aty";
import { pages } from "@/constants/pages";
import NProgress from "nprogress";
import { RouterPush } from "@/components/RouterPush";
export default function SearchBox({ tabs: propTabs }: { tabs: Pages[] }) {
  const router = useRouter();
  const location = usePathname();
  const active = propTabs.find((tab) => location.endsWith(tab.link)) || propTabs[0];
  const ismobile = useIsMobile()
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-2 lg:gap-4 items-center md:px-10 mx-auto ">

      <Card className="md:p-6 px-2 gap-2 md:gap-6 shadow-xl border-none bg-card text-card-foreground rounded-[0.5rem] w-full lg:w-[910px] h-[296px] flex flex-col justify-between">
        {
          ismobile && (
            <TabsNav mobile={false} tabs={pages} />
          )
        }
        <div className="space-y-4">
          <div className="flex items-center gap-4 bg-primary/5 border border-primary/10 rounded-[10px] md:px-5 px-3 py-2">
            <MapPin className="w-5 h-5 text-primary shrink-0" />
            <Input
              placeholder="Search Destination"
              className="border-none bg-transparent focus-visible:ring-0 text-base md:text-lg placeholder:text-muted-foreground h-12"
            />
          </div>

          <div className="flex gap-3 ">
            {[
              { label: "Check In", icon: Calendar, text: "Add dates" },
              { label: "Check Out", icon: Calendar, text: "Add dates" },
              { label: "Guests", icon: Users, text: "Add guests" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex md:flex-row flex-col w-full   items-center gap-3 bg-secondary/50 border border-border rounded-[10px] px-2 md:px-5 py-3 hover:bg-secondary/80 transition-colors cursor-pointer"
              >
                <item.icon className="w-4 h-4 text-muted-foreground shrink-0" />
                {
                  (
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                        {item.label}
                      </p>
                      {!ismobile && <p className="text-sm font-medium truncate">{item.text}</p>}
                    </div>
                  )
                }
              </div>
            ))}
          </div>
        </div>

        <Button
          className="w-full bg-[#FE3230] hover:bg-primary/90 mb-10 md:mb-0 text-primary-foreground md:h-14 rounded-[10px] text-lg font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
          onClick={() => { RouterPush(router, "/hotels/find"); }}
        >
          Search Hotel
        </Button>
      </Card>

      <div className="pt-5 md:pt-0">
        <LoopingVideoHero
          VIDEOS={["/happy.mp4", "/road.mp4", "/hot-air.mp4", "/japan.mp4"]}
        />
      </div>
    </div>
  );
}

export function LoopingVideoHero({ VIDEOS }: { VIDEOS: string[] }) {
  const [index, setIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % VIDEOS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [VIDEOS.length]);

  return (
    <div className="relative rounded-[0.5rem]  overflow-hidden shadow-2xl w-full md:max-w-[516px] md:h-[296px] h-[170px]  px-2 md:px-0 group bg-black">
      <AnimatePresence mode="popLayout">
        <motion.video
          key={VIDEOS[index]}
          ref={videoRef}
          src={VIDEOS[index]}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          autoPlay
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {VIDEOS.map((_, i) => (
          <div key={i} className="h-1 w-8 rounded-full bg-white/20 overflow-hidden">
            {index === i && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 5, ease: "linear" }}
                className="h-full bg-white"
              />
            )}
          </div>
        ))}
      </div>

      <div className="absolute top-4 left-4 bg-black/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
        <span className="flex items-center gap-2 text-white text-[10px] font-bold tracking-widest uppercase">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
          Live Preview
        </span>
      </div>
    </div>
  );
}