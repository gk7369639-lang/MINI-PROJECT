# Student Query Resolution Platform (SQRP)
### Advanced Autonomous Generative AI Academic Support & Triage System

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?logo=supabase)](https://supabase.com/)
[![Strict Mode](https://img.shields.io/badge/TypeScript-Strict_Verified-green)](https://www.typescriptlang.org/)

---

## 1. Executive Summary & Problem Statement

In conventional higher education institutions, student inquiries, grievance forms, and administrative requests often circulate across fragmented channels (unanswered emails, physical forms, departmental hand-offs), resulting in lost queries, lack of SLA enforcement, and student frustration.

The **Student Query Resolution Platform (SQRP)** is a complete, production-grade university software solution designed to eliminate manual query handling. It features:
- **Generative AI Query Triage**: Server-side natural language processing automatically parses student queries, detects missing documents (e.g. medical discharge slips or bank UTR numbers), classifies categories, and computes initial priorities.
- **Smart Workload-Aware Routing**: Evaluates live faculty load to dispatch inquiries to the optimal desk or departmental intake queue.
- **Deterministic State Machine**: Enforces transparent ticket transitions (`SUBMITTED` -> `ASSIGNED` -> `IN_PROGRESS` -> `WAITING_FOR_APPROVAL` -> `RESOLVED` -> `CLOSED` / `REOPENED`).
- **Administrative Approvals**: Dedicated workflow for Department Heads to review and decide upon attendance condonations, fee installment concessions, or exam timetable clashes.
- **Role-Based Security & Quarantining**: Students only view authorized tickets and public replies. Faculty internal investigation notes are strictly quarantined at the database and API layer.
- **Multi-Role Production Workflows**: Dedicated role-based dashboards for Student, Staff, Department Head, and Administrator with authenticated session management.

---

## 2. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | Next.js 14 App Router, React 18, TypeScript (Strict Mode) |
| **Styling & Design System** | Tailwind CSS (University Academic Navy/Blue theme), Lucide Icons |
| **Form Handling & Validation** | React Hook Form, Zod Schema Validation |
| **Backend & State Engine** | Next.js Server-Side Route Handlers, TypeScript State Machine |
| **Database & Security** | PostgreSQL, Supabase Auth, Row-Level Security (RLS) Policies |
| **Generative AI** | Server-side abstraction supporting Google Gemini, OpenAI, or Deterministic Rule Engine |
| **Verification & Quality** | Strict TypeScript compile check, ESLint code analysis, Production Next.js build |

---

## 3. Project Structure

```
├── docs/
│   ├── SRS.md                  # Complete Software Requirements Specification
│   ├── DATABASE_SCHEMA.md      # 18 normalized entities, relational mapping & RLS
│   ├── SECURITY.md             # Threat modeling, RLS enforcement & quarantine rules
│   ├── API_DOCUMENTATION.md    # RESTful API specifications with request/response payloads
│   ├── TESTING.md              # Quality assurance & architectural verification report
│   ├── DEPLOYMENT.md           # Production deployment & environment setup
│   └── DEMO_GUIDE.md           # Evaluator step-by-step presentation script
├── src/
│   ├── app/                    # Next.js App Router pages & API routes
│   │   ├── page.tsx            # SaaS Academic Landing page
│   │   ├── login/              # Multi-role authentication & session login
│   │   ├── register/           # Student onboarding with Roll No verification
│   │   ├── student/            # Student Portal (query submission, conversation, feedback)
│   │   ├── staff/              # Faculty Workdesk (queues, internal notes, copilot)
│   │   ├── department-head/    # Head approvals & departmental analytics
│   │   ├── admin/              # Global analytics, user directory, audit logs & CSV export
│   │   ├── knowledge-base/     # Searchable FAQ catalog
│   │   └── api/                # Secure route handlers
│   ├── components/             # Reusable UI & Layout components
│   ├── lib/
│   │   ├── ai/                 # Classifier, Smart Router, and Staff Copilot
│   │   ├── data/               # In-Memory & PostgreSQL repository store
│   │   ├── state-machine.ts    # Deterministic status transition engine
│   │   ├── utils.ts            # Formatting, badge styling & unique ID generation
│   │   └── validation/         # Zod schemas
│   └── types/                  # Strict TypeScript models
└── supabase/
    ├── migrations/             # Version-controlled SQL migration
    └── seed.sql                # Production-representative academic seed data
```

---

## 4. Quickstart & Local Installation

### Prerequisites
- Node.js LTS (v18, v20, or v24)
- npm or pnpm

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd "MINI PROJECT"
npm install
```

### 2. Environment Configuration
Copy the template environment file:
```bash
cp .env.example .env.local
```
*(The platform operates with 100% full fidelity out-of-the-box using its deterministic in-memory store and offline NLP engine even before external API keys are configured).*

### 3. Run Verification Checks
```bash
npx tsc --noEmit
npm run lint
```

### 4. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build Verification
```bash
npm run build
npm start
```

---

## 5. Verified User Accounts

| Role | Name | Email | Default Dashboard |
|---|---|---|---|
| **Student** | Aarav Sharma | `student@nite.edu.in` | `/student` |
| **Faculty Staff** | Dr. Ramesh Kumar | `staff@nite.edu.in` | `/staff` |
| **Department Head** | Prof. Meenakshi Sundaram | `head@nite.edu.in` | `/department-head` |
| **Administrator** | System Administrator | `admin@nite.edu.in` | `/admin` |

*(To sign in with any account, navigate to `/login` and enter the account email with any password, or register a new student account at `/register`).*
