import { z } from "zod";

export const CreateTicketSchema = z.object({
  subject: z
    .string()
    .min(5, "Subject must be at least 5 characters long.")
    .max(150, "Subject cannot exceed 150 characters."),
  description: z
    .string()
    .min(20, "Please provide a detailed description (at least 20 characters).")
    .max(3000, "Description cannot exceed 3000 characters."),
  category_id: z.string().optional(),
  department_id: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
});

export const TicketMessageSchema = z.object({
  content: z
    .string()
    .min(2, "Message cannot be empty.")
    .max(2000, "Message cannot exceed 2000 characters."),
});

export const InternalNoteSchema = z.object({
  content: z
    .string()
    .min(3, "Internal note must be at least 3 characters.")
    .max(2000, "Internal note cannot exceed 2000 characters."),
});

export const ApprovalDecisionSchema = z.object({
  decision: z.enum(["APPROVED", "REJECTED"]),
  comment: z
    .string()
    .min(5, "Please provide a decision rationale (at least 5 characters).")
    .max(1000, "Comment cannot exceed 1000 characters."),
});

export const FeedbackSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

export const StatusUpdateSchema = z.object({
  status: z.enum([
    "SUBMITTED",
    "TRIAGED",
    "ASSIGNED",
    "IN_PROGRESS",
    "WAITING_FOR_STUDENT",
    "WAITING_FOR_APPROVAL",
    "RESOLVED",
    "CLOSED",
    "REJECTED",
    "REOPENED",
    "ESCALATED",
  ]),
  reason: z
    .string()
    .min(3, "Please provide a reason for the status change (minimum 3 characters).")
    .max(500),
});
