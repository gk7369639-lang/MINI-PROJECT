import { TicketStatus, UserRole } from "@/types";

export interface TransitionValidationResult {
  allowed: boolean;
  error?: string;
  requiresReason?: boolean;
}

// Map of allowed status transitions
export const ALLOWED_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  SUBMITTED: ["TRIAGED", "ASSIGNED", "REJECTED"],
  TRIAGED: ["ASSIGNED", "REJECTED"],
  ASSIGNED: ["IN_PROGRESS", "ESCALATED", "REJECTED"],
  IN_PROGRESS: ["WAITING_FOR_STUDENT", "WAITING_FOR_APPROVAL", "RESOLVED", "ESCALATED"],
  WAITING_FOR_STUDENT: ["IN_PROGRESS", "RESOLVED", "CLOSED"],
  WAITING_FOR_APPROVAL: ["IN_PROGRESS", "RESOLVED", "REJECTED"],
  RESOLVED: ["CLOSED", "REOPENED"],
  REOPENED: ["ASSIGNED", "IN_PROGRESS", "ESCALATED"],
  ESCALATED: ["IN_PROGRESS", "WAITING_FOR_APPROVAL", "RESOLVED"],
  CLOSED: ["REOPENED"], // Admin only for reopen
  REJECTED: ["TRIAGED"], // Admin only for reopen
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

  // Role-based constraints
  if (userRole === "STUDENT") {
    if (!isTicketOwner) {
      return { allowed: false, error: "Students cannot modify tickets they do not own." };
    }
    // Student can only confirm closure or reopen a resolved ticket, or reply to a waiting ticket
    if (currentStatus === "RESOLVED" && nextStatus === "CLOSED") {
      return { allowed: true };
    }
    if (currentStatus === "RESOLVED" && nextStatus === "REOPENED") {
      return { allowed: true, requiresReason: true };
    }
    if (currentStatus === "WAITING_FOR_STUDENT" && nextStatus === "IN_PROGRESS") {
      return { allowed: true };
    }
    return {
      allowed: false,
      error: `Students are not authorized to transition tickets to ${nextStatus}.`,
    };
  }

  if (userRole === "STAFF") {
    // Staff cannot unilaterally approve an approval-required ticket
    if (currentStatus === "WAITING_FOR_APPROVAL" && nextStatus === "RESOLVED") {
      return {
        allowed: false,
        error: "Tickets waiting for approval require Department Head authorization.",
      };
    }
    // Staff cannot reopen a closed ticket without Head/Admin
    if (currentStatus === "CLOSED" || currentStatus === "REJECTED") {
      return {
        allowed: false,
        error: "Closed or rejected tickets can only be reopened by a Department Head or Administrator.",
      };
    }
    return { allowed: true };
  }

  if (userRole === "DEPARTMENT_HEAD") {
    return { allowed: true };
  }

  if (userRole === "ADMIN") {
    return { allowed: true };
  }

  return { allowed: false, error: "Unauthorized role for state transition." };
}
