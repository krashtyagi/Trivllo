"use client";

import { HotelRoomCardSkeleton } from "../../../hotels/[hotel]/_components/room-card";
import { TourService } from "../_providers_context/TourDetailsContextProvider";
import { TourDetailsCard } from "./bike-card";



export const TourServicesMain = ({
  services,

  isBookingMode,
  isLoading,
}: {
  services: TourService[]
  // hotelId: string;
  // rooms: RoomType[];
  isBookingMode: boolean;
  isLoading: boolean;
}) => {

  return (
    <div id="rooms" className="w-full space-y-6 scroll-mt-24">


      {isLoading && isBookingMode ? (
        <div className="flex flex-col gap-4">
          {[1, 2].map((i) => (
            <HotelRoomCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <Tours
          services={services}
          // services={services}
          isBookingMode={isBookingMode}
        />
      )}
    </div>
  );
};

export function Tours({
  services,
  isBookingMode,
}: {
  services: TourService[];
  isBookingMode: boolean;
}) {
  if (services?.length === 0) {
    return (
      <div className="p-10 border-2 border-dashed rounded-3xl text-center">
        <p className="text-slate-500 font-medium">
          No rooms available for the selected criteria.
        </p>
      </div>
    );
  }



  return (
    <div className="flex flex-col gap-2 md:gap-4">
      {services?.map((service) => (
        <TourDetailsCardItem
          key={service.serviceId}
          service={service}
          isBookingMode={isBookingMode}
        />
      ))}
    </div>
  );
}



export const TourDetailsCardItem = ({
  service,
  isBookingMode,
}: {
  service: TourService;
  isBookingMode: boolean;
}) => {
  // const { date: d } = useHotelStore();
  // const showReserveButton = !!d?.to && !!d?.from;
  // const totalBeds = room.beds.reduce(
  //   (acc: number, curr: { quantity: number }) => acc + curr.quantity,
  //   0,
  // );
  // const bedDescription = room.beds
  //   .map((b: { quantity: number; type: string }) => `${b.quantity} ${b.type}`)
  //   .join(", ");

  // const currentNightlyPrice =
  //   isBookingMode && room.displayPrice
  //     ? room.displayPrice
  //     : room.discountPrice || room.basePrice;

  // const originalPrice = room.basePrice;

  // Discount % calculation based on dynamic price
  // const discountPercent =
  //   originalPrice > currentNightlyPrice
  //     ? Math.round(
  //       ((originalPrice - currentNightlyPrice) / originalPrice) * 100,
  //     )
  //     : 0;

  return (
    <TourDetailsCard
      duration={service.duration}
      features={service.features}
      price={service.price}
      serviceId={service.serviceId}
      title={service.title}
      taxPercentage={service.taxPercentage}
      thumbnail={service.thumbnail}
      thumbnails={service.thumbnails}
      totalPriceWithTax={service.totalPriceWithTax}
    />
  );
};