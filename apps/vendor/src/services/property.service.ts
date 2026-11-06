import { axiosApi } from "@/lib/axios";

// Get all properties for the current vendor
export const getVendorProperties = async () => {
  const res = await axiosApi.get("/vendor-properties");
  return res.data;
};

// Add a new property (hotel/tour)
export const addVendorProperty = async (data: any) => {
  const res = await axiosApi.post("/vendor-properties/add", data);
  return res.data;
};

// Switch the active property
export const switchVendorProperty = async (propertyId: string) => {
  const res = await axiosApi.post("/vendor-properties/switch", { propertyId });
  return res.data;
};

// Get currently active property
export const getActiveProperty = async () => {
  const res = await axiosApi.get("/vendor-properties/active");
  return res.data;
};
