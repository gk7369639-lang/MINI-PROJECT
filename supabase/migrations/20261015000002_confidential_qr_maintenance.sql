-- ==============================================================================
-- STUDENT QUERY RESOLUTION & MAINTENANCE MANAGEMENT PLATFORM (SQRP)
-- Migration: 20261015000002_confidential_qr_maintenance.sql
-- Description: Extends schema for QR codes, field maintenance workers, faculty review,
--              work timestamps, and strict student identity confidentiality
-- ==============================================================================

-- 1. EXTEND ENUMS SAFELY
DO $$ BEGIN
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'FACULTY';
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'WORKER';
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'QUERY_SYSTEM_ADMIN';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TYPE ticket_status ADD VALUE IF NOT EXISTS 'UNDER_FACULTY_REVIEW';
    ALTER TYPE ticket_status ADD VALUE IF NOT EXISTS 'WAITING_FOR_CLARIFICATION';
    ALTER TYPE ticket_status ADD VALUE IF NOT EXISTS 'READY_FOR_ASSIGNMENT';
    ALTER TYPE ticket_status ADD VALUE IF NOT EXISTS 'ASSIGNED_TO_WORKER';
    ALTER TYPE ticket_status ADD VALUE IF NOT EXISTS 'WORKER_ACCEPTED';
    ALTER TYPE ticket_status ADD VALUE IF NOT EXISTS 'WAITING_FOR_PARTS_OR_RESOURCES';
    ALTER TYPE ticket_status ADD VALUE IF NOT EXISTS 'NOT_RESOLVED';
    ALTER TYPE ticket_status ADD VALUE IF NOT EXISTS 'REQUIRES_REASSIGNMENT';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. ADD MAINTENANCE, LOCATION & WORK TIMESTAMP COLUMNS TO TICKETS
ALTER TABLE public.tickets
    ADD COLUMN IF NOT EXISTS location_building VARCHAR(100),
    ADD COLUMN IF NOT EXISTS location_room VARCHAR(50),
    ADD COLUMN IF NOT EXISTS image_url TEXT,
    ADD COLUMN IF NOT EXISTS assigned_worker_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS faculty_reviewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS faculty_notes TEXT,
    ADD COLUMN IF NOT EXISTS worker_notes TEXT,
    ADD COLUMN IF NOT EXISTS not_resolved_reason TEXT,
    ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ DEFAULT now(),
    ADD COLUMN IF NOT EXISTS faculty_review_started_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS faculty_review_completed_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS worker_accepted_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS work_started_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS last_progress_at TIMESTAMPTZ;

-- 3. WORKER TASK UPDATES TABLE
CREATE TABLE IF NOT EXISTS public.worker_task_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
    worker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status ticket_status NOT NULL,
    note TEXT,
    parts_required TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast task log retrieval
CREATE INDEX IF NOT EXISTS idx_worker_task_updates_ticket ON public.worker_task_updates(ticket_id);
CREATE INDEX IF NOT EXISTS idx_worker_task_updates_worker ON public.worker_task_updates(worker_id);

-- 4. QR CODES MANAGEMENT TABLE
CREATE TABLE IF NOT EXISTS public.qr_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(150) NOT NULL,
    target_url TEXT NOT NULL,
    building VARCHAR(100),
    room VARCHAR(50),
    scan_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_qr_codes_building ON public.qr_codes(building);

-- 5. ROW LEVEL SECURITY (RLS) FOR CONFIDENTIALITY
ALTER TABLE public.worker_task_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;

-- Workers can view and insert their own task updates
CREATE POLICY "Workers can view assigned task updates"
    ON public.worker_task_updates
    FOR SELECT
    USING (
        auth.uid() = worker_id OR 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('FACULTY', 'QUERY_SYSTEM_ADMIN', 'ADMIN')
        )
    );

CREATE POLICY "Workers can create task updates"
    ON public.worker_task_updates
    FOR INSERT
    WITH CHECK (auth.uid() = worker_id);

-- Anyone authenticated can view QR codes; staff can manage them
CREATE POLICY "Public read for QR codes"
    ON public.qr_codes
    FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage QR codes"
    ON public.qr_codes
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('QUERY_SYSTEM_ADMIN', 'ADMIN')
        )
    );

-- 6. CONFIDENTIAL TICKET VIEW (Protects Student Identity at Database Level)
CREATE OR REPLACE VIEW public.confidential_tickets AS
SELECT 
    t.id,
    t.ticket_number,
    -- Strict Confidentiality: Student identity is NULL for staff/workers/admin
    CASE 
        WHEN auth.uid() = t.student_id THEN t.student_id 
        ELSE NULL 
    END AS student_id,
    CASE 
        WHEN auth.uid() = t.student_id THEN t.student_id 
        ELSE 'CONFIDENTIAL_PROTECTED'::uuid 
    END AS masked_student_ref,
    t.department_id,
    t.category_id,
    t.subject,
    t.description,
    t.priority,
    t.status,
    t.location_building,
    t.location_room,
    t.image_url,
    t.sla_due_at,
    t.assigned_to,
    t.assigned_worker_id,
    t.faculty_reviewer_id,
    t.faculty_notes,
    t.worker_notes,
    t.not_resolved_reason,
    t.resolution_summary,
    t.reopened_reason,
    t.submitted_at,
    t.faculty_review_started_at,
    t.faculty_review_completed_at,
    t.assigned_at,
    t.worker_accepted_at,
    t.work_started_at,
    t.last_progress_at,
    t.resolved_at,
    t.closed_at,
    t.created_at,
    t.updated_at
FROM public.tickets t;
