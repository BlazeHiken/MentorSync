Absolutely, King. Let's throw away the **"enterprise product" PRD** and make a **5-day MVP PRD**.

The important thing is that it still matches what you already submitted: Admin/Mentor/Student roles, division-wise assignment, feedback, mentor satisfaction, issue tracking, mentoring sessions, dashboard/analytics, and reports. 

# MentorSync — 5-Day MVP PRD

**Project:** MentorSync — Student Mentoring, Feedback & Support Platform
**Duration:** 5 days
**Team:** 4 developers
**Development:** Antigravity
**Frontend:** React.js
**Backend:** Django + Django REST Framework
**Database:** PostgreSQL
**Authentication:** JWT
**Version Control:** Git + GitHub 

---

# 1. Objective

Build a working web application that digitizes the basic mentor–mentee workflow of an educational institution.

The system will allow:

**Admin**

→ manage divisions and users
→ assign mentors to students
→ monitor feedback/issues
→ view dashboard

**Student**

→ view mentor
→ submit feedback
→ rate mentoring experience
→ report issues/suggestions
→ view issue status

**Mentor**

→ view assigned students
→ view their feedback/issues
→ record mentoring sessions
→ update issue status/action taken

This follows the workflow already submitted in the proposal. 

---

# 2. Scope

## 2.1 Roles

Only **3 roles** will be implemented.

### Admin

* Login
* Dashboard
* Manage students
* Manage mentors
* Manage divisions
* Assign mentors to students
* View feedback
* View issues
* View basic analytics

### Mentor

* Login
* Dashboard
* View assigned students
* View student feedback
* View satisfaction survey responses
* View reported issues
* Record mentoring session
* Update issue status
* Add action taken/follow-up

### Student

* Login
* Dashboard
* View assigned mentor
* Submit feedback
* Submit mentor satisfaction survey
* Report issue/concern
* View own submitted issues
* View issue status

---

# 3. Core Features

## Feature 1 — Authentication

### Requirements

* Login page
* JWT authentication
* Role-based access
* Logout
* Protected routes

Example:

```text
/login

        ↓

 ┌──────┼──────┐
 ↓      ↓      ↓
Admin  Mentor Student
```

No registration system is required for the MVP.

**Admin can create users.**

---

# 4. Division Management

Admin can:

* Create division
* View divisions
* Edit division
* Assign students to division
* Assign mentor to division

Example:

```text
Division A
   │
   └── Mentor: Rahul
        ├── Student 1
        ├── Student 2
        └── Student 3
```

This directly covers the submitted **division-wise mentor assignment** requirement. 

---

# 5. Mentor–Student Assignment

For the MVP, keep the relationship simple:

```text
Division
   ↓
Mentor
   ↓
Students
```

Admin can:

* Assign mentor to division
* View mentor's students
* Change mentor assignment

No complicated assignment-history system is required.

---

# 6. Student Feedback

Students can submit feedback.

### Feedback form

```text
Category:
[ Academic Experience ▼ ]

Rating:
★ ★ ★ ★ ★

Comments:
[________________________]

[Submit]
```

Categories:

* Academic Experience
* College Facilities
* Mentoring Experience
* General
* Suggestion

These reflect the types of information described in the submitted proposal. 

### Mentor

Can see feedback from their assigned students.

### Admin

Can see all feedback.

---

# 7. Mentor Satisfaction Survey

This is a separate simple survey because it is explicitly listed in your submitted functionality. 

Example:

```text
How satisfied are you with your mentor?

1   2   3   4   5

How helpful is your mentor?

1   2   3   4   5

Additional comments:
[______________________]

[Submit]
```

For the 5-day version, keep it **one fixed questionnaire**.

Do not build a dynamic survey builder.

---

# 8. Issue & Concern Reporting

Students can report problems.

### Form

```text
Title:
[________________]

Category:
[ Academic ▼ ]

Description:
[________________________]

Priority:
[ Medium ▼ ]

[Submit Issue]
```

Categories:

* Academic
* Facilities
* Mentoring
* Administrative
* Other

---

# 9. Issue Tracking

Every issue has a simple lifecycle:

```text
OPEN
 ↓
IN PROGRESS
 ↓
RESOLVED
```

Mentor can:

* View issue
* Change status
* Add action taken
* Add response

Student can:

* View issue
* View current status
* View mentor response

Admin can:

* View all issues

This covers the proposal's **Issue & Concern Reporting + Issue Tracking + Issue Resolution/Follow-up** workflow. 

---

# 10. Mentoring Sessions

Mentors can record a basic mentoring session.

### Form

```text
Student: Rahul

Date: 21/09/2026

Discussion:
[________________________]

Observation:
[________________________]

Action / Follow-up:
[________________________]

[Save Session]
```

Mentors can view previous sessions for their students.

No calendar integration.

No appointment system.

No real-time chat.

The submitted workflow specifically includes mentoring sessions and discussion followed by action and resolution. 

---

# 11. Dashboards

## Admin Dashboard

Keep this simple.

```text
┌──────────────┐ ┌──────────────┐
│ Students     │ │ Mentors      │
│     120      │ │      12      │
└──────────────┘ └──────────────┘

┌──────────────┐ ┌──────────────┐
│ Open Issues  │ │ Feedback     │
│      18      │ │     245      │
└──────────────┘ └──────────────┘
```

Then:

* Issues by category
* Issues by status
* Average satisfaction
* Feedback distribution

That's enough for the MVP's dashboard/analytics requirement. 

---

## Mentor Dashboard

```text
My Students       10
Open Issues        3
Pending Followups  2
Feedback          24
```

Plus:

* Student list
* Recent feedback
* Recent issues
* Mentoring sessions

---

## Student Dashboard

```text
My Mentor
Prof. Rahul

My Issues
2

My Feedback
5

Recent Session
21 Sept 2026
```

---

# 12. Database

Keep the database **small**.

### Tables

```text
users
divisions
mentor_assignments
feedback
satisfaction_surveys
issues
mentoring_sessions
```

That's it for the MVP.

We don't need:

```text
notifications
audit_logs
issue_history
documents
calendar_events
report_templates
```

unless the basic system is already finished.

---

# 13. Simplified Data Relationships

```text
                 USERS
             /     |     \
            /      |      \
         ADMIN   MENTOR   STUDENT
                    |
                    ↓
                DIVISION
                    |
                    ↓
               ASSIGNMENT
                    |
                    ↓
                 STUDENT
                /   |   \
               ↓    ↓    ↓
          FEEDBACK ISSUE SESSION
                     |
                     ↓
                  STATUS
```

---

# 14. API Structure

Keep APIs straightforward.

```text
/api/auth/login/

/api/users/
/api/divisions/
/api/assignments/

/api/feedback/
/api/surveys/

/api/issues/

/api/sessions/

/api/dashboard/
```

No GraphQL.

No WebSockets.

No microservices.

Just Django REST APIs.

---

# 15. React Pages

### Public

```text
/login
```

### Admin

```text
/admin/dashboard
/admin/users
/admin/divisions
/admin/assignments
/admin/feedback
/admin/issues
```

### Mentor

```text
/mentor/dashboard
/mentor/students
/mentor/feedback
/mentor/issues
/mentor/sessions
```

### Student

```text
/student/dashboard
/student/feedback
/student/survey
/student/issues
/student/sessions
```

That's roughly **15–16 screens**, but many can reuse components.

---

# 16. 4-Person Division

This is the important part.

## Person 1 — Authentication + Admin

### Backend

* User model/configuration
* JWT
* Permissions
* Admin APIs

### Frontend

* Login
* Admin dashboard
* User management

---

## Person 2 — Divisions + Assignments

### Backend

* Division APIs
* Mentor/student relationships
* Assignment APIs

### Frontend

* Division management
* Assignment management
* Mentor/student lists

---

## Person 3 — Feedback + Surveys

### Backend

* Feedback API
* Satisfaction survey API

### Frontend

* Student feedback form
* Satisfaction survey
* Mentor feedback view
* Admin feedback view

---

## Person 4 — Issues + Mentoring

### Backend

* Issue API
* Issue status
* Mentoring session API

### Frontend

* Issue reporting
* Issue management
* Mentoring session form
* Issue dashboard

---

# 17. Shared Work

Everyone should contribute to GitHub.

Each person owns a feature branch:

```text
main

├── feature/auth-admin
├── feature/divisions
├── feature/feedback
└── feature/issues
```

Everyone contributes to both:

```text
React
+
Django
+
PostgreSQL
```

where applicable.

---

# 18. 5-Day Schedule

## DAY 1 — Foundation

### Goal

Everyone can run the project.

* Create GitHub repository
* React setup
* Django setup
* PostgreSQL setup
* Connect frontend/backend
* Create database
* JWT authentication
* User roles
* Basic folder structure

**End of Day 1:**

```text
React ←→ Django ←→ PostgreSQL

Login works.
```

---

# DAY 2 — Management

### Person 1

Authentication + Admin

### Person 2

Divisions + assignments

### Person 3

Feedback backend/frontend skeleton

### Person 4

Issues backend/frontend skeleton

**End of Day 2:**

Admin should be able to:

```text
Login
 ↓
Create users
 ↓
Create division
 ↓
Assign mentor
```

---

# DAY 3 — Main Student Workflow

Complete:

```text
Student Login
      ↓
View Mentor
      ↓
Submit Feedback
      ↓
Submit Satisfaction Survey
      ↓
Report Issue
```

Mentor can:

```text
Login
 ↓
View students
 ↓
View feedback
 ↓
View issues
```

---

# DAY 4 — Mentor Workflow + Dashboard

Complete:

```text
Mentor
 ↓
Open Issue
 ↓
Add Action
 ↓
Update Status
 ↓
Record Mentoring Session
```

Then implement:

* Admin dashboard
* Mentor dashboard
* Student dashboard
* Basic charts/statistics

---

# DAY 5 — Integration & Demo

**NO NEW MAJOR FEATURES.**

Only:

* Fix integration bugs
* Fix authentication bugs
* Fix permissions
* UI cleanup
* Responsive layout
* Seed demo data
* Test every role
* Git merge
* README
* Screenshots
* Demo preparation

---

# 19. What We Are Explicitly NOT Building

This is the part that makes **5 days possible**.

### ❌ No

* Real-time chat
* Video calls
* AI
* Mobile app
* Email system
* Push notifications
* Calendar integration
* Dynamic survey builder
* Complex report generator
* PDF generation
* File management
* Microservices
* Advanced audit system
* Anonymous feedback initially
* Complicated assignment history

Anonymous feedback is listed as optional in your original proposal, so it can safely stay out of the first MVP. 

---

# 20. Final Demo Scenario

This is what you should be able to demonstrate at the end.

### Step 1 — Admin

```text
Login
 ↓
Create Division A
 ↓
Create Mentor
 ↓
Create Student
 ↓
Assign Mentor → Student
```

### Step 2 — Student

```text
Login
 ↓
See Mentor
 ↓
Submit Feedback
 ↓
Rate Mentor
 ↓
Report Academic Issue
```

### Step 3 — Mentor

```text
Login
 ↓
See Student
 ↓
See Feedback
 ↓
See Issue
 ↓
Record Mentoring Session
 ↓
Add Action Taken
 ↓
Mark Issue In Progress
```

### Step 4 — Student

```text
Login
 ↓
See Issue
 ↓
See Mentor Response
 ↓
See Resolved Status
```

### Step 5 — Admin

```text
Login
 ↓
Dashboard
 ↓
See:
  120 Students
  12 Mentors
  18 Issues
  245 Feedback Responses
  4.2/5 Satisfaction
```