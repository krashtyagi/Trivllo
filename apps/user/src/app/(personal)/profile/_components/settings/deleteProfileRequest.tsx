"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
    DialogHeader,
    DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Assuming you have a Textarea component
import { DeleteRequest } from "@/services/personal/profile.service";

const CONFIRMATION_TEXT = "DELETEMYPROFILE";

export function DeleteAccountRequestDialog({
    tag: tg,
    variant = "destructive",
    className,
    setOpen,
    open
}: {
    className?: string;
    tag: string;
    variant?: "link" | "default" | "destructive" | "outline" | "secondary" | "ghost";
    open: boolean;
    setOpen: (open: boolean) => void;
}) {
    const [inputValue, setInputValue] = useState("");
    const [reason, setReason] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const handleDeleteAccountRequest = async () => {
        if (inputValue !== CONFIRMATION_TEXT) return;

        setIsLoading(true);
        try {
            const res = await DeleteRequest({ reason });
            if (res?.success) {
                toast.success(res?.message);
            } else {
                toast.error(res?.message);
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        } finally {
            setIsLoading(false);
            setOpen(false);
            setReason("");
            setInputValue("");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant={variant} className={cn("flex justify-start", className)}>
                    {tg}
                </Button>
            </DialogTrigger>
            <DialogContent className="md:w-[500px] p-6 rounded-2xl w-[340px]">
                <DialogHeader>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. Please tell us why you are leaving and type &quot;<strong>{CONFIRMATION_TEXT}</strong>&quot; to confirm.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    {/* Reason Input */}
                    <Textarea
                        placeholder="Please tell us why you want to delete your account (optional)"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="resize-none"
                    />

                    {/* Confirmation Input */}
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={`Type "${CONFIRMATION_TEXT}" to confirm`}
                        className="uppercase"
                    />
                </div>

                <Button
                    variant="destructive"
                    className="w-full"
                    disabled={inputValue !== CONFIRMATION_TEXT || isLoading}
                    onClick={handleDeleteAccountRequest}
                >
                    {isLoading ? "Processing..." : "Confirm Delete"}
                </Button>
            </DialogContent>
        </Dialog>
    );
}