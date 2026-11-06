"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Loader2 } from "lucide-react";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  serviceName: string;
  isLoading?: boolean;
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  serviceName,
  isLoading = false,
}: DeleteConfirmationModalProps) {
  const [inputValue, setInputValue] = React.useState("");
  const expectedValue = `delete${serviceName}`;

  React.useEffect(() => {
    if (isOpen) {
      setInputValue("");
    }
  }, [isOpen]);

  const isMatched = inputValue === expectedValue;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[440px] border-destructive/20 shadow-2xl">
        <DialogHeader className="space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <DialogTitle className="text-center text-xl font-bold tracking-tight text-foreground">
            Delete Service
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-muted-foreground">
            This action cannot be undone. This will permanently delete the service{" "}
            <span className="font-semibold text-foreground">"{serviceName}"</span> and all associated data.
          </DialogDescription>
        </DialogHeader>

        <div className="my-4 space-y-3">
          <Label htmlFor="confirm-input" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Confirm by typing <span className="font-mono text-destructive select-all lowercase">{expectedValue}</span>:
          </Label>
          <Input
            id="confirm-input"
            type="text"
            placeholder={expectedValue}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="border-muted-foreground/20 focus-visible:ring-destructive font-mono"
            autoComplete="off"
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={!isMatched || isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Service"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
