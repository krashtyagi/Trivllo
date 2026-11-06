"use client";

import React, { useState } from "react";
import { useForm, useFormContext, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { toast } from "sonner";
import { Check, CreditCard, Calendar, Users, Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/spinner";
import { ScrollToTop } from "../../../../../../scrolltoto";
import { Form } from "@/components/ui/form";

import { cn } from "@/lib/utils";
import { usePaymentsContext } from "@/context/payments-form-provider";
import { PaymentProps, PaymentSchema } from "@/schema/payment.schema";
import {
  createServiceBooking,
  verifyServicePayment,
} from "@/services/booking/service-booking.service";
import { handleRefresh } from "@/services/dailyfunctions";
import { useQueryClient } from "@tanstack/react-query";
import { hooksSupplier } from "@/components/navbar/filter-nav-bar/calander05";
import { HighLightBar } from "./HightLightBar";
import { CancellationPolicyCard } from "./CanclePolicy";
import {
  AddOnsCard,
  GuestInfoCard,
  SpecialRequestCard,
  TripSummaryCard,
} from "./Addoncards";
import { PaymentSuccess } from "./PaymentSuccess";

import { useTourServiceDetails } from "@/services/tours/tours.queries";
import { useAuthStore } from "@/store/auth.store";

// ─── Types ────────────────────────────────────────────────────────────────────
type ServiceType = "tour" | "bike" | "adventure" | "cab";

// ─── Main BookingForm ────────────────────────────────────────────────────────
export const BookingForm = ({
  slug,
  hookname,
  serviceType,
  initialDate,
  initialGuests,
}: {
  slug: string[];
  hookname: keyof typeof hooksSupplier;
  serviceType: string;
  initialDate?: string;
  initialGuests?: string;
}) => {
  const store = hooksSupplier[hookname]();
  const { date, guests, setPayments, payments } = store;

  const { setCurrentStep, currentstep } = usePaymentsContext();
  const [loading, setLoading] = useState<boolean>(false);
  const queryClient = useQueryClient();
  const ismobile = useIsMobile();

  // Fetch tour details if serviceType is tour
  const { data: tourServiceData } = useTourServiceDetails(
    serviceType === "tour" ? slug[0] : "",
  );

  const { currUser } = useAuthStore();

  const parseInitialDate = (raw?: string) => {
    if (!raw || raw.includes("Add date")) return { checkin: "", checkout: "" };
    const parts = raw.split("-");
    const parsePart = (p?: string) => {
      if (!p) return "";
      const dmy = p.trim().split("/");
      if (dmy.length === 3) {
        return `${dmy[2]}-${dmy[1]}-${dmy[0]}`; // dd/MM/yyyy -> yyyy-MM-dd
      }
      return p.trim();
    };
    return {
      checkin: parsePart(parts[0]),
      checkout: parsePart(parts[1]) || parsePart(parts[0]),
    };
  };

  const parsedDates = parseInitialDate(initialDate);
  const checkinDefault = date?.from ? format(date.from, "yyyy-MM-dd") : parsedDates.checkin;
  const checkoutDefault = date?.to ? format(date.to, "yyyy-MM-dd") : parsedDates.checkout;

  const parsedGuests = parseInt(initialGuests || "") || 0;
  const initialAdults = Math.max(1, guests?.adults || parsedGuests || 1);
  const initialChildren = guests?.children || 0;
  const initialTotal = initialAdults + initialChildren;

  const methods = useForm<PaymentProps>({
    resolver: zodResolver(PaymentSchema),
    defaultValues: {
      dates: {
        checkin: checkinDefault,
        checkout: checkoutDefault,
      },
      guests: {
        adults: initialAdults,
        children: initialChildren,
      },
      guestInformation: Array(initialTotal)
        .fill(null)
        .map(() => ({
          firstname: currUser?.firstName || "",
          lastname: currUser?.lastName || "",
          email: currUser?.email || "",
          phone: currUser?.phoneNumber || "",
        })),
      specialRequest: "",
      rooms: [],
    },
    mode: "onChange",
  });

  React.useEffect(() => {
    if (currUser) {
      if (!methods.getValues("guestInformation.0.firstname") && currUser.firstName) {
        methods.setValue("guestInformation.0.firstname", currUser.firstName);
      }
      if (!methods.getValues("guestInformation.0.lastname") && currUser.lastName) {
        methods.setValue("guestInformation.0.lastname", currUser.lastName);
      }
      if (!methods.getValues("guestInformation.0.email") && currUser.email) {
        methods.setValue("guestInformation.0.email", currUser.email);
      }
      if (!methods.getValues("guestInformation.0.phone") && currUser.phoneNumber) {
        methods.setValue("guestInformation.0.phone", currUser.phoneNumber);
      }
    }
  }, [currUser, methods]);

  React.useEffect(() => {
    if (date?.from) {
      methods.setValue("dates.checkin", format(date.from, "yyyy-MM-dd"));
    } else if (parsedDates.checkin && !methods.getValues("dates.checkin")) {
      methods.setValue("dates.checkin", parsedDates.checkin);
    }
    if (date?.to) {
      methods.setValue("dates.checkout", format(date.to, "yyyy-MM-dd"));
    } else if (parsedDates.checkout && !methods.getValues("dates.checkout")) {
      methods.setValue("dates.checkout", parsedDates.checkout);
    }
  }, [date, parsedDates.checkin, parsedDates.checkout, methods]);

  // Dynamically sync guest count and guestInformation form fields
  const handleGuestsChange = (newAdults: number, newChildren: number) => {
    const newTotal = Math.max(1, newAdults + newChildren);
    methods.setValue("guests.adults", newAdults, { shouldValidate: true });
    methods.setValue("guests.children", newChildren, { shouldValidate: true });

    const currentGuests = methods.getValues("guestInformation") || [];
    if (newTotal > currentGuests.length) {
      const added = Array(newTotal - currentGuests.length)
        .fill(null)
        .map(() => ({
          firstname: "",
          lastname: "",
          email: "",
          phone: "",
        }));
      methods.setValue("guestInformation", [...currentGuests, ...added], {
        shouldValidate: true,
      });
    } else if (newTotal < currentGuests.length) {
      methods.setValue("guestInformation", currentGuests.slice(0, newTotal), {
        shouldValidate: true,
      });
    }
  };

  const buildPayload = (data: PaymentProps) => {
    const serviceId = slug[0];

    const primaryCustomer = {
      firstName: data.guestInformation[0]?.firstname || "",
      lastName: data.guestInformation[0]?.lastname || "",
      email: data.guestInformation[0]?.email || "",
      phoneNumber: data.guestInformation[0]?.phone || "",
    };

    const participants = data.guestInformation.map((g, idx) => ({
      name: `${g.firstname} ${g.lastname}`.trim() || `Guest ${idx + 1}`,
      age: 25,
      gender: "male" as const,
    }));

    const bookingDate = data.dates.checkin || format(new Date(), "yyyy-MM-dd");

    let meta: Record<string, any> = { note: data.specialRequest || "" };
    let extra: Record<string, any> = {};

    switch (serviceType as ServiceType) {
      case "bike":
        meta = {
          ...meta,
          startDate: data.dates.checkin,
          endDate: data.dates.checkout,
          pickupTime: "09:00 AM",
          dropTime: "08:00 PM",
          pickupLocation: (store as any).city || "",
          dropLocation: (store as any).city || "",
          helmetRequired: true,
          extraHelmet: false,
          fuelPreference: "full-to-full",
          licenseNumber: "",
        };
        break;
      case "cab":
        meta = {
          ...meta,
          pickup: (store as any).PickupCity || "",
          drop: (store as any).DropoffCity || "",
          pickupTime: "08:30 AM",
          pickupDate: data.dates.checkin,
          luggageCount: 0,
          tripType: "oneway",
          specialRequest: data.specialRequest || "",
        };
        break;
      case "tour":
        meta = {
          ...meta,
          startDate: data.dates.checkin || format(new Date(), "yyyy-MM-dd"),
          mealPreference: "veg",
        };
        break;
      case "adventure":
        extra = { timeSlot: "10:00 AM" };
        break;
    }

    return {
      serviceType,
      serviceId,
      bookingDate,
      primaryCustomer,
      participants,
      meta,
      ...extra,
    };
  };

  const onSubmit = async (data: PaymentProps) => {
    try {
      setLoading(true);
      const payload = buildPayload(data);
      const result = await createServiceBooking(payload);

      if (result?.success !== false) {
        const { razorpayOrder, booking } = result.data || result;

        const initialPaymentData: any = {
          ...result.data,
          razorpay_order_id: razorpayOrder.id,
          razorpay_payment_id: razorpayOrder.id,
          razorpay_signature: razorpayOrder.receipt,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          status: razorpayOrder.status,
          firstname: booking.primaryCustomer?.firstName || data.guestInformation[0]?.firstname || "",
          lastname: booking.primaryCustomer?.lastName || data.guestInformation[0]?.lastname || "",
          email: booking.primaryCustomer?.email || data.guestInformation[0]?.email || "",
          phone: booking.primaryCustomer?.phoneNumber || data.guestInformation[0]?.phone || "",
          createdAt: booking.createdAt,
          bookingId: booking._id,
          bookingReference: booking.bookingReference,
        };

        setPayments(initialPaymentData);

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: "Trivllo Booking",
          description: `Booking for ${booking.bookingReference}`,
          order_id: razorpayOrder.id,
          handler: async function (response: any) {
            try {
              const verifyResult = await verifyServicePayment(response);
              if (verifyResult.success !== false) {
                toast.success("Payment successful! Booking confirmed.");
                setPayments({
                  ...initialPaymentData,
                  status: "confirmed",
                  razorpay_payment_id: response.razorpay_payment_id || initialPaymentData.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature || initialPaymentData.razorpay_signature,
                  razorpay_order_id: response.razorpay_order_id || initialPaymentData.razorpay_order_id,
                });
                setCurrentStep((val) => val + 1);
                handleRefresh(queryClient, ["bookings"]);
                setLoading(false);
              } else {
                toast.error("Payment verification failed.");
              }
            } catch {
              toast.error("Payment verification failed.");
            } finally {
              setLoading(false);
            }
          },
          prefill: {
            name: `${data.guestInformation[0].firstname} ${data.guestInformation[0].lastname}`,
            email: data.guestInformation[0].email,
            contact: data.guestInformation[0].phone,
          },
          theme: { color: "#EA580C" },
          modal: {
            ondismiss: function () {
              setLoading(false);
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        toast.error(result?.message || "Failed to create booking.");
        setLoading(false);
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || error.message || "An error occurred.",
      );
      setLoading(false);
    }
  };

  const tourMaxPeople = tourServiceData?.data?.service?.maxPeople;

  if (currentstep === 3) {
    return <FinalStep />;
  }

  return (
    <Form {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className={cn("container max-w-7xl mx-auto px-4", ismobile && "pb-32")}
      >
        {/* Steps bar */}
        <div className="w-full py-8 overflow-x-auto">
          <HighLightBar />
        </div>

        {!loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8 w-full">
            <div className="lg:col-span-8">
              <PaymentFormContent
                methods={methods}
                serviceType={serviceType}
                maxPeople={tourMaxPeople}
                onGuestsChange={handleGuestsChange}
              />
            </div>
            {currentstep === 2 && (
              <div className="lg:col-span-4">
                <div className="sticky top-24">
                  {ismobile ? (
                    <div className="fixed bottom-0 left-0 right-0 z-100 w-full border-t bg-background/95 backdrop-blur-sm p-4 animate-in slide-in-from-bottom duration-300">
                      <BookingCard
                        loading={loading}
                        hookname={hookname}
                        serviceType={serviceType}
                        tourServiceData={tourServiceData?.data}
                      />
                    </div>
                  ) : (
                    <BookingDetailsCard
                      loading={loading}
                      hookname={hookname}
                      serviceType={serviceType}
                      tourServiceData={tourServiceData?.data}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-screen flex flex-col items-center justify-center py-32 space-y-4">
            <Spinner />
            <p className="text-muted-foreground animate-pulse">
              Processing your request...
            </p>
          </div>
        )}
      </form>
    </Form>
  );
};

// ─── Steps / inner form switcher ─────────────────────────────────────────────
export const PaymentFormContent = ({
  methods,
  serviceType,
  maxPeople,
  onGuestsChange,
}: {
  methods: UseFormReturn<PaymentProps>;
  serviceType: string;
  maxPeople?: number;
  onGuestsChange?: (newAdults: number, newChildren: number) => void;
}) => {
  const { currentstep } = usePaymentsContext();
  if (currentstep === 2)
    return (
      <BookingDetails
        methods={methods}
        serviceType={serviceType}
        maxPeople={maxPeople}
        onGuestsChange={onGuestsChange}
      />
    );
  return <FinalStep />;
};

// ─── Final Step ───────────────────────────────────────────────────────────────
export const FinalStep = () => {
  const toursStore = hooksSupplier["tours"]();
  const adventureStore = hooksSupplier["adventures"]();
  const bikesStore = hooksSupplier["bikes"]();
  const cabsStore = hooksSupplier["cabs"]();
  const hotelsStore = hooksSupplier["hotels"]();

  const payments = [
    toursStore.payments,
    adventureStore.payments,
    bikesStore.payments,
    cabsStore.payments,
    hotelsStore.payments,
  ].find((p) => p?.razorpay_order_id);

  if (!payments) return null;

  return (
    <>
      <ScrollToTop />
      <PaymentSuccess payment={payments} />
    </>
  );
};

// ─── Mobile bottom bar ────────────────────────────────────────────────────────
export const BookingCard = ({
  loading,
  hookname,
  serviceType,
  tourServiceData,
}: {
  loading: boolean;
  hookname: keyof typeof hooksSupplier;
  serviceType: string;
  tourServiceData?: any;
}) => {
  const methods = useFormContext<PaymentProps>();
  const adults = methods.watch("guests.adults") || 1;
  const children = methods.watch("guests.children") || 0;
  const totalGuests = Math.max(1, adults + children);
  const checkin = methods.watch("dates.checkin");

  const service = tourServiceData?.service;
  const basePricePerPerson = service?.price || 0;
  const taxPercentage = service?.taxPercentage || 0;
  const totalBasePrice = basePricePerPerson * totalGuests;
  const totalTax = Number(((totalBasePrice * taxPercentage) / 100).toFixed(2));
  const grandTotal = totalBasePrice + totalTax;

  return (
    <div className="flex items-center justify-between gap-4 ">
      <div className="flex flex-col">
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold tracking-tight">
            ₹{grandTotal.toLocaleString("en-IN")}
          </span>
          <span className="text-xs text-muted-foreground font-medium">
            total to pay
          </span>
        </div>
        <p className="text-xs text-muted-foreground font-medium">
          ₹{totalTax.toLocaleString("en-IN")}{" "}
          <span className="text-[11px] text-muted-foreground">
            tax ({taxPercentage}%)
          </span>
        </p>
        <div className="flex items-center gap-1 mt-1">
          <Check className="w-3 h-3 text-emerald-500 stroke-[3px]" />
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tight">
            Free cancellation
          </span>
        </div>
      </div>
      <Button
        type="submit"
        disabled={loading}
        className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-white text-base font-black shadow-lg shadow-primary/20 transition-all active:scale-[0.98] flex items-center gap-2"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Reserve"}
      </Button>
    </div>
  );
};

// ─── Desktop sidebar card ─────────────────────────────────────────────────────
export const BookingDetailsCard = ({
  loading,
  hookname,
  serviceType,
  tourServiceData,
}: {
  loading?: boolean;
  hookname: keyof typeof hooksSupplier;
  serviceType: string;
  tourServiceData?: any;
}) => {
  const store = hooksSupplier[hookname]();
  const methods = useFormContext<PaymentProps>();
  const checkin = methods.watch("dates.checkin");
  const checkout = methods.watch("dates.checkout");
  const adults = methods.watch("guests.adults") || 1;
  const children = methods.watch("guests.children") || 0;
  const totalGuests = Math.max(1, adults + children);

  const service = tourServiceData?.service;
  const company = tourServiceData?.company;

  const basePricePerPerson = service?.price || 0;
  const taxPercentage = service?.taxPercentage || 0;
  const totalBasePrice = basePricePerPerson * totalGuests;
  const totalTax = Number(((totalBasePrice * taxPercentage) / 100).toFixed(2));
  const grandTotal = totalBasePrice + totalTax;

  const serviceLabel: Record<string, string> = {
    tour: "Tour Package",
    bike: "Bike Rental",
    adventure: "Adventure Activity",
    cab: "Cab Ride",
  };

  const image =
    service?.images?.[0]?.url ||
    company?.images?.[0]?.url ||
    (typeof company?.images?.[0] === "string" ? company?.images?.[0] : null) ||
    "/story/hero.png";

  return (
    <Card className="shadow-lg border-primary/10 overflow-hidden rounded-2xl">
      {image && (
        <div className="relative h-44 w-full overflow-hidden bg-muted">
          <img
            src={image}
            alt={service?.title || "Booking"}
            className="w-full h-full object-cover"
          />
          {service?.duration && (
            <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              {service.duration}
            </div>
          )}
        </div>
      )}

      <div className="p-5 pb-3">
        <h3 className="text-lg font-bold line-clamp-1">
          {service?.title || serviceLabel[serviceType] || serviceType}
        </h3>
        {company?.name && (
          <p className="text-xs font-semibold text-muted-foreground mt-0.5">
            {company.name} {company.city ? `• ${company.city}` : ""}
          </p>
        )}
      </div>

      <CardContent className="p-5 pt-0 space-y-5">
        <div className="bg-muted/40 p-3.5 rounded-xl space-y-2 text-xs">
          {checkin && (
            <p className="text-muted-foreground flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="font-medium text-foreground">
                {checkin && checkout && checkin !== checkout
                  ? `${format(new Date(checkin), "dd MMM")} - ${format(new Date(checkout), "dd MMM yyyy")}`
                  : format(new Date(checkin), "dd MMM yyyy")}
              </span>
            </p>
          )}
          <p className="text-muted-foreground flex items-center gap-2">
            <Users className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="font-medium text-foreground">
              {totalGuests} {totalGuests === 1 ? "Guest" : "Guests"}
            </span>
            {service?.maxPeople && (
              <span className="text-[10px] text-muted-foreground">
                (Max: {service.maxPeople})
              </span>
            )}
          </p>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>
              Without Tax Price for {totalGuests}{" "}
              {totalGuests === 1 ? "person" : "persons"}
            </span>
            <span className="font-semibold">
              ₹{totalBasePrice.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span>Tax ({taxPercentage}%)</span>
            <span className="font-semibold">
              ₹{totalTax.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="flex justify-between text-lg font-black border-t pt-3 text-primary">
            <span>Total Payable</span>
            <span>₹{grandTotal.toLocaleString("en-IN")}</span>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 text-lg font-bold shadow-orange-200"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <CreditCard className="mr-2 h-5 w-5" /> Proceed to Pay
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

// ─── Booking Details (form step) ──────────────────────────────────────────────
export function BookingDetails({
  methods,
  serviceType,
  maxPeople,
  onGuestsChange,
}: {
  methods: UseFormReturn<PaymentProps>;
  serviceType: string;
  maxPeople?: number;
  onGuestsChange?: (newAdults: number, newChildren: number) => void;
}) {
  return (
    <div className="space-y-8 pb-20">
      <TripSummaryCard
        methods={methods}
        serviceType={serviceType}
        maxPeople={maxPeople}
        onGuestsChange={onGuestsChange}
      />
      <GuestInfoCard methods={methods} />
      <SpecialRequestCard methods={methods} />
      <AddOnsCard />
      <CancellationPolicyCard />
    </div>
  );
}

export default BookingCard;
