


"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFormContext, UseFormReturn, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { toast } from "sonner";
import { CheckCircle2, Copy, CreditCard, Calendar, Users, Info, Plus, Mail, Download, Home, Smartphone, User, IndianRupee } from "lucide-react";
import html2pdf from "html2pdf.js";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/spinner";
import { ScrollToTop } from "../../../../../../scrolltoto";
import { PhoneInput } from "./phoneinput";
import { Field } from "@/components/ui/field";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { cn } from "@/lib/utils";
import { usePaymentsContext } from "@/context/payments-form-provider";
import { Payment, useHotelStore } from "@/store/hotel.store";
import { PaymentProps, PaymentSchema } from "@/schema/payment.schema";
import { createBooking, verifyPayment } from "@/services/booking/booking.service";
import { VisitorsMembers } from "@/app/(home)/(categories)/hotels/[hotel]/_components/tabs";

import { handleRefresh } from "@/services/dailyfunctions";

import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth.store";

export const BookingForm = ({ slug }: { slug: string[] }) => {
  const { setPayments, payments, date, guests, selectedRoom } = useHotelStore();
  const { setCurrentStep, currentstep } = usePaymentsContext();
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useRouter();
  const queryClient = useQueryClient();

  const total = (guests?.adults || 0) + (guests?.children || 0);

  const methods = useForm<PaymentProps>({
    resolver: zodResolver(PaymentSchema),
    defaultValues: {
      dates: {
        checkin: date?.from ? format(date.from, "yyyy-MM-dd") : "",
        checkout: date?.to ? format(date.to, "yyyy-MM-dd") : "",
      },
      guests: {
        adults: guests?.adults || 0,
        children: guests?.children || 0,
      },
      guestInformation: Array(total || 1).fill({
        firstname: "",
        lastname: "",
        email: "",
        phone: "",
      }),
      specialRequest: "",
      rooms: [],
    },
    mode: "onChange",
  });

  React.useEffect(() => {
    if (!selectedRoom && currentstep !== 3) {
      navigate.replace("/");
    }
  }, [selectedRoom, navigate, currentstep]);

  const { currUser } = useAuthStore();

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
    if (date?.from && date?.to) {
      methods.setValue("dates.checkin", format(date.from, "yyyy-MM-dd"));
      methods.setValue("dates.checkout", format(date.to, "yyyy-MM-dd"));
    }
  }, [date, methods]);

  const onSubmit = async (data: PaymentProps) => {
    try {
      setLoading(true);
      const bookingData = {
        hotelId: slug[0],
        roomTypeId: slug[1],
        checkIn: data.dates.checkin,
        checkOut: data.dates.checkout,
        guests: { adults: data.guests.adults, children: data.guests.children },
        roomsBooked: data.rooms.length || 1,
        primaryGuest: {
          firstName: data.guestInformation[0]?.firstname || "",
          lastName: data.guestInformation[0]?.lastname || "",
          email: data.guestInformation[0]?.email || "",
          phoneNumber: data.guestInformation[0]?.phone || "",
        },
        additionalGuests: data.guestInformation.slice(1).map((guest) => ({
          firstName: guest.firstname || "",
          lastName: guest.lastname || "",
        })),
        specialRequest: data.specialRequest,
      };
      // console.log("bookingData", bookingData);

      const result = await createBooking(bookingData);


      if (result?.success) {
        const { razorpayOrder, booking } = result.data;
        const initialPaymentData: any = {
          ...result.data,
          razorpay_order_id: razorpayOrder.id,
          razorpay_payment_id: razorpayOrder.id,
          razorpay_signature: razorpayOrder.receipt,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          status: razorpayOrder.status,
          firstname: booking.primaryGuest?.firstName || data.guestInformation[0]?.firstname || "",
          lastname: booking.primaryGuest?.lastName || data.guestInformation[0]?.lastname || "",
          email: booking.primaryGuest?.email || data.guestInformation[0]?.email || "",
          phone: booking.primaryGuest?.phoneNumber || data.guestInformation[0]?.phone || "",
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
              setLoading(true);
              const verifyResult = await verifyPayment(response);
              if (verifyResult?.success !== false) {
                toast.success("Payment successful! Booking confirmed.");
                const verifiedBooking = verifyResult?.data;
                setPayments({
                  ...initialPaymentData,
                  status: "confirmed",
                  razorpay_payment_id: response.razorpay_payment_id || initialPaymentData.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature || initialPaymentData.razorpay_signature,
                  razorpay_order_id: response.razorpay_order_id || initialPaymentData.razorpay_order_id,
                  bookingId: verifiedBooking?._id || initialPaymentData.bookingId,
                  bookingReference: verifiedBooking?.bookingReference || initialPaymentData.bookingReference,
                  firstname: verifiedBooking?.primaryGuest?.firstName || initialPaymentData.firstname,
                  lastname: verifiedBooking?.primaryGuest?.lastName || initialPaymentData.lastname,
                  email: verifiedBooking?.primaryGuest?.email || initialPaymentData.email,
                  phone: verifiedBooking?.primaryGuest?.phoneNumber || initialPaymentData.phone,
                  amount: razorpayOrder.amount,
                });
                setCurrentStep((val) => val + 1);
                handleRefresh(queryClient, ["hotel_details", "hotel_availability"]);
              } else {
                toast.error("Payment verification failed.");
              }
            } catch (err) {
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
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();

      } else {
        toast.error(result?.message || "Failed to create booking.");
        setLoading(false);
      }
    } catch (error: any) {
      console.error(
        "Booking submission error:",
        error.response?.data?.message || error.response?.data || error.message || error,
      );
      toast.error(
        error.response?.data?.message || error.message || "An error occurred.",
      );
      setLoading(false);
    }
  };
  const ismobile = useIsMobile();

  if (currentstep === 3) {
    return <FinalStep />;
  }

  return (
    <Form {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className={cn("container max-w-7xl mx-auto px-4", ismobile && "pb-32")}>
        <StepsView />
        {!loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8 w-full">
            <div className="lg:col-span-8">
              <PaymentForm methods={methods} />
            </div>
            {currentstep === 2 && (
              <div className="lg:col-span-4">
                <div className="sticky top-24">
                  {ismobile ? (
                    <div className="fixed bottom-0 left-0 right-0 z-[90] w-full border-t bg-white dark:bg-zinc-950 p-4 animate-in slide-in-from-bottom duration-300">
                      <BookingCard loading={loading} />
                    </div>
                  ) : (
                    <BookingDetailsCard
                      hotelid={slug[0]}
                      roomTypeId={slug[1]}
                      loading={loading}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-screen flex flex-col items-center justify-center py-32 space-y-4">
            <Spinner />
            <p className="text-muted-foreground animate-pulse">Processing your request...</p>
          </div>
        )}
      </form>
    </Form>
  );
};

import { Check } from 'lucide-react';
import { useIsMobile } from "@/hooks/use-mobile";
import { RouterPush } from "@/components/RouterPush";
import { downloadBookings } from "./book.service";
import { HighLightBar } from "./HightLightBar";
import { CancellationPolicyCard } from "./CanclePolicy";
import { AddOnsCard, GuestInfoCard, SpecialRequestCard, TripSummaryCard } from "./Addoncards";
import { PaymentSuccess } from "./PaymentSuccess";

const BookingCard = ({ loading }: { loading: boolean }) => {
  const { selectedRoom, date } = useHotelStore();
  const methods = useFormContext<PaymentProps>();

  if (!selectedRoom) return null;

  const totalAdults = methods.watch("guests.adults") || 0;
  const totalChildren = methods.watch("guests.children") || 0;
  const nights = selectedRoom.nights || 0;
  const totalPrice = selectedRoom.totalPrice || 0;
  const totalPriceWithTax = selectedRoom.totalPriceWithTax || 0;
  const totalTax = selectedRoom.totalTax || 0;
  const taxPercentage = selectedRoom.taxPercentage || 0;

  return (
    <div className="flex items-center justify-between gap-4">
      {/* Price & Summary Section */}
      <div className="flex flex-col">
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold tracking-tight">₹{totalPriceWithTax.toLocaleString()}</span>
          <span className="text-xs text-muted-foreground font-medium">total to pay</span>
        </div>
        {/* <p className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 mt-0.5">
          {nights} nights · {totalAdults + totalChildren} guests
        </p> */}
        <p className="hidden md:block">₹{totalTax.toLocaleString()} <span className="text-xs text-muted-foreground font-medium">total tax</span></p>
        {/* <p>{taxPercentage.toLocaleString()}% <span className="text-xs text-muted-foreground font-medium"></span>   </p> */}
        <p>₹{totalTax.toLocaleString()} <span className="text-xs text-muted-foreground font-medium">tax</span></p>
        <div className="flex items-center gap-1 mt-1">
          <Check className="w-3 h-3 text-emerald-500 stroke-[3px]" />
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tight">Free cancellation</span>
        </div>
      </div>

      {/* Action Button */}
      <Button
        type="submit"
        disabled={loading}
        className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-white text-base font-black shadow-lg shadow-primary/20 transition-all active:scale-[0.98] flex items-center gap-2"
      >
        {loading ? <Spinner /> : "Reserve"}
      </Button>
    </div>
  );
};

export default BookingCard;
export const StepsView = () => (
  <div className="w-full py-8 overflow-x-auto">
    <HighLightBar />
  </div>
);

export const PaymentForm = ({ methods }: { methods: UseFormReturn<PaymentProps> }) => {
  const { currentstep } = usePaymentsContext();
  if (currentstep === 2) return <BookingDetails methods={methods} />;
  return <FinalStep />;
};

export const FinalStep = () => {
  const { payments, selectedRoom } = useHotelStore();
  if (!payments) return null;
  return (
    <>
      <ScrollToTop />
      <PaymentSuccess payment={payments} selectedRoom={selectedRoom} />
    </>
  );
};





export const BookingDetailsCard = ({ loading }: { loading?: boolean; hotelid: string; roomTypeId: string }) => {
  const { selectedRoom } = useHotelStore();
  const methods = useFormContext<PaymentProps>();
  const navigate = useRouter();

  if (!selectedRoom) return null;

  const nights = selectedRoom?.nights || 0;
  const totalPrice = selectedRoom?.totalPrice || 0;
  const totalPriceWithTax = selectedRoom?.totalPriceWithTax || 0;
  const totalTax = selectedRoom?.totalTax || 0;
  const taxPercentage = selectedRoom?.taxPercentage || 0;

  return (
    <Card className="shadow-lg border-primary/10 overflow-hidden">
      <img src={selectedRoom.image || "/hotels/img1.png"} alt="Room" className="w-full h-48 object-cover" />
      <CardContent className="p-6 space-y-6">
        <div>
          <h3 className="text-xl font-bold">{selectedRoom.title}</h3>
          <p className="text-sm text-muted-foreground flex items-center gap-2 mt-2">
            <Calendar className="h-4 w-4" />
            {format(new Date(methods.watch("dates.checkin")), "dd MMM")} - {format(new Date(methods.watch("dates.checkout")), "dd MMM yyyy")}
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
            <Users className="h-4 w-4" /> {methods.watch("guests.adults")} Adults, {methods.watch("guests.children")} Children
          </p>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Without Tax Price for {nights} nights</span>
            <span className="font-semibold">₹{totalPrice.toLocaleString()}</span>
          </div>
          {/* <div className="flex justify-between text-sm">
            <span>Total taxPercentage</span>
            <span className="font-semibold">{taxPercentage.toLocaleString()}%</span>
          </div> */}
          <div className="flex justify-between text-sm">
            <span>Tax ({taxPercentage}%)</span>
            <span className="font-semibold">₹{totalTax.toLocaleString()}</span>
          </div>

          <div className="flex justify-between text-lg font-black border-t pt-3 text-primary">
            <span>Total Payable</span>
            <span>₹{totalPriceWithTax.toLocaleString()}</span>
          </div>
        </div>

        <Button type="submit" disabled={nights <= 0 || loading} className="w-full h-12 text-lg font-bold shadow-orange-200">
          {loading ? <Spinner /> : <CreditCard className="mr-2 h-5 w-5" />}
          Proceed to Pay
        </Button>
      </CardContent>
    </Card>
  );
};

export function BookingDetails({ methods }: { methods: UseFormReturn<PaymentProps> }) {
  return (
    <div className="space-y-8 pb-20">
      <TripSummaryCard methods={methods} />
      <GuestInfoCard methods={methods} />
      <SpecialRequestCard methods={methods} />
      <AddOnsCard />
      <CancellationPolicyCard />
    </div>
  );
}









