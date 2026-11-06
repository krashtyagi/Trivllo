'use client'
import React, { useState } from 'react'
import { useSupportStsts, useAllTickets } from './queryes'
import { TicketStatsGrid } from './_components/supportStsts';
import { TicketDataTable } from './_components/ticket-table';
import { TicketDetailView } from './_components/ticket-detail';
import { StatsGridSkeleton, TableSkeleton } from '@/components/loaders/dashboard-skeleton';

export interface TicketStats {
  success: boolean;
  data: {
    totalTickets: number;
    activeTickets: number;
    resolvedTickets: number;
    closedTickets: number;
  };
}

const SupportPage = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const { data: statsData, isLoading: statsLoading } = useSupportStsts();
  const { data: ticketsData, isLoading: ticketsLoading } = useAllTickets(
    statusFilter !== "all" ? { status: statusFilter } : undefined
  );

  if (selectedTicketId) {
    return (
      <TicketDetailView
        ticketId={selectedTicketId}
        onBack={() => setSelectedTicketId(null)}
      />
    );
  }

  if (statsLoading || ticketsLoading) {
    return (
      <div className="space-y-6">
        <StatsGridSkeleton count={4} />
        <TableSkeleton rows={6} cols={5} />
      </div>
    );
  }

  const tickets = ticketsData?.data?.data?.tickets || [];

  return (
    <div className="space-y-6">
      <TicketStatsGrid stats={statsData?.data?.data} />
      <TicketDataTable
        tickets={tickets}
        onSelectTicket={(id) => setSelectedTicketId(id)}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />
    </div>
  );
};

export default SupportPage;