# Software Requirements Specification (SRS)
## Student Query Resolution Platform (SQRP)

### Document Version: 1.0.0
### Academic Year: 2025–2026

---

## 1. Introduction

### 1.1 Purpose
This document specifies the software requirements for the **Student Query Resolution Platform (SQRP)**. The system provides an automated, auditable, and intelligent framework for managing student academic, administrative, and infrastructural inquiries within a collegiate environment.

### 1.2 Scope
SQRP automates the query lifecycle from student intake to resolution, incorporating:
- Multi-channel query categorization (Academic Affairs, Examination Cell, Accounts, IT, Hostel).
- Generative AI assistance for pre-submission checks, automated categorization, and staff reply drafting.
- Multi-tier role permissions covering Students, Faculty Staff, Department Heads, and System Administrators.
- Administrative approval routing for policy waivers and attendance condonations.
- SLA adherence tracking and post-resolution student satisfaction ratings.

---

## 2. Overall Description

### 2.1 User Classes and Characteristics
1. **Student**: Submits queries, views real-time status history, replies to staff, confirms resolution, and rates service.
2. **Staff (Faculty Officer)**: Reviews assigned queries, claims unassigned intake tickets, writes quarantined internal notes, drafts public replies, and requests Head approval.
3. **Department Head**: Monitors departmental SLA adherence, resolves escalated cases, and formally approves or rejects policy exemption requests.
4. **Administrator**: Oversees university-wide operations, manages user directories, configures category SLA hours, reviews security audit trails, and exports compliance reports.

### 2.2 System Architecture
```
┌────────────────────────────────────────────────────────┐
│                   Next.js 14 Web UI                    │
│   Landing Page | Student | Staff | Head | Admin Portals │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│             Next.js Server Route Handlers              │
│       Role Guard | Zod Validation | State Machine       │
└──────────────┬───────────────────────────┬─────────────┘
               │                           │
┌──────────────▼─────────────┐ ┌───────────▼─────────────┐
│    Generative AI Agents    │ │    Database & Storage   │
│ Classifier | Router | Copilot│ │ Supabase Postgres (RLS)│
└────────────────────────────┘ └─────────────────────────┘
```

---

## 3. Functional Requirements

### FR-01: Multi-Role Authentication & Session Management
- **FR-01.1**: The system must enforce role verification for all protected routes (`/student/*`, `/staff/*`, `/department-head/*`, `/admin/*`).
- **FR-01.2**: Password credentials must never be exposed or logged in plaintext.

### FR-02: Query Intake & AI Pre-Screening
- **FR-02.1**: Students shall submit queries with subject, detailed description, and optional attachments.
- **FR-02.2**: The AI assistant shall analyze descriptions prior to submission to identify missing elements (such as Registration Numbers or transaction reference IDs) and suggest matching FAQ articles.
- **FR-02.3**: Upon persistence, the server shall generate a unique reference token conforming to `SQRP-YYYY-XXXXXX`.

### FR-03: Automated Triage & Smart Routing
- **FR-03.1**: An AI classification agent shall categorize the query, suggest priority, and recommend departmental destination.
- **FR-03.2**: If individual staff are unavailable, the query shall automatically route to the department intake queue.

### FR-04: Deterministic Ticket State Machine
- **FR-04.1**: Valid status transitions shall be enforced strictly on the server:
  - `SUBMITTED` -> `TRIAGED` | `ASSIGNED` | `REJECTED`
  - `ASSIGNED` -> `IN_PROGRESS` | `ESCALATED`
  - `IN_PROGRESS` -> `WAITING_FOR_STUDENT` | `WAITING_FOR_APPROVAL` | `RESOLVED`
  - `WAITING_FOR_APPROVAL` -> `IN_PROGRESS` | `RESOLVED` | `REJECTED`
  - `RESOLVED` -> `CLOSED` | `REOPENED`
- **FR-04.2**: Every transition shall record actor ID, previous status, next status, reason, and timestamp in `ticket_status_history`.

### FR-05: Department Head Approvals
- **FR-05.1**: Actions tagged as requiring approval (attendance condonation, fee installment concessions) must transition into `WAITING_FOR_APPROVAL`.
- **FR-05.2**: The Department Head must submit an explicit decision (`APPROVED` or `REJECTED`) along with compliance rationale.

### FR-06: Confidential Internal Notes
- **FR-06.1**: Faculty staff and administrators may log internal investigation notes.
- **FR-06.2**: Internal notes must be quarantined and never returned to student clients.

### FR-07: Post-Resolution Feedback & Quality Audit
- **FR-07.1**: Students may submit a 1–5 star rating and optional feedback once a query is resolved.
- **FR-07.2**: Resolved queries may be reopened within 7 days with mandatory explanation.

---

## 4. Non-Functional Requirements

1. **Performance**: Page loads must complete under 1.5 seconds under typical campus network loads.
2. **Reliability**: If external AI LLM services are rate-limited or unreachable, the system must transparently fall back to deterministic NLP rules without failing ticket persistence.
3. **Security**: Row Level Security (RLS) policies must be enabled on all relational tables.
4. **Usability**: Accessible UI adhering to WCAG 2.1 AA contrast requirements and responsive on mobile, tablet, and desktop screens.
