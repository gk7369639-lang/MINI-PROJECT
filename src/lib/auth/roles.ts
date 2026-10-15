import { UserRole } from "@/types";

export interface RolePermissions {
  canSubmitQuery: boolean;
  canViewAllTickets: boolean;
  canViewDepartmentTickets: boolean;
  canProcessAssignedTickets: boolean;
  canApproveRequests: boolean;
  canManageUsers: boolean;
  canManageDepartments: boolean;
  canViewAuditLogs: boolean;
  canAddInternalNotes: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  STUDENT: {
    canSubmitQuery: true,
    canViewAllTickets: false,
    canViewDepartmentTickets: false,
    canProcessAssignedTickets: false,
    canApproveRequests: false,
    canManageUsers: false,
    canManageDepartments: false,
    canViewAuditLogs: false,
    canAddInternalNotes: false,
  },
  STAFF: {
    canSubmitQuery: false,
    canViewAllTickets: false,
    canViewDepartmentTickets: true,
    canProcessAssignedTickets: true,
    canApproveRequests: false,
    canManageUsers: false,
    canManageDepartments: false,
    canViewAuditLogs: false,
    canAddInternalNotes: true,
  },
  DEPARTMENT_HEAD: {
    canSubmitQuery: false,
    canViewAllTickets: false,
    canViewDepartmentTickets: true,
    canProcessAssignedTickets: true,
    canApproveRequests: true,
    canManageUsers: false,
    canManageDepartments: false,
    canViewAuditLogs: false,
    canAddInternalNotes: true,
  },
  ADMIN: {
    canSubmitQuery: true,
    canViewAllTickets: true,
    canViewDepartmentTickets: true,
    canProcessAssignedTickets: true,
    canApproveRequests: true,
    canManageUsers: true,
    canManageDepartments: true,
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
    case "STAFF":
      return "/staff";
    case "DEPARTMENT_HEAD":
      return "/department-head";
    case "ADMIN":
      return "/admin";
    default:
      return "/";
  }
}
