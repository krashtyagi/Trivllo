"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  LoginFormProps,
  hotelCreateSchema,
  type SignUpProps,
  SignUpSchema,
  HotelCreatePayload,
  serviceTypeEnum,
  serviceTypeEnumProps,
} from "@/schema/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth.store";
import { useCurrentUser } from "@/services/queryes";
import {
  BankDetails,
  businessDetails,
  saveandsubmit,
  SaveHotelDetails,
  SaveCabDetails,
  SaveBikeDetails,
  SaveTourDetails,
  SaveAdventureDetails,
} from "./services";
import axios from "axios";

// hooks/use-signup.ts
export const useSignUp = () => {
  const [loading, setLoading] = React.useState<boolean>(false);
  const navigate = useRouter();
  const { userSignup, verifyOTP, setCurrStep } = useAuthStore();
  const { refetch } = useCurrentUser();

  const methods = useForm<SignUpProps>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      role: "vendor",
      gender: "male",
      country: "India",
      serviceType: "hotel",
      verificationDocs: [
        {
          docName: "panCard",
          docUrl: "",
        },
        {
          docName: "aadhaarFront",
          docUrl: "",
        },
      ],
    },
    mode: "onChange",
  });
  const submitStep_1 = async (
    serviceType: serviceTypeEnumProps,
    businessName: string,
    businessEmail: string,
    businessPhone: string,
    businessAddress: string,
    city: string,
    state: string,
    country: string,
    panNumber: string,
    aadhaarNumber: string,
    verificationDocs: { docName: string; docUrl: string }[],
    onNext: React.Dispatch<React.SetStateAction<number>>,
  ) => {
    setLoading(true);
    try {
      const filteredDocs = (verificationDocs || []).filter(doc => doc.docUrl && doc.docUrl.trim() !== "");
      const res = await businessDetails({
        serviceType, //
        businessName, //
        businessEmail, //
        businessPhone,
        businessAddress,
        city, //
        state, //
        country, //
        panNumber,
        aadhaarNumber,

        verificationDocs: filteredDocs, //
      });
      if (res.success) {
        toast.success(res.message || "Business details added successfully");
        onNext(res.currentStep + 1);
        setCurrStep(res.currentStep! + 1);
      } else {
        toast.error(res.message || "Failed to add business details");
      }

      // onNext((f) => f + 1);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  const submitStep_2 = async (
    bankName: string,
    accountNumber: string,
    ifscCode: string,
    branchName: string,
    accountHolderName: string,
    bankProof: { url: string; public_id: string; resource_type: string },
    onNext: React.Dispatch<React.SetStateAction<number>>,
  ) => {
    setLoading(true);
    try {
      const res = await BankDetails({
        bankName,
        accountNumber,
        ifscCode,
        branchName,
        accountHolderName,
        bankProof,
      });
      if (res.success) {
        toast.success(res.message || "Bank details added successfully");
        onNext(res.currentStep! + 1);
        setCurrStep(res.currentStep! + 1);
      } else {
        toast.error(res.message || "Failed to add bank details");
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  const submitStep_3 = async (
    serviceType: serviceTypeEnumProps,
    name: string,
    address: string,
    description: string,
    amenities: string[],
    documents: any[],
    images: any[],
    city: string,
    location: { type: string; coordinates: [number, number] },
    onNext: React.Dispatch<React.SetStateAction<number>>,
    extraFields?: { adventureCategory?: string; logo?: any; extraAddress?: any }
  ) => {
    setLoading(true);

    try {
      // If logo is provided in step 3, update vendor logo
      if (extraFields?.logo?.url) {
        try {
          const { axiosApi } = await import("@/lib/axios");
          await axiosApi.patch("/vendors/logo", { logo: extraFields.logo });
        } catch (logoErr) {
          console.error("Failed to save vendor logo:", logoErr);
        }
      }

      let res;
      if (serviceType === "cab") {
        res = await SaveCabDetails({
          name,
          address,
          description,
          features: amenities,
          documents,
          images,
          location: { city, state: extraFields?.extraAddress?.state || "", country: extraFields?.extraAddress?.country || "India" },
          coordinates: { lat: location.coordinates[1], lng: location.coordinates[0] },
          extraAddress: extraFields?.extraAddress,
        });
      } else if (serviceType === "bike") {
        res = await SaveBikeDetails({
          name,
          address,
          description,
          features: amenities,
          documents,
          images,
          location: { city, state: extraFields?.extraAddress?.state || "", country: extraFields?.extraAddress?.country || "India" },
          coordinates: { lat: location.coordinates[1], lng: location.coordinates[0] },
          extraAddress: extraFields?.extraAddress,
        });
      } else if (serviceType === "tour") {
        res = await SaveTourDetails({
          name,
          address,
          description,
          features: amenities,
          documents,
          images,
          location: { city, state: extraFields?.extraAddress?.state || "", country: extraFields?.extraAddress?.country || "India" },
          coordinates: { lat: location.coordinates[1], lng: location.coordinates[0] },
          extraAddress: extraFields?.extraAddress,
        });
      } else if (serviceType === "adventure") {
        res = await SaveAdventureDetails({
          name,
          category: extraFields?.adventureCategory || "rafting",
          city,
          state: extraFields?.extraAddress?.state || "",
          country: extraFields?.extraAddress?.country || "India",
          address,
          description,
          images,
          documents,
          features: amenities,
          coordinates: { lat: location.coordinates[1], lng: location.coordinates[0] },
          extraAddress: extraFields?.extraAddress,
        });
      } else {
        // hotel
        res = await SaveHotelDetails({
          name,
          address,
          description,
          amenities,
          documents,
          images,
          city,
          location,
          extraAddress: extraFields?.extraAddress,
        });
      }

      if (res.success) {
        toast.success(res.message || `${serviceType.toUpperCase()} details added successfully`);
        const r = await saveandsubmit();
        if (r.success) {
          toast.success(r.message || "Registration submitted successfully!");
          onNext(res.currentStep! + 2);
          setCurrStep(res.currentStep! + 2);
        }
      } else {
        toast.error(res.message || `Failed to add ${serviceType} details`);
      }
    } catch (error: any) {
      toast.error(error?.message || `Failed to add ${serviceType} details`);
    } finally {
      setLoading(false);
    }
  };
  const submitStep_4 = (
    onNext: React.Dispatch<React.SetStateAction<number>>,
  ) => {
    setLoading(true);
    try {
      // console.log(data);
      onNext((f) => f + 1);
    } catch (error) {}
  };

  const onHandleSubmit = methods.handleSubmit(async (data) => {
    setLoading(true);

    try {
      const result = await verifyOTP({ email: data.email, otp: data.otp });
      if (result.success) {
        toast.success(result.message || "Account created successfully!");
        // await refetch();
        setCurrStep(2);
        navigate.push("/signup/process");
      } else {
        toast.error(result.message || "Failed to verify OTP");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  });
  const veryOtp = async (
    email: string,
    otp: string,
    onNext: React.Dispatch<React.SetStateAction<number>>,
  ) => {
    setLoading(true);

    try {
      const result = await verifyOTP({ email: email, otp: otp });
      if (result.success) {
        toast.success(result.message || "OTP verified successfully");
        // onNext(result.currentStep);
        setCurrStep(result.currentStep + 1);
        navigate.push("/signup/process");
      } else {
        toast.error(result.message || "Failed to verify OTP");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const onGenerateOtp = async (
    email: string,
    password: string,
    role: string,
    firstName: string,
    lastName: string,
    phoneNumber: string,
    // gender: string,
    // dob: string,
    // country: string,
    // zipcode: string,
    // address: string,
    onNext: React.Dispatch<React.SetStateAction<number>>,
  ) => {
    setLoading(true);

    try {
      const result = await userSignup({
        email,
        password,
        role,
        firstName,
        lastName,
        phoneNumber,
        // gender,
        // dob,
        // country,
        // zipcode,
        // address,
      });
      if (result.success) {
        toast.success(result.message || "OTP sent to your email");
        onNext((prev) => prev + 1);
      } else {
        toast.error(result.message || "Failed to send OTP");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    methods,
    onHandleSubmit,
    onGenerateOtp,
    veryOtp,
    submitStep_1,
    submitStep_2,
    submitStep_3,
    submitStep_4,
  };
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// export const RegisterHotel = () => {
//   const [loading, setLoading] = React.useState<boolean>(false);
//   const navigate = useRouter();
//   const { userSignup, verifyOTP } = useAuthStore();
//   const { refetch } = useCurrentUser();

//   const methods = useForm<HotelCreatePayload>({
//     resolver: zodResolver(hotelCreateSchema),
//     defaultValues: {
//      address:"",
//      amenities:[],
//      city:"",
//      description:"",
//      documents:[],
//      images:[],
//      location:{
//       type:"",
//       coordinates:[0,0]
//      },
//      name:"",

//     },
//     mode: "onChange",
//   });
//   const submitStep_2 = (
//     onNext: React.Dispatch<React.SetStateAction<number>>,
//   ) => {
//     try {
//       // console.log(data);
//       onNext((f) => f + 1);
//     } catch (error) {}
//   };
//   const submitStep_3 = (
//     onNext: React.Dispatch<React.SetStateAction<number>>,
//   ) => {
//     try {
//       // console.log(data);
//       onNext((f) => f + 1);
//     } catch (error) {}
//   };
//   const submitStep_4 = (
//     onNext: React.Dispatch<React.SetStateAction<number>>,
//   ) => {
//     try {
//       // console.log(data);
//       onNext((f) => f + 1);
//     } catch (error) {}
//   };
//   const submitStep_1 = (
//     onNext: React.Dispatch<React.SetStateAction<number>>,
//   ) => {
//     try {
//       // console.log(data);
//       onNext((f) => f + 1);
//     } catch (error) {}
//   };

//   const onHandleSubmit = methods.handleSubmit(async (data) => {
//     setLoading(true);
//     console.log(data);

//     try {
//       const result = await verifyOTP({ email: data.email, otp: data.otp });
//       if (result.success) {
//         toast.success(result.message || "Account created successfully!");
//         // await refetch();
//         navigate.push("/signup/process");
//       } else {
//         toast.error(result.message || "Failed to verify OTP");
//       }
//     } catch (error) {
//       toast.error("An unexpected error occurred");
//     } finally {
//       setLoading(false);
//     }
//   });
//   const veryOtp = async (
//     email: string,
//     otp: string,
//     onNext: React.Dispatch<React.SetStateAction<number>>,
//   ) => {
//     setLoading(true);

//     try {
//       const result = await verifyOTP({ email: email, otp: otp });
//       if (result.success) {
//         toast.success(result.message || "OTP verified successfully");
//         onNext((prev) => prev + result.currentStep);
//         navigate.push("/signup/process");
//       } else {
//         toast.error(result.message || "Failed to verify OTP");
//       }
//     } catch (error) {
//       toast.error("An unexpected error occurred");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const onGenerateOtp = async (
//     email: string,
//     password: string,
//     role: string,
//     firstName: string,
//     lastName: string,
//     phoneNumber: string,
//     gender: string,
//     dob: string,
//     country: string,
//     zipcode: string,
//     address: string,
//     onNext: React.Dispatch<React.SetStateAction<number>>,
//   ) => {
//     setLoading(true);
//     console.log(email, password);

//     try {
//       const result = await userSignup({
//         email,
//         password,
//         role,
//         firstName,
//         lastName,
//         phoneNumber,
//         gender,
//         dob,
//         country,
//         zipcode,
//         address,
//       });
//       if (result.success) {
//         toast.success(result.message || "OTP sent to your email");
//         onNext((prev) => prev + 1);
//       } else {
//         toast.error(result.message || "Failed to send OTP");
//       }
//     } catch (error) {
//       toast.error("An unexpected error occurred");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return {
//     loading,
//     methods,
//     onHandleSubmit,
//     onGenerateOtp,
//     veryOtp,
//     submitStep_1,
//     submitStep_2,
//     submitStep_3,
//     submitStep_4,
//   };
// };
