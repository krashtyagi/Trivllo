"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useLogin } from "@/hooks/auth/use-sign";
import LOGO from "@/components/logo/logo";
import { Eye, EyeOff, Lock, Mail, ShieldCheck, Sparkles } from "lucide-react";

// Google SVG Icon from Watermelon UI spec
const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" {...props}>
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

export default function Auth07() {
  const { onHandleSubmit, methods, loading } = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleGoogleClick = () => {
    // As per user instructions: "dont complete google auth just ui"
    toast.info("Google Sign-In is currently in preview mode for Admin. Please use your Admin Email & Password.", {
      duration: 4000,
    });
  };

  return (
    <div className="flex min-h-screen w-full bg-white dark:bg-zinc-950 font-sans text-neutral-950 dark:text-neutral-50 antialiased selection:bg-neutral-900 selection:text-white relative overflow-hidden">
      {/* Left Form Section */}
      <div className="flex w-full flex-col justify-between lg:w-1/2 p-6 sm:p-10 z-10">
        {/* Header Branding */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="scale-90 origin-left">
              <LOGO />
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin Portal
            </span>
          </div>

          <a
            href="/"
            className="text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            ← Back to site
          </a>
        </div>

        {/* Form Container */}
        <div className="flex flex-1 items-center justify-center my-8">
          <div className="w-full max-w-[420px] transition-all duration-300">
            {/* Titles */}
            <div className="mb-8 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 dark:bg-zinc-800 text-xs font-medium text-neutral-600 dark:text-neutral-300 mb-3">
                <Sparkles className="w-3 h-3 text-primary" />
                <span>Secure Management & CMS</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white md:text-4xl">
                Welcome back
              </h1>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                Sign in to manage hotels, bookings, content & blog SEO.
              </p>
            </div>

            {/* Google Login Button (UI only, as requested) */}
            <div className="mb-4">
              <button
                type="button"
                onClick={handleGoogleClick}
                className="group flex w-full items-center justify-center gap-3 rounded-full border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 py-3.5 text-sm font-medium text-neutral-700 dark:text-neutral-200 shadow-xs transition-all hover:bg-neutral-50 dark:hover:bg-zinc-800 hover:border-neutral-300 dark:hover:border-zinc-700 active:scale-[0.99]"
              >
                <GoogleIcon className="text-lg transition-transform group-hover:scale-110" />
                <span>Continue with Google</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-6 flex items-center">
              <div className="grow border-t border-neutral-200 dark:border-zinc-800"></div>
              <span className="px-4 text-xs font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                or sign in with email
              </span>
              <div className="grow border-t border-neutral-200 dark:border-zinc-800"></div>
            </div>

            {/* Actual Form connected to useLogin hook */}
            <form className="flex flex-col gap-4" onSubmit={onHandleSubmit}>
              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="email"
                  className="text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300"
                >
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    id="email"
                    type="email"
                    placeholder="admin@trivllo.com"
                    disabled={loading}
                    {...methods.register("email")}
                    className="w-full rounded-full border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 pl-11 pr-5 py-3 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-zinc-500 focus:border-neutral-900 dark:focus:border-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10 dark:focus:ring-white/10 transition-all"
                  />
                </div>
                {methods.formState.errors.email && (
                  <span className="text-xs text-red-500 pl-3">
                    {methods.formState.errors.email.message}
                  </span>
                )}
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300"
                  >
                    Password
                  </label>
                  <a
                    href="/resetpassword"
                    className="text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    disabled={loading}
                    {...methods.register("password")}
                    className="w-full rounded-full border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 pl-11 pr-11 py-3 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-zinc-500 focus:border-neutral-900 dark:focus:border-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10 dark:focus:ring-white/10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {methods.formState.errors.password && (
                  <span className="text-xs text-red-500 pl-3">
                    {methods.formState.errors.password.message}
                  </span>
                )}
              </div>

              {/* Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs text-neutral-600 dark:text-neutral-400">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded-md border-neutral-300 dark:border-zinc-700 text-neutral-900 dark:text-white focus:ring-neutral-900 accent-neutral-900 dark:accent-white"
                  />
                  <span>Keep me logged in for 30 days</span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="mt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-linear-to-b from-[#2a2a2a] to-[#111111] dark:from-zinc-100 dark:to-zinc-300 px-6 py-3.5 text-sm font-semibold text-white dark:text-zinc-950 shadow-md hover:shadow-lg transition-all hover:opacity-95 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <span>Sign In to Dashboard</span>
                  )}
                </button>
              </div>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center text-xs text-neutral-400 dark:text-zinc-500">
              Protected by Trivllo Enterprise Security & RBAC.
            </div>
          </div>
        </div>

        {/* Bottom subtle copyright */}
        <div className="text-xs text-neutral-400 dark:text-zinc-600 text-center lg:text-left">
          © {new Date().getFullYear()} Trivllo Inc. All rights reserved.
        </div>
      </div>

      {/* Right Hero Image Section (Watermelon style rounded container) */}
      <div className="hidden lg:block lg:w-1/2 p-4 xl:p-6">
        <div className="relative h-full w-full overflow-hidden rounded-[2.5rem] bg-zinc-900 shadow-2xl border border-neutral-200/50 dark:border-zinc-800">
          <img
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1600&auto=format&fit=crop"
            alt="Trivllo Hospitality & Travel"
            className="h-full w-full object-cover brightness-95 scale-105 hover:scale-100 transition-transform duration-1000 ease-out"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

          {/* Floating Glassmorphic Info Card */}
          <div className="absolute bottom-10 left-10 right-10 p-6 rounded-2xl bg-white/10 dark:bg-black/30 backdrop-blur-xl border border-white/20 text-white shadow-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold tracking-wider uppercase text-emerald-300">
                Live CMS & Control Center
              </span>
            </div>
            <h3 className="text-xl font-bold">
              Drive High-Intent Organic Traffic with Travel Blogs
            </h3>
            <p className="mt-1 text-sm text-white/80 leading-relaxed">
              Publish travel guides, hotel comparisons, and destination articles to rank on Google and convert searchers into bookings.
            </p>

            <div className="mt-4 flex items-center gap-4 text-xs text-white/70 pt-3 border-t border-white/15">
              <div>🏨 <strong>500+</strong> Hotels</div>
              <div>•</div>
              <div>🗺️ <strong>50+</strong> Destinations</div>
              <div>•</div>
              <div>✍️ <strong>RBAC</strong> Multi-Author CMS</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
