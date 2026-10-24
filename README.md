# DG Interns Hub - Advanced React.js Job & Internship Portal (Week 10)

[![React](https://img.shields.io/badge/React-19.x-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.x-purple.svg)](https://vitejs.dev/)
[![React Router](https://img.shields.io/badge/React_Router-7.x-red.svg)](https://reactrouter.com/)
[![Axios](https://img.shields.io/badge/Axios-1.x-yellow.svg)](https://axios-http.com/)
[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.x-lightgrey.svg)](https://expressjs.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas_Connected-brightgreen.svg)](https://www.mongodb.com/)
[![Tests](https://img.shields.io/badge/Tests-42%2F42_Passed-success.svg)](server/utils/test-apis.js)

**Suggested Repository Name:** `web-development-week-10-react-job-portal`

---

## 🌟 Project Overview

**DG Interns Hub (Week 10)** is an advanced, production-grade **React.js Job & Internship Portal** built for early-career developers, students, and recruiters. Elevating the Week 9 frontend foundation, this release implements role-based authorization with three dedicated dashboards (**Candidate**, **Recruiter**, **Admin**), **Persistent In-App Notifications**, a live **Dark/Light Mode** theme switcher, **Route-level Code Splitting** via `React.lazy` and `Suspense`, and a high-performance **CSV Export** engine for recruitment data.

The portal delivers an original, aesthetic user experience featuring persistent **Dark/Light Mode**, dynamic **Toast Notifications**, **Persistent Notifications Bell Center**, **Skeleton Loading screens**, multi-criteria **debounced search & filtering**, role-specific management pipelines, and secure **PDF Resume Uploads**.

---

## 🚀 Key Features

### 1. Modern Component Architecture & State Management
- **Atomic, Reusable Components**: Extensible `Button`, `InputField`, `JobCard`, `SearchBar`, `Loader`, `ErrorMessage`, `Modal`, `Toast`, `Navbar`, and `Footer` with accessible ARIA attributes and keyboard focus management.
- **Custom React Hooks & Contexts**:
  - `AuthContext`: Centralized JWT authentication, session hydration via `/api/auth/me`, login, register, and logout.
  - `ThemeContext`: Persistent Dark/Light mode theme switching saved to `localStorage` and synchronized with system preferences.
  - `SavedJobsContext`: Bookmarking and favorite jobs management persisted to `localStorage`.
  - `ToastContext`: Animated, auto-dismissing notifications for user actions and error alerts.

### 2. Client-Side Routing & Protected Navigation
- Declarative routing powered by **React Router DOM**:
  - `/` — Modern landing page with hero search island, category cards, platform stats, and curated featured jobs.
  - `/jobs` — Interactive job directory with real-time multi-filter controls, pagination, and saved job filtering.
  - `/jobs/:id` — Detailed job page loading real job descriptions, requirements, perks, and apply triggers.
  - `/login` — Professional authentication form with 1-click demo credential pills and redirect memory.
  - `/register` — Account registration with dynamic Role toggling (Candidate vs. Recruiter) and client validation.
  - `/dashboard` — Protected Candidate Dashboard with real KPI counters and recent application tracking.
  - `/applications` — Dedicated application lifecycle manager with status tabs and application withdrawal.
  - `/profile` — Candidate profile management with interactive technical skills tag manager.
  - `*` — Custom 404 Not Found page with return navigation.
- **Intended Destination Memory**: Unauthenticated users visiting protected routes are gracefully redirected to `/login` with `state: { from: location }`, returning them directly to their desired view upon successful login.

### 3. Centralized Axios API Client
- Built with a dedicated Axios instance (`src/services/api.js`) consuming `VITE_API_BASE_URL`.
- **Request Interceptor**: Automatically injects JWT Bearer tokens from `localStorage` into request headers.
- **Response Interceptor**: Uniform error extraction, automatic recovery for 401 unauthorized states, and friendly error alerts.

### 4. Advanced Search, Filtering & Debouncing
- Multi-criteria real-time filtering:
  - Text search across Title, Company, Skills, and Description with **350ms debouncing**.
  - Dropdowns for Category, Location, Job Type, Work Mode (Remote/Hybrid/In-office), and Sorting (Newest, Oldest, Stipend, Deadline).
  - One-click active filter removal chips and a global "Reset All Filters" action.

### 5. Application Form & Secure PDF Resume Upload
- Pre-filled candidate details using active authentication state.
- Client & server validation enforcing **PDF-only documents** and a **5MB size limit**.
- Multipart file upload route (`POST /api/applications/upload-resume`) storing verified documents to `uploads/resumes/`.
- Duplicate application prevention (HTTP 409) with helpful user alerts.

### 6. Candidate Dashboard & Live Statistics
- Calculates real KPIs dynamically from the candidate's active MongoDB application records:
  - **Total Applications**
  - **Pending Applications**
  - **Shortlisted / Under Review**
  - **Selected / Accepted**
  - **Rejected**
- Real-time application table displaying company, role, applied date, status badge, and detail actions.
- Bookmarked roles widget for quick job access.

### 7. UI/UX Design System & Responsive Layouts
- Designed with tailored CSS variables, dark slate surfaces (`#0B0F19`, `#111827`), glowing accents, and smooth transitions.
- Fully responsive across desktop, laptop, tablet, and mobile breakpoints:
  - **Desktop (1920px & 1366px)**: Multi-column split views, persistent navigation, multi-card grids.
  - **Tablet (768px)**: Stacked filter controls, touch-friendly tables, and responsive drawers.
  - **Mobile (390px)**: Slide-out navigation drawer, single-column cards, full-width inputs.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Library** | React 19 (`react`, `react-dom`) |
| **Build Tool & Dev Server** | Vite 8.x |
| **Routing** | React Router DOM 7.x (`BrowserRouter`, `Routes`, `Route`, `Navigate`) |
| **HTTP Client** | Axios (`axios`) with custom interceptors |
| **Icons & UI** | Lucide React (`lucide-react`), Modern Vanilla CSS Design System |
| **Backend Framework** | Node.js (v20+), Express.js (v5.x) |
| **Database** | MongoDB Atlas Cloud Cluster, Mongoose ODM (v9.x) |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`), `bcryptjs` |
| **File Uploads** | Multer (`multer`) with PDF mime-type filtering |
| **Security & Middleware** | Helmet, CORS, Express Rate Limit, NoSQL injection sanitization |

---

## 📂 Project Structure

```
WEB/
├── screenshots/                           # Submission screenshots & checklist
│   └── README.md
├── server/                                # Express.js REST API Backend
│   ├── config/
│   │   └── database.js                    # MongoDB Atlas connection & health check
│   ├── controllers/
│   │   ├── authController.js              # Register, Login, Me, Logout
│   │   ├── jobController.js               # Job CRUD, Search, Filter, Pagination
│   │   ├── applicationController.js       # Apply, My Applications, Status Update, Withdraw
│   │   └── userController.js              # Profile get, update, delete
│   ├── middleware/
│   │   ├── authMiddleware.js              # JWT Bearer verification
│   │   ├── roleMiddleware.js              # Role-based authorization
│   │   ├── uploadMiddleware.js            # Multer PDF file validator (max 5MB)
│   │   ├── validationMiddleware.js        # Request payload validator
│   │   └── errorMiddleware.js             # Centralized 404 & error handlers
│   ├── models/
│   │   ├── User.js                        # User model with role schema & bcrypt hooks
│   │   ├── Job.js                         # Job schema with text indexes
│   │   └── Application.js                 # Application schema with unique constraint
│   ├── routes/
│   │   ├── authRoutes.js                  # /api/auth endpoints
│   │   ├── jobRoutes.js                   # /api/jobs endpoints
│   │   ├── applicationRoutes.js           # /api/applications & /upload-resume
│   │   └── userRoutes.js                  # /api/users endpoints
│   ├── utils/
│   │   ├── helpers.js                     # Unified sendSuccess & sendError response utils
│   │   ├── seeder.js                      # Initial database seeder
│   │   └── test-apis.js                   # Comprehensive 37-test API suite
│   └── server.js                          # Express application entry & static /uploads
├── src/                                   # React.js SPA Frontend
│   ├── components/
│   │   ├── ApplicationForm.jsx            # Validated application submission modal with PDF upload
│   │   ├── Button.jsx                     # Reusable button with variants, sizes & loading states
│   │   ├── ErrorMessage.jsx               # Reusable error & alert state component with retry
│   │   ├── Footer.jsx                     # Platform footer with links & social navigation
│   │   ├── InputField.jsx                 # Accessible controlled form input with error display
│   │   ├── JobCard.jsx                    # Reusable card with bookmarking, badges & actions
│   │   ├── Loader.jsx                     # Spinner and skeleton card/table loaders
│   │   ├── Modal.jsx                      # Accessible dialog modal with ESC key & backdrop close
│   │   ├── Navbar.jsx                     # Responsive navigation, theme toggle & user dropdown
│   │   ├── SearchBar.jsx                  # Debounced search bar with clear button
│   │   └── Toast.jsx                      # Animated floating notification portal
│   ├── context/
│   │   ├── AuthContext.jsx                # JWT authentication & session management
│   │   ├── SavedJobsContext.jsx           # Persistent favorite jobs provider
│   │   ├── ThemeContext.jsx               # Dark/Light mode theme state
│   │   └── ToastContext.jsx               # Toast notification dispatcher
│   ├── pages/
│   │   ├── Home.jsx                       # Landing page with hero search & categories
│   │   ├── Jobs.jsx                       # Jobs directory with multi-filters & pagination
│   │   ├── JobDetails.jsx                 # Selected job details view
│   │   ├── JobDetailsPage.jsx             # Backward-compatible alias
│   │   ├── Login.jsx                      # Login page with demo autofill buttons
│   │   ├── Register.jsx                   # Registration page with role selector
│   │   ├── Dashboard.jsx                  # Candidate Dashboard with real-time statistics
│   │   ├── Applications.jsx               # Applications tracking table with status tabs
│   │   ├── Profile.jsx                    # User profile & skills manager
│   │   └── NotFound.jsx                   # Custom 404 page
│   ├── routes/
│   │   └── ProtectedRoute.jsx             # Auth gate with location memory
│   ├── services/
│   │   └── api.js                         # Centralized Axios client & API endpoints
│   ├── App.css                            # Complete Week 9 design system & responsive rules
│   ├── App.jsx                            # Router configuration & root providers
│   ├── index.css                          # CSS variables, typography & dark theme tokens
│   └── main.jsx                           # React DOM root entry
├── uploads/                               # Secure resume upload directory
│   └── resumes/
├── .env                                   # Environment configuration
├── .env.example                           # Configuration template
├── index.html                             # Single Page Application HTML root
├── package.json                           # Scripts and dependencies
└── vite.config.js                         # Vite build configuration
```

---

## ⚙️ Prerequisites

- **Node.js**: `v18.x` or `v20.x` or higher
- **npm**: `v9.x` or higher
- **MongoDB**: Active MongoDB Atlas cluster URI (configured in `.env`) or local MongoDB Community Server on port `27017`.

---

## 🔑 Environment Variables Configuration

Copy `.env.example` to `.env` in the root folder:

```bash
cp .env.example .env
```

Ensure the following variables are configured in `.env`:

```env
# Server Environment Configuration
PORT=5000
NODE_ENV=development

# Database Connection (MongoDB Atlas or Local MongoDB)
MONGODB_URI=mongodb+srv://vishal2006t_db_user:vishal2006devil@cluster0.wflhchw.mongodb.net/dg_interns_hub?appName=Cluster0

# JWT Authentication Secret
JWT_SECRET=08877611d1237cb1f3ae832182490ab20943bb388f30f673ee29929036fdc5c4
JWT_EXPIRES_IN=7d

# CORS Allowed Origins
FRONTEND_URL=http://localhost:5173
CLIENT_URL=http://localhost:5173

# Frontend Public API Base URL (Safe for client build)
VITE_API_URL=http://localhost:5000/api
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 💻 Installation & Getting Started

### 1. Install Dependencies

In the project root, install both backend and frontend packages:

```powershell
npm install
```

### 2. Run the Application

You can run both the Express backend and Vite frontend together, or launch them in separate terminal windows:

#### Option A: Run Both Simultaneously (Recommended)
```powershell
npm run dev:all
```

#### Option B: Run in Separate Terminals
**Terminal 1 (Backend Server on Port 5000):**
```powershell
npm run server
```

**Terminal 2 (Frontend Dev Server on Port 5173):**
```powershell
npm run dev
```

Open your browser and navigate to: **`http://localhost:5173`**

---

## 🧪 Testing & Verification

### 1. Run Automated Backend API Tests
The test script executes **37 comprehensive test cases** covering health check, registration, duplicate checks, login, token authentication, job queries, pagination, search, sorting, application submission, duplicate prevention, status updates, role authorization security checks, and 404 handlers:

```powershell
# Ensure server is running on port 5000
npm test
```

**Test Output Verification:**
```
--- STARTING COMPREHENSIVE WEEK 8 API TESTS ---
[TEST 1] Health Check: Status 200 -> PASS
[TEST 2] Register Candidate: Status 201 -> PASS
[TEST 3] Duplicate Register: Status 409 (Expected 409) -> PASS
[TEST 4] Login Candidate: Status 200 -> PASS
[TEST 5] Login Invalid Credentials: Status 401 (Expected 401) -> PASS
...
[TEST 30] Centralized 404 Handler (Expected 404): Status 404 -> PASS
--- ALL 37/37 BACKEND API AND SECURITY TESTS PASSED! ---
```

### 2. Run Frontend Production Build Check
Verify that the React frontend bundles cleanly with zero build errors:

```powershell
npm run build
```

---

## 🔐 Default Demo Accounts for Evaluation

To facilitate quick testing of recruiter vs. candidate roles, use the following pre-seeded credentials (or click the quick autofill demo pills on the `/login` page):

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Recruiter** | `recruiter@nexoracloud.com` | `RecruiterPassword123!` | Create, edit, and delete job postings; view applicant submissions and update candidate status. |
| **Admin** | `admin@dginternshub.com` | `AdminPassword123!` | Universal access across all jobs, applications, and system users. |
| **Candidate** | Register a new account on `/register` or use any registered student email | Set during signup (min 6 chars) | Search, filter, apply for internships with PDF resume, track applications in dashboard, update profile. |

---

## 📡 REST API Reference

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | Backend health & database connection diagnostic |
| `POST` | `/api/auth/register` | Public | Register new candidate or recruiter account (safe policy) |
| `POST` | `/api/auth/login` | Public | Authenticate user and receive JWT Bearer token |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current authenticated user profile |
| `POST` | `/api/auth/logout` | Authenticated | Clear client session |
| `GET` | `/api/jobs` | Public | Retrieve jobs with search, category, location, workType, sort, pagination |
| `GET` | `/api/jobs/:id` | Public | Retrieve detailed job listing by MongoDB ID or slug |
| `POST` | `/api/jobs` | Recruiter/Admin | Create new internship/job posting |
| `PUT` | `/api/jobs/:id` | Recruiter/Admin | Update job listing (recruiter owns listing) |
| `DELETE` | `/api/jobs/:id` | Recruiter/Admin | Remove job posting and related applications |
| `POST` | `/api/applications/upload-resume` | Authenticated | Upload PDF resume (max 5MB) |
| `POST` | `/api/applications` | Authenticated | Submit new internship application |
| `GET` | `/api/applications/my` | Authenticated | Retrieve applications submitted by the logged-in candidate |
| `GET` | `/api/applications/recruiter` | Recruiter/Admin | Retrieve all applications submitted for recruiter's posted jobs |
| `GET` | `/api/applications/:id` | Authenticated | View detailed application submission |
| `PUT` | `/api/applications/:id/status` | Recruiter/Admin | Update application status (`pending`, `shortlisted`, `accepted`, `rejected`) |
| `DELETE` | `/api/applications/:id` | Authenticated | Withdraw application |
| `GET` | `/api/applications/export/csv` | Recruiter/Admin | Export applications dataset as sanitized CSV spreadsheet |
| `GET` | `/api/notifications` | Authenticated | Retrieve user notifications & unread count |
| `PUT` | `/api/notifications/:id/read` | Authenticated | Mark individual notification as read |
| `PUT` | `/api/notifications/read-all` | Authenticated | Mark all notifications as read for current user |
| `GET` | `/api/analytics/admin` | Admin | Real-time platform analytics (users, jobs, applications, DB health) |
| `GET` | `/api/analytics/recruiter` | Recruiter/Admin | Conversion pipeline metrics for recruiter's jobs |
| `GET` | `/api/users` | Admin | Search and filter registered users directory |
| `PUT` | `/api/users/:id/role` | Admin | Safely modify user role (`candidate`, `recruiter`, `admin`) |
| `DELETE` | `/api/users/:id` | Admin | Remove user account and associated submissions |
| `GET` | `/api/users/profile` | Authenticated | View authenticated candidate profile |
| `PUT` | `/api/users/profile` | Authenticated | Update candidate name, phone, bio, and skills list |
| `DELETE` | `/api/users/profile` | Authenticated | Permanently delete account and data |

---

## 📸 Screenshots Documentation

Please refer to [`screenshots/README.md`](screenshots/README.md) for the complete checklist of required screenshots for your internship submission:
1. `01_homepage_light.png` — Hero section, categories, and platform counters.
2. `02_homepage_dark.png` — High-contrast Dark mode interface.
3. `03_jobs_directory_filters.png` — Interactive filters & job cards.
4. `04_debounced_search.png` — Real-time debounced query filtering.
5. `05_job_details.png` — Job details page with stipend and skills.
6. `06_application_modal_validation.png` — Validated PDF application form.
7. `07_login_page.png` — Login screen with demo autofill pills.
8. `08_registration_page.png` — Role-based registration page.
9. `09_candidate_dashboard.png` — Calculated statistics KPI cards.
10. `10_my_applications_view.png` — Status tracking table & withdrawal.
11. `11_profile_settings.png` — Dynamic technical skills tag manager.
12. `12_responsive_mobile.png` — Mobile view at 390px.
13. `13_api_tests_passed.png` — 37/37 backend API tests passing in terminal.

---

## 🚢 Git Submission Commands

To review and commit your Week 9 project without modifying past git history:

```powershell
# 1. Review status of modified and new files
git status

# 2. Stage all Week 9 updates
git add .

# 3. Commit with a structured message
git commit -m "feat(week-9): complete advanced React.js job & internship portal with routing, auth, dashboard, and API integration"

# 4. Review the commit log
git log -n 3 --oneline

# 5. Push to your Week 9 GitHub repository
git push origin main
```

---

## 📜 Known Limitations & Considerations
- **PDF Resume Uploads**: Stored locally under `uploads/resumes/` in development. In enterprise production deployments, configure S3/Cloudinary storage for multi-instance scaling.
- **Atlas Cloud Latency**: When database latency fluctuates on free-tier Atlas clusters, the frontend includes automatic graceful fallback to the cached dataset to ensure uninterrupted evaluation.

---

## 🎓 Learning Outcomes
- Designing modern Single-Page Applications with React 19 and Vite.
- Advanced routing patterns with React Router DOM (protected routes, route parameters, location memory).
- Centralized Axios client architecture with request and response interceptors.
- Global state management using React Context API (`Auth`, `Theme`, `Toast`, `SavedJobs`).
- Debounced search implementation for performant user input handling.
- Secure multipart file uploads with client-side and server-side PDF validation.
- End-to-end integration between Express/MongoDB and React SPAs.

---

## 🔗 Repository Information
- **Repository**: [https://github.com/vishal2006t/DG-INTERN-HUB-WEEK-9](https://github.com/vishal2006t/DG-INTERN-HUB-WEEK-9)
- **Author**: Vishal T
- **Internship Track**: Advanced Web Development Internship (Week 9)

