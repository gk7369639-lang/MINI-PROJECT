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

### Step 2: Student Query Submission & AI Pre-Screening
1. Click **Launch Portal** or navigate to `/student`.
2. Click **Submit New Query**.
3. Type:
   - **Subject**: `Medical OD Condonation for Viral Fever`
   - **Description**: `I missed 6 lectures due to viral fever. Please condone my attendance.`
4. Click **Pre-Screen with AI**:
   - Show how the AI detects missing details (e.g. prompts for Student Registration Number and medical discharge slips) and surfaces matching FAQ articles immediately before the ticket is created!
5. Add your Roll Number (`22BCE1045`) and click **Submit Query to University Desk**.
6. Note the unique server-generated reference token: `SQRP-2026-XXXXXX`.

### Step 3: Faculty Staff Workdesk & Copilot
1. Use the **Top Demo Role Bar** to click **Ramesh (STAFF)**.
2. Notice the instant switch to the Faculty Workdesk (`/staff`):
   - Active workload metrics and queues.
   - Open the submitted ticket.
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
1. In the Top Demo Role Bar, click **Meenakshi (DEPARTMENT HEAD)**.
2. The browser automatically navigates to `/department-head`.
3. Click **Review Pending Approvals**:
   - Show the pending case with staff justification.
4. Click **Grant Approval**:
   - Confirm with official approval comment: *"Approved under Academic Council Regulation 8.2."*
   - Show ticket transition to `IN_PROGRESS`.

### Step 5: Resolution, Student Feedback & Reopen
1. Switch back to **Ramesh (STAFF)**:
   - Click **Resolve Ticket**: Enter resolution summary: *"Condonation granted. ERP updated to 78% attendance."*
2. Switch back to **Aarav (STUDENT)**:
   - Open the ticket at `/student`.
   - Show the green **Faculty Resolution Summary** banner!
   - Click **Confirm Resolution**: The 5-star rating modal appears!
   - Give a 5-star rating with comments: *"Very fast resolution!"* and submit.

### Step 6: Admin Portal, Analytics & CSV Export
1. In the Top Demo Role Bar, click **System Administrator (ADMIN)**:
   - Show real computed metrics: 100% Traceable Audit History, Resolution Rate, 5.0 Star Student Satisfaction.
   - Show the dynamic Departmental Query Load distribution.
   - Click **Export CSV Report** to download the complete spreadsheet.
   - Click **Security Audit Logs** to show the immutable trail of every single action performed during the presentation!
