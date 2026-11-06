'use client'
import { useParams } from 'next/navigation';
import React from 'react'
import { useBookingById } from '../queryes';
import BookingDetailView from './bookingDetails';
import { PageSkeleton } from '@/components/loaders/loader/skeleton';

type Props = {}
export interface ApiResponse {
  success: boolean;
  data: BookingData;
}

export interface BookingData {
  _id: string;
  user: User;
  vendor: Vendor;
  payment: Payment;
  bookingInfo: BookingInfo;
  service: Service;
  pricing: Pricing;
}

// --- Sub-Interfaces ---

export interface User {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
}

export interface Vendor {
  _id: string;
  businessName: string;
  status: 'approved' | 'pending' | 'rejected'; // Adjusted to common status types
  isActive: boolean;
}

export interface Payment {
  _id: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  amountPaid: number;
  currency: string;
  paymentMethod: string;
  status: 'captured' | 'failed' | 'pending';
  isVerified: boolean;
  refund: {
    refundAmount: number;
    refundStatus: 'none' | 'pending' | 'completed';
  };
}

export interface BookingInfo {
  bookingId: string;
  bookingReference: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  paymentStatus: 'paid' | 'unpaid' | 'partial';
  checkIn: string; // ISO Date string
  checkOut: string; // ISO Date string
  nights: number;
  createdAt: string; // ISO Date string
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
  additionalGuests: any[]; // Specified as array based on your JSON
  roomNumber: string;
  cancellation: Record<string, any>; // Empty object in your example
  refund: {
    refundStatus: string;
    refundAmount: number;
    refundPercentage: number;
  };
}

export interface Service {
  type: 'hotel' | string;
  hotel: {
    _id: string;
    name: string;
    city: string;
    address: string;
    rating: number;
    numReviews: number;
    verificationStatus: 'pending' | 'verified';
    image: string;
  };
  room: {
    roomTypeId: string;
    pricePerNight: number;
  };
}

export interface Pricing {
  pricePerNight: number;
  nights: number;
  roomsBooked: number;
  taxAmount: number;
  cleaningFee: number;
  discountAmount: number;
  totalAmount: number;
}
const page = (props: Props) => {
    const {bookingId} = useParams();
          const id = Array.isArray(bookingId)
          ? bookingId[0]
          : bookingId || "";
    const {data, isLoading} = useBookingById(id);
    if(isLoading){
        return (
            <PageSkeleton/>
        )
    }
  return (
    <div>
        <BookingDetailView data={data?.data?.data}/>
    </div>
  )
}

export default page