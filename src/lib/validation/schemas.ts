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
  location_building: z.string().optional(),
  location_room: z.string().optional(),
  image_url: z.string().optional(),
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
    "UNDER_FACULTY_REVIEW",
    "WAITING_FOR_CLARIFICATION",
    "READY_FOR_ASSIGNMENT",
    "ASSIGNED_TO_WORKER",
    "WORKER_ACCEPTED",
    "IN_PROGRESS",
    "WAITING_FOR_PARTS_OR_RESOURCES",
    "NOT_RESOLVED",
    "REQUIRES_REASSIGNMENT",
    "RESOLVED",
    "CLOSED",
    "REOPENED",
    "ESCALATED",
    "TRIAGED",
    "ASSIGNED",
    "WAITING_FOR_STUDENT",
    "WAITING_FOR_APPROVAL",
    "REJECTED",
  ]),
  reason: z
    .string()
    .min(3, "Please provide a reason for the status change (minimum 3 characters).")
    .max(500),
});

export const WorkerActionSchema = z.object({
  action: z.enum(["ACCEPT", "START", "UPDATE_PROGRESS", "RESOLVE", "NOT_RESOLVED"]),
  note: z.string().optional(),
  parts_required: z.string().optional(),
  resolution_summary: z.string().optional(),
  reason: z.string().optional(),
});

export const FacultyReviewSchema = z.object({
  action: z.enum(["START_REVIEW", "ASSIGN_WORKER", "REQUEST_CLARIFICATION"]),
  worker_id: z.string().optional(),
  department_id: z.string().optional(),
  category_id: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  deadline_hours: z.number().int().min(1).max(720).optional(),
  faculty_note: z.string().optional(),
  student_message: z.string().optional(),
});
