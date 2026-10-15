-- ==============================================================================
-- STUDENT QUERY RESOLUTION PLATFORM (SQRP)
-- Migration: 20261015000001_initial_schema.sql
-- Description: Complete schema for 18 core entities with constraints, indexes & RLS
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMS & DOMAINS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('STUDENT', 'STAFF', 'DEPARTMENT_HEAD', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE ticket_status AS ENUM (
        'SUBMITTED',
        'TRIAGED',
        'ASSIGNED',
        'IN_PROGRESS',
        'WAITING_FOR_STUDENT',
        'WAITING_FOR_APPROVAL',
        'RESOLVED',
        'CLOSED',
        'REJECTED',
        'REOPENED',
        'ESCALATED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE ticket_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE approval_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE message_type AS ENUM ('PUBLIC_REPLY', 'SYSTEM_UPDATE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. DEPARTMENTS
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    contact_email VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. PROFILES (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    role user_role NOT NULL DEFAULT 'STUDENT',
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    phone VARCHAR(30),
    avatar_url TEXT,
    student_id_number VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add head_profile_id to departments after profiles exists
ALTER TABLE public.departments 
    ADD COLUMN IF NOT EXISTS head_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 4. SUPPORT CATEGORIES
CREATE TABLE IF NOT EXISTS public.support_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    sla_hours INTEGER NOT NULL DEFAULT 48,
    requires_approval BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. TICKETS
CREATE SEQUENCE IF NOT EXISTS ticket_seq START WITH 1001;

CREATE TABLE IF NOT EXISTS public.tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_number VARCHAR(30) NOT NULL UNIQUE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    category_id UUID REFERENCES public.support_categories(id) ON DELETE SET NULL,
    subject VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    priority ticket_priority NOT NULL DEFAULT 'MEDIUM',
    status ticket_status NOT NULL DEFAULT 'SUBMITTED',
    sla_due_at TIMESTAMPTZ,
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    resolution_summary TEXT,
    reopened_reason TEXT,
    resolved_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. TICKET ASSIGNMENTS
CREATE TABLE IF NOT EXISTS public.ticket_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
    assigned_to UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    assignment_type VARCHAR(50) NOT NULL DEFAULT 'MANUAL', -- 'AUTO_AI', 'MANUAL', 'ESCALATED'
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. TICKET MESSAGES (Public Conversation)
CREATE TABLE IF NOT EXISTS public.ticket_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    message_type message_type NOT NULL DEFAULT 'PUBLIC_REPLY',
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. INTERNAL NOTES (Staff Only)
CREATE TABLE IF NOT EXISTS public.internal_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. TICKET STATUS HISTORY (Audit Trail)
CREATE TABLE IF NOT EXISTS public.ticket_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
    changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    old_status ticket_status,
    new_status ticket_status NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. APPROVAL REQUESTS
CREATE TABLE IF NOT EXISTS public.approval_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
    requested_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
    action_type VARCHAR(100) NOT NULL, -- e.g. 'FEE_WAIVER', 'ATTENDANCE_CORRECTION', 'EXAM_SPECIAL_PERMIT'
    reason TEXT NOT NULL,
    status approval_status NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    decided_at TIMESTAMPTZ
);

-- 11. APPROVAL DECISIONS
CREATE TABLE IF NOT EXISTS public.approval_decisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES public.approval_requests(id) ON DELETE CASCADE,
    decider_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    decision approval_status NOT NULL,
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    link VARCHAR(255),
    is_read BOOLEAN NOT NULL DEFAULT false,
    notification_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. ATTACHMENTS
CREATE TABLE IF NOT EXISTS public.attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
    message_id UUID REFERENCES public.ticket_messages(id) ON DELETE SET NULL,
    uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size_bytes INTEGER NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 14. KNOWLEDGE BASE ARTICLES
CREATE TABLE IF NOT EXISTS public.knowledge_base_articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    content TEXT NOT NULL,
    category_id UUID REFERENCES public.support_categories(id) ON DELETE SET NULL,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    tags TEXT[],
    is_published BOOLEAN NOT NULL DEFAULT true,
    view_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 15. AI CLASSIFICATIONS
CREATE TABLE IF NOT EXISTS public.ai_classifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
    suggested_category_id UUID REFERENCES public.support_categories(id) ON DELETE SET NULL,
    suggested_department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    suggested_priority ticket_priority,
    confidence_score NUMERIC(4, 2) NOT NULL DEFAULT 0.0,
    summary TEXT,
    extracted_entities JSONB DEFAULT '{}'::jsonb,
    model_name VARCHAR(100),
    raw_response JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 16. AI ROUTING LOGS
CREATE TABLE IF NOT EXISTS public.ai_routing_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
    recommended_department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    recommended_staff_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    routing_reason TEXT,
    workload_considered JSONB DEFAULT '{}'::jsonb,
    is_auto_assigned BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 17. FEEDBACK
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL UNIQUE REFERENCES public.tickets(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 18. AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100),
    details JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 19. APPLICATION SETTINGS
CREATE TABLE IF NOT EXISTS public.application_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_tickets_student ON public.tickets(student_id);
CREATE INDEX IF NOT EXISTS idx_tickets_department ON public.tickets(department_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to ON public.tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON public.tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket ON public.ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_internal_notes_ticket ON public.internal_notes(ticket_id);
CREATE INDEX IF NOT EXISTS idx_status_history_ticket ON public.ticket_status_history(ticket_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_approval_requests_dept ON public.approval_requests(department_id, status);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internal_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_base_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check role from auth.uid()
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS user_role AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Profiles: Anyone authenticated can read basic profiles, users can update own profile
CREATE POLICY "Profiles read policy" ON public.profiles
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Profiles update own" ON public.profiles
    FOR UPDATE TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid() AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

-- Departments & Categories: Authenticated users can view active departments/categories
CREATE POLICY "Departments read" ON public.departments
    FOR SELECT TO authenticated USING (is_active = true OR public.current_user_role() = 'ADMIN');

CREATE POLICY "Categories read" ON public.support_categories
    FOR SELECT TO authenticated USING (is_active = true OR public.current_user_role() = 'ADMIN');

-- Tickets:
-- 1. Student can view only own tickets
CREATE POLICY "Student read own tickets" ON public.tickets
    FOR SELECT TO authenticated
    USING (
        student_id = auth.uid() 
        OR public.current_user_role() IN ('STAFF', 'DEPARTMENT_HEAD', 'ADMIN')
    );

-- 2. Student can insert tickets with student_id = auth.uid()
CREATE POLICY "Student insert own tickets" ON public.tickets
    FOR INSERT TO authenticated
    WITH CHECK (
        student_id = auth.uid() 
        OR public.current_user_role() IN ('STAFF', 'ADMIN')
    );

-- 3. Staff/Head/Admin can update tickets
CREATE POLICY "Staff update assigned tickets" ON public.tickets
    FOR UPDATE TO authenticated
    USING (
        public.current_user_role() IN ('STAFF', 'DEPARTMENT_HEAD', 'ADMIN')
        OR (student_id = auth.uid() AND status IN ('RESOLVED')) -- Student can confirm resolution or reopen
    );

-- Ticket Messages:
CREATE POLICY "Messages read" ON public.ticket_messages
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.tickets t 
            WHERE t.id = ticket_id 
            AND (t.student_id = auth.uid() OR public.current_user_role() IN ('STAFF', 'DEPARTMENT_HEAD', 'ADMIN'))
        )
    );

CREATE POLICY "Messages insert" ON public.ticket_messages
    FOR INSERT TO authenticated
    WITH CHECK (
        sender_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.tickets t 
            WHERE t.id = ticket_id 
            AND (t.student_id = auth.uid() OR public.current_user_role() IN ('STAFF', 'DEPARTMENT_HEAD', 'ADMIN'))
        )
    );

-- Internal Notes: STRICTLY STAFF, HEAD, ADMIN. Never student!
CREATE POLICY "Internal notes viewable by staff only" ON public.internal_notes
    FOR SELECT TO authenticated
    USING (public.current_user_role() IN ('STAFF', 'DEPARTMENT_HEAD', 'ADMIN'));

CREATE POLICY "Internal notes insertable by staff only" ON public.internal_notes
    FOR INSERT TO authenticated
    WITH CHECK (
        author_id = auth.uid() 
        AND public.current_user_role() IN ('STAFF', 'DEPARTMENT_HEAD', 'ADMIN')
    );

-- Notifications: User sees only own notifications
CREATE POLICY "User sees own notifications" ON public.notifications
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "User updates own notifications" ON public.notifications
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid());

-- Feedback:
CREATE POLICY "Feedback viewable by staff and owner" ON public.feedback
    FOR SELECT TO authenticated
    USING (student_id = auth.uid() OR public.current_user_role() IN ('STAFF', 'DEPARTMENT_HEAD', 'ADMIN'));

CREATE POLICY "Student submits feedback" ON public.feedback
    FOR INSERT TO authenticated
    WITH CHECK (student_id = auth.uid());

-- Knowledge base:
CREATE POLICY "Public KB view" ON public.knowledge_base_articles
    FOR SELECT TO authenticated
    USING (is_published = true OR public.current_user_role() = 'ADMIN');
