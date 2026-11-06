"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  Loader2,
  Eye,
  Shield,
  User as UserIcon,
  Calendar,
  Phone,
  Hash,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User } from "../page";
import { useRouter } from "next/navigation";
import { RouterPush } from "@/components/RouterPush";
import { useUpdateUserStatus } from "../_calls/queryies";
import { toast } from "sonner";

const UserActionsCell = ({ user }: { user: User }) => {
  const router = useRouter();
  const { mutate: toggleStatus, isPending } = useUpdateUserStatus();

  const handleToggle = () => {
    toggleStatus(
      { userId: user._id, isActive: !user.isActive },
      {
        onSuccess: (res: any) => {
          toast.success(res?.data?.message || `User status updated successfully`);
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || "Failed to update user status");
        },
      }
    );
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="h-8 px-2.5 text-xs font-medium gap-1.5 hover:bg-primary/10 hover:text-primary hover:border-primary/40 transition-all cursor-pointer"
        onClick={() => RouterPush(router, `users/${user._id}`)}
      >
        <Eye className="h-3.5 w-3.5" />
        View
      </Button>

      <Button
        variant={user.isActive ? "destructive" : "outline"}
        size="sm"
        className={`h-8 px-3 text-xs font-semibold transition-all cursor-pointer ${
          !user.isActive
            ? "border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700 hover:border-emerald-500"
            : ""
        }`}
        disabled={isPending}
        onClick={handleToggle}
      >
        {isPending ? (
          <Loader2 className="h-3 w-3 animate-spin mr-1" />
        ) : user.isActive ? (
          "Block"
        ) : (
          "Unblock"
        )}
      </Button>
    </div>
  );
};

const formatDate = (iso: string) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const columns: ColumnDef<User>[] = [
  {
    id: "user",
    header: "User",
    accessorFn: (row) => `${row.firstName} ${row.lastName} ${row.email}`,
    cell: ({ row }) => {
      const router = useRouter();
      const user = row.original;
      const initials =
        `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}` || "U";

      return (
        <div className="flex items-center gap-3">
          <TooltipProvider>
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <Avatar className="h-8 w-8 border border-border cursor-zoom-in">
                  <AvatarImage src={user.avatar} alt={user.firstName} />
                  <AvatarFallback className="text-[10px] bg-muted">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent side="right" className="p-1 border-border bg-popover">
                <div className="relative h-[100px] w-[100px] overflow-hidden rounded-md">
                  <img
                    src={user.avatar || "/placeholder-user.jpg"}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div
            className="flex flex-col cursor-pointer hover:underline decoration-primary/30"
            onClick={() => RouterPush(router, `users/${user._id}`)}
          >
            <span className="font-medium text-foreground text-sm leading-none mb-1">
              {user.firstName
                ? `${user.firstName} ${user.lastName || ""}`.trim()
                : "Unnamed User"}
            </span>
            <span className="text-[10px] text-muted-foreground lowercase">
              {user.email || "No email"}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Role / Staff Access",
    cell: ({ row }) => {
      const role = (row.original.role || "user").toLowerCase();
      let colorClass = "bg-muted text-muted-foreground border-border";
      let label = "Customer";

      if (role === "blog_editor") {
        colorClass =
          "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
        label = "Blog Editor";
      } else if (role === "blog_author") {
        colorClass =
          "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20";
        label = "Blog Author";
      } else if (role === "seo_manager") {
        colorClass =
          "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20";
        label = "SEO Manager";
      } else if (role === "reviewer") {
        colorClass =
          "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
        label = "Reviewer";
      } else if (role === "admin" || role === "super_admin") {
        colorClass =
          "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
        label = role === "super_admin" ? "Super Admin" : "Admin";
      }

      return (
        <Badge variant="outline" className={`font-semibold text-xs ${colorClass}`}>
          {label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "phoneNumber",
    header: "Contact",
    cell: ({ row }) => (
      <div className="text-sm text-foreground/80 font-mono">
        {row.getValue("phoneNumber") || "—"}
      </div>
    ),
  },
  {
    accessorKey: "totalBookings",
    header: "Bookings",
    cell: ({ row }) => (
      <div className="flex justify-start px-2">
        <Badge variant="secondary" className="font-bold">
          {row.getValue("totalBookings") ?? 0}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Joined",
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">
        {formatDate(row.getValue("createdAt"))}
      </div>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean;
      return (
        <Badge
          variant="outline"
          className={`capitalize font-medium ${
            isActive
              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {isActive ? "Active" : "Blocked"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <UserActionsCell user={row.original} />,
  },
];

interface UsersDataTableProps {
  users: User[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages?: number;
  };
  isLoading?: boolean;
  page: number;
  setPage: (page: number | ((p: number) => number)) => void;
  limit: number;
  setLimit: (limit: number) => void;
  search: string;
  setSearch: (search: string) => void;
  roleFilter: string;
  setRoleFilter: (role: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
}

export function UsersDataTable({
  users,
  pagination,
  isLoading = false,
  page,
  setPage,
  limit,
  setLimit,
  search,
  setSearch,
  roleFilter,
  setRoleFilter,
  statusFilter,
  setStatusFilter,
}: UsersDataTableProps) {
  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const totalPages = pagination?.totalPages || 1;
  const totalUsers = pagination?.total || users.length;

  return (
    <div className="w-full rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Top Header & Search/Filter Controls */}
      <div className="p-4 bg-muted/20 border-b border-border flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            User Management & Directory
            <Badge variant="secondary" className="text-xs font-mono font-medium">
              {totalUsers} {totalUsers === 1 ? "user" : "users"}
            </Badge>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage customer accounts, assigned staff privileges (Blog Editor, SEO, Reviewers), and access controls.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:w-[220px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search name, email, phone..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 bg-background h-9 text-xs"
            />
          </div>

          {/* Role Filter */}
          <Select
            value={roleFilter}
            onValueChange={(val) => {
              setRoleFilter(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-9 w-[130px] text-xs">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="user">Customer Only</SelectItem>
              <SelectItem value="blog_editor">Blog Editor</SelectItem>
              <SelectItem value="blog_author">Blog Author</SelectItem>
              <SelectItem value="seo_manager">SEO Manager</SelectItem>
              <SelectItem value="reviewer">Reviewer</SelectItem>
              <SelectItem value="admin">Administrator</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-9 w-[110px] text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
            </SelectContent>
          </Select>

          {/* Limit Selector */}
          <Select
            value={String(limit)}
            onValueChange={(val) => {
              setLimit(Number(val));
              setPage(1);
            }}
          >
            <SelectTrigger className="h-9 w-[110px] text-xs">
              <SelectValue placeholder="Limit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 / page</SelectItem>
              <SelectItem value="20">20 / page</SelectItem>
              <SelectItem value="50">50 / page</SelectItem>
              <SelectItem value="100">100 / page</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/40">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="h-10 text-[11px] uppercase font-bold text-muted-foreground tracking-wider"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-36 text-center text-muted-foreground"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="text-xs">Loading users from database...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-border hover:bg-muted/40 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3 px-4">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-muted-foreground text-sm italic"
                >
                  No users matched the current filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 sm:p-4 bg-muted/10 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>
            Showing {users.length > 0 ? (page - 1) * limit + 1 : 0} to{" "}
            {Math.min(page * limit, totalUsers)} of {totalUsers} users
          </span>
          <span className="text-muted-foreground/60">•</span>
          <span>
            Page {page} of {totalPages}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs cursor-pointer"
            disabled={page <= 1 || isLoading}
            onClick={() => setPage((p) => Math.max(1, (p as number) - 1))}
          >
            <ChevronLeft className="h-3.5 w-3.5 mr-1" />
            Previous
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs cursor-pointer"
            disabled={page >= totalPages || isLoading}
            onClick={() => setPage((p) => (p as number) + 1)}
          >
            Next
            <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}