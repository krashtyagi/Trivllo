// import { data } from "@/app/(dashboard)/reservation/_components/data"
import { NewRoomProps } from "@/app/(dashboard)/(categories)/rooms/new/zod-schema";
import { axiosApi } from "@/lib/axios";

//cab
export const addCabService = async (data: any) => {
  const res = await axiosApi.post("/cab-services/vendor/cab-services", data);
  return res.data;
};
export const updateCabServices = async (id: string, data: any) => {
  const res = await axiosApi.put(
    `/cab-services/vendor/cab-services/${id}`,
    data,
  );
  return res.data;
};
export const getCabsServices = async () => {
  const res = await axiosApi.get("/cab-services/vendor/cab-services");
  return res.data;
};
export const getCabServiceDetailsById = async (id: string) => {
  const res = await axiosApi.get(`/cab-services/vendor/cab-services/${id}`);
  return res.data;
};

//bike
export const addbikeService = async (data: any) => {
  const res = await axiosApi.post("/bike-services/vendor/bike-services", data);
  return res.data;
};
export const updatebikeService = async (id: string, data: any) => {
  const res = await axiosApi.put(
    `/bike-services/vendor/bike-services/${id}`,
    data,
  );
  return res.data;
};
export const getBikesServices = async () => {
  const res = await axiosApi.get("/bike-services/vendor/bike-services");
  return res.data;
};
export const getBikeServiceDetailsById = async (id: string) => {
  const res = await axiosApi.get(`/bike-services/vendor/bike-services/${id}`);
  return res.data;
};

//tour
export const addTourService = async (data: any) => {
  const res = await axiosApi.post("/tour-services/vendor/tour-services", data);
  return res.data;
};
export const updateTourService = async (id: string, data: any) => {
  const res = await axiosApi.put(
    `/tour-services/vendor/tour-services/${id}`,
    data,
  );
  return res.data;
};
export const getToursServices = async () => {
  const res = await axiosApi.get("/tour-services/vendor/tour-services");
  return res.data;
};
export const getTourServiceDetailsById = async (id: string) => {
  const res = await axiosApi.get(`/tour-services/vendor/tour-services/${id}`);
  return res.data;
};

//adventure
export const addAdventureService = async (data: any) => {
  const res = await axiosApi.post("/services/vendor/services", data);
  return res.data;
};
export const updateAdventureService = async (id: string, data: any) => {
  const res = await axiosApi.put(`/services/vendor/services/${id}`, data);
  return res.data;
};
export const getAdventuresServices = async () => {
  const res = await axiosApi.get("/services/vendor/services");
  return res.data;
};
export const getAdventureServiceDetailsById = async (id: string) => {
  const res = await axiosApi.get(`/services/vendor/services/${id}`);
  return res.data;
};

// Delete services
export const deleteCabService = async (id: string) => {
  const res = await axiosApi.delete(`/cab-services/vendor/cab-services/${id}`);
  return res.data;
};

export const deleteBikeService = async (id: string) => {
  const res = await axiosApi.delete(`/bike-services/vendor/bike-services/${id}`);
  return res.data;
};

export const deleteTourService = async (id: string) => {
  const res = await axiosApi.delete(`/tour-services/vendor/tour-services/${id}`);
  return res.data;
};

export const deleteAdventureService = async (id: string) => {
  const res = await axiosApi.delete(`/services/vendor/services/${id}`);
  return res.data;
};
/////////////////////////
export const VendorAccountsConnectAccount = async (data: FormData) => {
  try {
    const res = await axiosApi.post("/vendor-accounts/connect-account", {
      email: data.get("email"),
      password: data.get("password"),
    });
    return res.data;
  } catch (error) {
    return [];
  }
};
export const getConnectedAccount = async (vendorId: string | undefined) => {
  try {
    if (!vendorId) {
      return [];
    }
    const res = await axiosApi.get("/vendor-accounts/connected-accounts", {
      params: { vendorId: vendorId },
    });
    return res.data;
  } catch (error) {
    return [];
  }
};
export const addRooms = async (data: NewRoomProps) => {
  const res = await axiosApi.post("/room-types/auto", data);
  return res.data;
};
export const multiverndorservice = async () => {
  try {
    const res = await axiosApi.get(`/multi-service-vendor/dashboard/stats`, {
      params: {
        serviceType: "cabs",
        range: "week",
      },
    });

    return res.data;
  } catch (error) {
    return error;
  }
};
export const getDashboard = async (params?: {
  reservationDays?: number;
  propertyId?: string;
}) => {
  try {
    const res = await axiosApi.get(`/vendors/dashboard`, { params });

    return res.data;
  } catch (error) {
    return error;
  }
};

export const getCheckout = async (id: string) => {
  try {
    const res = await axiosApi.get(`/vendors/bookings/${id}/check-out`);

    return res.data;
  } catch (error) {
    return error;
  }
};

export const getTasks = async () => {
  try {
    const res = await axiosApi.get("/vendors/tasks");

    return res.data;
  } catch (error) {
    return [];
  }
};
export const createTsk = async (data: {
  title: string;
  description: string;
  status: string;
  dueDate: Date | undefined;
}) => {
  const res = await axiosApi.post("/vendors/tasks", data);
  return res.data;
};

export const ReservedUsersDetails = async (id: string) => {
  const res = await axiosApi(`/vendors/bookings/${id}`);
  return res.data;
};
export const updateTask = async ({
  data,
  id,
}: {
  id: string;
  data: {
    title?: string;
    description?: string;
    status: string;
    dueDate?: Date | undefined;
  };
}) => {
  const res = await axiosApi.patch(`/vendors/tasks/${id}`, data);
  return res.data;
};
export const deleteTask = async (id: string) => {
  const res = await axiosApi.delete(`/vendors/tasks/${id}`);
  return res.data;
};
export const getReservation = async () => {
  try {
    const res = await axiosApi.get("/vendors/bookings");

    return res.data;
  } catch (error) {
    return [];
  }
};
export const getRooms = async (hotelId: string) => {
  try {
    const res = await axiosApi.get("/vendors/room-types", {
      params: {
        hotelId: hotelId,
      },
    });
    return res.data;
  } catch (error) {
    return {
      data: [],
      status: 500,
      statusText: "Error",
      headers: {},
      config: {},
    };
  }
};
export const getRoomById = async (id: string, hotelId: string) => {
  try {
    const res = await axiosApi.get(`/vendors/room-types/${id}`, {
      params: {
        hotelId: hotelId,
      },
    });
    return res.data;
  } catch (error) {
    return {
      data: [],
      status: 500,
      statusText: "Error",
      headers: {},
      config: {},
    };
  }
};

export const deleteRoomType = async (id: string) => {
  const res = await axiosApi.delete(`/room-types/${id}`);
  return res.data;
};

export const updateRoomType = async (id: string, payload: any) => {
  const res = await axiosApi.patch(`/room-types/${id}`, payload);
  return res.data;
};
