"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { userAccessToken } from "@/types/auth";
import { useCurrentUser } from "@/services/hotel/querys";

const NotAuthorise = ({
  children,
  className,
  title,
  description,
}: {
  children: React.ReactNode;
  className?: string;
  title: string;
  description: string;
}) => {
  const { data: user, isLoading } = useCurrentUser();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const accessToken = localStorage.getItem(userAccessToken);
    if (accessToken) {
      setIsAuthorized(true);
    } else if (!isLoading) {
      setIsAuthorized(!!user?.data);
    }
  }, [isLoading, user]);

  if (isAuthorized === null || isLoading) return null;

  if (!isAuthorized) {
    return (
      <div
        className={cn(
          "w-full h-full flex items-center justify-center",
          className,
        )}
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default NotAuthorise;