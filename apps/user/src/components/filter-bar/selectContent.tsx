import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import SearchInput from "@/constants/search-box-components/search-input";
import { useHotelStore } from "@/store/hotel.store";
import { useBikesStore } from "@/store/bikes.store";
import { useCabsStore } from "@/store/cabs.store";
import { useToursStore } from "@/store/tours.store";
import { useAdventureStore } from "@/store/adventure.store";
import { usePathname } from "next/navigation";

type LocationItem = {
  id: number;
  title: string;
  subtitle?: string;
};

interface Propsc {
  items: LocationItem[];
  onSelect?: (item: LocationItem) => void;
  type?: "pickup" | "dropoff" | "general";
}

export function LocationSuggestionDropdown({
  items,
  onSelect,
  type = "general",
}: Propsc) {
  const hotelStore = useHotelStore();
  const bikesStore = useBikesStore();
  const cabsStore = useCabsStore();
  const toursStore = useToursStore();
  const adventureStore = useAdventureStore();

  const pathname = usePathname();

  const activeCategory = (() => {
    if (pathname.includes("/hotels")) return "hotels";
    if (pathname.includes("/bikes")) return "bikes";
    if (pathname.includes("/cabs")) return "cabs";
    if (pathname.includes("/tours")) return "tours";
    if (pathname.includes("/adventures")) return "adventures";
    return "hotels";
  })();

  const activeCity = (() => {
    if (activeCategory === "hotels") return hotelStore.city;
    if (activeCategory === "bikes") return bikesStore.city;
    if (activeCategory === "tours") return toursStore.city;
    if (activeCategory === "adventures") return adventureStore.city;
    if (activeCategory === "cabs") {
      return type === "pickup" ? cabsStore.PickupCity : cabsStore.DropoffCity;
    }
    return "";
  })();

  const handleSetCity = (city: string) => {
    if (activeCategory === "hotels") hotelStore.setCity(city);
    else if (activeCategory === "bikes") bikesStore.setCity(city);
    else if (activeCategory === "tours") toursStore.setCity(city);
    else if (activeCategory === "adventures") adventureStore.setCity(city);
    else if (activeCategory === "cabs") {
      if (type === "pickup") cabsStore.setPickupCity(city);
      else cabsStore.setDropoffCity(city);
    }
  };

  return (
    <div className="w-full rounded-2xl bg-background p-2">
      <div className="flex flex-col gap-1">
        <SearchInput
          label="Where"
          placeholder="Search Location"
          setCity={handleSetCity}
          value={activeCity}
        />
      </div>
    </div>
  );
}
// <div>
//         {items.map((item) => (
//         <button
//           key={item.id}
//           onClick={() => onSelect?.(item)}
//           className={cn(
//             "flex w-full items-center gap-4 rounded-xl p-3 text-left transition-colors",
//             "hover:bg-accent hover:text-accent-foreground"
//           )}
//         >
//           {/* Icon Container */}
//           <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted">
//             <MapPin className="text-muted-foreground" size={20} />
//           </div>

//           {/* Text */}
//           <div className="flex flex-col">
//             <p className="font-medium text-foreground">
//               {item.title}
//             </p>
//             {item.subtitle && (
//               <p className="text-sm text-muted-foreground">
//                 {item.subtitle}
//               </p>
//             )}
//           </div>
//         </button>
//       ))}
//       </div>