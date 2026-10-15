import { Profile } from "@/types";
import { db } from "@/lib/data/store";

export const DEMO_ACCOUNTS: { role: string; email: string; name: string; id: string }[] = [
  {
    role: "STUDENT",
    email: "student@nite.edu.in",
    name: "Aarav Sharma (Student)",
    id: "user-student-1",
  },
  {
    role: "STAFF",
    email: "staff@nite.edu.in",
    name: "Dr. Ramesh Kumar (Academic Staff)",
    id: "user-staff-1",
  },
  {
    role: "DEPARTMENT_HEAD",
    email: "head@nite.edu.in",
    name: "Prof. Meenakshi Sundaram (Head of Academic Affairs)",
    id: "user-head-1",
  },
  {
    role: "ADMIN",
    email: "admin@nite.edu.in",
    name: "System Administrator",
    id: "user-admin-1",
  },
];

export function getSessionUser(userId?: string | null): Profile {
  if (userId) {
    const found = db.getProfileById(userId);
    if (found) return found;
  }
  // Default to student
  return db.getProfileById("user-student-1")!;
}
