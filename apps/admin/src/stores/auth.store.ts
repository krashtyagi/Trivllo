import { axiosApi } from "@/lib/axios";
import { adminAccessToken } from "@/services/auth";
import { authClient } from "@/lib/auth-client";
import { create } from "zustand";

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
  loginBoxOpen: boolean;
  setLoginBoxOpen: (open: boolean) => void;
  signupBoxOpen: boolean;
  setSignupBoxOpen: (open: boolean) => void;
  isLoging: boolean;
  isSiging: boolean;
  currUser: User | null;
  hotel: {
    _id: string;
    name: string;
  };
  draft: boolean;
  userLogin: (data: Login_signup_Data) => Promise<{
    success: boolean;
    message: string;
    user?: any;
  }>;
  userSignup: (
    data: Login_signup_Data,
  ) => Promise<{ success: boolean; message: string }>;
  verifyOTP: (data: { email: string; otp: string }) => Promise<{
    success: boolean;
    message: string;
    currentStep: number;
    status: string;
  }>;
  resendOTP: (email: string) => Promise<{ success: boolean; message: string }>;
  updateUser: (
    data: Partial<User>,
  ) => Promise<{ success: boolean; message: string }>;
  uploadFile: (file: File) => Promise<{
    success: boolean;
    url?: string;
    message: string;
    public_id?: string;
    resource_type?: string;
  }>;
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

export const useAuthStore = create<AuthStates>()((set) => ({
  loginBoxOpen: false,
  setLoginBoxOpen: (open: boolean) => set({ loginBoxOpen: open }),
  signupBoxOpen: false,
  setSignupBoxOpen: (open: boolean) => set({ signupBoxOpen: open }),
  isLoging: false,
  isSiging: false,
  currUser: null,
  currStep: null,
  setCurrStep: (step: number) => set({ currStep: step }),
  hotel: {
    _id: "",
    name: "",
  },
  draft: true,

  userLogin: async (data: Login_signup_Data) => {
    set({ isLoging: true });
    try {
      if (data.email && data.password) {
        const res = await authClient.signIn.email({
          email: data.email,
          password: data.password,
        });

        if (res.data) {
          const userRole = (res.data.user as any)?.role || "user";
          const allowedRoles = [
            "admin",
            "super_admin",
            "blog_author",
            "blog_editor",
            "seo_manager",
            "reviewer",
          ];

          if (!allowedRoles.includes(userRole)) {
            await authClient.signOut();
            return {
              success: false,
              message: "Access denied. Admin privileges required.",
            };
          }

          set({ currUser: res.data.user as any });
          const sessionToken = (res.data as any)?.token || (res.data as any)?.session?.token || "better-auth-session";
          localStorage.setItem(adminAccessToken, sessionToken);
          localStorage.setItem("status", "approved");

          return {
            success: true,
            message: "Login successful",
            user: res.data.user,
          };
        }

        if (res.error) {
          // Fallback to legacy login during transition
          try {
            const fallbackRes = await axiosApi.post("/auth/login", data);
            if (fallbackRes.data.success) {
              set({ currUser: fallbackRes.data.data.user });
              const token = fallbackRes.data.accessToken;
              if (token) localStorage.setItem(adminAccessToken, token);
              localStorage.setItem("status", "approved");
              return {
                success: true,
                message: fallbackRes.data.message,
                user: fallbackRes.data.data.user,
              };
            }
          } catch (e) {}

          return {
            success: false,
            message: res.error.message || "Login failed",
          };
        }
      }

      const res = await axiosApi.post("/auth/login", data);
      if (res.data.success) {
        set({ currUser: res.data.data.user });
        const token = res.data.accessToken;
        localStorage.setItem(adminAccessToken, token);

        const status = res.data.data.vendor?.status || "approved";
        const currentStep = res.data.data.vendor?.currentStep || 1;
        localStorage.setItem("status", status);
        set({
          draft: ["draft", "pending", "rejected"].includes(status),
          currStep: currentStep,
        });

        return {
          success: true,
          message: res.data.message,
          user: res.data.data.user,
        };
      }
      return {
        success: false,
        message: res.data.message || "Login failed",
        currentStep: 0,
        status: "draft",
      };
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
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
      const err = error as { response?: { data?: { message?: string } } };
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
        const token = res.data.accessToken;
        localStorage.setItem(adminAccessToken, token);
        const status = res.data.data.vendor?.status || "approved";
        const currentStep = res.data.data.vendor?.currentStep || 1;
        localStorage.setItem("status", status);
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
        message: res.data.message || "Verification failed",
        currentStep: res.data.data.vendor.currentStep,
        status: res.data.data.vendor.status,
      };
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
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
      const err = error as { response?: { data?: { message?: string } } };
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
      const err = error as { response?: { data?: { message?: string } } };
      return {
        success: false,
        message: err.response?.data?.message || "Failed to update profile",
      };
    }
  },

  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append("files", file);
    formData.append("folder", "profiles");

    try {
      const res = await axiosApi.post("/uploads", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (res.data.success) {
        return {
          success: true,
          url: res.data.files[0].url,
          message: "File uploaded successfully",
          public_id: res.data.files[0].public_id as string,
          resource_type: res.data.files[0].resource_type as string,
        };
      }
      return {
        success: false,
        message: res.data.message || "Upload failed",
      };
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      return {
        success: false,
        message: err.response?.data?.message || "Upload failed",
      };
    }
  },

  forgotPassword: async (data: { email: string }) => {
    set({ isSiging: true });
    try {
      const res = await axiosApi.post("/auth/forgot-password", data);
      return { success: res.data.success, message: res.data.message };
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
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
      const err = error as { response?: { data?: { message?: string } } };
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
      const err = error as { response?: { data?: { message?: string } } };
      return {
        success: false,
        message: err.response?.data?.message || "Reset password failed",
      };
    } finally {
      set({ isSiging: false });
    }
  },
}));
