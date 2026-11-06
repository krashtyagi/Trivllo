"use client";
import React, { useState, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { MoreHorizontal, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TaskForm } from "./taskform";
import { useGetTasks } from "@/services/tanstack.query";
import { format } from "date-fns";
import Link from "next/link";
import { useGetVendorReviews } from "../../reviews/hooks/useVendorReviews";

export interface ITask {
  _id: string;
  vendorId: string;
  title: string;
  description?: string;
  dueDate: Date;
  priority: "low" | "medium" | "high";
  status: "pending" | "completed";
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}
export function RatingAndTasks() {
  const [checking, setChecking] = useState(false);
  const { data: t, isLoading: taskLoading, refetch, isRefetching } = useGetTasks();
  const tasks: ITask[] = t?.data || [];

  const { data: reviewsResponse, isLoading: reviewsLoading } = useGetVendorReviews();
  const reviewsData = reviewsResponse?.data || {};
  const summary = reviewsData.summary || {
    averageRating: 0,
    totalReviews: 0,
    breakdown: {
      facilities: 0,
      cleanliness: 0,
      services: 0,
      comfort: 0,
      location: 0,
    },
  };

  const averageRating = Number(summary.averageRating) || 0;
  const totalReviews = Number(summary.totalReviews) || 0;
  const breakdown = summary.breakdown || {};

  let ratingAdjective = "No Reviews";
  if (averageRating >= 4.5) ratingAdjective = "Impressive";
  else if (averageRating >= 4.0) ratingAdjective = "Very Good";
  else if (averageRating >= 3.0) ratingAdjective = "Good";
  else if (averageRating >= 2.0) ratingAdjective = "Fair";
  else if (averageRating > 0) ratingAdjective = "Poor";

  const ratingCategories = [
    { key: "facilities" as const, label: "Facilities" },
    { key: "cleanliness" as const, label: "Cleanliness" },
    { key: "services" as const, label: "Services" },
    { key: "comfort" as const, label: "Comfort" },
    { key: "location" as const, label: "Location" },
  ];

  const handleSubmitCheck = async ({
    id, status
  }: {
    id: string, status: string
  }) => {
    const data = {
      status: status === "completed" ? "pending" : "completed"
    }
    try {
      setChecking(true);
      const res = updateTask({
        id, data

      })
    } catch (error) {
      console.error("not checked something went wrong");


    } finally {
      setChecking(false);
    }

  }
  return (
    <div className="grid grid-cols-1 gap-2 max-w-md">
      <Card className="border-none shadow-sm rounded-3xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl font-bold">
            Overall Rating
          </CardTitle>
          <Link href="/reviews" title="View all reviews">
            <MoreHorizontal className="h-5 w-5 text-muted-foreground hover:text-foreground cursor-pointer transition-colors" />
          </Link>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-white dark:bg-zinc-100 rounded-2xl p-4 flex items-baseline gap-1 shadow-sm">
              <span className="text-3xl font-extrabold text-slate-900">
                {averageRating > 0 ? averageRating.toFixed(1) : "0.0"}
              </span>
              <span className="text-slate-500 font-semibold text-xs">/5</span>
            </div>
            <div>
              <p className="font-bold text-foreground text-lg leading-tight">
                {ratingAdjective}
              </p>
              <p className="text-xs text-muted-foreground">
                from {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {ratingCategories.map((item) => {
              const score = Number(breakdown[item.key] || 0);
              const percentage = Math.min(100, Math.round((score / 5) * 100));

              return (
                <div key={item.key} className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground w-24 font-medium">
                    {item.label}
                  </span>
                  <div className="flex-1 h-2 bg-lime-100/60 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-violet-500 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-foreground w-6 text-right">
                    {score > 0 ? score.toFixed(1) : "0.0"}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm rounded-3xl">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-xl font-bold ">
            Tasks
          </CardTitle>
          <TaskForm
            refetch={() => { refetch() }}
            trigger={
              <Button
                size="icon"
                className="bg-violet-500 hover:bg-violet-600 rounded-xl h-10 w-10"
              >
                <Plus className="h-6 w-6" />
              </Button>
            }
          />
        </CardHeader>

        <CardContent className="relative space-y-6">
          {taskLoading ? (
            <PageSkeleton />
          ) : tasks.length === 0 ? (
            <MessageModal title="Add tasks" description="adding notes can be usefull to remember tasks" />
          ) : (
            tasks.map((task: ITask, index: number) => {
              // Determine visual variant based on task priority or index
              // In the original UI, some were purple, some were green.
              const isViolet = task.priority === "high" || index % 3 === 1;

              return (
                <div key={task._id} className="flex gap-4 relative">
                  {/* Timeline Connector Line */}
                  {index !== tasks.length - 1 && (
                    <div className="absolute left-[11px] top-8 w-[1px] h-12 bg-slate-200" />
                  )}


                  <Checkbox
                    disabled={checking}


                    onCheckedChange={() => {
                      handleSubmitCheck({
                        id: task?._id, status: task.status
                      })
                    }}
                    defaultChecked={task.status === "completed"}
                    className="mt-1 border-slate-200 data-[state=checked]:bg-violet-500 h-6 w-6 rounded-md"
                  />


                  <div
                    className={`flex-1 rounded-2xl p-4 transition-all ${isViolet
                      ? "bg-violet-500 text-white shadow-md shadow-violet-100"
                      : "bg-emerald-50 text-slate-800"
                      }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span
                        className={`text-[11px] uppercase tracking-wider font-semibold ${isViolet ? "text-violet-200" : "text-slate-400"
                          }`}
                      >
                        {/* Format the Date safely */}
                        {task.dueDate
                          ? format(new Date(task.dueDate), "MMMM dd, yyyy")
                          : "No Date"}
                      </span>
                      <DropdownMenuIcons refetch={() => refetch()} task={task} trigger={
                        <MoreHorizontal className="h-4 w-4 opacity-60 cursor-pointer" />
                      } />

                    </div>
                    <p className="text-sm font-medium leading-snug">
                      {task.title}
                    </p>
                    {task.description && (
                      <p className={`text-xs mt-1 opacity-70 line-clamp-1`}>
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  CreditCardIcon,
  LogOutIcon,
  SettingsIcon,
  UserIcon,
} from "lucide-react"
import { IconPencil, IconTrash } from "@tabler/icons-react";
import { deleteTask, updateTask } from "@/services/fetch.service";
import { Spinner } from "@/components/ui/spinner";
import { MessageModal } from "../../(categories)/rooms/_components/RoomsListing";
import { PageSkeleton } from "../../(categories)/rooms/_components/details.skeleton";

export function DropdownMenuIcons({ trigger, task, refetch }: { trigger: ReactNode, task: ITask, refetch: () => void }) {
  const [deleting, setDeleting] = useState(false);
  const handelDelete = () => {
    try {
      setDeleting(true);
      const res = deleteTask(task?._id).then(() => {
        refetch();
      })


    } catch (error) {
      console.error(error);

    } finally {
      setDeleting(false);
    }
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem asChild>
          <TaskForm
            refetch={refetch}
            task={task}
            trigger={<span className="flex items-center gap-2">
              <IconPencil />
              Edit
            </span>} />

        </DropdownMenuItem>
        <DropdownMenuItem>
          <CreditCardIcon />
          Billing
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={handelDelete} disabled={deleting}>
          <IconTrash />
          {deleting ? <Spinner /> : "Delete"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
