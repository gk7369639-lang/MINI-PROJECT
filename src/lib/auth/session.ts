import { Profile } from "@/types";
import { db } from "@/lib/data/store";

export function getSessionUser(userId?: string | null): Profile | null {
  if (!userId) return null;
  return db.getProfileById(userId) || null;
}
