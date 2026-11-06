"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  Send,
  XCircle,
  User,
  Clock,
  Mail,
  Phone,
  Hash,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useTicketDetail, useReplyToTicket, useCloseTicket } from "../queryes";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; className: string }> = {
  open: {
    label: "Open",
    className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  in_progress: {
    label: "In Progress",
    className: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  },
  resolved: {
    label: "Resolved",
    className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  },
  closed: {
    label: "Closed",
    className: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
  },
};

const formatDateTime = (iso: string) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

interface TicketDetailProps {
  ticketId: string;
  onBack: () => void;
}

export function TicketDetailView({ ticketId, onBack }: TicketDetailProps) {
  const { data: res, isLoading } = useTicketDetail(ticketId);
  const replyMutation = useReplyToTicket();
  const closeMutation = useCloseTicket();
  const [message, setMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const ticket = res?.data?.data;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket?.messages]);

  const handleReply = async () => {
    if (!message.trim()) return;
    try {
      await replyMutation.mutateAsync({ ticketId, message: message.trim() });
      setMessage("");
      toast.success("Reply sent successfully");
    } catch {
      toast.error("Failed to send reply");
    }
  };

  const handleClose = async () => {
    try {
      await closeMutation.mutateAsync(ticketId);
      toast.success("Ticket closed");
      onBack();
    } catch {
      toast.error("Failed to close ticket");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Ticket not found
      </div>
    );
  }

  const config = statusConfig[ticket.status] || statusConfig.open;
  const isClosed = ticket.status === "closed";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to tickets
        </Button>
        {!isClosed && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/20">
                <XCircle className="h-4 w-4" />
                Close Ticket
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Close this ticket?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will mark the ticket as closed. The user will no longer be able to reply.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClose} className="bg-red-600 hover:bg-red-700">
                  Close Ticket
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chat Area */}
        <div className="lg:col-span-2">
          <Card className="border-border">
            <div className="p-4 border-b border-border bg-muted/20">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">{ticket.subject}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Created {formatDateTime(ticket.createdAt)}
                  </p>
                </div>
                <Badge variant="outline" className={`${config.className} font-medium`}>
                  {config.label}
                </Badge>
              </div>
            </div>

            <CardContent className="p-0">
              {/* Messages */}
              <div className="max-h-[480px] overflow-y-auto p-4 space-y-4">
                {ticket.messages?.map((msg: any, i: number) => {
                  const isAdmin = msg.sender === "admin";
                  return (
                    <div
                      key={i}
                      className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                          isAdmin
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-muted rounded-bl-md"
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {msg.message}
                        </p>
                        <p
                          className={`text-[10px] mt-1.5 ${
                            isAdmin
                              ? "text-primary-foreground/60"
                              : "text-muted-foreground/60"
                          }`}
                        >
                          {msg.sender === "admin" ? "Admin" : "User"} · {formatDateTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Reply Box */}
              {!isClosed && (
                <div className="border-t border-border p-4 bg-muted/10">
                  <div className="flex gap-3">
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your reply..."
                      className="min-h-[80px] resize-none bg-background"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleReply();
                        }
                      }}
                    />
                    <Button
                      onClick={handleReply}
                      disabled={!message.trim() || replyMutation.isPending}
                      className="self-end gap-2"
                    >
                      {replyMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      Send
                    </Button>
                  </div>
                </div>
              )}

              {isClosed && (
                <div className="border-t border-border p-4 bg-muted/10 text-center">
                  <p className="text-sm text-muted-foreground">This ticket has been closed</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-4">
          <Card className="border-border">
            <div className="p-4 border-b border-border bg-muted/20">
              <h4 className="text-sm font-semibold text-foreground">Customer Details</h4>
            </div>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">{ticket.user?.name || "—"}</p>
                  <p className="text-[10px] text-muted-foreground">Customer</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground/70" />
                  <span className="text-muted-foreground text-xs">{ticket.user?.email || "—"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground/70" />
                  <span className="text-muted-foreground text-xs font-mono">{ticket.user?.phoneNumber || "—"}</span>
                </div>
                {ticket.bookingReference && (
                  <div className="flex items-center gap-3 text-sm">
                    <Hash className="h-3.5 w-3.5 text-muted-foreground/70" />
                    <span className="text-muted-foreground text-xs font-mono">{ticket.bookingReference}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <div className="p-4 border-b border-border bg-muted/20">
              <h4 className="text-sm font-semibold text-foreground">Ticket Timeline</h4>
            </div>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <div>
                  <p className="text-xs font-medium">Created</p>
                  <p className="text-[10px] text-muted-foreground">{formatDateTime(ticket.createdAt)}</p>
                </div>
              </div>
              {ticket.messages?.length > 1 && (
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <div>
                    <p className="text-xs font-medium">Last Message</p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatDateTime(ticket.messages[ticket.messages.length - 1]?.createdAt)}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${isClosed ? "bg-zinc-400" : "bg-emerald-500 animate-pulse"}`} />
                <div>
                  <p className="text-xs font-medium">{isClosed ? "Closed" : "Active"}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {ticket.messages?.length || 0} messages total
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
