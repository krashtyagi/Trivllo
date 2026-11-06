"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { useCurrentUser } from "@/services/hotel/querys";
import {
  getMyTickets,
  createTicket,
  getTicketDetail,
  replyToTicket,
  Ticket,
  TicketMessage
} from "@/services/personal/support.service";
import {
  Search,
  Plus,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Send,
  RefreshCw,
  User,
  Mail,
  Phone,
  Bookmark,
  ChevronRight,
  ShieldAlert,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";

type StatusType = "all" | "open" | "in_progress" | "resolved" | "closed";

const Support = () => {
  const { t } = useTranslation();
  const { data: currUser } = useCurrentUser();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [statusFilter, setStatusFilter] = useState<StatusType>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  const [formSubject, setFormSubject] = useState("");
  const [formBookingRef, setFormBookingRef] = useState("");
  const [formDescription, setFormDescription] = useState("");

  const chatEndRef = useRef<HTMLDivElement>(null);

  const fetchTicketsList = async (showLoader = true) => {
    if (showLoader) setLoadingList(true);
    const filterStatus = statusFilter === "all" ? undefined : statusFilter;
    const response = await getMyTickets({ status: filterStatus });
    if (response) {
      setTickets(response.tickets);
    }
    if (showLoader) setLoadingList(false);
  };

  useEffect(() => {
    fetchTicketsList();
  }, [statusFilter]);

  const fetchTicketDetails = async (ticketId: string) => {
    setLoadingDetail(true);
    const details = await getTicketDetail(ticketId);
    if (details) {
      setSelectedTicket(details);
    }
    setLoadingDetail(false);
  };

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedTicket?.messages, loadingDetail]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim() || sendingReply) return;

    setSendingReply(true);
    const updated = await replyToTicket(selectedTicket._id, replyText.trim());
    if (updated) {
      await fetchTicketDetails(selectedTicket._id);
      setReplyText("");
      fetchTicketsList(false);
    }
    setSendingReply(false);
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSubject.trim() || !formDescription.trim()) {
      toast.error("Subject and Description are required");
      return;
    }

    setSubmittingTicket(true);
    const newTicket = await createTicket({
      name: `${currUser?.data?.firstName || ""} ${currUser?.data?.lastName || ""}`.trim() || "User",
      email: currUser?.data?.email || "",
      phoneNumber: currUser?.data?.phoneNumber || "",
      subject: formSubject.trim(),
      description: formDescription.trim(),
      bookingReference: formBookingRef.trim() || undefined
    });

    if (newTicket) {
      setFormSubject("");
      setFormBookingRef("");
      setFormDescription("");
      setIsCreateModalOpen(false);
      await fetchTicketsList(true);
      await fetchTicketDetails(newTicket._id);
    }
    setSubmittingTicket(false);
  };

  const filteredTickets = tickets.filter(ticket =>
    ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.bookingReference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket._id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: Ticket["status"]) => {
    const styles = {
      open: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50",
      in_progress: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50",
      resolved: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50",
      closed: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800/50 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800"
    };

    const icons = {
      open: <AlertCircle className="w-3.5 h-3.5 mr-1" />,
      in_progress: <Clock className="w-3.5 h-3.5 mr-1" />,
      resolved: <CheckCircle2 className="w-3.5 h-3.5 mr-1" />,
      closed: <ShieldAlert className="w-3.5 h-3.5 mr-1" />
    };

    const label = {
      open: "Open",
      in_progress: "In Progress",
      resolved: "Resolved",
      closed: "Closed"
    };

    return (
      <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize", styles[status])}>
        {icons[status]}
        {label[status]}
      </span>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-h-[850px] bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden animate-in fade-in duration-300">

      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-6 py-4 bg-zinc-50/50 dark:bg-zinc-900/20">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-500" />
            Support Center
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Need help with a booking? Create a ticket and track its status below.
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-primary hover:bg-indigo-500 text-white shadow-sm flex items-center gap-1.5 h-9 rounded-lg text-xs md:text-sm"
        >
          <Plus className="w-4 h-4" />
          New Ticket
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden relative">

        <div className={cn(
          "w-full md:w-[380px] lg:w-[420px] flex flex-col border-r border-zinc-200 dark:border-zinc-800 h-full bg-white dark:bg-zinc-950 z-10 transition-all",
          selectedTicket ? "hidden md:flex" : "flex"
        )}>
          <div className="p-4 space-y-3 border-b border-zinc-100 dark:border-zinc-850">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Search tickets by subject, booking ref..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus-visible:ring-indigo-500"
              />
            </div>

            <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
              {(["all", "open", "in_progress", "resolved", "closed"] as StatusType[]).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={cn(
                    "px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors border",
                    statusFilter === status
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-transparent"
                      : "bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-800"
                  )}
                >
                  {status === "all" ? "All Tickets" : status.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-900">
            {loadingList ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-2 text-zinc-400">
                <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
                <span className="text-xs">Loading your tickets...</span>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <MessageSquare className="w-10 h-10 text-zinc-350 dark:text-zinc-700 mb-3" />
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-200">No tickets found</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-[280px]">
                  {searchQuery
                    ? "Try adjusting your search filters or queries."
                    : "Create your first support ticket to communicate with our representatives."}
                </p>
                {!searchQuery && (
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="mt-4 border-zinc-200 dark:border-zinc-800 text-xs"
                  >
                    Create Ticket
                  </Button>
                )}
              </div>
            ) : (
              filteredTickets.map((ticket) => {
                const isActive = selectedTicket?._id === ticket._id;
                return (
                  <div
                    key={ticket._id}
                    onClick={() => fetchTicketDetails(ticket._id)}
                    className={cn(
                      "p-4 cursor-pointer hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-all border-l-2",
                      isActive
                        ? "border-l-indigo-600 bg-indigo-50/10 dark:bg-indigo-950/10"
                        : "border-l-transparent"
                    )}
                  >
                    <div className="flex justify-between items-start gap-2 mb-1.5">
                      <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate flex-1">
                        {ticket.subject}
                      </h4>
                      <span className="text-[10px] text-zinc-400 whitespace-nowrap">
                        {new Date(ticket.lastMessageAt || ticket.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center mt-3 gap-2">
                      <div className="flex items-center text-[11px] text-zinc-500 dark:text-zinc-450">
                        {ticket.bookingReference ? (
                          <span className="flex items-center bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded text-zinc-600 dark:text-zinc-400 font-mono">
                            <Bookmark className="w-3 h-3 mr-0.5 text-zinc-400" />
                            {ticket.bookingReference}
                          </span>
                        ) : (
                          <span className="text-zinc-400 italic">General Inquiry</span>
                        )}
                      </div>
                      {getStatusBadge(ticket.status)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className={cn(
          "flex-1 flex flex-col h-full bg-zinc-50/30 dark:bg-zinc-950/20",
          selectedTicket ? "flex" : "hidden md:flex items-center justify-center p-8 text-center"
        )}>
          {selectedTicket ? (
            <div className="flex-1 flex flex-col h-full overflow-hidden">

              <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-6 py-4 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedTicket(null)}
                    className="md:hidden p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg text-zinc-500 dark:text-zinc-400"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 text-sm md:text-base">
                        {selectedTicket.subject}
                      </h3>
                      {getStatusBadge(selectedTicket.status)}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
                      <span>ID: #{selectedTicket._id.slice(-8).toUpperCase()}</span>
                      {selectedTicket.bookingReference && (
                        <span className="flex items-center text-zinc-500 dark:text-zinc-400">
                          <Bookmark className="w-3.5 h-3.5 mr-0.5 text-zinc-400" />
                          Ref: {selectedTicket.bookingReference}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => fetchTicketDetails(selectedTicket._id)}
                  disabled={loadingDetail}
                  className="rounded-lg h-9 w-9 text-zinc-500 dark:text-zinc-450 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                >
                  <RefreshCw className={cn("w-4 h-4", loadingDetail && "animate-spin")} />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {loadingDetail && selectedTicket.messages?.length === 0 ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
                  </div>
                ) : (
                  selectedTicket.messages?.map((msg, idx) => {
                    const isAdmin = msg.sender === "admin";
                    return (
                      <div
                        ref={chatEndRef}
                        key={idx}
                        className={cn(
                          "flex w-full flex-col max-w-[80%]",
                          isAdmin ? "mr-auto items-start" : "ml-auto items-end"
                        )}
                      >
                        <div
                          className={cn(
                            "rounded-2xl px-4 py-2.5 text-sm shadow-xs",
                            isAdmin
                              ? "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-tl-none"
                              : "bg-primary text-white rounded-tr-none"
                          )}
                        >
                          {msg.message}
                        </div>
                        <span className="text-[10px] text-zinc-400 mt-1.5 px-1">
                          {isAdmin ? "Support Representative" : "You"} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })
                )}
                {/* <div  /> */}
              </div>

              <div className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4">
                {selectedTicket.status === "closed" ? (
                  <div className="bg-zinc-55 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5 flex items-center gap-3 text-zinc-500 dark:text-zinc-400 text-xs">
                    <ShieldAlert className="w-5 h-5 text-zinc-400 flex-shrink-0" />
                    <span>This ticket has been resolved and closed. If you require additional support, please open a new ticket.</span>
                  </div>
                ) : (
                  <form onSubmit={handleSendReply} className="flex gap-2">
                    <Textarea
                      placeholder="Write your response here..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="resize-none min-h-[44px] h-[44px] max-h-[80px] bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus-visible:ring-indigo-500 focus-visible:ring-1 py-3 px-4"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendReply(e);
                        }
                      }}
                    />
                    <Button
                      type="submit"
                      disabled={!replyText.trim() || sendingReply}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl h-11 px-4 shadow-sm flex items-center justify-center self-end"
                    >
                      {sendingReply ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </form>
                )}
              </div>

            </div>
          ) : (
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-zinc-200 dark:border-zinc-800">
                <MessageSquare className="w-8 h-8 text-indigo-500" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Select a support ticket</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-[320px] mx-auto">
                View your active conversations, review previous replies, or open a new query with our team.
              </p>
              <Button
                variant="outline"
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-6 border-zinc-200 dark:border-zinc-850"
              >
                Create a Ticket
              </Button>
            </div>
          )}
        </div>

      </div>

      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden z-10 flex flex-col"
            >
              <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/30">
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-55">
                  Create Support Ticket
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Complete the fields below to submit a new inquiry to our agent dashboard.
                </p>
              </div>

              <form onSubmit={handleCreateTicket} className="p-6 space-y-4">

                <div className="grid grid-cols-2 gap-3 text-xs p-3 bg-zinc-50 dark:bg-zinc-900/40 rounded-xl border border-zinc-200/50 dark:border-zinc-800/55">
                  <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 truncate">
                    <User className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="truncate">{`${currUser?.data?.firstName || ""} ${currUser?.data?.lastName || ""}`.trim() || "User"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 truncate">
                    <Mail className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="truncate">{currUser?.data?.email || "No email"}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <Input
                    required
                    placeholder="e.g. Flight cancellation inquiry, Payment failure"
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    className="bg-zinc-50/30 dark:bg-zinc-900/10 border-zinc-200 dark:border-zinc-800 rounded-lg text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Booking Reference <span className="text-zinc-400 font-normal">(Optional)</span>
                  </label>
                  <Input
                    placeholder="e.g. BK-98721A"
                    value={formBookingRef}
                    onChange={(e) => setFormBookingRef(e.target.value)}
                    className="bg-zinc-50/30 dark:bg-zinc-900/10 border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    required
                    rows={4}
                    placeholder="Describe your issue or query in detail so our support agents can assist you efficiently..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="bg-zinc-50/30 dark:bg-zinc-900/10 border-zinc-200 dark:border-zinc-800 rounded-lg text-sm resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="border-zinc-200 dark:border-zinc-800 text-xs rounded-lg"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submittingTicket}
                    className="bg-primary hover:bg-indigo-500 text-white rounded-lg text-xs"
                  >
                    {submittingTicket ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Ticket"
                    )}
                  </Button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Support;