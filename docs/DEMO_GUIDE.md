# College Mini Project Demonstration Script
## Student Query Resolution Platform (SQRP)

This walkthrough guides the evaluator or student presenter through a complete end-to-end demonstration of the platform.

---

## Demonstration Sequence (10-Minute Presentation)

### Step 1: Landing Page & Public Knowledge Base
1. Open `http://localhost:3000`.
2. Point out:
   - Institutional branding (National Institute of Technology & Engineering).
   - Problem Statement & Solution highlighted in the Hero section.
   - Interactive 5-stage Query Lifecycle visualization.
   - Click **Public Knowledge Base** to show searchable FAQs (e.g., search for "medical" or "wifi").

### Step 2: Student Authentication & Query Submission with AI Pre-Screening
1. Click **Sign In** or navigate to `/login`.
2. Sign in with the student account:
   - **Email**: `student@nite.edu.in`
   - **Password**: Any demo password (e.g., `student123`)
   *(Alternatively, test the `/register` page to onboard a new student profile).*
3. From the Student Dashboard (`/student`), click **Submit New Query**.
4. Fill in:
   - **Subject**: `Medical OD Condonation for Viral Fever`
   - **Description**: `I missed 6 lectures due to viral fever. Please condone my attendance.`
5. Click **Pre-Screen with AI**:
   - Show how the AI detects missing details (e.g. prompts for Student Registration Number and medical discharge slips) and surfaces matching FAQ articles immediately before the ticket is created!
6. Add your Roll Number (`22BCE1045`) and click **Submit Query to University Desk**.
7. Note the unique server-generated reference token: `SQRP-2026-XXXXXX`.

### Step 3: Faculty Staff Workdesk & AI Copilot
1. Log out or navigate to `/login` and sign in with the Faculty Staff account:
   - **Email**: `staff@nite.edu.in`
   - **Password**: Any password (e.g., `staff123`)
2. In the Faculty Workdesk (`/staff`):
   - Review active workload queues and open the newly submitted student query.
3. Click **AI Staff Copilot**:
   - Watch the copilot summarize the student's request, draft an empathetic response, and suggest an internal verification note.
4. Click **Apply to Public Box** and click **Send Public Reply**.
5. Type an internal note in the quarantined box:
   - *"Cross-checked hospital slip. Eligible for Regulation 8.2 condonation."*
   - Click **Save Internal Note**.
6. Click **Request Head Approval**:
   - Choose `Medical Attendance Condonation (Below 75%)` and click **Dispatch to Department Head**.
   - Show ticket transition to `WAITING_FOR_APPROVAL`.

### Step 4: Department Head Approval
1. Navigate to `/login` and sign in as Department Head:
   - **Email**: `head@nite.edu.in`
   - **Password**: Any password (e.g., `head123`)
2. The browser automatically navigates to `/department-head`.
3. Click **Review Pending Approvals**:
   - Show the pending case with staff justification.
4. Click **Grant Approval**:
   - Confirm with official approval comment: *"Approved under Academic Council Regulation 8.2."*
   - Show ticket transition to `IN_PROGRESS`.

### Step 5: Resolution, Student Feedback & Reopen
1. Switch back to `/login` and log in as `staff@nite.edu.in`:
   - Click **Resolve Ticket**: Enter resolution summary: *"Condonation granted. ERP updated to 78% attendance."*
2. Switch back to `/login` and log in as `student@nite.edu.in`:
   - Open the ticket at `/student`.
   - Show the green **Faculty Resolution Summary** banner!
   - Click **Confirm Resolution**: The 5-star rating modal appears!
   - Give a 5-star rating with comments: *"Very fast resolution!"* and submit.

### Step 6: Admin Portal, Analytics & CSV Export
1. Log in as Administrator:
   - **Email**: `admin@nite.edu.in`
   - **Password**: Any password (e.g., `admin123`)
2. View real computed metrics:
   - Resolution Rate, Active Query Count, Student Satisfaction.
   - Departmental Query Load distribution.
   - Click **Export CSV Report** to download the complete spreadsheet.
   - Navigate to **Security Audit Logs** (`/admin/audit-logs`) to inspect the immutable trail of every action performed!
