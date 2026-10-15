import { UserRole } from "@/types";

export interface RolePermissions {
  canSubmitQuery: boolean;
  canViewAllTickets: boolean;
  canViewDepartmentTickets: boolean;
  canReviewAndAssign: boolean;
  canExecuteWorkerTasks: boolean;
  canApproveRequests: boolean;
  canManageUsers: boolean;
  canManageDepartments: boolean;
  canManageQRCodes: boolean;
  canViewAuditLogs: boolean;
  canAddInternalNotes: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  STUDENT: {
    canSubmitQuery: true,
    canViewAllTickets: false,
    canViewDepartmentTickets: false,
    canReviewAndAssign: false,
    canExecuteWorkerTasks: false,
    canApproveRequests: false,
    canManageUsers: false,
    canManageDepartments: false,
    canManageQRCodes: false,
    canViewAuditLogs: false,
    canAddInternalNotes: false,
  },
  FACULTY: {
    canSubmitQuery: false,
    canViewAllTickets: false,
    canViewDepartmentTickets: true,
    canReviewAndAssign: true,
    canExecuteWorkerTasks: false,
    canApproveRequests: true,
    canManageUsers: false,
    canManageDepartments: false,
    canManageQRCodes: true,
    canViewAuditLogs: false,
    canAddInternalNotes: true,
  },
  WORKER: {
    canSubmitQuery: false,
    canViewAllTickets: false,
    canViewDepartmentTickets: false,
    canReviewAndAssign: false,
    canExecuteWorkerTasks: true,
    canApproveRequests: false,
    canManageUsers: false,
    canManageDepartments: false,
    canManageQRCodes: false,
    canViewAuditLogs: false,
    canAddInternalNotes: true,
  },
  QUERY_SYSTEM_ADMIN: {
    canSubmitQuery: true,
    canViewAllTickets: true,
    canViewDepartmentTickets: true,
    canReviewAndAssign: true,
    canExecuteWorkerTasks: true,
    canApproveRequests: true,
    canManageUsers: true,
    canManageDepartments: true,
    canManageQRCodes: true,
    canViewAuditLogs: true,
    canAddInternalNotes: true,
  },
  STAFF: {
    canSubmitQuery: false,
    canViewAllTickets: false,
    canViewDepartmentTickets: true,
    canReviewAndAssign: true,
    canExecuteWorkerTasks: false,
    canApproveRequests: false,
    canManageUsers: false,
    canManageDepartments: false,
    canManageQRCodes: true,
    canViewAuditLogs: false,
    canAddInternalNotes: true,
  },
  DEPARTMENT_HEAD: {
    canSubmitQuery: false,
    canViewAllTickets: false,
    canViewDepartmentTickets: true,
    canReviewAndAssign: true,
    canExecuteWorkerTasks: false,
    canApproveRequests: true,
    canManageUsers: false,
    canManageDepartments: false,
    canManageQRCodes: true,
    canViewAuditLogs: false,
    canAddInternalNotes: true,
  },
  ADMIN: {
    canSubmitQuery: true,
    canViewAllTickets: true,
    canViewDepartmentTickets: true,
    canReviewAndAssign: true,
    canExecuteWorkerTasks: true,
    canApproveRequests: true,
    canManageUsers: true,
    canManageDepartments: true,
    canManageQRCodes: true,
    canViewAuditLogs: true,
    canAddInternalNotes: true,
  },
};

export function hasPermission(role: UserRole, permission: keyof RolePermissions): boolean {
  return Boolean(ROLE_PERMISSIONS[role]?.[permission]);
}

export function getDefaultRedirectForRole(role: UserRole): string {
  switch (role) {
    case "STUDENT":
      return "/student";
    case "FACULTY":
      return "/faculty";
    case "WORKER":
      return "/worker";
    case "QUERY_SYSTEM_ADMIN":
    case "ADMIN":
      return "/admin";
    case "STAFF":
      return "/staff";
    case "DEPARTMENT_HEAD":
      return "/department-head";
    default:
      return "/";
  }
}
