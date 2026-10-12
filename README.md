# DG Interns Hub - Full Stack Internship & Job Portal (Week 8)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.x-lightgrey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%209.x-brightgreen.svg)](https://www.mongodb.com/)
[![React](https://img.shields.io/badge/React-19.x-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.x-purple.svg)](https://vitejs.dev/)

A professional, production-ready Full-Stack Job & Internship Portal engineered for the **DG Interns Hub Advanced Web Application Internship (Week 8)**. This milestone elevates the Week 7 frontend interface into a complete full-stack web application featuring a robust REST API backend, secure role-based authentication, database indexing, query sanitization, and automated data seeding.

---

## 🎯 Week 8 Objectives & Highlights

- **Backend Architecture**: Structured Express.js backend with separated MVC pattern (`config/`, `controllers/`, `models/`, `routes/`, `middleware/`, `validators/`, `utils/`).
- **Database Modeling**: Production Mongoose schemas for `User`, `Job`, and `Application` with relational references, indexes, and duplicate prevention.
- **Role-Based Access Control (RBAC)**: Support for three distinct user roles:
  - `candidate`: Browse opportunities, filter/search/sort, apply, track status in "My Applications", withdraw applications.
  - `recruiter`: Create jobs, update and delete own listings, view applicants, review & update application statuses.
  - `admin`: Universal permissions across all jobs, applications, and user accounts.
- **Authentication**: Stateless JSON Web Token (JWT) workflow paired with bcrypt password hashing and token verification middleware.
- **Advanced Query Features**: Multi-criteria search, category & work-mode filtering, sorting (newest, oldest, deadline, stipend), and paginated responses with metadata.
- **Enterprise Security**: Helmet HTTP headers, IP rate limiting, brute-force auth rate limiting, request payload limits, NoSQL injection protection, and sanitized error responses.
- **Seamless UI Integration**: Full connection between the existing Week 7 React UI and the new REST APIs, including interactive 1-click demo logins and modal dashboards.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Backend Runtime** | Node.js (v20+), Express.js |
| **Database & ODM** | MongoDB, Mongoose ODM |
| **Authentication & Crypto** | JSON Web Tokens (`jsonwebtoken`), `bcryptjs` |
| **Security & Middleware** | `helmet`, `cors`, `express-rate-limit`, parameter sanitization |
| **Frontend Framework** | React 19, React Router DOM, Vite |
| **Icons & Styling** | Lucide React, Modern CSS Design System |
| **API Testing & Tools** | Postman Collection v2.1.0, Oxlint |

---

## 📂 Project Structure

```
.
├── server/                                # Advanced Week 8 Backend
│   ├── config/
│   │   └── database.js                    # MongoDB connection with dev fallback
│   ├── controllers/
│   │   ├── authController.js              # Register, Login, Me, Logout
│   │   ├── jobController.js               # CRUD, Search, Filter, Pagination, Sort
│   │   ├── applicationController.js       # Apply, Track, Status Update, Withdraw
│   │   └── userController.js              # Profile view, update, delete
│   ├── models/
│   │   ├── User.js                        # User schema with bcrypt hooks & roles
│   │   ├── Job.js                         # Job schema with text & compound indexes
│   │   └── Application.js                 # Application schema with unique constraint
│   ├── routes/
│   │   ├── authRoutes.js                  # /api/auth endpoints
│   │   ├── jobRoutes.js                   # /api/jobs endpoints
│   │   ├── applicationRoutes.js           # /api/applications endpoints
│   │   └── userRoutes.js                  # /api/users endpoints
│   ├── middleware/
│   │   ├── authMiddleware.js              # JWT verification
│   │   ├── roleMiddleware.js              # Role-based authorization
│   │   ├── errorMiddleware.js             # Centralized error handler (no stack leaks)
│   │   └── validationMiddleware.js        # Request body & ObjectId validation
│   ├── validators/
│   │   ├── authValidator.js               # Email/password validation
│   │   ├── jobValidator.js                # Job payload validation
│   │   └── applicationValidator.js        # Application payload validation
│   ├── utils/
│   │   ├── helpers.js                     # Standard response helpers & sanitizers
│   │   └── seeder.js                      # Auto-seeder for demo users & verified jobs
│   └── server.js                          # Express app entry point & security setup
│
├── postman/
│   └── DG-Interns-Hub-API.json            # Complete Postman Collection (v2.1.0)
│
├── src/                                   # Week 7 Preserved Frontend + Week 8 Integration
│   ├── components/
│   │   ├── AuthModal.jsx                  # Sign In / Register Modal + 1-Click Demo Login
│   │   ├── MyApplicationsModal.jsx        # Candidate application status tracker
│   │   ├── PostJobModal.jsx               # Recruiter internship posting modal
│   │   ├── ApplicationForm.jsx            # Connected API application submission
│   │   ├── Navbar.jsx                     # Navbar with RBAC badge & user actions
│   │   ├── JobCard.jsx                    # Internship card display
│   │   └── ...
│   ├── context/
│   │   └── AuthContext.jsx                # Global Auth state & token storage
│   ├── services/
│   │   └── api.js                         # REST client wrapper with fallback
│   ├── pages/
│   │   ├── Home.jsx                       # Hero, featured listings, stats
│   │   ├── Jobs.jsx                       # Connected to /api/jobs with pagination
│   │   ├── JobDetailsPage.jsx             # Dynamic /api/jobs/:id details
│   │   └── Contact.jsx                    # Contact page
│   └── data/
│       └── jobs.js                        # Verified seed data
│
├── API-DOCUMENTATION.md                   # Complete REST API reference manual
├── .env.example                           # Sample environment configuration
├── .gitignore                             # Git exclusion rules
├── package.json                           # Dependencies & npm scripts
└── README.md                              # Project documentation
```

---

## ⚡ Quick Start & Installation

### 1. Prerequisites
- **Node.js**: `v18` or `v20+` installed
- **npm**: `v9+` or `v10+` installed
- **MongoDB**: Local MongoDB instance running on `mongodb://127.0.0.1:27017` or MongoDB Atlas cloud URI

### 2. Clone and Install Dependencies
```bash
# Clone the repository
git clone https://github.com/vishal2006t/DG-INTERN-HUB-WEEK-8.git
cd DG-INTERN-HUB-WEEK-8

# Install all dependencies (Frontend + Backend)
npm install
```

### 3. Environment Configuration
Create a `.env` file in the project root based on `.env.example`:
```bash
cp .env.example .env
```

Ensure your `.env` contains:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/dg_interns_hub
JWT_SECRET=super_secret_jwt_key_dg_interns_hub_development_2026
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```
> **Note**: `.env` is ignored by Git to safeguard private keys and credentials.

---

## 🚀 Running the Project

### Option A: Run Both Frontend and Backend Concurrently (Recommended)
```bash
npm run dev:all
```
- Backend starts at: `http://localhost:5000`
- Frontend starts at: `http://localhost:5173`

### Option B: Run Backend Separately
```bash
# Start backend server
npm run server

# Or run with automatic reload during development
npm run server:watch
```

### Option C: Run Frontend Separately
```bash
npm run dev
```

---

## 🔐 Default Demo Accounts (Auto-Seeded)

When the backend starts for the first time, default accounts and 6+ verified internship opportunities are seeded into MongoDB:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Candidate** | `candidate@example.com` | `CandidatePassword123!` | Apply to jobs, track & withdraw applications |
| **Recruiter** | `recruiter@nexoracloud.com` | `RecruiterPassword123!` | Create, update, delete jobs; manage applicant status |
| **Admin** | `admin@dginternshub.com` | `AdminPassword123!` | Full unrestricted access to all entities |

> **Pro Tip**: In the web UI, click **Sign In** to access 1-Click quick login buttons for all three roles!

---

## 📡 REST API Overview

All responses return standard envelopes:
- Success: `{ "success": true, "message": "...", "data": ... }`
- Error: `{ "success": false, "message": "..." }`

### Authentication APIs
- `POST /api/auth/register` - Create account (Candidate or Recruiter)
- `POST /api/auth/login` - Authenticate & obtain JWT
- `GET /api/auth/me` - Fetch authenticated user details
- `POST /api/auth/logout` - Invalidate client session

### User APIs
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update bio, skills, contact info, password
- `DELETE /api/users/profile` - Delete profile & related applications

### Job & Internship APIs
- `GET /api/jobs` - List jobs with search, category/mode filters, pagination, and sorting
- `GET /api/jobs/:id` - View single job by ObjectId or custom slug
- `POST /api/jobs` - Create job *(Recruiter / Admin only)*
- `PUT /api/jobs/:id` - Update job *(Poster / Admin only)*
- `DELETE /api/jobs/:id` - Delete job *(Poster / Admin only)*

### Application APIs
- `POST /api/applications` - Submit application *(Duplicate prevention enforced)*
- `GET /api/applications/my` - View current candidate's applications
- `GET /api/applications/:id` - Inspect application *(Candidate, Poster, Admin)*
- `PUT /api/applications/:id/status` - Update status to `reviewed`, `shortlisted`, `accepted`, `rejected` *(Poster / Admin)*
- `DELETE /api/applications/:id` - Withdraw application

> For the exhaustive endpoint documentation with curl examples, request bodies, and parameter tables, please see [API-DOCUMENTATION.md](file:///d:/DG%20INTERNS%20HUB/WEEK%208/WEB/API-DOCUMENTATION.md).

---

## 🛡️ Security Implementation

1. **JSON Web Token (JWT)**: Cryptographically signed tokens expiring in 7 days, verified on all protected routes.
2. **Password Protection**: One-way bcrypt salt-and-hash algorithm prevents plaintext credential exposure.
3. **Role-Based Guards**: Strict middleware checks prevent unauthorized privilege escalation (e.g., candidate attempting to create jobs).
4. **Helmet Security Headers**: Shields against common HTTP vulnerabilities (XSS, clickjacking, MIME-sniffing).
5. **Rate Limiting**:
   - General API limiter: Max 300 requests / 15 minutes per IP.
   - Authentication limiter: Max 50 requests / 15 minutes per IP to block brute-force attempts.
6. **Query & Input Sanitization**: Rejects prohibited MongoDB operators (`$` and `.`) in user parameters to prevent NoSQL injection.
7. **Safe Error Handling**: Never leaks stack traces, internal server filepaths, or database connection details to clients.
8. **Body Size Limits**: JSON parsing capped at `15kb` to prevent Denial of Service (DoS) attacks via oversized payloads.

---

## 📬 Postman Testing

A comprehensive Postman collection is included in [postman/DG-Interns-Hub-API.json](file:///d:/DG%20INTERNS%20HUB/WEEK%208/WEB/postman/DG-Interns-Hub-API.json).

### How to Import and Run:
1. Open **Postman**.
2. Click **Import** -> Select file `postman/DG-Interns-Hub-API.json`.
3. The collection is organized into 5 folders:
   - `1. Authentication` (Register, Login, Me, Logout, Duplicate prevention)
   - `2. Users Profile` (Get profile, Update profile)
   - `3. Jobs Management` (Create, List, Filter, Search, Sort, Pagination, Update)
   - `4. Applications` (Apply, My applications, Update status, Delete)
   - `5. Security & Edge Cases` (Missing token, Invalid token, Wrong role, Malformed body)
4. Tests automatically capture and pass JWT tokens into collection variables (`candidateToken`, `recruiterToken`, `jobId`, `applicationId`).

---

## 🔗 GitHub Repository

- **Repository**: [https://github.com/vishal2006t/DG-INTERN-HUB-WEEK-8](https://github.com/vishal2006t/DG-INTERN-HUB-WEEK-8)
- **Author**: Vishal T
- **Internship**: DG Interns Hub - Advanced Web Application Internship (Week 8)
