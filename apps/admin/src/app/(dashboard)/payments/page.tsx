'use client'
import React, { useState } from 'react'
import { usePaymentStats, useAllPayments } from './queryes'
import { PaymentStatsGrid } from './_components/payment-stats'
import { PaymentDataTable } from './_components/payment-table'
import { PaymentDetailView } from './_components/payment-detail'
import { StatsGridSkeleton, TableSkeleton } from '@/components/loaders/dashboard-skeleton'

const PaymentsPage = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);

  const { data: statsRes, isLoading: statsLoading } = usePaymentStats();
  const { data: paymentsRes, isLoading: paymentsLoading } = useAllPayments(
    statusFilter !== "all" ? { status: statusFilter } : undefined
  );

  if (selectedPaymentId) {
    return (
      <PaymentDetailView
        paymentId={selectedPaymentId}
        onBack={() => setSelectedPaymentId(null)}
      />
    );
  }

  if (statsLoading || paymentsLoading) {
    return (
      <div className="space-y-6">
        <StatsGridSkeleton count={5} />
        <TableSkeleton rows={6} cols={6} />
      </div>
    );
  }

  const payments = paymentsRes?.data?.data?.payments || [];
  const stats = statsRes?.data?.data;

  return (
    <div className="space-y-6">
      <PaymentStatsGrid stats={stats} />
      <PaymentDataTable
        payments={payments}
        onSelectPayment={(id) => setSelectedPaymentId(id)}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />
    </div>
  );
};

export default PaymentsPage;