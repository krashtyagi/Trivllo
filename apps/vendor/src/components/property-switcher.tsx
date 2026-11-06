"use client";

import * as React from "react";
import { Plus, Building2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useSidebar } from "@/components/ui/sidebar";
import { useVendorProperties, useSwitchProperty } from "@/services/property.query";
import { useCurrentUser } from "@/services/queryes";
import { cn } from "@/lib/utils";

export function PropertySwitcher() {
  const router = useRouter();
  const { isMobile, setOpenMobile } = useSidebar();
  const { data: userData } = useCurrentUser();
  const { data: propertiesData, isLoading } = useVendorProperties();
  const switchMutation = useSwitchProperty();
  const [switchingId, setSwitchingId] = React.useState<string | null>(null);

  const approvedData = userData?.data?.approvedData;
  const properties = propertiesData?.data?.properties || [];
  const activePropertyId = propertiesData?.data?.activePropertyId;

  // Only show for approved vendors with service type hotel or tour
  const serviceType = approvedData?.serviceType;
  if (!serviceType || !["hotel", "tour"].includes(serviceType)) return null;

  const handleSwitch = async (propertyId: string) => {
    if (propertyId === activePropertyId) return;

    try {
      setSwitchingId(propertyId);
      const result = await switchMutation.mutateAsync(propertyId);
      if (result?.success) {
        toast.success(`Switched to ${result.data?.name || "property"}`);
        if (isMobile) {
          setOpenMobile(false);
        }
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to switch property");
    } finally {
      setSwitchingId(null);
    }
  };

  const MAX_PROPERTIES = 50;
  const isLimitReached = properties.length >= MAX_PROPERTIES;

  const handleAddProperty = () => {
    if (isLimitReached) {
      toast.error(`Maximum limit of ${MAX_PROPERTIES} properties reached`);
      return;
    }
    router.push("/settings/add-property");
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const entityName = serviceType === "tour" ? "Tour" : "Hotel";

  if (isLoading) {
    return (
      <div className="w-full flex items-center gap-2 px-2 py-1.5 opacity-60">
        <div className="h-7 w-7 rounded-full bg-muted animate-pulse" />
        <div className="h-3 w-20 rounded bg-muted animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0.5 w-full">
      {/* Properties List - only picture and name, green boundary on active */}
      <div className="flex flex-col gap-0.5 max-h-48 overflow-y-auto no-scrollbar">
        {properties.map((property: any) => {
          const isActive =
            property._id === activePropertyId || property.isCurrentlyActive;
          const isVerified =
            property.verificationStatus === "verified" && property.isActive;
          const isSwitching =
            switchMutation.isPending && switchingId === property._id;

          return (
            <button
              key={property._id}
              type="button"
              disabled={!isVerified || switchMutation.isPending}
              onClick={() => isVerified && handleSwitch(property._id)}
              className={cn(
                "w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left transition-colors group cursor-pointer hover:bg-sidebar-accent/50",
                !isVerified && "opacity-40 cursor-not-allowed",
              )}
            >
              {/* Picture / PFP - green boundary when active */}
              <div
                className={cn(
                  "relative h-7 w-7 rounded-full overflow-hidden shrink-0 flex items-center justify-center bg-muted/40 transition-all",
                  isActive
                    ? "ring-2 ring-emerald-500 ring-offset-2 ring-offset-sidebar"
                    : "border border-border/60 opacity-80 group-hover:opacity-100",
                )}
              >
                {property.image ? (
                  <img
                    src={property.image}
                    alt={property.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </div>

              {/* Name only */}
              <span
                className={cn(
                  "text-xs truncate flex-1",
                  isActive
                    ? "font-semibold text-foreground"
                    : "font-medium text-muted-foreground group-hover:text-foreground",
                )}
              >
                {property.name}
              </span>

              {isSwitching && (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-500 shrink-0 ml-auto" />
              )}
            </button>
          );
        })}

        {/* Add Property Button */}
        {isLimitReached ? (
          <div className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-muted-foreground/60 text-xs">
            <span className="text-[11px] italic">Limit reached ({MAX_PROPERTIES}/{MAX_PROPERTIES})</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleAddProperty}
            className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left transition-colors group cursor-pointer hover:bg-sidebar-accent/50 text-muted-foreground hover:text-foreground"
          >
            <div className="h-7 w-7 rounded-full border border-dashed border-muted-foreground/40 flex items-center justify-center shrink-0 group-hover:border-emerald-500 group-hover:text-emerald-500 transition-colors">
              <Plus className="h-3.5 w-3.5 text-muted-foreground group-hover:text-emerald-500 transition-colors" />
            </div>
            <span className="text-xs font-medium truncate">
              Add {entityName}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
