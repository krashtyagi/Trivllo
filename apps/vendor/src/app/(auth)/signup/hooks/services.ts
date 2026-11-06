import { axiosApi } from "@/lib/axios";
import { serviceTypeEnumProps, SignUpProps } from "@/schema/auth";

export const businessDetails = async ({
  serviceType,
  businessName,
  businessEmail,
  businessPhone,
  businessAddress,
  city,
  state,
  country,
  panNumber,
  aadhaarNumber,
  verificationDocs,
}: {
  serviceType: serviceTypeEnumProps;
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  businessAddress: string;
  city: string;
  state: string;
  country: string;
  panNumber: string;
  aadhaarNumber: string;
  verificationDocs: { docName: string; docUrl: string }[];
}) => {
  const res = await axiosApi.post("/vendors/register", {
    serviceType,
    businessName,
    businessEmail,
    businessPhone,
    businessAddress,
    city,
    state,
    country,
    panNumber,
    aadhaarNumber,
    verificationDocs,
  });
  return {
    success: res.data.success,
    message: res.data.message,
    currentStep: res.data.data.currentStep,
  };
};

export const BankDetails = async ({
  bankName,
  accountNumber,
  ifscCode,
  branchName,
  accountHolderName,
  bankProof,
}: {
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branchName: string;
  accountHolderName: string;
  bankProof: { url: string; public_id: string; resource_type: string };
}) => {
  const res = await axiosApi.post("/vendor-bank", {
    bankName,
    accountNumber,
    ifscCode,
    branchName,
    accountHolderName,
    bankProof,
  });

  return {
    success: res.data.success,
    message: res.data.message,
    currentStep: res.data.data.currentStep,
  };
};

export const SaveHotelDetails = async ({
  name,
  address,
  description,
  amenities,
  documents,
  images,
  city,
  location,
  extraAddress,
}: {
  name: string;
  address: any;
  description: string;
  amenities: string[];
  documents: {
    docName: string;
    docUrl: string;
    public_id: string;
    resource_type: string;
  }[];
  images: { url: string; public_id: string; resource_type: string }[];
  city: string;
  location: { type: string; coordinates: [number, number] };
  extraAddress?: any;
}) => {
  const payload = {
    name,
    address: typeof address === "object" ? address : {
      streetAddress: address,
      city,
      location,
      ...(extraAddress || {}),
    },
    ...(extraAddress || {}),
    description,
    amenities,
    documents,
    images,
    city,
    location,
  };

  const res = await axiosApi.post("/vendors/hotels", payload);
  return {
    success: res.data.success,
    message: res.data.message,
    currentStep: res.data.data.currentStep,
  };
};

export const SaveCabDetails = async ({
  name,
  address,
  description,
  features,
  documents,
  images,
  location,
  coordinates,
  extraAddress,
}: {
  name: string;
  address: any;
  description: string;
  features: string[];
  documents: any[];
  images: any[];
  location: { city: string; state: string; country: string };
  coordinates: { lat: number; lng: number };
  extraAddress?: any;
}) => {
  const payload = {
    name,
    address: typeof address === "object" ? address : {
      streetAddress: address,
      city: location.city,
      state: location.state,
      country: location.country,
      ...(extraAddress || {}),
    },
    ...(extraAddress || {}),
    description,
    features,
    documents,
    images,
    location,
    coordinates,
  };

  const res = await axiosApi.post("/cabs/vendor/cabs", payload);
  return {
    success: res.data.success,
    message: res.data.message,
    currentStep: res.data.data.currentStep,
  };
};

export const SaveBikeDetails = async ({
  name,
  address,
  description,
  features,
  documents,
  images,
  location,
  coordinates,
  extraAddress,
}: {
  name: string;
  address: any;
  description: string;
  features: string[];
  documents: any[];
  images: any[];
  location: { city: string; state: string; country: string };
  coordinates: { lat: number; lng: number };
  extraAddress?: any;
}) => {
  const payload = {
    name,
    address: typeof address === "object" ? address : {
      streetAddress: address,
      city: location.city,
      state: location.state,
      country: location.country,
      ...(extraAddress || {}),
    },
    ...(extraAddress || {}),
    description,
    features,
    documents,
    images,
    location,
    coordinates,
  };

  const res = await axiosApi.post("/bikes/vendor/bikes", payload);
  return {
    success: res.data.success,
    message: res.data.message,
    currentStep: res.data.data.currentStep,
  };
};

export const SaveTourDetails = async ({
  name,
  address,
  description,
  features,
  documents,
  images,
  location,
  coordinates,
  extraAddress,
}: {
  name: string;
  address: any;
  description: string;
  features: string[];
  documents: any[];
  images: any[];
  location: { city: string; state: string; country: string };
  coordinates: { lat: number; lng: number };
  extraAddress?: any;
}) => {
  const payload = {
    name,
    address: typeof address === "object" ? address : {
      streetAddress: address,
      city: location.city,
      state: location.state,
      country: location.country,
      ...(extraAddress || {}),
    },
    ...(extraAddress || {}),
    description,
    features,
    documents,
    images,
    location,
    coordinates,
  };

  const res = await axiosApi.post("/tours/vendor/tours", payload);
  return {
    success: res.data.success,
    message: res.data.message,
    currentStep: res.data.data.currentStep,
  };
};

export const SaveAdventureDetails = async ({
  name,
  category,
  city,
  state,
  country,
  address,
  description,
  images,
  documents,
  features,
  coordinates,
  extraAddress,
}: {
  name: string;
  category: string;
  city: string;
  state: string;
  country: string;
  address: any;
  description: string;
  images: any[];
  documents: any[];
  features: string[];
  coordinates: { lat: number; lng: number };
  extraAddress?: any;
}) => {
  const payload = {
    name,
    category,
    city,
    state,
    country,
    address: typeof address === "object" ? address : {
      streetAddress: address,
      city,
      state,
      country,
      ...(extraAddress || {}),
    },
    ...(extraAddress || {}),
    description,
    images,
    documents,
    features,
    coordinates,
  };

  const res = await axiosApi.post("/adventures/vendor/adventures", payload);
  return {
    success: res.data.success,
    message: res.data.message,
    currentStep: res.data.data.currentStep,
  };
};
export const saveandsubmit = async () => {
  const res = await axiosApi.post("/vendors/submit");

  return {
    success: res.data.success,
    message: res.data.message,
  };
};
