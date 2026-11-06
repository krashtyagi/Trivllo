'use client';

import { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Props = {
  children: React.ReactNode;
  content?: React.ReactNode;
  renderContent?: (isOpen: boolean) => React.ReactNode;
  tagline?: string;
  type?: "filter" | "home";
};

// components/filter-bar/HotelFilterBar.tsx

const HotelFilterBar = ({ children, content, renderContent, tagline }: Props) => {
  const [open, setOpen] = useState(false);

  // Sync browser history with dialog open/close
  useEffect(() => {
    if (!open) return;

    // Push a history entry so the browser back button can close the dialog
    window.history.pushState({ mapDialog: true }, "");

    const handlePopState = () => {
      setOpen(false);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [open]);

  // When closing via UI (X button, overlay click), pop the dummy history entry
  const handleOpenChange = useCallback((nextOpen: boolean) => {
    if (!nextOpen && window.history.state?.mapDialog) {
      window.history.back();
    } else {
      setOpen(nextOpen);
    }
  }, []);

  const dialogContent = renderContent ? renderContent(open) : content;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {/* 1. Added asChild so the Trigger doesn't act like a button */}
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      {/* max-w-none, h-[100dvh], rounded-none, border-none overrides the default dialog box styling */}
      <DialogContent className="w-screen max-w-none h-[100dvh] flex flex-col p-0 m-0 z-[1000] border-none sm:rounded-none overflow-hidden" >
        <DialogHeader className="hidden">
          <DialogTitle>
          </DialogTitle>
        </DialogHeader>

        {dialogContent || <div className="text-center">No content available</div>}
      </DialogContent>
    </Dialog>
  );
};

export default HotelFilterBar;
