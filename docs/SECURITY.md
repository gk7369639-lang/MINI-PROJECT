# Security Architecture & Threat Mitigation
## Student Query Resolution Platform (SQRP)

---

## 1. Security Architecture Principles

SQRP incorporates Defense-in-Depth, ensuring that client-side controls are always backed by server-side verification and database Row Level Security.

### Core Security Tenets
1. **Never Trust Client Input**: All route handlers validate request bodies against strict Zod schemas before processing.
2. **Never Trust Client Roles**: Role headers are verified server-side against protected database records.
3. **Data Quarantine**: Private faculty deliberation notes (`internal_notes`) are quarantined at the API and database levels, ensuring student clients cannot access them via direct requests or inspect-element.
4. **Credential Isolation**: Service-role keys (`SUPABASE_SERVICE_ROLE_KEY`) and AI private tokens (`AI_API_KEY`) are restricted to server-side route handlers and never exposed in browser-accessible JavaScript.

---

## 2. Threat Modeling & Safeguards

| Threat Vector | Potential Impact | SQRP Safeguard |
|---|---|---|
| **IDOR (Insecure Direct Object Reference)** | Student reads or modifies another student's query | Server-side user authorization checks `student_id === auth.uid()`. Database RLS policy blocks cross-user reads. |
| **Privilege Escalation** | Student promotes account to Staff or Admin | `user_role` updates are restricted to server-side administrator operations. Browser-side profile updates are constrained by `role = (SELECT role FROM profiles WHERE id = auth.uid())`. |
| **Internal Deliberation Leak** | Student views confidential faculty notes | `internal_notes` table has an explicit RLS policy restricting SELECT to `STAFF`, `DEPARTMENT_HEAD`, and `ADMIN`. API routes filter `internal_notes: []` for student responses. |
| **Prompt Injection** | Student injects instructions to force AI approval | User query input is treated strictly as untrusted data wrapped in JSON schemas. The AI only *recommends* classifications; all status transitions require explicit human or deterministic server execution. |
| **Denial of Service / Spam Queries** | Duplicate query submission flooding | Frontend form disables duplicate submissions during processing. Server enforces rate limits and unique ticket IDs. |

---

## 3. Environment Variable Security

All sensitive secrets are isolated:
- `NEXT_PUBLIC_SUPABASE_URL`: Public (Client-safe)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public (Protected by database RLS)
- `SUPABASE_SERVICE_ROLE_KEY`: **Private / Server-Only**
- `AI_API_KEY`: **Private / Server-Only**

The repository `.gitignore` explicitly excludes `.env`, `.env.local`, and build artifacts to prevent accidental credential leakage.
