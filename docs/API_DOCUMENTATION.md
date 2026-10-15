# RESTful API Documentation
## Student Query Resolution Platform (SQRP)

Base Path: `/api`

---

## 1. Tickets Endpoints

### 1.1 List Tickets
- **Endpoint**: `GET /api/tickets`
- **Description**: Returns queries filtered by role. Students only receive their own queries; faculty receive their departmental or assigned queries.
- **Query Parameters**:
  - `status`: Optional filter (`SUBMITTED`, `IN_PROGRESS`, `RESOLVED`, etc.)
  - `search`: Keyword string matching ticket ID or subject
  - `departmentId`: Optional department filter
- **Response `200 OK`**:
```json
{
  "success": true,
  "tickets": [
    {
      "id": "ticket-101",
      "ticket_number": "SQRP-2026-A109B4",
      "student_name": "Aarav Sharma",
      "subject": "Medical OD Exemption for Hospitalization Period",
      "priority": "HIGH",
      "status": "WAITING_FOR_APPROVAL",
      "sla_due_at": "2026-10-16T10:00:00Z"
    }
  ]
}
```

### 1.2 Submit New Query
- **Endpoint**: `POST /api/tickets`
- **Description**: Submits student query, triggers automated AI classification and smart faculty routing.
- **Request Body**:
```json
{
  "subject": "Medical OD Condonation for CS301",
  "description": "Hospitalized for acute dengue. Attaching medical documents for attendance exemption.",
  "category_id": "cat-att",
  "department_id": "dept-acad",
  "priority": "HIGH"
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "ticket": {
    "id": "ticket-1729000000",
    "ticket_number": "SQRP-2026-B918X2",
    "status": "ASSIGNED",
    "assigned_to": "user-staff-1"
  },
  "classification": {
    "suggested_category_name": "Attendance Shortage & On-Duty (OD) Exemption",
    "confidence_score": 0.92
  }
}
```

### 1.3 Ticket Details & Updates
- **Endpoint**: `GET /api/tickets/:id`
- **Endpoint**: `PATCH /api/tickets/:id` (Transition status or reassign)

---

## 2. Conversation & Internal Notes

### 2.1 Post Public Message
- **Endpoint**: `POST /api/tickets/:id/messages`
- **Body**: `{ "content": "Updated hospital fitness slip uploaded." }`

### 2.2 Post Quarantined Internal Note
- **Endpoint**: `POST /api/tickets/:id/notes`
- **Body**: `{ "content": "Verified hospital registration number with medical board." }`
- **Security**: Returns `403 Forbidden` if requested by a `STUDENT`.

---

## 3. Administrative Approvals

### 3.1 List Pending Approvals
- **Endpoint**: `GET /api/approvals`

### 3.2 Decide Approval
- **Endpoint**: `POST /api/approvals`
- **Body**:
```json
{
  "requestId": "app-101-1",
  "decision": "APPROVED",
  "comment": "Approved under Academic Council Regulation 8.2."
}
```

---

## 4. Generative AI Services

### 4.1 Real-Time Ticket Classification
- **Endpoint**: `POST /api/ai/classify`
- **Body**: `{ "subject": "...", "description": "..." }`

### 4.2 AI Copilot & Pre-Screening
- **Endpoint**: `POST /api/ai/copilot`
- **Actions**:
  - `assist-student`: Checks for missing roll/transaction numbers, suggests FAQs.
  - `staff-copilot`: Generates executive conversation summary, suggested student reply, and internal note proposal.

---

## 5. Reports & Exports

### 5.1 Export CSV
- **Endpoint**: `GET /api/admin/reports`
- **Headers**: `Content-Type: text/csv`
