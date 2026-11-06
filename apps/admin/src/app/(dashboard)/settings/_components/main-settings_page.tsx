"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Loader2,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  Key,
  Eye,
  EyeOff,
  Laptop,
  Smartphone,
  Tablet,
  Globe,
  Clock,
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  LogOut,
  Upload,
  Percent,
  Calculator,
  Server,
  Layers,
} from "lucide-react";
import PopularSectionsSettings from "./popular-sections-settings";
import {
  useActiveTax,
  useVerifyTaxPassword,
  useSetTaxWithPassword,
  useAdminProfile,
  useUpdateAdminProfile,
  useChangeAdminPassword,
  useAdminSessions,
  useRevokeSession,
  useRevokeOtherSessions,
} from "../_calls/queryes";
import { useAuthStore } from "@/stores/auth.store";
import { useSearchParams } from "next/navigation";

// ==========================================
// SCHEMAS
// ==========================================

export const ProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().optional(),
  gender: z.string().optional(),
  country: z.string().optional(),
  address: z.string().optional(),
  zipcCode: z.string().optional(),
  bio: z.string().max(250, "Bio cannot exceed 250 characters").optional(),
});

export const PasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  });

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function AdminSettingsPage({
  defaultTab = "destinations",
}: {
  defaultTab?: string;
}) {
  const searchParams = useSearchParams();
  const urlTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(urlTab || defaultTab);

  useEffect(() => {
    if (urlTab) {
      setActiveTab(urlTab);
    }
  }, [urlTab]);

  // ------------------------------------------
  // TAX RATES STATE & MUTATIONS
  // ------------------------------------------
  const { data: initialTaxData, isLoading: isInitialTaxLoading } = useActiveTax();
  const verifyTaxMutation = useVerifyTaxPassword();
  const setTaxMutation = useSetTaxWithPassword();

  const [isTaxUnlocked, setIsTaxUnlocked] = useState(false);
  const [taxUnlockPassword, setTaxUnlockPassword] = useState("");
  const [showUnlockPassword, setShowUnlockPassword] = useState(false);

  const [currentTaxRate, setCurrentTaxRate] = useState<number>(12);
  const [pendingTaxRate, setPendingTaxRate] = useState<number>(12);
  const [taxConfirmPassword, setTaxConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [simulatorAmount, setSimulatorAmount] = useState<number>(10000);

  // ------------------------------------------
  // PROFILE STATE & MUTATIONS
  // ------------------------------------------
  const {
    data: profileData,
    isLoading: isProfileLoading,
    refetch: refetchProfile,
  } = useAdminProfile();
  const updateProfileMutation = useUpdateAdminProfile();
  const uploadFile = useAuthStore((s) => s.uploadFile);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const profileForm = useForm<z.infer<typeof ProfileSchema>>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      gender: "other",
      country: "India",
      address: "",
      zipcCode: "",
      bio: "",
    },
  });

  useEffect(() => {
    const user = profileData?.data?.data || profileData?.data;
    if (user) {
      profileForm.reset({
        firstName: user.firstName || user.name?.split(" ")[0] || "",
        lastName:
          user.lastName ||
          user.name?.split(" ").slice(1).join(" ") ||
          "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        gender: user.gender || "other",
        country: user.country || "India",
        address: user.address || "",
        zipcCode: user.zipcCode || "",
        bio: user.bio || "",
      });
      if (user.avatar) {
        setAvatarPreview(user.avatar);
      }
    }
  }, [profileData, profileForm]);

  // ------------------------------------------
  // SECURITY / PASSWORD STATE & MUTATIONS
  // ------------------------------------------
  const changePasswordMutation = useChangeAdminPassword();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const passwordForm = useForm<z.infer<typeof PasswordSchema>>({
    resolver: zodResolver(PasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const watchedNewPassword = passwordForm.watch("newPassword") || "";

  // Dynamic Password Variety Checklist & Strength
  const passwordStats = useMemo(() => {
    const hasMinLength = watchedNewPassword.length >= 8;
    const hasLower = /[a-z]/.test(watchedNewPassword);
    const hasUpper = /[A-Z]/.test(watchedNewPassword);
    const hasDigit = /[0-9]/.test(watchedNewPassword);
    const hasSpecial = /[^a-zA-Z0-9]/.test(watchedNewPassword);

    let score = 0;
    if (hasMinLength) score++;
    if (hasLower) score++;
    if (hasUpper) score++;
    if (hasDigit) score++;
    if (hasSpecial) score++;

    let label = "Very Weak";
    let color = "bg-red-500 text-red-500";
    let percent = 20;

    if (score >= 5) {
      label = "Extremely Strong";
      color = "bg-emerald-500 text-emerald-500";
      percent = 100;
    } else if (score >= 4) {
      label = "Strong";
      color = "bg-green-500 text-green-500";
      percent = 80;
    } else if (score === 3) {
      label = "Moderate";
      color = "bg-blue-500 text-blue-500";
      percent = 60;
    } else if (score === 2) {
      label = "Fair";
      color = "bg-amber-500 text-amber-500";
      percent = 40;
    }

    return {
      score,
      label,
      color,
      percent,
      checks: {
        hasMinLength,
        hasLower,
        hasUpper,
        hasDigit,
        hasSpecial,
      },
    };
  }, [watchedNewPassword]);

  // ------------------------------------------
  // SESSIONS STATE & MUTATIONS
  // ------------------------------------------
  const {
    data: sessionsData,
    isLoading: isSessionsLoading,
    refetch: refetchSessions,
    isFetching: isSessionsFetching,
  } = useAdminSessions();
  const revokeSessionMutation = useRevokeSession();
  const revokeOtherSessionsMutation = useRevokeOtherSessions();

  const sessionsList = useMemo(() => {
    return sessionsData?.data?.data?.sessions || [];
  }, [sessionsData]);

  // ==========================================
  // HANDLERS
  // ==========================================

  // 1. Tax Unlock Handler
  const handleUnlockTax = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taxUnlockPassword.trim()) {
      toast.error("Please enter your admin password");
      return;
    }

    try {
      const res = await verifyTaxMutation.mutateAsync(taxUnlockPassword);
      const taxRate =
        res.data?.data?.taxPercentage ?? res.data?.taxPercentage ?? 12;
      setCurrentTaxRate(taxRate);
      setPendingTaxRate(taxRate);
      setIsTaxUnlocked(true);
      setTaxUnlockPassword("");
      toast.success("Tax Vault Unlocked: Access granted for this session");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          "Incorrect admin password. Access denied."
      );
    }
  };

  // 2. Tax Save Handler
  const handleSaveTax = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pendingTaxRate < 0 || pendingTaxRate > 100) {
      toast.error("Tax rate percentage must be between 0 and 100");
      return;
    }
    if (!taxConfirmPassword.trim()) {
      toast.error(
        "Admin password is required to authorize changing the tax rate"
      );
      return;
    }

    try {
      await setTaxMutation.mutateAsync({
        taxPercentage: Number(pendingTaxRate),
        password: taxConfirmPassword,
      });
      setCurrentTaxRate(pendingTaxRate);
      setTaxConfirmPassword("");
      toast.success(
        `Tax rate updated to ${pendingTaxRate}% successfully across all bookings`
      );
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          "Failed to update tax. Please check your password."
      );
    }
  };

  // 3. Profile Save Handler
  const onProfileSubmit = async (values: z.infer<typeof ProfileSchema>) => {
    try {
      // Exclude email from payload as email cannot be changed
      const { email, ...payload } = values;
      await updateProfileMutation.mutateAsync({
        ...payload,
        avatar: avatarPreview,
      });
      toast.success("Admin profile updated successfully");
      refetchProfile();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update profile");
    }
  };

  // 4. Avatar File Picker
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const res = await uploadFile(file);
      if (res.success && res.url) {
        setAvatarPreview(res.url);
        toast.success("Profile photo uploaded");
      } else {
        toast.error(res.message || "Upload failed");
      }
    } catch {
      toast.error("Error uploading profile photo");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // 5. Password Update Handler
  const onPasswordSubmit = async (values: z.infer<typeof PasswordSchema>) => {
    try {
      const res = await changePasswordMutation.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      toast.success(
        res.data?.message || "Admin password changed successfully"
      );
      passwordForm.reset();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          "Failed to change password. Please verify current password."
      );
    }
  };

  // 6. Revoke Session Handler
  const handleRevokeSession = async (sessionId: string) => {
    try {
      await revokeSessionMutation.mutateAsync(sessionId);
      toast.success("Device session revoked successfully");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to revoke session"
      );
    }
  };

  // 7. Revoke Other Sessions Handler
  const handleRevokeAllOtherSessions = async () => {
    try {
      const res = await revokeOtherSessionsMutation.mutateAsync();
      const count =
        res.data?.data?.revokedCount ?? res.data?.message ?? "All other";
      toast.success(
        `Successfully terminated other active sessions (${count})`
      );
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to terminate sessions"
      );
    }
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            Admin Settings & Control Center
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Global platform governance, protected financial commission rates, security keys, and active administrative sessions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="px-3 py-1 bg-primary/10 text-primary border-primary/20 text-xs font-semibold flex items-center gap-1.5"
          >
            <Shield className="w-3.5 h-3.5" /> High Privilege Role
          </Badge>
          <Badge
            variant="secondary"
            className="px-3 py-1 text-xs font-medium"
          >
            Trivllo Engine v2.4
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full space-y-6"
      >
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 max-w-[850px] p-1 bg-muted/60 backdrop-blur-md rounded-xl">
          <TabsTrigger
            value="destinations"
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg text-xs md:text-sm font-medium"
          >
            <Layers className="w-4 h-4 mr-1.5 hidden sm:inline-block" />
            Destinations
          </TabsTrigger>
          <TabsTrigger
            value="tax"
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg text-xs md:text-sm font-medium"
          >
            {isTaxUnlocked ? (
              <Unlock className="w-4 h-4 mr-1.5 text-emerald-500 hidden sm:inline-block" />
            ) : (
              <Lock className="w-4 h-4 mr-1.5 text-amber-500 hidden sm:inline-block" />
            )}
            Tax Rates
          </TabsTrigger>
          <TabsTrigger
            value="profile"
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg text-xs md:text-sm font-medium"
          >
            <UserIcon className="w-4 h-4 mr-1.5 hidden sm:inline-block" />
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg text-xs md:text-sm font-medium"
          >
            <ShieldCheck className="w-4 h-4 mr-1.5 hidden sm:inline-block" />
            Security
          </TabsTrigger>
          <TabsTrigger
            value="sessions"
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg text-xs md:text-sm font-medium"
          >
            <Server className="w-4 h-4 mr-1.5 hidden sm:inline-block" />
            Sessions
          </TabsTrigger>
        </TabsList>

        {/* ========================================================= */}
        {/* TAB 1: DESTINATIONS                                      */}
        {/* ========================================================= */}
        <TabsContent value="destinations" className="space-y-4">
          <PopularSectionsSettings />
        </TabsContent>

        {/* ========================================================= */}
        {/* TAB 2: TAX RATES (PROTECTED FINANCIAL VAULT)             */}
        {/* ========================================================= */}
        <TabsContent value="tax" className="space-y-6">
          {!isTaxUnlocked ? (
            /* --- LOCKED VAULT VIEW --- */
            <Card className="border border-amber-500/30 bg-gradient-to-br from-card via-card/95 to-amber-950/10 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <Lock className="w-64 h-64 text-amber-500" />
              </div>

              <CardHeader className="space-y-2 border-b border-border/50 pb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-sm">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl md:text-2xl font-bold flex items-center gap-2">
                      Protected Platform Tax Commission Vault
                      <Badge
                        variant="outline"
                        className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-xs font-semibold"
                      >
                        🔒 Confidential
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-sm mt-0.5">
                      Global tax rate directly controls platform fee deduction and vendor revenue payouts.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-6 pb-6 space-y-6 max-w-xl">
                <div className="rounded-xl bg-muted/50 border border-border/60 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Current Tax Rate
                    </span>
                    <Badge variant="secondary" className="font-mono text-xs">
                      Rate Encrypted
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-3xl font-extrabold tracking-widest text-muted-foreground select-none">
                    <span>•••• %</span>
                    <span className="text-xs font-sans text-muted-foreground/80 font-normal">
                      (Hidden for security)
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground pt-1">
                    To prevent unauthorized inspection or tampering, please enter your admin password below to reveal and edit the tax configuration.
                  </p>
                </div>

                <form onSubmit={handleUnlockTax} className="space-y-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="unlockPassword"
                      className="text-sm font-semibold text-foreground flex items-center gap-1.5"
                    >
                      <Key className="w-4 h-4 text-amber-500" /> Admin Master Password
                    </label>
                    <div className="relative">
                      <Input
                        id="unlockPassword"
                        type={showUnlockPassword ? "text" : "password"}
                        placeholder="Enter your administrator password"
                        value={taxUnlockPassword}
                        onChange={(e) => setTaxUnlockPassword(e.target.value)}
                        className="pr-10 h-11 bg-background"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowUnlockPassword(!showUnlockPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showUnlockPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={verifyTaxMutation.isPending || !taxUnlockPassword}
                    className="w-full sm:w-auto h-11 px-6 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-medium shadow-md shadow-amber-500/20"
                  >
                    {verifyTaxMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verifying Clearance...
                      </>
                    ) : (
                      <>
                        <Unlock className="w-4 h-4 mr-2" />
                        Unlock & View Tax Rate
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>

              <CardFooter className="bg-muted/30 border-t border-border/40 py-3 px-6 text-xs text-muted-foreground flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                All password attempts and tax modifications are cryptographically audited with timestamp and IP.
              </CardFooter>
            </Card>
          ) : (
            /* --- UNLOCKED VAULT VIEW --- */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Control Card */}
              <Card className="lg:col-span-2 border border-emerald-500/30 bg-card shadow-sm">
                <CardHeader className="border-b border-border/50 pb-5">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <Unlock className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                          Tax Commission Configuration
                          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs">
                            Active & Unlocked
                          </Badge>
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Applied universally to all customer bookings before calculating vendor net payouts.
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsTaxUnlocked(false)}
                      className="border-border text-xs flex items-center gap-1.5 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Lock className="w-3.5 h-3.5" /> Re-Lock Vault
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="pt-6 space-y-6">
                  {/* Active Rate Banner */}
                  <div className="rounded-xl border border-border/70 bg-muted/40 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Currently Configured Rate
                      </span>
                      <div className="text-4xl font-extrabold text-foreground mt-1 flex items-baseline gap-1">
                        {currentTaxRate}%
                        <span className="text-sm font-normal text-muted-foreground">
                          commission
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground max-w-[280px]">
                      Vendor receives: <strong className="text-foreground">{(100 - currentTaxRate).toFixed(1)}%</strong> of gross booking total. Platform retains <strong className="text-foreground">{currentTaxRate}%</strong>.
                    </div>
                  </div>

                  {/* Form to update */}
                  <form onSubmit={handleSaveTax} className="space-y-6">
                    {/* Rate Input & Presets */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-foreground flex items-center justify-between">
                        <span>New Tax Rate Percentage (%)</span>
                        <span className="text-xs font-normal text-muted-foreground">
                          0% to 100%
                        </span>
                      </label>
                      <div className="relative max-w-xs">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={pendingTaxRate}
                          onChange={(e) =>
                            setPendingTaxRate(parseFloat(e.target.value) || 0)
                          }
                          className="text-lg font-bold pr-10 h-12"
                        />
                        <Percent className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>

                      {/* Quick Presets */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {[5, 10, 12, 15, 18, 20].map((preset) => (
                          <Button
                            key={preset}
                            type="button"
                            variant={pendingTaxRate === preset ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPendingTaxRate(preset)}
                            className="text-xs h-7 px-2.5 rounded-full"
                          >
                            {preset}% {preset === 12 && "(Default)"}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Password Confirmation */}
                    <div className="space-y-2 max-w-md pt-2 border-t border-border/50">
                      <label
                        htmlFor="confirmTaxPassword"
                        className="text-sm font-semibold text-foreground flex items-center gap-1.5"
                      >
                        <Key className="w-4 h-4 text-primary" /> Admin Password Confirmation
                        <span className="text-destructive">*</span>
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Type your admin password to sign and apply this tax change.
                      </p>
                      <div className="relative">
                        <Input
                          id="confirmTaxPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Verify admin password to commit"
                          value={taxConfirmPassword}
                          onChange={(e) => setTaxConfirmPassword(e.target.value)}
                          className="pr-10 h-11"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <Button
                        type="submit"
                        disabled={
                          setTaxMutation.isPending || !taxConfirmPassword.trim()
                        }
                        className="h-11 px-6 font-medium shadow-sm"
                      >
                        {setTaxMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Applying Changes...
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4 mr-2" />
                            Save & Commit Tax Settings
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Real-time Simulator Card */}
              <Card className="border border-border bg-muted/20 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-primary" /> Payout Simulator
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Live preview of how the proposed {pendingTaxRate}% tax impacts booking transactions.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">
                      Sample Booking Amount (₹)
                    </label>
                    <Input
                      type="number"
                      step="500"
                      min="100"
                      value={simulatorAmount}
                      onChange={(e) =>
                        setSimulatorAmount(Math.max(0, parseFloat(e.target.value) || 0))
                      }
                      className="font-mono h-9"
                    />
                  </div>

                  <div className="space-y-2 pt-2 border-t border-border/60">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Gross Booking:</span>
                      <span className="font-mono font-medium">₹{simulatorAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-amber-600 dark:text-amber-400">
                      <span>Platform Commission ({pendingTaxRate}%):</span>
                      <span className="font-mono font-bold">
                        ₹{((simulatorAmount * pendingTaxRate) / 100).toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm font-bold text-emerald-600 dark:text-emerald-400 pt-2 border-t border-border/40">
                      <span>Vendor Net Payout:</span>
                      <span className="font-mono">
                        ₹{(
                          simulatorAmount -
                          (simulatorAmount * pendingTaxRate) / 100
                        ).toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-lg bg-background/80 p-3 text-[11px] text-muted-foreground border border-border/50">
                    💡 This formula matches the Vendor Revenue Engine: bookings are recorded at gross customer price, and net earnings are automatically calculated after platform tax deduction.
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* ========================================================= */}
        {/* TAB 3: ADMIN PROFILE                                     */}
        {/* ========================================================= */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="border border-border bg-card shadow-sm">
            <CardHeader className="border-b border-border/50 pb-5">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    Administrator Profile
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Manage administrative identity, contact details, and display preferences.
                  </CardDescription>
                </div>
                <Badge
                  variant="outline"
                  className="bg-primary/5 text-primary border-primary/20 text-xs px-3 py-1 font-semibold"
                >
                  Role: Super Administrator
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              {isProfileLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-8 max-w-3xl">
                  {/* Avatar Upload Section */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-4 rounded-xl border border-border/60 bg-muted/30">
                    <div className="relative group">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-muted border-2 border-border shadow-sm flex items-center justify-center">
                        {avatarPreview ? (
                          <img
                            src={avatarPreview}
                            alt="Admin Avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <UserIcon className="w-10 h-10 text-muted-foreground" />
                        )}
                      </div>
                      {isUploadingAvatar && (
                        <div className="absolute inset-0 bg-background/80 rounded-2xl flex items-center justify-center">
                          <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <h4 className="text-sm font-semibold text-foreground">
                        Profile Avatar
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        JPG, PNG, WebP or SVG format. Recommended 256x256 pixels.
                      </p>
                      <div className="pt-1">
                        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-xs font-medium cursor-pointer shadow-xs transition-colors">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Change Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarChange}
                            disabled={isUploadingAvatar}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Profile Form */}
                  <Form {...profileForm}>
                    <form
                      onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                      className="space-y-5"
                    >
                      {/* Name Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={profileForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input placeholder="First Name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={profileForm.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Last Name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Email Row - IMMUTABLE / DISABLED AS REQUESTED */}
                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center justify-between">
                              <FormLabel className="flex items-center gap-1.5">
                                <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                                Email Address
                              </FormLabel>
                              <Badge
                                variant="secondary"
                                className="text-[10px] font-semibold tracking-wide uppercase bg-muted/80 flex items-center gap-1 text-muted-foreground"
                              >
                                <Lock className="w-2.5 h-2.5" /> Locked / Read-only
                              </Badge>
                            </div>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  {...field}
                                  type="email"
                                  disabled
                                  readOnly
                                  className="bg-muted/40 cursor-not-allowed pr-10 text-muted-foreground font-mono text-sm"
                                />
                                <Lock className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2" />
                              </div>
                            </FormControl>
                            <FormDescription className="text-xs text-muted-foreground flex items-center gap-1.5 pt-0.5">
                              <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                              Administrator primary email is permanently anchored and cannot be modified.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Phone & Country Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={profileForm.control}
                          name="phoneNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-1.5">
                                <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                                Phone Number
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="+91 9876543210" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={profileForm.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-1.5">
                                <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                                Country
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="Country" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Address & Zip */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={profileForm.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                                Office / Street Address
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="Administrative address" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={profileForm.control}
                          name="zipcCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Postal / Zip Code</FormLabel>
                              <FormControl>
                                <Input placeholder="Zip Code" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="pt-2">
                        <Button
                          type="submit"
                          disabled={updateProfileMutation.isPending}
                          className="h-11 px-6 font-medium shadow-sm"
                        >
                          {updateProfileMutation.isPending ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Saving Changes...
                            </>
                          ) : (
                            "Save Profile Changes"
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========================================================= */}
        {/* TAB 4: SECURITY (PASSWORD WITH VARIETY OF CHARACTERS)    */}
        {/* ========================================================= */}
        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Password Form Card */}
            <Card className="lg:col-span-2 border border-border bg-card shadow-sm">
              <CardHeader className="border-b border-border/50 pb-5">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Key className="w-5 h-5 text-primary" /> Change Admin Password
                </CardTitle>
                <CardDescription className="text-sm">
                  Update administrative credentials. All characters (uppercase, lowercase, numbers, special symbols) are accepted and securely hashed with 12-round bcrypt.
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-6">
                <Form {...passwordForm}>
                  <form
                    onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                    className="space-y-5 max-w-lg"
                  >
                    {/* Current Password */}
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                {...field}
                                type={showCurrentPassword ? "text" : "password"}
                                placeholder="Enter your current password"
                                className="pr-10 h-11"
                                autoComplete="current-password"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setShowCurrentPassword(!showCurrentPassword)
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                tabIndex={-1}
                              >
                                {showCurrentPassword ? (
                                  <EyeOff className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* New Password */}
                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                {...field}
                                type={showNewPassword ? "text" : "password"}
                                placeholder="Enter strong new password"
                                className="pr-10 h-11"
                                autoComplete="new-password"
                              />
                              <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                tabIndex={-1}
                              >
                                {showNewPassword ? (
                                  <EyeOff className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Real-time Password Strength Meter */}
                    {watchedNewPassword && (
                      <div className="space-y-3 p-3.5 rounded-xl border border-border/60 bg-muted/30">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-muted-foreground">
                            Password Strength
                          </span>
                          <span
                            className={`font-bold ${passwordStats.color.split(" ")[1]}`}
                          >
                            {passwordStats.label}
                          </span>
                        </div>
                        {/* Progress bar */}
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full ${passwordStats.color.split(" ")[0]} transition-all duration-300`}
                            style={{ width: `${passwordStats.percent}%` }}
                          />
                        </div>

                        {/* Checklist */}
                        <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                          <div
                            className={`flex items-center gap-1.5 ${
                              passwordStats.checks.hasMinLength
                                ? "text-emerald-600 dark:text-emerald-400 font-medium"
                                : "text-muted-foreground"
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>8+ Characters</span>
                          </div>
                          <div
                            className={`flex items-center gap-1.5 ${
                              passwordStats.checks.hasLower
                                ? "text-emerald-600 dark:text-emerald-400 font-medium"
                                : "text-muted-foreground"
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Lowercase (a-z)</span>
                          </div>
                          <div
                            className={`flex items-center gap-1.5 ${
                              passwordStats.checks.hasUpper
                                ? "text-emerald-600 dark:text-emerald-400 font-medium"
                                : "text-muted-foreground"
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Uppercase (A-Z)</span>
                          </div>
                          <div
                            className={`flex items-center gap-1.5 ${
                              passwordStats.checks.hasDigit
                                ? "text-emerald-600 dark:text-emerald-400 font-medium"
                                : "text-muted-foreground"
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Numbers (0-9)</span>
                          </div>
                          <div
                            className={`col-span-2 flex items-center gap-1.5 ${
                              passwordStats.checks.hasSpecial
                                ? "text-emerald-600 dark:text-emerald-400 font-medium"
                                : "text-muted-foreground"
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Special Symbols (!@#$%^&*-_+=?)</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Confirm Password */}
                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm New Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                {...field}
                                type={showConfirmNewPassword ? "text" : "password"}
                                placeholder="Re-enter new password"
                                className="pr-10 h-11"
                                autoComplete="new-password"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setShowConfirmNewPassword(
                                    !showConfirmNewPassword
                                  )
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                tabIndex={-1}
                              >
                                {showConfirmNewPassword ? (
                                  <EyeOff className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="pt-2">
                      <Button
                        type="submit"
                        disabled={changePasswordMutation.isPending}
                        className="h-11 px-6 font-medium shadow-sm"
                      >
                        {changePasswordMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Updating Password...
                          </>
                        ) : (
                          "Update Admin Password"
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Security Best Practices Card */}
            <div className="space-y-4">
              <Card className="border border-border bg-muted/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" /> Security Standards
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs text-muted-foreground">
                  <p>
                    • Use diverse character sets including alphanumeric and special symbols to prevent brute-force attacks.
                  </p>
                  <p>
                    • Changing your password immediately invalidates stale sessions and syncs both local and Better Auth accounts.
                  </p>
                  <p>
                    • Do not reuse the administrator password on external services.
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-border bg-muted/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" /> Audit Trail
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground space-y-2">
                  <p>
                    All password change events trigger automatic revocation of expired tokens and send security logs to server telemetry.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ========================================================= */}
        {/* TAB 5: ACTIVE SESSIONS (ADMIN LOGIN SESSIONS)             */}
        {/* ========================================================= */}
        <TabsContent value="sessions" className="space-y-6">
          <Card className="border border-border bg-card shadow-sm">
            <CardHeader className="border-b border-border/50 pb-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Server className="w-5 h-5 text-primary" /> Active Administrator Sessions
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Manage and inspect devices, browsers, and IP addresses authenticated into this admin portal.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetchSessions()}
                    disabled={isSessionsFetching}
                    className="text-xs h-9 px-3 flex items-center gap-1.5"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 ${
                        isSessionsFetching ? "animate-spin" : ""
                      }`}
                    />
                    <span>Refresh</span>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleRevokeAllOtherSessions}
                    disabled={
                      revokeOtherSessionsMutation.isPending ||
                      sessionsList.length <= 1
                    }
                    className="text-xs h-9 px-3 flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Terminate Other Sessions</span>
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-border/60 bg-muted/30">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Total Active Devices
                  </div>
                  <div className="text-2xl font-extrabold text-foreground mt-1">
                    {sessionsList.length || 1}
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-border/60 bg-muted/30">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Current Device
                  </div>
                  <div className="text-sm font-bold text-foreground mt-1 truncate">
                    {sessionsList.find((s: any) => s.isCurrent)?.device?.browser || "Web Browser"} on{" "}
                    {sessionsList.find((s: any) => s.isCurrent)?.device?.os || "Windows"}
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-border/60 bg-muted/30">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Portal Isolation
                  </div>
                  <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" /> Enforced
                  </div>
                </div>
              </div>

              {/* Sessions List */}
              {isSessionsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : sessionsList.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-border rounded-xl">
                  <Laptop className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground">
                    Current browser session active
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    No other concurrent administrative devices recorded.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sessionsList.map((session: any) => {
                    const isCurrent = session.isCurrent;
                    const deviceType = session.device?.deviceType?.toLowerCase();
                    const browser = session.device?.browser || "Browser";
                    const os = session.device?.os || "Desktop OS";
                    const ip = session.ipAddress || "127.0.0.1";
                    const lastActive = session.updatedAt || session.createdAt;

                    return (
                      <div
                        key={session._id || session.id}
                        className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                          isCurrent
                            ? "border-emerald-500/40 bg-emerald-500/5 shadow-xs"
                            : "border-border/70 bg-card hover:bg-muted/30"
                        }`}
                      >
                        <div className="flex items-start sm:items-center gap-3.5">
                          <div
                            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                              isCurrent
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {deviceType === "mobile" ? (
                              <Smartphone className="w-5 h-5" />
                            ) : deviceType === "tablet" ? (
                              <Tablet className="w-5 h-5" />
                            ) : (
                              <Laptop className="w-5 h-5" />
                            )}
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm text-foreground">
                                {browser} on {os}
                              </span>
                              {isCurrent && (
                                <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px] font-semibold flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  Current Device (This Session)
                                </Badge>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1 font-mono">
                                <Globe className="w-3 h-3" /> {ip}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {lastActive
                                  ? new Date(lastActive).toLocaleString(undefined, {
                                      month: "short",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : "Active now"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {!isCurrent && (
                          <div className="self-end sm:self-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleRevokeSession(session._id || session.id)
                              }
                              disabled={revokeSessionMutation.isPending}
                              className="text-xs h-8 text-destructive hover:bg-destructive hover:text-destructive-foreground border-destructive/20"
                            >
                              <LogOut className="w-3.5 h-3.5 mr-1" />
                              Revoke Access
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}