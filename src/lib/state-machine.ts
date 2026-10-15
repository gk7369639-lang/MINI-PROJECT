import { TicketStatus, UserRole } from "@/types";

export interface TransitionValidationResult {
  allowed: boolean;
  error?: string;
  requiresReason?: boolean;
}

// Map of allowed status transitions for student query & maintenance workflows
export const ALLOWED_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  SUBMITTED: [
    "UNDER_FACULTY_REVIEW",
    "READY_FOR_ASSIGNMENT",
    "ASSIGNED_TO_WORKER",
    "WAITING_FOR_CLARIFICATION",
    "ESCALATED",
    "TRIAGED",
    "ASSIGNED",
    "REJECTED",
  ],
  UNDER_FACULTY_REVIEW: [
    "READY_FOR_ASSIGNMENT",
    "ASSIGNED_TO_WORKER",
    "WAITING_FOR_CLARIFICATION",
    "ESCALATED",
    "NOT_RESOLVED",
    "REQUIRES_REASSIGNMENT",
  ],
  WAITING_FOR_CLARIFICATION: [
    "UNDER_FACULTY_REVIEW",
    "READY_FOR_ASSIGNMENT",
    "ASSIGNED_TO_WORKER",
    "ESCALATED",
  ],
  READY_FOR_ASSIGNMENT: [
    "ASSIGNED_TO_WORKER",
    "UNDER_FACULTY_REVIEW",
    "ESCALATED",
  ],
  ASSIGNED_TO_WORKER: [
    "WORKER_ACCEPTED",
    "IN_PROGRESS",
    "REQUIRES_REASSIGNMENT",
    "UNDER_FACULTY_REVIEW",
    "ESCALATED",
  ],
  WORKER_ACCEPTED: [
    "IN_PROGRESS",
    "WAITING_FOR_PARTS_OR_RESOURCES",
    "NOT_RESOLVED",
    "REQUIRES_REASSIGNMENT",
    "ESCALATED",
  ],
  IN_PROGRESS: [
    "WAITING_FOR_PARTS_OR_RESOURCES",
    "RESOLVED",
    "NOT_RESOLVED",
    "REQUIRES_REASSIGNMENT",
    "WAITING_FOR_STUDENT",
    "WAITING_FOR_APPROVAL",
    "ESCALATED",
  ],
  WAITING_FOR_PARTS_OR_RESOURCES: [
    "IN_PROGRESS",
    "NOT_RESOLVED",
    "REQUIRES_REASSIGNMENT",
    "ESCALATED",
  ],
  NOT_RESOLVED: [
    "REQUIRES_REASSIGNMENT",
    "UNDER_FACULTY_REVIEW",
    "ASSIGNED_TO_WORKER",
    "ESCALATED",
  ],
  REQUIRES_REASSIGNMENT: [
    "ASSIGNED_TO_WORKER",
    "UNDER_FACULTY_REVIEW",
    "READY_FOR_ASSIGNMENT",
    "ESCALATED",
  ],
  RESOLVED: [
    "CLOSED",
    "REOPENED",
  ],
  CLOSED: [
    "REOPENED",
  ],
  REOPENED: [
    "UNDER_FACULTY_REVIEW",
    "ASSIGNED_TO_WORKER",
    "IN_PROGRESS",
    "ESCALATED",
  ],
  ESCALATED: [
    "UNDER_FACULTY_REVIEW",
    "ASSIGNED_TO_WORKER",
    "IN_PROGRESS",
    "RESOLVED",
  ],
  // Legacy aliases
  TRIAGED: ["ASSIGNED", "ASSIGNED_TO_WORKER", "REJECTED"],
  ASSIGNED: ["IN_PROGRESS", "WORKER_ACCEPTED", "ESCALATED", "REJECTED"],
  WAITING_FOR_STUDENT: ["IN_PROGRESS", "UNDER_FACULTY_REVIEW", "RESOLVED", "CLOSED"],
  WAITING_FOR_APPROVAL: ["IN_PROGRESS", "RESOLVED", "REJECTED"],
  REJECTED: ["UNDER_FACULTY_REVIEW", "TRIAGED"],
};

/**
 * Validates whether a user with a given role can transition a ticket from currentStatus to nextStatus.
 */
export function validateStateTransition(
  currentStatus: TicketStatus,
  nextStatus: TicketStatus,
  userRole: UserRole,
  isTicketOwner: boolean = false
): TransitionValidationResult {
  if (currentStatus === nextStatus) {
    return { allowed: false, error: "Ticket is already in this status." };
  }

  const allowedNext = ALLOWED_TRANSITIONS[currentStatus];
  if (!allowedNext || !allowedNext.includes(nextStatus)) {
    return {
      allowed: false,
      error: `Invalid transition from ${currentStatus} to ${nextStatus}.`,
    };
  }

  // Role: STUDENT
  if (userRole === "STUDENT") {
    if (!isTicketOwner) {
      return { allowed: false, error: "Students cannot modify tickets they do not own." };
    }
    if (currentStatus === "RESOLVED" && nextStatus === "CLOSED") {
      return { allowed: true };
    }
    if (currentStatus === "RESOLVED" && nextStatus === "REOPENED") {
      return { allowed: true, requiresReason: true };
    }
    if (
      (currentStatus === "WAITING_FOR_CLARIFICATION" || currentStatus === "WAITING_FOR_STUDENT") &&
      (nextStatus === "UNDER_FACULTY_REVIEW" || nextStatus === "IN_PROGRESS")
    ) {
      return { allowed: true };
    }
    return {
      allowed: false,
      error: `Students are not authorized to transition tickets to ${nextStatus}.`,
    };
  }

  // Role: WORKER
  if (userRole === "WORKER") {
    // Workers can accept, start, request parts, resolve, or mark not resolved
    if (
      (currentStatus === "ASSIGNED_TO_WORKER" || currentStatus === "ASSIGNED") &&
      nextStatus === "WORKER_ACCEPTED"
    ) {
      return { allowed: true };
    }
    if (
      (currentStatus === "WORKER_ACCEPTED" || currentStatus === "ASSIGNED_TO_WORKER") &&
      nextStatus === "IN_PROGRESS"
    ) {
      return { allowed: true };
    }
    if (
      (currentStatus === "IN_PROGRESS" || currentStatus === "WORKER_ACCEPTED") &&
      nextStatus === "WAITING_FOR_PARTS_OR_RESOURCES"
    ) {
      return { allowed: true, requiresReason: true };
    }
    if (
      currentStatus === "WAITING_FOR_PARTS_OR_RESOURCES" &&
      nextStatus === "IN_PROGRESS"
    ) {
      return { allowed: true };
    }
    if (currentStatus === "IN_PROGRESS" && nextStatus === "RESOLVED") {
      return { allowed: true, requiresReason: true };
    }
    if (
      (currentStatus === "IN_PROGRESS" || currentStatus === "WORKER_ACCEPTED" || currentStatus === "WAITING_FOR_PARTS_OR_RESOURCES") &&
      (nextStatus === "NOT_RESOLVED" || nextStatus === "REQUIRES_REASSIGNMENT")
    ) {
      return { allowed: true, requiresReason: true };
    }
    return {
      allowed: false,
      error: `Workers cannot transition a ticket from ${currentStatus} to ${nextStatus}.`,
    };
  }

  // Role: FACULTY / STAFF
  if (userRole === "FACULTY" || userRole === "STAFF") {
    // Faculty can review and assign, request clarification, or reassign
    if (
      (currentStatus === "SUBMITTED" || currentStatus === "REQUIRES_REASSIGNMENT" || currentStatus === "NOT_RESOLVED" || currentStatus === "REOPENED") &&
      (nextStatus === "UNDER_FACULTY_REVIEW" || nextStatus === "ASSIGNED_TO_WORKER" || nextStatus === "READY_FOR_ASSIGNMENT")
    ) {
      return { allowed: true };
    }
    if (
      currentStatus === "UNDER_FACULTY_REVIEW" &&
      (nextStatus === "READY_FOR_ASSIGNMENT" || nextStatus === "ASSIGNED_TO_WORKER" || nextStatus === "WAITING_FOR_CLARIFICATION")
    ) {
      return { allowed: true };
    }
    if (currentStatus === "WAITING_FOR_CLARIFICATION" && (nextStatus === "UNDER_FACULTY_REVIEW" || nextStatus === "ASSIGNED_TO_WORKER")) {
      return { allowed: true };
    }
    // Faculty cannot unilaterally close or reopen without policy
    if (currentStatus === "CLOSED") {
      return { allowed: false, error: "Only Query System Administrator can reopen a closed ticket." };
    }
    return { allowed: true };
  }

  // Role: QUERY_SYSTEM_ADMIN / ADMIN / DEPARTMENT_HEAD
  if (userRole === "QUERY_SYSTEM_ADMIN" || userRole === "ADMIN" || userRole === "DEPARTMENT_HEAD") {
    return { allowed: true };
  }

  return { allowed: false, error: "Unauthorized role for state transition." };
}
