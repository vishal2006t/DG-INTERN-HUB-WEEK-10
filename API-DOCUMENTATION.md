# DG Interns Hub - REST API Documentation (Week 8)

Welcome to the official REST API documentation for the **DG Interns Hub Backend Application**. This production-grade API powers user authentication, role-based workflows, internship listing exploration, search, filtering, pagination, sorting, and end-to-end application tracking.

---

## 📋 Overview & Architecture

- **Base URL**: `http://localhost:5000/api`
- **Authentication**: JSON Web Token (JWT) transmitted via HTTP header:  
  `Authorization: Bearer <your_jwt_token>`
- **Response Format**: Strict JSON format with consistent envelope:
  ```json
  // Success
  {
    "success": true,
    "message": "Operation successful description",
    "data": { ... }
  }

  // Error
  {
    "success": false,
    "message": "Specific error description"
  }
  ```
- **Security & Protection**:
  - Helmet security headers
  - Global IP Rate Limiting (300 requests / 15 mins) & Auth Limiting (50 requests / 15 mins)
  - CORS origin controls
  - Request body payload limiting (`15kb`)
  - NoSQL query sanitization
  - Role-based authorization (`candidate`, `recruiter`, `admin`)
  - Bcrypt password hashing (10 salt rounds)

---

## 📑 Table of Endpoints

1. [Authentication Endpoints](#1-authentication-endpoints)
   - `POST /api/auth/register`
   - `POST /api/auth/login`
   - `GET /api/auth/me`
   - `POST /api/auth/logout`
2. [User Endpoints](#2-user-endpoints)
   - `GET /api/users/profile`
   - `PUT /api/users/profile`
   - `DELETE /api/users/profile`
3. [Job & Internship Endpoints](#3-job--internship-endpoints)
   - `GET /api/jobs` (Search, Filters, Pagination, Sorting)
   - `GET /api/jobs/:id`
   - `POST /api/jobs`
   - `PUT /api/jobs/:id`
   - `DELETE /api/jobs/:id`
4. [Application Endpoints](#4-application-endpoints)
   - `POST /api/applications`
   - `GET /api/applications/my`
   - `GET /api/applications/:id`
   - `PUT /api/applications/:id/status`
   - `DELETE /api/applications/:id`
5. [System Health Check](#5-system-health-check)
   - `GET /api/health`

---

## 1. Authentication Endpoints

### 1.1 Register User
- **Endpoint**: `/api/auth/register`
- **Method**: `POST`
- **Purpose**: Creates a new user account with hashed password and generates an initial JWT.
- **Authentication**: None (Public)
- **Required Role**: None (can specify role: `candidate` or `recruiter`, defaults to `candidate`)
- **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "password": "Password123!",
    "role": "candidate",
    "phone": "+91 98765 43210"
  }
  ```
- **Example Request**:
  ```bash
  curl -X POST http://localhost:5000/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"name":"Jane Doe","email":"jane.doe@example.com","password":"Password123!","role":"candidate"}'
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "user": {
        "id": "67a4561234bc5678ef901234",
        "name": "Jane Doe",
        "email": "jane.doe@example.com",
        "role": "candidate",
        "phone": "+91 98765 43210",
        "createdAt": "2026-10-08T10:00:00.000Z"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```
- **Error Response (409 Conflict / 400 Bad Request)**:
  ```json
  {
    "success": false,
    "message": "An account with this email address already exists"
  }
  ```

---

### 1.2 User Login
- **Endpoint**: `/api/auth/login`
- **Method**: `POST`
- **Purpose**: Authenticates user credentials and issues a JWT token.
- **Authentication**: None (Public)
- **Required Role**: None
- **Request Body**:
  ```json
  {
    "email": "jane.doe@example.com",
    "password": "Password123!"
  }
  ```
- **Example Request**:
  ```bash
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"jane.doe@example.com","password":"Password123!"}'
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "user": {
        "id": "67a4561234bc5678ef901234",
        "name": "Jane Doe",
        "email": "jane.doe@example.com",
        "role": "candidate"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```
- **Error Response (401 Unauthorized)**:
  ```json
  {
    "success": false,
    "message": "Invalid email or password"
  }
  ```

---

### 1.3 Get Current User (Me)
- **Endpoint**: `/api/auth/me`
- **Method**: `GET`
- **Purpose**: Retrieves currently authenticated user session details from token.
- **Authentication**: Required (`Bearer <token>`)
- **Required Role**: Any authenticated user
- **Example Request**:
  ```bash
  curl -X GET http://localhost:5000/api/auth/me \
    -H "Authorization: Bearer <your_jwt_token>"
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Current user retrieved successfully",
    "data": {
      "user": {
        "_id": "67a4561234bc5678ef901234",
        "name": "Jane Doe",
        "email": "jane.doe@example.com",
        "role": "candidate",
        "phone": "+91 98765 43210",
        "skills": ["React", "JavaScript"]
      }
    }
  }
  ```
- **Error Response (401 Unauthorized)**:
  ```json
  {
    "success": false,
    "message": "Authentication required"
  }
  ```

---

### 1.4 Logout
- **Endpoint**: `/api/auth/logout`
- **Method**: `POST`
- **Purpose**: Logs out the client session.
- **Authentication**: Optional
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```

---

## 2. User Endpoints

### 2.1 Get User Profile
- **Endpoint**: `/api/users/profile`
- **Method**: `GET`
- **Purpose**: Retrieves the detailed profile of the authenticated user.
- **Authentication**: Required (`Bearer <token>`)
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Profile fetched successfully",
    "data": {
      "user": {
        "_id": "67a4561234bc5678ef901234",
        "name": "Jane Doe",
        "email": "jane.doe@example.com",
        "role": "candidate",
        "phone": "+91 98765 43210",
        "bio": "Enthusiastic CS student",
        "skills": ["React", "CSS", "Node.js"]
      }
    }
  }
  ```

### 2.2 Update User Profile
- **Endpoint**: `/api/users/profile`
- **Method**: `PUT`
- **Purpose**: Modifies user profile fields (bio, skills, phone, companyName, password).
- **Authentication**: Required (`Bearer <token>`)
- **Request Body**:
  ```json
  {
    "bio": "Full stack enthusiast with focus on React and Node.js",
    "skills": ["React", "Node.js", "MongoDB", "Express"],
    "phone": "+91 99999 88888"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Profile updated successfully",
    "data": {
      "user": {
        "id": "67a4561234bc5678ef901234",
        "name": "Jane Doe",
        "email": "jane.doe@example.com",
        "role": "candidate",
        "phone": "+91 99999 88888",
        "bio": "Full stack enthusiast with focus on React and Node.js",
        "skills": ["React", "Node.js", "MongoDB", "Express"]
      }
    }
  }
  ```

### 2.3 Delete User Profile
- **Endpoint**: `/api/users/profile`
- **Method**: `DELETE`
- **Purpose**: Deletes the user account and associated applications.
- **Authentication**: Required (`Bearer <token>`)
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "User profile and related records deleted successfully"
  }
  ```

---

## 3. Job & Internship Endpoints

### 3.1 Get All Jobs (Search, Filter, Pagination, Sorting)
- **Endpoint**: `/api/jobs`
- **Method**: `GET`
- **Purpose**: Returns paginated list of job and internship listings matching query parameters.
- **Authentication**: Public
- **Query Parameters**:
  | Parameter | Type | Description | Example |
  | :--- | :--- | :--- | :--- |
  | `search` | String | Keyword query matched across title, company, skills, location, description | `?search=react` |
  | `type` | String | Employment type (`internship`, `full-time`, `part-time`) | `?type=internship` |
  | `location` | String | Location substring filter | `?location=remote` |
  | `skill` | String | Specific required technology/skill | `?skill=javascript` |
  | `category` | String | Category category filter (e.g. `Web Development`, `Python & AI`) | `?category=Web%20Development` |
  | `workType` | String | Mode of work (`Remote`, `Hybrid`, `On-site`) | `?workType=Remote` |
  | `sort` | String | Sorting criteria: `newest` (default), `oldest`, `deadline`, `stipend-high` | `?sort=newest` |
  | `page` | Number | Page number (default: `1`) | `?page=1` |
  | `limit` | Number | Items per page (default: `10`, max safe limit: `100`) | `?limit=10` |

- **Combined Query Example**:
  ```bash
  curl -X GET "http://localhost:5000/api/jobs?type=internship&location=remote&skill=react&page=1&limit=10&sort=newest"
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "page": 1,
    "limit": 10,
    "total": 6,
    "totalPages": 1,
    "data": [
      {
        "_id": "67a4561234bc5678ef909999",
        "title": "Web Development Intern",
        "company": "Nexora Cloud Solutions",
        "location": "Remote (India)",
        "workType": "Remote",
        "type": "internship",
        "category": "Web Development",
        "duration": "3 Months",
        "stipend": "₹18,000 / month",
        "stipendAmount": 18000,
        "skills": ["HTML5", "CSS3", "JavaScript", "Responsive Design", "Git", "REST APIs"],
        "description": "Build modern, accessible web interfaces...",
        "openings": 3,
        "applicantsCount": 64,
        "featured": true,
        "slug": "web-development-intern",
        "createdAt": "2026-10-08T09:00:00.000Z"
      }
    ]
  }
  ```

---

### 3.2 Get Single Job By ID or Slug
- **Endpoint**: `/api/jobs/:id`
- **Method**: `GET`
- **Purpose**: Retrieves comprehensive specifications for a job by MongoDB ObjectId or custom slug (e.g. `web-development-intern`).
- **Authentication**: Public
- **Example Request**:
  ```bash
  curl -X GET http://localhost:5000/api/jobs/web-development-intern
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Job fetched successfully",
    "data": {
      "_id": "67a4561234bc5678ef909999",
      "title": "Web Development Intern",
      "company": "Nexora Cloud Solutions",
      "location": "Remote (India)",
      "workType": "Remote",
      "category": "Web Development",
      "stipend": "₹18,000 / month",
      "skills": ["HTML5", "CSS3", "JavaScript", "Git"],
      "responsibilities": [...],
      "requirements": [...],
      "learning": [...],
      "benefits": [...]
    }
  }
  ```
- **Error Response (404 Not Found)**:
  ```json
  {
    "success": false,
    "message": "Job not found"
  }
  ```

---

### 3.3 Create New Job
- **Endpoint**: `/api/jobs`
- **Method**: `POST`
- **Purpose**: Creates a new job posting.
- **Authentication**: Required (`Bearer <token>`)
- **Required Role**: `recruiter` or `admin`
- **Request Body**:
  ```json
  {
    "title": "Backend Node.js Intern",
    "company": "Nexora Cloud Solutions",
    "location": "Remote",
    "workType": "Remote",
    "type": "internship",
    "category": "Full Stack Development",
    "duration": "3 Months",
    "stipend": "₹20,000 / month",
    "stipendAmount": 20000,
    "skills": ["Node.js", "Express", "MongoDB", "REST APIs"],
    "description": "Design and build scalable RESTful microservices...",
    "openings": 2,
    "featured": true
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Job created successfully",
    "data": {
      "_id": "67a4561234bc5678ef908888",
      "title": "Backend Node.js Intern",
      "company": "Nexora Cloud Solutions",
      "postedBy": "67a4561234bc5678ef901234",
      "status": "open"
    }
  }
  ```
- **Error Response (403 Forbidden)**:
  ```json
  {
    "success": false,
    "message": "Access denied: role 'candidate' is not authorized to access this resource"
  }
  ```

---

### 3.4 Update Job
- **Endpoint**: `/api/jobs/:id`
- **Method**: `PUT`
- **Purpose**: Updates an existing job posting.
- **Authentication**: Required (`Bearer <token>`)
- **Required Role**: Job owner (`recruiter`) or `admin`
- **Request Body**:
  ```json
  {
    "openings": 5,
    "stipend": "₹22,000 / month"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Job updated successfully",
    "data": { ... }
  }
  ```

---

### 3.5 Delete Job
- **Endpoint**: `/api/jobs/:id`
- **Method**: `DELETE`
- **Purpose**: Deletes a job posting and its related applications.
- **Authentication**: Required (`Bearer <token>`)
- **Required Role**: Job owner (`recruiter`) or `admin`
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Job deleted successfully"
  }
  ```

---

## 4. Application Endpoints

### 4.1 Apply for a Job
- **Endpoint**: `/api/applications`
- **Method**: `POST`
- **Purpose**: Submits an application for a specific job/internship. Automatically prevents duplicate applications by the same user for the same job.
- **Authentication**: Required (`Bearer <token>`)
- **Required Role**: `candidate` or `admin`
- **Request Body**:
  ```json
  {
    "jobId": "67a4561234bc5678ef909999",
    "fullName": "Jane Doe",
    "email": "jane.doe@example.com",
    "phone": "+91 98765 43210",
    "whyInterested": "I have solid foundation in React and want to learn enterprise workflows.",
    "resumeFileName": "Jane_Doe_Resume.pdf"
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Application submitted successfully",
    "data": {
      "_id": "67a4561234bc5678ef907777",
      "job": {
        "title": "Web Development Intern",
        "company": "Nexora Cloud Solutions"
      },
      "status": "pending",
      "fullName": "Jane Doe",
      "createdAt": "2026-10-08T10:15:00.000Z"
    }
  }
  ```
- **Error Response (409 Conflict - Duplicate)**:
  ```json
  {
    "success": false,
    "message": "You have already submitted an application for this position"
  }
  ```

---

### 4.2 Get My Applications
- **Endpoint**: `/api/applications/my`
- **Method**: `GET`
- **Purpose**: Retrieves all applications submitted by the logged-in candidate with populated job info.
- **Authentication**: Required (`Bearer <token>`)
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Applications retrieved successfully",
    "data": [
      {
        "_id": "67a4561234bc5678ef907777",
        "job": {
          "title": "Web Development Intern",
          "company": "Nexora Cloud Solutions",
          "location": "Remote",
          "stipend": "₹18,000 / month"
        },
        "status": "pending",
        "createdAt": "2026-10-08T10:15:00.000Z"
      }
    ]
  }
  ```

---

### 4.3 Get Application By ID
- **Endpoint**: `/api/applications/:id`
- **Method**: `GET`
- **Purpose**: Returns single application details.
- **Authentication**: Required (`Bearer <token>`)
- **Required Role**: Applicant (`candidate`), Job Poster (`recruiter`), or `admin`
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Application retrieved successfully",
    "data": { ... }
  }
  ```

---

### 4.4 Update Application Status
- **Endpoint**: `/api/applications/:id/status`
- **Method**: `PUT`
- **Purpose**: Updates an applicant's evaluation status.
- **Authentication**: Required (`Bearer <token>`)
- **Required Role**: Job owner (`recruiter`) or `admin`
- **Request Body**:
  ```json
  {
    "status": "shortlisted",
    "notes": "Selected for interview stage 1."
  }
  ```
  *(Valid status values: `pending`, `reviewed`, `shortlisted`, `rejected`, `accepted`)*
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Application status updated to shortlisted",
    "data": { ... }
  }
  ```

---

### 4.5 Delete Application
- **Endpoint**: `/api/applications/:id`
- **Method**: `DELETE`
- **Purpose**: Withdraws or deletes an application.
- **Authentication**: Required (`Bearer <token>`)
- **Required Role**: Applicant (`candidate`), Job Poster (`recruiter`), or `admin`
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Application removed successfully"
  }
  ```

---

## 5. System Health Check

### 5.1 Health Check
- **Endpoint**: `/api/health`
- **Method**: `GET`
- **Purpose**: Quick diagnostics to verify backend server status.
- **Authentication**: Public
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "DG Interns Hub Backend API is running smoothly",
    "timestamp": "2026-10-08T10:30:00.000Z",
    "environment": "development"
  }
  ```
