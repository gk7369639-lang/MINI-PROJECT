# Database Schema Documentation
## Student Query Resolution Platform (SQRP)

### Database: PostgreSQL 15+ (Supabase Architecture)
### Migration File: `supabase/migrations/20261015000001_initial_schema.sql`

---

## 1. Entity-Relationship Overview

```
 [auth.users]
      │ 1:1
      ▼
 [profiles] ────────┐ 1:N
      │              ▼
      │ 1:N     [tickets] ◄────── [support_categories] ◄── [departments]
      │              │                    │                      ▲
      │              ├─► [ticket_messages]│                      │
      │              ├─► [internal_notes] │                      │
      │              ├─► [ticket_status_history]                 │
      │              ├─► [approval_requests] ────────────────────┘
      │              ├─► [feedback]
      │              └─► [attachments]
      ▼
 [notifications]
```

---

## 2. Table Specifications

### 2.1 `departments`
Stores academic and administrative units.
- `id` (UUID, PK)
- `code` (VARCHAR(20), UNIQUE) — e.g. `ACAD`, `EXAM`, `FIN`, `CSE`, `ITS`
- `name` (VARCHAR(150), NOT NULL)
- `description` (TEXT)
- `contact_email` (VARCHAR(255))
- `head_profile_id` (UUID, FK -> `profiles.id`)
- `is_active` (BOOLEAN, DEFAULT true)
- `created_at` / `updated_at` (TIMESTAMPTZ)

### 2.2 `profiles`
Extends Supabase `auth.users` with university-specific metadata.
- `id` (UUID, PK, FK -> `auth.users.id` ON DELETE CASCADE)
- `email` (VARCHAR(255), UNIQUE, NOT NULL)
- `full_name` (VARCHAR(150), NOT NULL)
- `role` (`user_role`: `STUDENT` | `STAFF` | `DEPARTMENT_HEAD` | `ADMIN`)
- `department_id` (UUID, FK -> `departments.id`)
- `student_id_number` (VARCHAR(50)) — e.g. `22BCE1045`
- `phone` (VARCHAR(30))
- `avatar_url` (TEXT)
- `is_active` (BOOLEAN, DEFAULT true)

### 2.3 `support_categories`
Defines operational query classes, target SLA hours, and approval requirements.
- `id` (UUID, PK)
- `department_id` (UUID, FK -> `departments.id`, NOT NULL)
- `name` (VARCHAR(100), NOT NULL)
- `code` (VARCHAR(50), UNIQUE, NOT NULL)
- `description` (TEXT)
- `sla_hours` (INTEGER, NOT NULL, DEFAULT 48)
- `requires_approval` (BOOLEAN, NOT NULL, DEFAULT false)
- `is_active` (BOOLEAN, NOT NULL, DEFAULT true)

### 2.4 `tickets`
Central query entity.
- `id` (UUID, PK)
- `ticket_number` (VARCHAR(30), UNIQUE, NOT NULL) — Format: `SQRP-2026-XXXXXX`
- `student_id` (UUID, FK -> `profiles.id`, NOT NULL)
- `department_id` (UUID, FK -> `departments.id`)
- `category_id` (UUID, FK -> `support_categories.id`)
- `subject` (VARCHAR(200), NOT NULL)
- `description` (TEXT, NOT NULL)
- `priority` (`ticket_priority`: `LOW` | `MEDIUM` | `HIGH` | `URGENT`)
- `status` (`ticket_status`: `SUBMITTED`, `TRIAGED`, `ASSIGNED`, `IN_PROGRESS`, `WAITING_FOR_STUDENT`, `WAITING_FOR_APPROVAL`, `RESOLVED`, `CLOSED`, `REJECTED`, `REOPENED`, `ESCALATED`)
- `sla_due_at` (TIMESTAMPTZ)
- `assigned_to` (UUID, FK -> `profiles.id`)
- `resolution_summary` (TEXT)
- `reopened_reason` (TEXT)
- `resolved_at` / `closed_at` (TIMESTAMPTZ)
- `created_at` / `updated_at` (TIMESTAMPTZ)

### 2.5 `ticket_messages`
Public conversational thread between student and assigned faculty.
- `id` (UUID, PK)
- `ticket_id` (UUID, FK -> `tickets.id` ON DELETE CASCADE)
- `sender_id` (UUID, FK -> `profiles.id`)
- `message_type` (`PUBLIC_REPLY` | `SYSTEM_UPDATE`)
- `content` (TEXT, NOT NULL)
- `created_at` (TIMESTAMPTZ)

### 2.6 `internal_notes`
Quarantined faculty investigation notes (Strictly hidden from students).
- `id` (UUID, PK)
- `ticket_id` (UUID, FK -> `tickets.id` ON DELETE CASCADE)
- `author_id` (UUID, FK -> `profiles.id`)
- `content` (TEXT, NOT NULL)
- `created_at` (TIMESTAMPTZ)

### 2.7 `approval_requests` & `approval_decisions`
Multi-level administrative approvals.
- `approval_requests`: `id`, `ticket_id`, `requested_by`, `department_id`, `action_type`, `reason`, `status` (`PENDING`, `APPROVED`, `REJECTED`), `created_at`, `decided_at`
- `approval_decisions`: `id`, `request_id`, `decider_id`, `decision`, `comment`, `created_at`

### 2.8 `feedback`
Post-resolution student satisfaction ratings.
- `id` (UUID, PK)
- `ticket_id` (UUID, FK -> `tickets.id` UNIQUE)
- `student_id` (UUID, FK -> `profiles.id`)
- `rating` (INTEGER, CHECK: 1 <= rating <= 5)
- `comment` (TEXT)
- `created_at` (TIMESTAMPTZ)

---

## 3. Row-Level Security (RLS) Summary

| Table | Student Permissions | Staff Permissions | Department Head | Administrator |
|---|---|---|---|---|
| `profiles` | Read own, Update own | Read all, Update own | Read all, Update own | Full Access |
| `tickets` | Read & Insert Own | Read Dept & Assigned | Read Department | Full Access |
| `ticket_messages` | Read/Insert on Own | Read/Insert Assigned | Read/Insert Dept | Full Access |
| `internal_notes` | **ACCESS DENIED (RLS)** | Read/Insert Dept | Read/Insert Dept | Full Access |
| `approval_requests`| **ACCESS DENIED (RLS)** | Read Dept, Insert | Read Dept, Decide | Full Access |
| `feedback` | Insert Own, Read Own | Read Dept Feedback | Read Dept Feedback | Full Access |
