import { Filters } from "@/context/NuqsContentProvider";
import { axiosApi } from "@/lib/axios";
import { toast } from "sonner";
import { CabService } from "@/types";
import qs from "qs";

export const getAllCabs = async () => {
  try {
    const res = await axiosApi.get(`/cab-services`);
    return res.data;
  } catch (error) {
    console.error(error);
    toast.error("something went wrong");
  }
};
export const getCabServiceDetails = async (id: string) => {
  try {
    const res = await axiosApi.get(`/cab-services/${id}`);
    return res.data;
  } catch (error) {
    console.error(error);
    toast.error("something went wrong");
  }
};
export const getCabCompanyDetails = async (id: string) => {
  try {
    const res = await axiosApi.get(`/cab-services/company/${id}`);
    return res.data;
  } catch (error) {
    console.error(error);
    toast.error("something went wrong");
  }
};
export type CabsResponse = {
  data: CabService[];
  total: number;
  count?: number;
};
export const getCabs = async (
  filters: Filters,
  page: number = 1,
  limit: number = 9,
): Promise<CabsResponse> => {
  const params: Record<string, unknown> = { page, limit };

  const [minPrice, maxPrice] = filters.price ?? [0, 10];
  if (minPrice > 0) params.minPrice = minPrice;
  if (maxPrice > 0 && maxPrice < 10) params.maxPrice = maxPrice;

  if ((filters as any).pickup && (filters as any).dropoff) {
    params.pickup = (filters as any).pickup;
    params.drop = (filters as any).dropoff;
  }

  if (filters.score?.length > 0) {
    params.minRating = Math.min(...filters.score.map(Number));
  }

  const allAmenities = [
    ...(filters.amenities ?? []),
    ...(filters.essentials ?? []),
    ...(filters.features ?? []),
    ...(filters.onsite ?? []),
  ];
  if (allAmenities.length > 0) {
    params.amenities = allAmenities;
  }

  if (filters.roomSize?.length > 0) {
    params.maxSize = Math.max(...filters.roomSize.map(Number));
  }

  if ((filters as any).adults) {
    params.adults = (filters as any).adults;
  } else if (filters.Bedrooms?.length > 0) {
    params.adults = Math.max(...filters.Bedrooms);
  }

  if ((filters as any).children) {
    params.children = (filters as any).children;
  }

  if (filters.Beds?.length > 0) params.beds = Math.max(...filters.Beds);
  if (filters.Bathrooms?.length > 0)
    params.bathrooms = Math.max(...filters.Bathrooms);

  if ((filters as any).date?.checkIn)
    params.checkIn = (filters as any).date.checkIn;
  if ((filters as any).date?.checkOut)
    params.checkOut = (filters as any).date.checkOut;

  if (
    filters.typeOfPlace?.length > 0 &&
    !filters.typeOfPlace.includes("Any type")
  ) {
    params.typeOfPlace = filters.typeOfPlace;
  }

  // const response = await axiosApi.get("/hotels", {
  //   params,
  //   paramsSerializer: (p) => qs.stringify(p, { arrayFormat: "repeat" }),
  // });
  const response = await axiosApi.get("/cab-services", {
    params,
    paramsSerializer: (p) => qs.stringify(p, { arrayFormat: "repeat" }),
  });

  return {
    data: response.data.data?.cabs ?? [],
    total: response.data.data?.pagination?.count ?? 0,
  };
};
