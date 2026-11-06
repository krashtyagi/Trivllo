import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getConnectedAccount,
  getDashboard,
  getReservation,
  getRoomById,
  getRooms,
  getTasks,
  multiverndorservice,
  ReservedUsersDetails,
  getCabsServices,
  getBikesServices,
  getToursServices,
  getCabServiceDetailsById,
  getBikeServiceDetailsById,
  getTourServiceDetailsById,
  getAdventuresServices,
  getAdventureServiceDetailsById,
  deleteCabService,
  deleteBikeService,
  deleteTourService,
  deleteAdventureService,
  deleteRoomType,
} from "./fetch.service";
import { useCurrentUser } from "./queryes";

// Delete Service Mutations
export const useDeleteRoomType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteRoomType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-getRooms"] });
      queryClient.invalidateQueries({ queryKey: ["vendor-getRoomById"] });
    },
  });
};

// Delete Service Mutations
export const useDeleteCabService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCabService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-getCabsServices"] });
    },
  });
};

export const useDeleteBikeService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBikeService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-getBikesServices"] });
    },
  });
};

export const useDeleteTourService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTourService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-getToursServices"] });
    },
  });
};

export const useDeleteAdventureService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAdventureService,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["user-getAdventuresServices"],
      });
      queryClient.invalidateQueries({
        queryKey: ["user-getAdventureServiceDetailsById"],
      });
    },
  });
};

//cab
export const useGetCabsServices = () => {
  return useQuery({
    queryKey: ["user-getCabsServices"],
    queryFn: () => getCabsServices(),
    staleTime: 100000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
    retry: false,
  });
};
export const useGetCabServiceDetailsById = (id: string) => {
  return useQuery({
    queryKey: ["user-getCabServiceDetailsById", id],
    queryFn: () => getCabServiceDetailsById(id),
    staleTime: 100000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
    retry: false,
    enabled: !!id,
  });
};
//bike
export const useGetBikesServices = () => {
  return useQuery({
    queryKey: ["user-getBikesServices"],
    queryFn: () => getBikesServices(),
    staleTime: 100000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
    retry: false,
  });
};
export const useGetBikeServiceDetailsById = (id: string) => {
  return useQuery({
    queryKey: ["user-getBikeServiceDetailsById", id],
    queryFn: () => getBikeServiceDetailsById(id),
    staleTime: 100000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
    retry: false,
    enabled: !!id,
  });
};
//tour
export const useGetToursServices = () => {
  return useQuery({
    queryKey: ["user-getToursServices"],
    queryFn: () => getToursServices(),
    staleTime: 100000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
    retry: false,
  });
};
export const useGetTourServiceDetailsById = (id: string) => {
  return useQuery({
    queryKey: ["user-getTourServiceDetailsById", id],
    queryFn: () => getTourServiceDetailsById(id),
    staleTime: 100000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
    retry: false,
    enabled: !!id,
  });
};
//adventure
export const useGetAdventuresServices = () => {
  return useQuery({
    queryKey: ["user-getAdventuresServices"],
    queryFn: () => getAdventuresServices(),
    staleTime: 100000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
    retry: false,
  });
};
export const useGetAdventureServiceDetailsById = (id: string) => {
  return useQuery({
    queryKey: ["user-getAdventureServiceDetailsById", id],
    queryFn: () => getAdventureServiceDetailsById(id),
    staleTime: 100000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
    retry: false,
    enabled: !!id,
  });
};
/////////////////////////////////////////////////////////////////////
export const useGetMultivendorStatss = () => {
  return useQuery({
    queryKey: ["user-multivendor"],
    queryFn: () => multiverndorservice(),
    staleTime: 100000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
    retry: false,
  });
};

export const useGetConnectedAccounts = () => {
  const { data } = useCurrentUser();
  const vendorId = data?.data?.vendor.vendorId;
  return useQuery({
    queryKey: ["user-getConnectedAccounts", vendorId],
    queryFn: () => getConnectedAccount(vendorId),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
    retry: false,
    enabled: !!vendorId,
  });
};
export const useGetDashboard = (
  reservationDays?: number,
  propertyId?: string,
) => {
  return useQuery({
    queryKey: ["user-getDashboard", propertyId, reservationDays],
    queryFn: () => getDashboard({ reservationDays, propertyId }),
    staleTime: 10000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
    retry: false,
  });
};
export const useGetReservedUserData = (id: string) => {
  return useQuery({
    queryKey: ["user-ReservedUsersDetails", id],
    queryFn: () => ReservedUsersDetails(id),
    staleTime: 1000000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
    retry: false,
    enabled: !!id,
  });
};
export const useGetTasks = () => {
  return useQuery({
    queryKey: ["user-getTasks"],
    queryFn: () => getTasks(),
    staleTime: 10000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
    retry: false,
  });
};
export const useResevatiosnData = () => {
  return useQuery({
    queryKey: ["user-reservations"],
    queryFn: () => getReservation(),
    staleTime: 10000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
    retry: false,
  });
};
export const useAllRooms = () => {
  const { data: user } = useCurrentUser();
  const hotelId = user?.data?.approvedData?.hotelId;

  return useQuery({
    queryKey: ["vendor-getRooms", hotelId],
    queryFn: () => getRooms(hotelId),
    staleTime: 20000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    retry: false,
    enabled: !!hotelId,
  });
};
export const useRoomById = (id: string) => {
  const { data: user } = useCurrentUser();
  const hotelId = user?.data?.approvedData?.hotelId;
  return useQuery({
    queryKey: ["vendor-getRoomById", id, hotelId],
    queryFn: () => getRoomById(id, hotelId),
    staleTime: 200000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
    retry: false,
    enabled: !!id && !!hotelId,
  });
};
// export const useGetNewHotels = () => {
//   return useQuery({
//     queryKey:["gethotels_home"],
//     queryFn:()=>getNewHotels(),
//     staleTime: 20000,
//     refetchOnWindowFocus: false,
//     refetchOnMount: false,
//     refetchOnReconnect: true,
//     retry: false
//   })
// };
