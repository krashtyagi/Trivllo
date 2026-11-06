'use client';

import React, { useState } from 'react';
import { useAllUsers } from './_calls/queryies';
import { UsersDataTable } from './_components/userstable';

export interface User {
  _id: string;
  isActive: boolean;
  createdAt: string;
  totalBookings: number;
  role?: string;
  phoneNumber?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
}

interface ApiResponse {
  success: boolean;
  data: {
    users: User[];
    pagination: Pagination;
  };
}

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: response, isLoading } = useAllUsers({
    page,
    limit,
    search: search.trim() || undefined,
    role: roleFilter !== "all" ? roleFilter : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const apiData = response?.data as ApiResponse;
  const users = apiData?.data?.users || [];
  const pagination = apiData?.data?.pagination;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <UsersDataTable
        users={users}
        pagination={pagination}
        isLoading={isLoading}
        page={page}
        setPage={setPage}
        limit={limit}
        setLimit={setLimit}
        search={search}
        setSearch={setSearch}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />
    </div>
  );
}