import { connectDB, Support } from "@repo/database";
import mongoose from "mongoose";

export const createTicket = async (data: any, userId: any) => {
  await connectDB();
  const { name, email, phoneNumber, subject, description, bookingReference } =
    data;

  if (!name || !email || !subject || !description) {
    throw new Error("Required fields are missing");
  }

  const ticket = await Support.create({
    userId: new mongoose.Types.ObjectId(userId),
    name,
    email,
    phoneNumber,
    subject,
    description,
    bookingReference,
    messages: [
      {
        sender: "user",
        message: description,
      },
    ],
  });

  return ticket;
};

export const getMyTickets = async (userId: any, query: any = {}) => {
  await connectDB();
  const { page = 1, limit = 10, status } = query;

  const skip = (Number(page) - 1) * Number(limit);

  const filter: any = {
    userId: new mongoose.Types.ObjectId(userId),
  };

  if (status && status !== "all") {
    filter.status = status;
  }

  const tickets = await Support.find(filter)
    .select("subject status createdAt lastMessageAt bookingReference")
    .sort({ lastMessageAt: -1, createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .lean();

  const total = await Support.countDocuments(filter);

  return {
    tickets,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
    },
  };
};

export const getTicketDetail = async (ticketId: any, userId: any) => {
  await connectDB();
  const ticket: any = await Support.findOne({
    _id: ticketId,
    userId: new mongoose.Types.ObjectId(userId),
  }).lean();

  if (!ticket) {
    throw new Error("Ticket not found");
  }

  return {
    _id: ticket._id,
    subject: ticket.subject,
    status: ticket.status,
    bookingReference: ticket.bookingReference,
    createdAt: ticket.createdAt,
    lastMessageAt: ticket.lastMessageAt,
    messages:
      ticket.messages?.map((msg: any) => ({
        sender: msg.sender,
        message: msg.message,
        createdAt: msg.createdAt,
      })) || [],
  };
};

export const replyToTicket = async (
  ticketId: any,
  userId: any,
  message: string
) => {
  await connectDB();
  if (!message || !message.trim()) {
    throw new Error("Message is required");
  }

  const ticket = await Support.findOne({
    _id: ticketId,
    userId: new mongoose.Types.ObjectId(userId),
  });

  if (!ticket) {
    throw new Error("Ticket not found");
  }

  if (ticket.status === "closed") {
    throw new Error("Ticket is closed");
  }

  ticket.messages.push({
    sender: "user",
    message,
    createdAt: new Date(),
  } as any);

  ticket.lastMessageAt = new Date();

  if (ticket.status === "resolved") {
    ticket.status = "in_progress";
  }

  await ticket.save();

  return ticket;
};

