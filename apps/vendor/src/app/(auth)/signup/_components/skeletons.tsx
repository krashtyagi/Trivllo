import React from "react";

export const Step1Skeleton = () => {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Title block */}
      <div className="space-y-2">
        <div className="h-6 w-48 bg-white/10 rounded-md" />
        <div className="h-4 w-72 bg-white/5 rounded-md" />
      </div>

      {/* Grid for Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-28 bg-white/10 rounded" />
            <div className="h-12 w-full bg-white/5 border border-white/5 rounded-xl" />
          </div>
        ))}
      </div>

      <hr className="border-white/5" />

      {/* Verification Docs Section */}
      <div className="space-y-4">
        <div className="space-y-1">
          <div className="h-5 w-40 bg-white/10 rounded" />
          <div className="h-3.5 w-64 bg-white/5 rounded" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="h-4 w-24 bg-white/10 rounded" />
            <div className="h-12 w-full bg-white/5 rounded-xl" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-32 bg-white/10 rounded" />
            <div className="h-12 w-full bg-white/5 rounded-xl" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-[140px] w-full bg-white/5 border-2 border-dashed border-white/5 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
};

export const Step2Skeleton = () => {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Section 1: Account Holder & Bank Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-36 bg-white/10 rounded" />
            <div className="h-12 w-full bg-white/5 rounded-xl" />
          </div>
        ))}
      </div>

      {/* Section 2: Numbers & Routing box */}
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-32 bg-white/10 rounded" />
              <div className="h-12 w-full bg-white/5 rounded-xl" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-28 bg-white/10 rounded" />
              <div className="h-12 w-full bg-white/5 rounded-xl" />
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Bank Proof Upload */}
      <div className="space-y-4">
        <div className="space-y-1">
          <div className="h-5 w-44 bg-white/10 rounded" />
          <div className="h-3.5 w-72 bg-white/5 rounded" />
        </div>

        <div className="max-w-md">
          <div className="h-[140px] w-full bg-white/5 border-2 border-dashed border-white/5 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export const Step3Skeleton = () => {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Title & Basic Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="h-4 w-24 bg-white/10 rounded" />
          <div className="h-12 w-full bg-white/5 rounded-xl" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-28 bg-white/10 rounded" />
          <div className="h-12 w-full bg-white/5 rounded-xl" />
        </div>
      </div>

      <div className="space-y-2">
        <div className="h-4 w-20 bg-white/10 rounded" />
        <div className="h-28 w-full bg-white/5 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="h-4 w-24 bg-white/10 rounded" />
          <div className="h-12 w-full bg-white/5 rounded-xl" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-32 bg-white/10 rounded" />
          <div className="h-12 w-full bg-white/5 rounded-xl" />
        </div>
      </div>

      {/* Amenities Checkboxes Skeleton */}
      <div className="space-y-4">
        <div className="h-5 w-36 bg-white/10 rounded" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl h-12">
              <div className="w-4 h-4 bg-white/10 rounded animate-pulse" />
              <div className="h-3 w-16 bg-white/5 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Documents */}
      <div className="space-y-4">
        <div className="h-5 w-44 bg-white/10 rounded" />
        <div className="max-w-md">
          <div className="h-[140px] w-full bg-white/5 border-2 border-dashed border-white/5 rounded-xl" />
        </div>
      </div>

      {/* Gallery images */}
      <div className="space-y-4">
        <div className="h-5 w-36 bg-white/10 rounded" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="aspect-square w-full bg-white/5 border border-white/5 rounded-2xl" />
          ))}
          <div className="aspect-square w-full bg-white/5 border-2 border-dashed border-white/5 rounded-2xl" />
        </div>
      </div>
    </div>
  );
};

export const ReviewSkeleton = () => {
  return (
    <div className="py-12 flex flex-col items-center text-center animate-pulse space-y-6">
      <div className="w-16 h-16 bg-white/10 rounded-full" />
      <div className="h-6 w-60 bg-white/10 rounded" />
      <div className="h-4 w-80 bg-white/5 rounded" />
      <div className="h-4 w-72 bg-white/5 rounded" />
      <div className="h-10 w-36 bg-white/10 rounded-xl pt-4" />
    </div>
  );
};

export const OtpSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse text-center py-6">
      <div className="w-12 h-12 bg-white/10 rounded-full mx-auto animate-pulse" />
      <div className="h-5 w-44 bg-white/10 rounded mx-auto animate-pulse" />
      <div className="h-4 w-72 bg-white/5 rounded mx-auto animate-pulse" />
      
      {/* 6 OTP boxes */}
      <div className="flex justify-center gap-2 py-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="w-12 h-14 bg-white/5 border border-white/10 rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  );
};
