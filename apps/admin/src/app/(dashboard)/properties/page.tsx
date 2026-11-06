'use client'
import React, { Suspense } from 'react'
import { useProperty } from './_calls/queryies'
import { PropertiesDataTable } from './_comp/propertytable';
import { PageSkeleton } from '@/components/loaders/loader/skeleton';
import { ErrorBoundary } from 'react-error-boundary';
import { MessageModal } from '@/components/messagemodal';

type Props = {}
export interface Property {
  _id: string;
  status: "approved" | "pending" | "rejected" | "blocked";
  submittedAt?: string; // Optional because some entries don't have it
  propertyName?: string;
  businessName?: string;
  city: string;
  vendorName: string;
  rank: string;
  canAssignRank: boolean;
  serviceType?: string;
}

export interface PropertyResponse {
  success: boolean;
  data: {
    properties: Property[];
    pagination: {
      page: number;
      limit: number;
      total: number;
    };
  };
}
const page = (props: Props) => {
  const { data, isLoading } = useProperty({ limit: 200 });
  if(isLoading){
    return <PageSkeleton/>
  }
  return (
    <ErrorBoundary fallback={<MessageModal title="Error" description="Something went wrong" />}>
            <Suspense fallback={<PageSkeleton />}>
            
    <div>
      <PropertiesDataTable properties={data?.data?.data?.properties || []}/>
    </div>
    </Suspense>
    </ErrorBoundary>
  )
}

export default page 