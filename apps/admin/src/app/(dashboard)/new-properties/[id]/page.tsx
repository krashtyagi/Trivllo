"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { axiosApi } from "@/lib/axios";
import { Loader2 } from "lucide-react";

export default function NewPropertyDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const propId = Array.isArray(id) ? id[0] : id;

    // Fetch pending list to find which vendor owns this property
    axiosApi
      .get("/admin/vendor-properties/pending")
      .then((res) => {
        const list = res.data?.data?.properties || [];
        const match = list.find((p: any) => p._id === propId);
        if (match?.vendor?._id || match?.vendorId) {
          const vId = match.vendor?._id || match.vendorId;
          router.replace(`/properties/${vId}?propertyId=${propId}`);
        } else {
          // If not in first page, try direct property details
          router.replace(`/properties/${propId}`);
        }
      })
      .catch(() => {
        setError("Could not locate property");
      });
  }, [id, router]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6 space-y-3">
        <p className="text-sm text-red-500 font-medium">{error}</p>
        <button
          onClick={() => router.push("/new-properties")}
          className="text-xs px-3 py-1.5 rounded-lg border hover:bg-muted"
        >
          Back to New Properties
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
      <p className="text-xs text-muted-foreground">Opening hotel details...</p>
    </div>
  );
}
