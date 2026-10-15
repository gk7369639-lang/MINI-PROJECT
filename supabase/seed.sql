-- ==============================================================================
-- STUDENT QUERY RESOLUTION PLATFORM (SQRP)
-- Seed Data: supabase/seed.sql
-- Description: Realistic academic demonstration data for all 4 roles and workflows
-- ==============================================================================

-- 1. APPLICATION SETTINGS
INSERT INTO public.application_settings (key, value, description) VALUES
('platform_title', '"Student Query Resolution Platform (SQRP)"', 'Platform title display'),
('institution_name', '"National Institute of Technology & Engineering"', 'Institution name'),
('auto_ai_routing_enabled', 'true', 'Enable automatic AI query triage and routing'),
('sla_escalation_hours', '48', 'Hours before an unaddressed query is marked overdue'),
('allow_student_reopen_days', '7', 'Number of days student can reopen a resolved ticket')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 2. DEPARTMENTS
INSERT INTO public.departments (id, code, name, description, contact_email, is_active) VALUES
('11111111-1111-1111-1111-111111111101', 'ACAD', 'Academic Affairs & Registry', 'Course registrations, credit transfers, transcripts, and degree certificates', 'academics@nite.edu.in', true),
('11111111-1111-1111-1111-111111111102', 'EXAM', 'Examination Cell & Evaluation', 'End-semester exams, hall tickets, revaluation, and grade cards', 'examcell@nite.edu.in', true),
('11111111-1111-1111-1111-111111111103', 'FIN', 'Accounts & Finance', 'Tuition fees, hostel dues, scholarship stipends, and refund requests', 'finance@nite.edu.in', true),
('11111111-1111-1111-1111-111111111104', 'CSE', 'Computer Science & Engineering Dept', 'Departmental lab issues, elective selections, project approvals', 'cse.dept@nite.edu.in', true),
('11111111-1111-1111-1111-111111111105', 'HOSTEL', 'Hostel & Residential Services', 'Hostel allotment, mess issues, maintenance, and day-scholar transport', 'hostel@nite.edu.in', true),
('11111111-1111-1111-1111-111111111106', 'ITS', 'Campus IT & Infrastructure Support', 'Campus WiFi, student portal credentials, email access, lab network', 'itsupport@nite.edu.in', true)
ON CONFLICT (code) DO NOTHING;

-- 3. SUPPORT CATEGORIES
INSERT INTO public.support_categories (id, department_id, name, code, description, sla_hours, requires_approval, is_active) VALUES
('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111101', 'Attendance Shortage Exemption', 'ATTENDANCE_EXEMPTION', 'Medical/OD requests requiring Head approval', 48, true, true),
('22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111101', 'Bonafide / Transcript Certificate', 'CERTIFICATE_BONAFIDE', 'Application for official bonafide and transcripts', 24, false, true),
('22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111102', 'Hall Ticket Discrepancy', 'HALL_TICKET_ERROR', 'Name/subject code correction on exam hall tickets', 24, false, true),
('22222222-2222-2222-2222-222222222204', '11111111-1111-1111-1111-111111111102', 'Revaluation & Paper Viewing', 'EXAM_REVALUATION', 'Review of graded answer sheets', 72, true, true),
('22222222-2222-2222-2222-222222222205', '11111111-1111-1111-1111-111111111103', 'Tuition Fee Payment & Receipt', 'FEE_RECEIPT_ISSUE', 'Payment gateway issues, double deductions, receipt generation', 48, false, true),
('22222222-2222-2222-2222-222222222206', '11111111-1111-1111-1111-111111111103', 'Fee Concession / Installment Request', 'FEE_CONCESSION', 'Requests for delayed installment payments', 72, true, true),
('22222222-2222-2222-2222-222222222207', '11111111-1111-1111-1111-111111111106', 'WiFi & Campus Portal Login', 'IT_PORTAL_ACCESS', 'Password reset, 2FA recovery, campus WiFi MAC binding', 12, false, true),
('22222222-2222-2222-2222-222222222208', '11111111-1111-1111-1111-111111111105', 'Hostel Room Maintenance', 'HOSTEL_MAINTENANCE', 'Plumbing, electrical, furniture repairs in dormitories', 24, false, true)
ON CONFLICT (code) DO NOTHING;

-- 4. KNOWLEDGE BASE ARTICLES
INSERT INTO public.knowledge_base_articles (id, title, slug, content, category_id, department_id, tags, is_published, view_count) VALUES
('33333333-3333-3333-3333-333333333301', 
 'How to Apply for Medical Leave / OD Attendance Waiver', 
 'how-to-apply-medical-od-waiver',
 'Students who missed lectures due to authorized medical leave or official college sports/cultural representations must upload hospital discharge summaries or faculty coordinator authorization letters within 5 days of returning. Approvals are vetted by the Academic Head.',
 '22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111101', 
 ARRAY['attendance', 'medical', 'od', 'leave'], true, 142),

('33333333-3333-3333-3333-333333333302', 
 'Fixing Double Deductions During Online Fee Payments', 
 'fixing-double-deductions-fee-payment',
 'If money was debited from your bank account but your student portal still shows "Pending Payment", please note that banking gateways require up to 24 hours to reconcile. If the receipt does not auto-generate within 24 hours, submit a query under Accounts with your Transaction Reference Number (UTR).',
 '22222222-2222-2222-2222-222222222205', '11111111-1111-1111-1111-111111111103', 
 ARRAY['fees', 'payment', 'refund', 'receipt'], true, 289),

('33333333-3333-3333-3333-333333333303', 
 'Connecting Laptops and Mobile Devices to Campus 5GHz WiFi', 
 'connecting-to-campus-wifi',
 'To register your device MAC address for the campus high-speed WiFi network, use your Institute Roll Number and LDAP credentials. Personal routers or hotspot repeaters are strictly prohibited inside university dorms.',
 '22222222-2222-2222-2222-222222222207', '11111111-1111-1111-1111-111111111106', 
 ARRAY['wifi', 'it-support', 'internet', 'network'], true, 514)
ON CONFLICT (slug) DO NOTHING;
