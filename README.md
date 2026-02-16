# 🏢 Employee Management System

Full-Stack Onboarding & Visa Workflow Platform


## Overview

This project is a full-stack Employee / HR portal designed to manage the complete onboarding lifecycle of new hires, including:

* Secure invitation-based registration
* Onboarding form submission & HR review workflow
* Personal information management
* Visa document tracking (OPT workflow)
* Secure document upload & access control
* Role-based authorization (Employee / HR)

The system is built with a production-oriented architecture emphasizing:

* Secure authentication
* Proper data modeling
* Clean API design
* Role-based access control
* Cloud-based document storage

# System Architecture

## High-Level Architecture

```
Frontend (React + MUI)
        ↓
REST API (Express)
        ↓
MongoDB (Mongoose)
        ↓
AWS S3 (Document Storage)
```

# 🛠 Tech Stack

## Backend

* Node.js
* Express
* MongoDB
* Mongoose
* JWT (Access + Refresh Token rotation)
* HTTP-only cookies
* AWS S3 (Presigned URL upload)
* Nodemailer (Invite email)

## Frontend

* React
* TypeScript
* Material UI
* Axios
* Context API (Authentication)

# 🔐 Authentication & Security Design

## 1️⃣ Invitation-Based Registration

Employees cannot self-register.

HR:

* Generates a secure token
* Token expires in 3 hours
* Token is hashed before storing in DB
* Email sent with registration link

Registration validation flow:

```
Token → SHA256 → Compare with DB
Check:
  - Exists
  - Not expired
  - Not used
```

## 2️⃣ JWT + Refresh Token Rotation

### Access Token

* Short-lived (15 min default)
* Stored in memory
* Sent in Authorization header

### Refresh Token

* Long-lived (7 days default)
* Stored in HTTP-only cookie
* Hashed in DB
* Rotated on every refresh

This prevents:

* Token replay
* Token theft persistence

## 3️⃣ Role-Based Access Control

Middleware:

* `authMiddleware`
* `requireRole("hr")`

Ensures:

* Employees cannot access HR routes
* HR cannot access employee-only routes
* Documents are strictly owner-validated

# Data Modeling

## Core Entities

### User

* username
* email
* role
* profile (basic identity info)

### EmployeeProfile

* personal info
* address
* emergency contact
* employment info
* documents metadata

### OnboardingApplication

* user reference
* formData (Mixed)
* status
* HR feedback
* version tracking
* history array

### Document

* user
* type
* category
* status
* S3 URL
* audit trail

### RegistrationToken

* tokenHash
* expiresAt
* used flag

# Business Workflow

## 👩‍💼 Employee Flow

### 1. Registration

* Receives invite email
* Registers with token
* Account created

### 2. Login

* JWT issued
* Redirected to onboarding page

### 3. Onboarding Application

Status can be:

* never_submitted
* pending
* approved
* rejected

Rules:

* Pending → read-only
* Rejected → editable with feedback
* Approved → redirected to dashboard

### 4. Personal Information

Sections:

* Name
* Address
* Contact
* Employment
* Emergency
* Documents

Editable sections:

* Toggle edit mode
* Cancel / Save
* API patch per section

### 5. Visa Status Management (OPT)

Sequential document enforcement:

1. OPT Receipt
2. OPT EAD
3. I-983
4. I-20

Users cannot upload next document until previous is approved.

## 👨‍💼 HR Flow

### 1. Hiring Management

* Generate token
* Invite history
* Review onboarding applications
* Approve / Reject with feedback

### 2. Employee Profiles

* Aggregated employee view
* Alphabetical sorting
* Search by name

### 3. Visa Management

* In-progress list
* Approve / Reject documents
* Download documents
* See next required action

# ☁️ Document Upload Architecture

Secure upload process:

1. Frontend requests presigned URL
2. Backend validates:

   * Document type
   * Category
   * Ownership
3. Upload directly to S3
4. Confirm upload
5. DB record updated
6. Status = pending
7. HR reviews document

Security controls:

* S3 URL validation
* Owner check
* Approved documents cannot be overwritten
* Audit trail per document

# API Design

Example endpoints:

## Auth

```
POST /auth/login
POST /auth/register
GET  /auth/validate/:token
POST /auth/logout
POST /auth/refresh
```

## Employee

```
GET  /employee/me
PATCH /employee/me
```

## Onboarding

```
GET  /onboarding/me
POST /onboarding
GET  /hr/onboarding
POST /hr/onboarding/:id/review
```

## Uploads

```
POST /uploads/presign
POST /uploads/complete
POST /uploads/presign-get
```

# 🚀 Running the Project

## Backend

```
npm install
npm run dev
```

Runs at:

```
http://localhost:4000
```

## Frontend

```
npm install
npm run dev
```

Runs at:

```
http://localhost:5173
```