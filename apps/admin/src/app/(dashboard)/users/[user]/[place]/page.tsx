'use client'
import { useParams } from 'next/navigation';
import React from 'react'
import { useDestination } from '../../_calls/queryies';
import BookingDetailView from './details';
import { PageSkeleton } from '@/components/loaders/loader/skeleton';

export interface BookingDetailResponse {
  success: boolean;
  data: BookingDetail;
}

export interface BookingDetail {
  _id: string;
  vendor: VendorInfo;
  payment: PaymentDetails;
  bookingInfo: BookingInfo;
  service: ServiceDetails;
  pricing: PricingDetails;
}

interface VendorInfo {
  _id: string;
  businessName: string;
  status: "approved" | "pending" | "rejected";
  isActive: boolean;
}

interface PaymentDetails {
  _id: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  amountPaid: number;
  currency: string;
  paymentMethod: string;
  status: string;
  isVerified: boolean;
  refund: {
    refundAmount: number;
    refundStatus: string;
  };
}

interface BookingInfo {
  bookingId: string;
  bookingReference: string;
  status: "confirmed" | "pending" | "cancelled";
  paymentStatus: "paid" | "unpaid" | "partial";
  checkIn: string;
  checkOut: string;
  nights: number;
  createdAt: string;
  guests: {
    adults: number;
    children: number;
  };
  primaryGuest: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
  additionalGuests: any[]; // Adjust type if guests have a specific structure
  roomNumber: string;
  cancellation: Record<string, any>;
  refund: {
    refundStatus: string;
    refundAmount: number;
    refundPercentage: number;
  };
}

interface ServiceDetails {
  type: "hotel" | string;
  hotel: {
    _id: string;
    name: string;
    city: string;
    address: string;
    rating: number;
    numReviews: number;
    isActive: boolean;
    verificationStatus: string;
    image: string;
  };
  room: {
    roomTypeId: string;
    pricePerNight: number;
  };
}

interface PricingDetails {
  pricePerNight: number;
  nights: number;
  roomsBooked: number;
  taxAmount: number;
  cleaningFee: number;
  discountAmount: number;
  totalAmount: number;
}
const page = () => {
  const { user, place } = useParams();


  const id = Array.isArray(user) ? user[0] : user ?? "";
  
  const booking = Array.isArray(place) ? place[0] : place ?? "";

    const {data , isLoading} = useDestination({
        id, booking
    })
    if(isLoading){
        return (
            <PageSkeleton/>
        )
    }
  return (
    <div><BookingDetailView data={data?.data?.data} /></div>
  )
}

export default page