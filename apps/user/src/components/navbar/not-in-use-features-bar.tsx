import { FloatingDock } from "@/components/ui/floating-dock";
import {
  IconBike,
  IconBuilding,
  IconBus,
  IconCar,
  IconExchange,
  IconMountain,
  IconPlane,
  IconTrain,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export function FloatingDockFeatues({className}:{className?:string}) {
  const links = [
    {
      title: "Hotels",
      icon: (
        <IconBuilding className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/hotels",
    },

    {
      title: "Flight",
      icon: (
        <IconPlane className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/flights",
    },
    {
      title: "Tours",
      icon: (
        <IconMountain className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/tours",
    },
    
    {
      title: "Thrills",
      icon: (
        <IconExchange className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/thrills",
    },

    {
      title: "Cabs",
      icon: (
        <IconCar className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/cabs",
    },
    {
      title: "Bikes",
      icon: (
        <IconBike className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/bikes",
    },
    {
      title: "Bus",
      icon: (
        <IconBus className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/bus",
    },
    {
      title: "Train",
      icon: (
        <IconTrain className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/trains",
    },
  ];
  return (
    <div className={cn("w-full ",className)}>
        <FloatingDock
        desktopClassName=" justify-between px-10 "
        mobileClassName="translate-y-100" 
        items={links}
      />
    </div>
  );
}
