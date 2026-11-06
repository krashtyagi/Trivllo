import { axiosApi } from "@/lib/axios";
import { Activity } from "@/context/AdventureContextProvider";
import { toast } from "sonner";
import { Filters } from "@/context/NuqsContentProvider";
import qs from "qs";

export type ActivityResponse = {
  data: Activity[];
  total: number;
  count?: number;
};
export const getAllAdventures = async () => {
  try {
    const res = await axiosApi.get(`/adventures`, {
      params: {
        city: "Rishikesh",
        category: "rafting",
      },
    });
    return res.data;
  } catch (error) {
    console.error(error);
    toast.error("something went wrong");
  }
};
export const getAvailableAdventures = async (data: {
  city?: string;
  category?: string;
  date?: {
    checkIn: string;
    checkOut: string;
  };
  page?: number;
  limit?: number;
}) => {
  try {
    const res = await axiosApi.get(`/adventures/search`, {
      params: {
        ...data,
      },
    });
    return res.data;
  } catch (error) {
    console.error(error);
    toast.error("something went wrong");
  }
};
export const getAdventureServiceDetails = async (id: string) => {
  try {
    const res = await axiosApi.get(`/services/${id}`);
    return res.data;
  } catch (error) {
    console.error(error);
    toast.error("something went wrong");
  }
};
export const getAdventureCompanyDetails = async (id: string) => {
  try {
    const res = await axiosApi.get(`/adventures/${id}`);
    return res.data;
  } catch (error) {
    console.error(error);
    toast.error("something went wrong");
  }
};

export const getAllAdventuresSearch = async (
  filters: Filters,
  page: number = 1,
  limit: number = 9,
): Promise<ActivityResponse> => {
  const params: Record<string, unknown> = { page, limit };

  const [minPrice, maxPrice] = filters.price ?? [0, 10];
  if (minPrice > 0) params.minPrice = minPrice;
  if (maxPrice > 0 && maxPrice < 10) params.maxPrice = maxPrice;

  if (filters.location?.length > 0) {
    params.city = filters.location[0];
    params.category = (filters as any).category[0];
  } else if ((filters as any).city) {
    params.city = (filters as any).city;
    params.category = (filters as any).category;
  }
  //  if (filters.category?.length > 0) {
  //   params.category = filters.category[0];
  // } else if ((filters as any).category) {
  //   params.category = (filters as any).category;
  // }

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

  const response = await axiosApi.get("/adventures", {
    params,
    paramsSerializer: (p) => qs.stringify(p, { arrayFormat: "repeat" }),
  });
  // const response = await axiosApi.get("/bike-services", {
  //   params,
  //   paramsSerializer: (p) => qs.stringify(p, { arrayFormat: "repeat" }),
  // });

  return {
    data: response.data.data ?? [],
    total: response.data.count ?? 0,
  };
};
