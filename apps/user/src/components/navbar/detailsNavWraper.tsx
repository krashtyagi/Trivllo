"use client";
import { TabsNav } from "../ui/tabs-nav-aty";
import { FilterOfPages, pages } from "@/constants/pages";
import { Footer } from "../footer/FFooter";
import { FindTabsNav } from "./filter-nav-bar/find-filter-bars";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import LOGO from "./logo";
import { useIsMobile } from "@/hooks/use-mobile";

import TopRight from "./topRight";
import { BottomNav, MobileNavWrapper } from "./mobilenav";
import { PopLogin } from "./PopMessages";
import { userAccessToken } from "@/types/auth";

const pagesNames = pages.map((page) => page.link.split("/")[1]);
const DetailsNavWrapper = ({ children }: { children: React.ReactNode }) => {
    const location = usePathname();
    const isMobile = useIsMobile();
    const [showAdPopup, setShowAdPopup] = useState(false);
    const [hasDismissed, setHasDismissed] = useState(false);


    const segments = location.split("/").filter(Boolean);

    const shouldShowNavbar = !(
        (segments.length === 1 && pagesNames.includes(segments[0])) ||
        segments.length === 0
    );
    const mobileHeight = isMobile ? "h-20" : "h-40";
    useEffect(() => {
        const token = typeof window !== "undefined" ? localStorage.getItem(userAccessToken) : null;

        if (token) {
            setShowAdPopup(false);
            return;
        }

        if (!token && !hasDismissed) {
            const timer = setTimeout(() => {
                setShowAdPopup(true);
            }, 50000);

            return () => clearTimeout(timer);
        }
    }, [location, hasDismissed]);

    const ismobile = useIsMobile();

    return (
        <div className=" flex flex-col pb-20 md:pb-0   ">
            <div
                className={cn(
                    " top-0 left-0 z-50 w-full bg-card    flex flex-col justify-center bg-gradient-to-br from-zinc-100 to-transparent dark:bg-gradient-to-bl dark:from-zinc-700  border-b border-gray-300 dark:border-gray-700 ",
                    "h-auto",
                    "bg-background",
                    isMobile ? "bg-transparent border-none shadow-sm static" : ""

                )}
            >
                <div className="flex flex-col  justify-center md:py-3 md:px-5  sm:pr-3 px-2 h-full">

                    <div className="flex  justify-between py-3     h-full">
                        <LOGO />
                        {/* {(
                            <div className="hidden md:flex flex-col items-center gap-[5px] h-full md:block w-full">
                                {shouldShowNavbar && (
                                    <div className="md:w-[485px] lg:w-[585px] ">

                                        <FindTabsNav mobile={false} tabs={FilterOfPages} />
                                    </div>
                                )}
                            </div>
                        )} */}
                        <TopRight isMobile={isMobile} />
                    </div>


                    {/* {(
                        <div className="hidden md:flex flex-col items-center gap-[5px] h-full md:block -my-1">
                            {!shouldShowNavbar && (
                                <TabsNav mobile={false} tabs={pages} />
                            )}
                        </div>
                    )} */}


                </div>
                {/* {!isMobile && !shouldShowNavbar && <PersistentHeader>
          <div className="flex h-14 items-center justify-around px-20 ">
            <TabsNav mobile={false} tabs={pages} containerClassName="shadow-none border-none bg-transparent" />
          </div>
        </PersistentHeader>} */}

            </div>

            <main
                className={cn(
                    "flex-1 bg-card",
                    // shouldShowNavbar ? "pt-21" : "pt-29",
                    isMobile ? "pt-2" : "",
                )}
            >
                {!shouldShowNavbar && ismobile && <TabsNav mobile={false} tabs={pages} />}
                {/* {!shouldShowNavbar && (
          <div className="mb-3 ">
            <FilterBarLayout pages={pages} />
          </div>
        )} */}
                {children}
            </main>
            <div className="w-full border-1 mt-10" />

            <Footer />
            {/* CUSTOM LOGIN AD POPUP */}
            {showAdPopup && !hasDismissed && (
                <PopLogin setHasDismissed={setHasDismissed} setShowAdPopup={setShowAdPopup} />
            )}
            <MobileNavWrapper content={<div className="flex h-14 items-center justify-around">
                <BottomNav />
            </div>} isMobile={isMobile} />
        </div>
    );
};


export default DetailsNavWrapper;




