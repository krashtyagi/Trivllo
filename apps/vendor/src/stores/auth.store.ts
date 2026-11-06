import { axiosApi } from "@/lib/axios";
import { vendorAccessToken } from "@/services/auth";
import { authClient } from "@/lib/auth-client";
import { useCurrentUser } from "@/services/queryes";
import { create } from "zustand";
import { persist } from "zustand/middleware"; // 1. Import the middleware

interface User {
  id: string;
  email: string;
  role: string;
  isVerified: boolean;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  phoneNumber?: string;
  gender?: string;
  country?: string;
  address?: string;
  zipCode?: string;
}

interface AuthStates {
  currStep: number | null;
  setCurrStep: (step: number) => void;
  steeperStep: number | null;
  setSteeperStep: (step: number) => void;
  loginBoxOpen: boolean;
  setLoginBoxOpen: (open: boolean) => void;
  signupBoxOpen: boolean;
  setSignupBoxOpen: (open: boolean) => void;
  vendorEmail: string;
  setVendorEmail: (email: string) => void;
  businessName: string;
  setBusinessName: (name: string) => void;
  hotelId: string;
  setHotelId: (id: string) => void;
  isLoging: boolean;
  switching: boolean;
  isSiging: boolean;
  currUser: User | null;
  hotel: { _id: string; name: string };
  draft: boolean;
  userLogin: (data: Login_signup_Data) => Promise<any>;
  switchAccount: (id: string, cat: string) => Promise<any>;
  userSignup: (data: Login_signup_Data) => Promise<any>;
  verifyOTP: (data: { email: string; otp: string }) => Promise<any>;
  resendOTP: (email: string) => Promise<any>;
  updateUser: (data: Partial<User>) => Promise<any>;
  uploadFile: (file: File, folder?: string) => Promise<any>;
  deleteFile: (publicId: string, resourceType?: string) => Promise<any>;
  deleteMultipleFiles: (publicIds: string[], resourceType?: string) => Promise<any>;
  forgotPassword: (data: {
    email: string;
  }) => Promise<{ success: boolean; message: string }>;
  verifyForgotPasswordOTP: (data: {
    email: string;
    otp: string;
    endpoint: string;
  }) => Promise<{ success: boolean; message: string }>;
  resetPassword: (data: {
    email: string;
    otp: string;
    newPassword: string;
  }) => Promise<{ success: boolean; message: string }>;
}

interface Login_signup_Data {
  email: string;
  password?: string;
  role?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  gender?: string;
  dob?: string;
  country?: string;
  address?: string;
  zipcode?: string;
}

// 2. Wrap your store configuration with persist()
export const useAuthStore = create<AuthStates>()(
  persist(
    (set) => ({
      loginBoxOpen: false,
      setLoginBoxOpen: (open: boolean) => set({ loginBoxOpen: open }),
      signupBoxOpen: false,
      setSignupBoxOpen: (open: boolean) => set({ signupBoxOpen: open }),
      isLoging: false,
      isSiging: false,
      currUser: null,
      switching: false,
      currStep: 2,
      steeperStep: 2,
      setSteeperStep: (s: number) => set({ steeperStep: s }),
      setCurrStep: (step: number) => set({ currStep: step }),
      vendorEmail: "",
      setVendorEmail: (email: string) => set({ vendorEmail: email }),
      businessName: "",
      setBusinessName: (name: string) => set({ businessName: name }),
      hotelId: "",
      setHotelId: (id: string) => set({ hotelId: id }),
      hotel: { _id: "", name: "" },
      draft: true,

      switchAccount: async (id: string, cat: string) => {
        set({ switching: true });
        try {
          const res = await axiosApi.post("/vendor-accounts/switch-account", {
            targetVendorId: id,
          });
          if (res.data.success) {
            const token = res.data.accessToken;
            const status = res.data.vendor.status;
            localStorage.setItem(vendorAccessToken, token);
            localStorage.setItem("status", status);
            localStorage.setItem("category", cat);

            return {
              success: true,
            };
          }
          return {
            success: false,
            message: res.data.message || "Login failed",
            currentStep: 0,
            status: "draft",
          };
        } catch (error) {
          return [];
        } finally {
          set({ switching: false });
        }
      },
      userLogin: async (data: Login_signup_Data) => {
        set({ isLoging: true });
        try {
          if (data.email && data.password) {
            const res = await authClient.signIn.email({
              email: data.email,
              password: data.password,
            });

            if (res.data) {
              const userRole = (res.data.user as any)?.role;
              const isVendor = (res.data.user as any)?.isVendor;
              if (userRole !== "vendor" && !isVendor) {
                await authClient.signOut();
                return {
                  success: false,
                  message: "Access denied. Not a vendor account.",
                  currentStep: 0,
                  status: "draft",
                };
              }

              set({ currUser: res.data.user as any });
              const sessionToken = (res.data as any)?.token || (res.data as any)?.session?.token || "better-auth-session";
              localStorage.setItem(vendorAccessToken, sessionToken);

              try {
                const vendorProfile = await axiosApi.get("/vendors/me", {
                  headers: {
                    Authorization: `Bearer ${sessionToken}`,
                  },
                });
                const vData = vendorProfile.data?.data;
                if (vData) {
                  const status = vData.vendor?.status || vData.status || "approved";
                  const currentStep = vData.vendor?.currentStep || vData.currentStep || 1;
                  const serviceType = vData.vendor?.serviceType || vData.serviceType || "hotel";
                  localStorage.setItem("status", status);
                  localStorage.setItem("category", serviceType);
                  set({
                    draft: ["draft", "pending", "rejected"].includes(status),
                    currStep: currentStep,
                  });
                  return {
                    success: true,
                    message: "Login successful",
                    currentStep,
                    status,
                  };
                }
              } catch (profileErr) {}

              localStorage.setItem("status", "approved");
              localStorage.setItem("category", "hotel");
              return {
                success: true,
                message: "Login successful",
                currentStep: 1,
                status: "approved",
              };
            }

            if (res.error) {
              // Fallback to legacy login during transition
              try {
                const fallbackRes = await axiosApi.post("/auth/login", data);
                if (fallbackRes.data.success) {
                  set({ currUser: fallbackRes.data.data.user });
                  const token = fallbackRes.data.accessToken;
                  const status = fallbackRes.data.data.vendor?.status || "approved";
                  const currentStep = fallbackRes.data.data.vendor?.currentStep || 1;
                  localStorage.setItem(vendorAccessToken, token);
                  localStorage.setItem("status", status);
                  localStorage.setItem(
                    "category",
                    fallbackRes.data.data?.vendor?.serviceType || "hotel",
                  );
                  set({
                    draft: ["draft", "pending", "rejected"].includes(status),
                    currStep: currentStep,
                  });
                  return {
                    success: true,
                    message: fallbackRes.data.message,
                    currentStep: currentStep,
                    status: status,
                  };
                }
              } catch (e) {}

              return {
                success: false,
                message: res.error.message || "Login failed",
                currentStep: 0,
                status: "draft",
              };
            }
          }

          const res = await axiosApi.post("/auth/login", data);
          if (res.data.success) {
            set({ currUser: res.data.data.user });
            const token = res.data.accessToken;
            const status = res.data.data.vendor?.status || "approved";
            const currentStep = res.data.data.vendor?.currentStep || 1;
            localStorage.setItem(vendorAccessToken, token);
            localStorage.setItem("status", status);
            localStorage.setItem(
              "category",
              res.data.data?.vendor?.serviceType || "hotel",
            );
            set({
              draft: ["draft", "pending", "rejected"].includes(status),
              currStep: currentStep,
            });
            return {
              success: true,
              message: res.data.message,
              currentStep: currentStep,
              status: status,
            };
          }
          return {
            success: false,
            message: res.data.message || "Login failed",
            currentStep: 0,
            status: "draft",
          };
        } catch (error) {
          const err = error as any;
          return {
            success: false,
            message: err.response?.data?.message || "Login failed",
            currentStep: 0,
            status: "draft",
          };
        } finally {
          set({ isLoging: false });
        }
      },

      userSignup: async (data: Login_signup_Data) => {
        set({ isSiging: true });
        try {
          const res = await axiosApi.post("/auth/signup", data);
          return { success: res.data.success, message: res.data.message };
        } catch (error) {
          const err = error as any;
          return {
            success: false,
            message: err.response?.data?.message || "Signup failed",
          };
        } finally {
          set({ isSiging: false });
        }
      },

      verifyOTP: async (data: { email: string; otp: string }) => {
        set({ isSiging: true });
        try {
          const res = await axiosApi.post("/auth/verify-otp", data);
          if (res.data.success) {
            set({ currUser: res.data.data.user });
            localStorage.setItem(vendorAccessToken, res.data.accessToken);
            localStorage.setItem("status", res.data.data.vendor.status);
            return {
              success: true,
              message: res.data.message,
              currentStep: res.data.data.vendor?.currentStep || 0,
              status: res.data.data.vendor.status,
            };
          }
          return {
            success: false,
            message: res.data.message || "Verification failed",
            currentStep: res.data.data.vendor.currentStep,
            status: res.data.data.vendor.status,
          };
        } catch (error) {
          const err = error as any;
          return {
            success: false,
            message: err.response?.data?.message || "Verification failed",
            currentStep: 0,
            status: "draft",
          };
        } finally {
          set({ isSiging: false });
        }
      },

      resendOTP: async (email: string) => {
        try {
          const res = await axiosApi.post("/auth/resend-otp", { email });
          return { success: res.data.success, message: res.data.message };
        } catch (error) {
          const err = error as any;
          return {
            success: false,
            message: err.response?.data?.message || "Failed to resend OTP",
          };
        }
      },

      updateUser: async (data: Partial<User>) => {
        try {
          const res = await axiosApi.patch("/users/update-me", data);
          if (res.data.success) {
            set({ currUser: res.data.data });
            return { success: true, message: "Profile updated successfully" };
          }
          return {
            success: false,
            message: res.data.message || "Failed to update profile",
          };
        } catch (error) {
          const err = error as any;
          return {
            success: false,
            message: err.response?.data?.message || "Failed to update profile",
          };
        }
      },

      uploadFile: async (file: File, folder: string = "profiles") => {
        const formData = new FormData();
        formData.append("files", file);
        formData.append("folder", folder);
        try {
          const res = await axiosApi.post("/uploads", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          if (res.data.success) {
            return {
              success: true,
              url: res.data.files[0].url,
              message: "File uploaded successfully",
              public_id: res.data.files[0].public_id,
              resource_type: res.data.files[0].resource_type,
            };
          }
          return {
            success: false,
            message: res.data.message || "Upload failed",
          };
        } catch (error) {
          const err = error as any;
          return {
            success: false,
            message: err.response?.data?.message || "Upload failed",
          };
        }
      },

      deleteFile: async (publicId: string, resourceType: string = "image") => {
        if (!publicId) return { success: true };
        try {
          const res = await axiosApi.delete("/uploads", {
            data: { public_id: publicId, resource_type: resourceType },
          });
          return {
            success: res.data.success,
            message: res.data.message || "File deleted successfully",
          };
        } catch (error) {
          const err = error as any;
          return {
            success: false,
            message: err.response?.data?.message || "Failed to delete file",
          };
        }
      },

      deleteMultipleFiles: async (publicIds: string[], resourceType: string = "image") => {
        if (!publicIds || publicIds.length === 0) return { success: true };
        try {
          const res = await axiosApi.delete("/uploads", {
            data: { public_ids: publicIds, resource_type: resourceType },
          });
          return {
            success: res.data.success,
            message: res.data.message || "Files deleted successfully",
          };
        } catch (error) {
          const err = error as any;
          return {
            success: false,
            message: err.response?.data?.message || "Failed to delete files",
          };
        }
      },

      forgotPassword: async (data: { email: string }) => {
        set({ isSiging: true });
        try {
          const res = await axiosApi.post("/auth/forgot-password", data);
          return { success: res.data.success, message: res.data.message };
        } catch (error) {
          const err = error as any;
          return {
            success: false,
            message: err.response?.data?.message || "Forgot password failed",
          };
        } finally {
          set({ isSiging: false });
        }
      },

      verifyForgotPasswordOTP: async (data: {
        email: string;
        otp: string;
        endpoint: string;
      }) => {
        set({ isSiging: true });
        try {
          const res = await axiosApi.post(data.endpoint, {
            email: data.email,
            otp: data.otp,
          });
          if (res.data.success) {
            return { success: true, message: res.data.message };
          }
          return {
            success: false,
            message: res.data.message || "Verification failed",
          };
        } catch (error) {
          const err = error as any;
          return {
            success: false,
            message: err.response?.data?.message || "Verification failed",
          };
        } finally {
          set({ isSiging: false });
        }
      },

      resetPassword: async (data: {
        email: string;
        otp: string;
        newPassword: string;
      }) => {
        set({ isSiging: true });
        try {
          const res = await axiosApi.patch("/auth/reset-password", data);
          return { success: res.data.success, message: res.data.message };
        } catch (error) {
          const err = error as any;
          return {
            success: false,
            message: err.response?.data?.message || "Reset password failed",
          };
        } finally {
          set({ isSiging: false });
        }
      },
    }),
    {
      name: "auth-storage", // 3. Unique name for your localStorage key
    },
  ),
);
