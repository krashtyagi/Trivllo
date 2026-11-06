"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { blogService } from "@/services/blog.service";
import { adminAccessToken } from "@/services/auth";
import { authClient } from "@/lib/auth-client";
import LOGO from "@/components/logo/logo";
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Loader2,
  Lock,
  User,
  Mail,
  ArrowRight,
  Sparkles,
} from "lucide-react";

function AcceptInviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [inviteData, setInviteData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    async function verify() {
      if (!token) {
        setErrorMsg("No invitation token found in link.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await blogService.verifyInvitationToken(token);
        setInviteData(data);
      } catch (err: any) {
        setErrorMsg(
          err.response?.data?.message ||
            "This invitation link is invalid or has expired."
        );
      } finally {
        setLoading(false);
      }
    }
    verify();
  }, [token]);

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!inviteData?.hasAccount && (!password || password.length < 8)) {
      toast.error("Please enter a secure password (at least 8 characters)");
      return;
    }

    try {
      setSubmitting(true);
      const res = await blogService.acceptInvitationToken({
        token,
        name: name.trim() || undefined,
        password: password || undefined,
      });

      if (res?.token) {
        localStorage.setItem(adminAccessToken, res.token);
      }

      if (password) {
        try {
          await authClient.signIn.email({
            email: inviteData.email,
            password,
          });
        } catch (e) {}
      }

      toast.success(
        `Welcome to Trivllo! Your account has been activated as ${res.assignedRole.replace("_", " ")}.`
      );

      // Redirect to admin dashboard
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to activate invitation."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-zinc-950 text-white">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
        <p className="text-sm text-zinc-400">Verifying your editorial invitation...</p>
      </div>
    );
  }

  if (errorMsg || !inviteData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-zinc-950 text-white font-sans">
        <div className="w-full max-w-md p-8 rounded-3xl bg-zinc-900 border border-zinc-800 text-center shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4 border border-red-500/20">
            <XCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold mb-2">Invitation Expired or Invalid</h2>
          <p className="text-xs text-zinc-400 leading-relaxed mb-6">
            {errorMsg || "The link you followed may have expired or already been used."}
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center w-full px-5 py-3 rounded-full bg-white text-zinc-950 text-xs font-semibold hover:bg-zinc-200 transition-colors"
          >
            Go to Admin Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-zinc-950 font-sans text-white selection:bg-white selection:text-black items-center justify-center p-6">
      <div className="w-full max-w-md p-8 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Branding */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="scale-90 origin-left">
            <LOGO />
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-400 border border-amber-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            Editorial Access
          </span>
        </div>

        {/* Title */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800 text-[11px] font-medium text-zinc-300 mb-2">
            <Sparkles className="w-3 h-3 text-primary" />
            <span>Official Invitation</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            Join Trivllo Team
          </h2>
          <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
            You&apos;ve been invited as a{" "}
            <span className="font-semibold text-white uppercase">
              {inviteData.assignedRole?.replace("_", " ")}
            </span>
            . Complete your profile below to access the CMS.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleActivate} className="flex flex-col gap-4">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Invited Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="email"
                readOnly
                value={inviteData.email}
                className="w-full rounded-full border border-zinc-800 bg-zinc-950/80 pl-11 pr-5 py-3 text-xs text-zinc-300 font-mono select-none cursor-not-allowed"
              />
            </div>
          </div>

          {/* Full Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Your Full Name
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="e.g. Aanya Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-full border border-zinc-800 bg-zinc-950 pl-11 pr-5 py-3 text-xs text-white placeholder:text-zinc-600 focus:border-white focus:outline-none focus:ring-1 focus:ring-white transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              {inviteData.hasAccount
                ? "Enter Password to Confirm"
                : "Create Secure Password"}
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-full border border-zinc-800 bg-zinc-950 pl-11 pr-5 py-3 text-xs text-white placeholder:text-zinc-600 focus:border-white focus:outline-none focus:ring-1 focus:ring-white transition-all"
              />
            </div>
            <span className="text-[11px] text-zinc-500 pl-3">
              Minimum 8 characters
            </span>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full rounded-full bg-white text-zinc-950 py-3.5 text-xs font-bold hover:bg-zinc-200 transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
            ) : (
              <>
                <span>Activate Account & Enter CMS</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-[11px] text-zinc-500">
          Already have an account?{" "}
          <Link href="/login" className="text-white hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white text-sm">
          Loading invitation...
        </div>
      }
    >
      <AcceptInviteContent />
    </Suspense>
  );
}
