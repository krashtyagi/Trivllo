"use client"

export interface BookingResponse {
  data: BookingDetail;
}

export interface BookingDetail {
  bookingReference: string;
  status: "confirmed" | "cancelled" | "pending"; // Added union for type safety
  checkIn: string;  // ISO Date string
  checkOut: string; // ISO Date string
  nights: number;
  guests: Guests;
  specialRequest: string | null;
  primaryGuest: PrimaryGuest;
  room: RoomInfo;
  priceSummary: PriceSummary;
}

export interface Guests {
  adults: number;
  children: number;
}

export interface PrimaryGuest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

export interface RoomInfo {
  roomType: string;
  roomNumber: string;
  image: string;
}

export interface PriceSummary {
  pricePerNight: number;
  taxAmount: number;
  cleaningFee: number;
  discountAmount: number;
  totalAmount: number;
  paymentStatus: "paid" | "pending" | "failed" | "refunded";
}

export default function DashboardPage({ id }: { id: string }) {
  const { data: d, isLoading } = useGetReservedUserData(id)
  if (isLoading) return <PageSkeleton />
  const data = d


  return (
    <div className="min-h-screen bg-muted/30 p-6">
      <div className="grid grid-cols-12 gap-6">

        <div className="col-span-12 lg:col-span-3">
          <ProfileCard data={data?.data} />
        </div>

        <div className="col-span-12 lg:col-span-6">
          <BookingInfoCard data={data?.data} />
        </div>

        <div className="col-span-12 lg:col-span-3">
          <RoomInfoCard data={data?.data} />
        </div>
      </div>

      {/* <div className="mt-6">
        <BookingHistoryTable />
      </div> */}
    </div>
  )
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export function ProfileCard({ data }: { data: BookingDetail }) {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">

        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-full overflow-hidden ">
            <img src={"/person.png"} alt="user" />
          </div>
          <div>
            <p className="font-semibold">{data.primaryGuest.firstName} {data.primaryGuest.lastName}</p>
            <p className="text-sm text-muted-foreground">
              {data.primaryGuest.phoneNumber}
            </p>
          </div>
        </div>

        <Separator />

        {/* Personal Info */}
        <div className="space-y-2 text-sm">
          <p><span className="font-medium">Date of Birth:</span> June 15, 1985</p>
          {/* <p><span className="font-medium">Gender:</span> NA</p> */}
          <p><span className="font-medium">Nationality:</span> Indian</p>
          <p><span className="font-medium">Passport No:</span> A12345678</p>
        </div>

        {/* <Separator /> */}

        {/* Loyalty */}
        {/* <div className="space-y-3">
          <p className="font-medium">Loyalty Program</p>
          <Badge className="bg-purple-500">Platinum Member</Badge>
          <p className="text-sm text-muted-foreground">
            15,000 points • Elite Tier
          </p>
        </div> */}

      </CardContent>
    </Card>
  )
}

import { Button } from "@/components/ui/button"

export function BookingInfoCard({ data }: { data: BookingDetail }) {
  // 1. Create a reusable formatter
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  // 2. Format the creation date (Booking time)
  // Assuming checkIn or a separate 'createdAt' field exists
  const bookingTime = new Date(data.checkIn).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Card className="rounded-2xl shadow-sm border-muted">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-6">
        <div>
          <Badge
            variant={data.status === 'confirmed' ? 'default' : 'secondary'}
            className="mb-2 capitalize"
          >
            {data.status}
          </Badge>
          <CardTitle className="text-xl">Booking ID: {data.bookingReference}</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {formatDate(data.checkIn)} • {bookingTime}
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="text-muted-foreground">Payment:</span>
          <span className={data.priceSummary.paymentStatus === 'paid' ? 'text-green-600' : 'text-orange-500'}>
            {data.priceSummary.paymentStatus.toUpperCase()}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4 text-sm">
          <Info label="Room Type" value={data.room.roomType} />
          <Info label="Room Number" value={data.room.roomNumber || "Pending"} />
          <Info
            label="Price"
            value={`₹${data.priceSummary.pricePerNight.toLocaleString('en-IN')}`}
          />
          <Info
            label="Guests"
            value={`${data.guests.adults} Adults, ${data.guests.children} ${data.guests.children === 1 ? 'Child' : 'Children'}`}
          />
          {/* FIXED DATES HERE */}
          <Info label="Check In" value={formatDate(data.checkIn)} />
          <Info label="Check Out" value={formatDate(data.checkOut)} />
          <Info label="Duration" value={`${data.nights} Night${data.nights > 1 ? 's' : ''}`} />
        </div>

        <Separator />

        <div>
          <p className="font-medium mb-3">Included Amenities</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="text-green-500">✓</span> Complimentary breakfast
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="text-green-500">✓</span> Free High-speed Wi-Fi
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="text-green-500">✓</span> Access to gym and pool
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  )
}

import Image from "next/image"


export function RoomInfoCard({ data }: { data: BookingDetail }) {
  return (
    <Card className="rounded-2xl overflow-hidden shadow-none bg-background border border-border ">
      <CardHeader>
        <CardTitle>Room Info</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="relative h-40 w-full rounded-xl overflow-hidden">
          <Image
            src={data.room.image || "/room.png"}
            alt="Room"
            fill
            className="object-cover"
          />
        </div>

        <div className="flex justify-between text-sm">
          <span>35 m²</span>
          <span>King Bed</span>
          <span>2 Guests</span>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Price Per Night</span>
            <span><Rupee />{data.priceSummary.pricePerNight}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax Amount</span>
            <span><Rupee />{data.priceSummary.taxAmount}</span>
          </div>
          <div className="flex justify-between">
            <span>Cleaning Fee</span>
            <span><Rupee />{data.priceSummary.cleaningFee}</span>
          </div>
          <div className="flex justify-between">
            <span>Discount Amount</span>
            <span><Rupee />{data.priceSummary.discountAmount}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span><Rupee />{data.priceSummary.totalAmount}</span>
          </div>
        </div>

        <div className="flex gap-3 px-2">
          <Badge className="bg-purple-500">Paid</Badge>
          <Badge className="bg-red-500">{data.priceSummary.paymentStatus}</Badge>
        </div>
      </CardContent>
    </Card>
  )
}

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useGetReservedUserData } from "@/services/tanstack.query"
import { PageSkeleton } from "../../(categories)/rooms/_components/details.skeleton";
import Rupee from "@/components/rupee";


export function BookingHistoryTable() {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Booking History</CardTitle>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking ID</TableHead>
              <TableHead>Room Type</TableHead>
              <TableHead>Check-In</TableHead>
              <TableHead>Check-Out</TableHead>
              <TableHead>Guests</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            <TableRow>
              <TableCell>LG-B00109</TableCell>
              <TableCell>
                <Badge variant="secondary">Deluxe</Badge>
              </TableCell>
              <TableCell>June 19, 2024</TableCell>
              <TableCell>June 21, 2024</TableCell>
              <TableCell>2 Guests</TableCell>
            </TableRow>

            <TableRow>
              <TableCell>LG-B00085</TableCell>
              <TableCell>
                <Badge className="bg-purple-500">Suite</Badge>
              </TableCell>
              <TableCell>March 25, 2024</TableCell>
              <TableCell>March 30, 2024</TableCell>
              <TableCell>1 Guest</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}