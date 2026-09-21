# MentorSync

> **Student Mentoring, Feedback & Support Platform**

MentorSync is a web-based mentoring and student support platform designed for educational institutions. It digitizes the mentor–mentee workflow by providing role-based dashboards for **Admins, Mentors, and Students**.

The platform allows administrators to manage users and divisions, mentors to manage their assigned students and mentoring activities, and students to submit feedback, satisfaction surveys, and issues.

---

## 🚀 Features

### 👨‍💼 Admin

* Secure login with role-based access
* Manage students and mentors
* Create and manage divisions
* Assign mentors to divisions/students
* View student feedback
* View reported issues
* Monitor basic platform analytics
* View overall satisfaction statistics

### 👨‍🏫 Mentor

* Secure mentor login
* View assigned students
* View student feedback
* View mentor satisfaction responses
* View reported issues
* Record mentoring sessions
* Update issue status
* Add action taken and follow-up information

### 🎓 Student

* Secure student login
* View assigned mentor
* Submit feedback
* Rate mentoring experience
* Submit mentor satisfaction survey
* Report academic or other concerns
* Track submitted issues
* View mentor responses and issue status

---

## 🛠️ Tech Stack

| Layer           | Technology            |
| --------------- | --------------------- |
| Frontend        | React.js              |
| Backend         | Django                |
| API             | Django REST Framework |
| Database        | PostgreSQL            |
| Authentication  | JWT                   |
| Version Control | Git & GitHub          |

The MVP intentionally uses a straightforward architecture without microservices, WebSockets, GraphQL, or unnecessary infrastructure.

---

## 🏗️ System Architecture

```text
                  ┌─────────────────┐
                  │   React.js      │
                  │    Frontend     │
                  └────────┬────────┘
                           │
                           │ REST API
                           ▼
                  ┌─────────────────┐
                  │     Django      │
                  │      + DRF      │
                  └────────┬────────┘
                           │
                           │ ORM
                           ▼
                  ┌─────────────────┐
                  │   PostgreSQL    │
                  │    Database     │
                  └─────────────────┘
```

Authentication and authorization are handled through JWT and role-based permissions.

---

## 👥 User Roles

MentorSync has three primary roles:

```text
                    MentorSync
                        │
          ┌─────────────┼─────────────┐
          │             │             │
        Admin         Mentor        Student
          │             │             │
     Management     Mentoring      Feedback
     Analytics      Sessions       Surveys
     Assignments    Issues         Issues
```

---

## 🔑 Core Modules

### 1. Authentication

* JWT-based authentication
* Login/logout
* Protected routes
* Role-based authorization
* Admin-created user accounts

```text
/login
   │
   ├── Admin
   ├── Mentor
   └── Student
```

---

### 2. Division & Assignment Management

Administrators can create divisions and assign mentors.

```text
Division
   │
   └── Mentor
        │
        ├── Student 1
        ├── Student 2
        └── Student 3
```

This keeps mentor–student relationships simple and manageable.

---

### 3. Student Feedback

Students can submit feedback using categories such as:

* Academic Experience
* College Facilities
* Mentoring Experience
* General
* Suggestion

Each feedback entry can contain a rating and comments.

---

### 4. Mentor Satisfaction Survey

Students can rate their mentoring experience through a fixed questionnaire.

Example:

```text
How satisfied are you with your mentor?
⭐ ⭐ ⭐ ⭐ ⭐

How helpful is your mentor?
⭐ ⭐ ⭐ ⭐ ⭐

Additional Comments:
[________________________]
```

---

### 5. Issue & Concern Reporting

Students can report concerns through a structured form.

Supported categories include:

* Academic
* Facilities
* Mentoring
* Administrative
* Other

Each issue contains information such as:

```text
Title
Category
Description
Priority
Status
Response
Action Taken
```

---

### 6. Issue Tracking

Issues follow a simple lifecycle:

```text
OPEN
  │
  ▼
IN PROGRESS
  │
  ▼
RESOLVED
```

Mentors can update the issue status and add responses/action taken.

Students can track the status of their submitted issues.

---

### 7. Mentoring Sessions

Mentors can record mentoring sessions for assigned students.

A session contains:

* Student
* Date
* Discussion
* Observation
* Action / Follow-up

Example:

```text
Student: Rahul
Date: 21/09/2026

Discussion:
Academic performance and upcoming exams.

Observation:
Student needs improvement in preparation.

Action / Follow-up:
Schedule follow-up discussion next week.
```

---

## 📊 Dashboards

### Admin Dashboard

Provides an overview of the mentoring system.

```text
┌──────────────────┐  ┌──────────────────┐
│ Students         │  │ Mentors          │
│      120         │  │       12         │
└──────────────────┘  └──────────────────┘

┌──────────────────┐  ┌──────────────────┐
│ Open Issues      │  │ Feedback         │
│       18         │  │      245         │
└──────────────────┘  └──────────────────┘
```

Additional analytics:

* Issues by category
* Issues by status
* Average satisfaction
* Feedback distribution

### Mentor Dashboard

Displays:

* Assigned students
* Open issues
* Pending follow-ups
* Feedback
* Recent mentoring sessions

### Student Dashboard

Displays:

* Assigned mentor
* Submitted issues
* Submitted feedback
* Recent mentoring sessions
* Issue status

---

## 🗄️ Database Structure

The MVP uses the following primary tables:

```text
users
   │
   ├── divisions
   │
   ├── mentor_assignments
   │
   ├── feedback
   │
   ├── satisfaction_surveys
   │
   ├── issues
   │
   └── mentoring_sessions
```

### Main Relationships

```text
Users
  │
  ├── Admin
  ├── Mentor
  └── Student
        │
        ▼
     Division
        │
        ▼
Mentor Assignment
        │
        ▼
     Student
      / | \
     /  |  \
 Feedback Issues Sessions
```

---

## 🔌 API Structure

The backend exposes REST APIs through Django REST Framework.

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

---

## 📁 Frontend Routes

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

---

## ⚙️ Getting Started

### Prerequisites

Make sure you have installed:

* Node.js
* Python 3.x
* PostgreSQL
* Git

---

### 1. Clone the Repository

```bash
git clone <repository-url>
cd MentorSync
```

---

### 2. Backend Setup

```bash
cd backend

python -m venv venv
```

Activate the virtual environment.

**Windows:**

```bash
venv\Scripts\activate
```

**Linux/macOS:**

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

---

### 3. Configure Environment Variables

Create a `.env` file:

```env
SECRET_KEY=your_secret_key

DEBUG=True

DB_NAME=mentorsync
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432

JWT_SECRET_KEY=your_jwt_secret
```

---

### 4. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE mentorsync;
```

Run migrations:

```bash
python manage.py makemigrations
python manage.py migrate
```

---

### 5. Create Admin User

```bash
python manage.py createsuperuser
```

---

### 6. Start Backend

```bash
python manage.py runserver
```

Backend will run on:

```text
http://127.0.0.1:8000
```

---

### 7. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will run on the URL displayed by Vite.

---

## 🔐 Authentication Flow

```text
User
 │
 ▼
Login
 │
 ▼
Django Authentication
 │
 ▼
JWT Token
 │
 ▼
Role Verification
 │
 ├───────────┬────────────┐
 ▼           ▼            ▼
Admin      Mentor       Student
```

Protected API requests include the JWT token:

```http
Authorization: Bearer <access_token>
```

---

## 🔄 Example User Workflow

### Admin

```text
Login
  ↓
Create Division
  ↓
Create Mentor
  ↓
Create Student
  ↓
Assign Mentor → Student
  ↓
Monitor Dashboard
```

### Student

```text
Login
  ↓
View Mentor
  ↓
Submit Feedback
  ↓
Rate Mentor
  ↓
Report Issue
```

### Mentor

```text
Login
  ↓
View Students
  ↓
View Feedback
  ↓
View Issues
  ↓
Record Mentoring Session
  ↓
Add Action Taken
  ↓
Update Issue Status
```

### Student Follow-up

```text
Login
  ↓
View Issue
  ↓
View Mentor Response
  ↓
Track Status
```

---

## 🌿 Git Workflow

Each developer works on a dedicated feature branch.

```text
main
 │
 ├── feature/auth-admin
 ├── feature/divisions
 ├── feature/feedback
 └── feature/issues
```

Recommended workflow:

```bash
git checkout -b feature/your-feature

git add .

git commit -m "Add feature"

git push origin feature/your-feature
```

Create a Pull Request and merge into `main` after review.

---

## 📅 Development Plan

The project is designed as a **5-day MVP**.

### Day 1 — Foundation

* React setup
* Django setup
* PostgreSQL setup
* Frontend/backend connection
* JWT authentication
* User roles
* Basic project structure

### Day 2 — Management

* User management
* Division management
* Mentor assignments
* Feedback/issue foundations

### Day 3 — Student Workflow

* Student dashboard
* Mentor viewing
* Feedback submission
* Satisfaction survey
* Issue reporting

### Day 4 — Mentor Workflow & Dashboards

* Mentor dashboard
* Issue management
* Mentoring sessions
* Admin dashboard
* Basic analytics

### Day 5 — Integration & Demo

* Bug fixes
* Permission testing
* UI cleanup
* Responsive design
* Demo data
* Integration testing
* Documentation
* Demo preparation

The final day is intentionally reserved for integration and stabilization rather than adding major functionality.

---

## 🚫 Out of Scope

To keep the MVP achievable within five days, the following are intentionally excluded:

* Real-time chat
* Video calls
* AI features
* Mobile application
* Email system
* Push notifications
* Calendar integration
* Dynamic survey builder
* Complex report generator
* PDF generation
* File management
* Microservices
* Advanced audit system
* Complex assignment history
* Anonymous feedback in the initial MVP

These exclusions are part of the MVP scope rather than missing functionality.

---

## 🎯 Final MVP Goal

MentorSync should provide a complete basic mentoring workflow:

```text
                    ┌──────────────┐
                    │    ADMIN     │
                    └──────┬───────┘
                           │
                 Manage & Assign
                           │
                           ▼
                    ┌──────────────┐
                    │    MENTOR    │
                    └──────┬───────┘
                           │
                    Mentoring
                    Sessions
                           │
                           ▼
                    ┌──────────────┐
                    │   STUDENT    │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
          Feedback      Survey       Issues
              │            │            │
              └────────────┼────────────┘
                           ▼
                    Mentor Response
                           │
                           ▼
                     Issue Resolution
```

MentorSync provides a centralized system for **student mentoring, feedback collection, satisfaction measurement, issue tracking, and mentoring session management**.
