# DG Interns Hub – 5 to 10 Minute Live Demonstration Script (Week 9)
## "React.js Advanced Job & Internship Portal"

**Target Duration:** 7 – 8 Minutes  
**Target Audience:** Technical Mentors, Evaluators, Recruiters  
**Preparation Checklist:**
- [ ] Backend running (`node server/server.js`) on `http://localhost:5000`
- [ ] Frontend running (`npm run dev`) on `http://localhost:5173`
- [ ] Browser window opened in standard 1920x1080 or 1366x768 resolution
- [ ] Sample PDF resume ready on your desktop (`Candidate_Resume.pdf`)

---

### [00:00 - 01:15] Introduction & Landing Page Overview
- **Action:** Open `http://localhost:5173/` in your browser.
- **Presenter Screen:** Show the Landing Page (Home).
- **Spoken Script:**
  > "Hello everyone. Welcome to the live demonstration of the DG Interns Hub Week 9 project — an advanced React.js Job and Internship Portal.
  > 
  > As you can see on the landing page, we have engineered an original, production-ready interface. At the top, we have our branding mark, navigation links, and theme toggle. In the hero section, candidates can immediately discover opportunities through our live search island or click on trending search keywords like React, Remote, or Docker.
  > 
  > Scrolling down, we have real-time platform statistics counters highlighting 500+ active roles, trending domain categories such as Web Development, Cloud & DevOps, and AI, followed by curated Featured Opportunities loaded directly from our MongoDB Atlas database via Express APIs."

---

### [01:15 - 02:15] Dark Mode & Search/Filter Engine
- **Action 1:** Click the Sun/Moon theme toggle button in the top navbar.
- **Presenter Screen:** Show the seamless transition to Dark Mode with rich navy/slate backgrounds (`#0B0F19`, `#111827`) and glowing badges.
- **Action 2:** Click **"Browse Jobs"** (`/jobs`).
- **Spoken Script:**
  > "One of our advanced requirements was persistent Dark Mode. Notice how clicking the theme toggle smoothly transforms every element, card border, input field, and badge to high-contrast dark tokens. This setting is automatically saved to LocalStorage, so if I refresh the page, the user's preference is remembered.
  > 
  > Now, let's explore the Jobs directory. Here, we've implemented multi-criteria filtering. In the search bar, I'll type 'React'. Notice that as I type, our debounced search automatically triggers without requiring a page reload or submitting a form.
  > 
  > We can also filter simultaneously by Location (for example, 'Remote'), Category, Job Type, or sort by highest stipend. Active filter chips appear above the grid and can be dismissed individually or cleared with one click using 'Clear All'."

---

### [02:15 - 03:45] Job Details, Bookmarking & Applying with PDF Upload
- **Action 1:** Click on any job card title (e.g. *Full Stack Developer Intern*).
- **Presenter Screen:** Display the detailed `/jobs/:id` page.
- **Action 2:** Click the **"Save Job"** button. Show the toast notification appear in the bottom-right.
- **Action 3:** Click **"Apply Now"** to open the Application Modal dialog.
- **Action 4:** Drag and drop or browse to select a PDF resume. Fill out Name, Email, Phone, and Cover Letter.
- **Action 5:** Click **"Submit Application"**. Show the success state.
- **Spoken Script:**
  > "Here on the `/jobs/:id` route, the application retrieves the exact job details from our Express backend. Candidates can review the stipend strip, duration, full responsibilities, required technical skills, and mentorship benefits.
  > 
  > I can bookmark this opportunity by clicking 'Save Job'. Watch the toast notification slide in at the bottom right — this is handled by our global ToastContext and saved into SavedJobsContext.
  > 
  > Now, let's apply for this position. Clicking 'Apply Now' launches our accessible modal dialog. If I try to upload a non-PDF file or omit required fields, clear validation errors appear immediately. Let's upload a valid PDF resume and write our cover statement. When I submit, our Multer backend endpoint validates the PDF format and size, stores the file securely, and links the application to this job in MongoDB. If I attempt to apply a second time, our compound index prevents duplicate submissions and displays an informative alert."

---

### [03:45 - 05:00] Authentication & Protected Route Redirection
- **Action 1:** Log out or open `/login`.
- **Action 2:** Show the Login form with demo autofill buttons.
- **Action 3:** Click **"Recruiter Demo"** or enter candidate credentials and submit.
- **Spoken Script:**
  > "Next, let's look at authentication and security. Our portal supports role-based access for candidates, recruiters, and administrators.
  > 
  > If an unauthenticated user attempts to visit a protected route like `/dashboard`, our `ProtectedRoute` component intercepts the request, redirects them to `/login`, and preserves their intended location in router state.
  > 
  > On the login page, we've provided convenient 1-click demo credential pills for fast evaluator testing. Let's sign in. The backend issues a stateless JWT token containing user role claims. Our Axios client automatically captures this token and attaches it to all subsequent requests via HTTP interceptors."

---

### [05:00 - 06:30] Candidate Dashboard & Real Statistics Calculation
- **Action:** Navigate to `/dashboard`.
- **Presenter Screen:** Showcase the Candidate Dashboard.
- **Spoken Script:**
  > "Upon login, the candidate is welcomed to their personalized Dashboard.
  > 
  > Notice the five metric cards across the top: Total Applications, Pending, Shortlisted, Selected, and Rejected. Crucially, these are not hardcoded numbers. They are computed dynamically by iterating through the candidate's real application records fetched from `/api/applications/my`.
  > 
  > Below the KPI cards, the Recent Applications table lists each submitted role, company name, submission timestamp, and current review status. On the right, candidates have immediate access to their profile overview and bookmarked roles."

---

### [06:30 - 07:30] My Applications, Profile & Skills Manager
- **Action 1:** Navigate to `/applications`.
- **Action 2:** Switch between status tabs (All, Pending, Shortlisted). Click **"Details"** to inspect the application modal with the submitted cover letter and resume link.
- **Action 3:** Navigate to `/profile`. Add a new skill (e.g., *TypeScript*) and click **"Save Profile Changes"**.
- **Spoken Script:**
  > "On the dedicated Applications page, users can filter applications by status tabs or search within their submissions. Clicking 'Details' opens a modal showing the exact cover letter and verified resume link stored on the server. Candidates can also safely withdraw an application if needed.
  > 
  > In the Profile section, candidates can manage their professional bio, contact details, and technical skill tags. Let's add 'TypeScript' to our skill cluster and click 'Save Changes'. The updated profile is persisted via `PUT /api/users/profile` and immediately synchronizes across the application."

---

### [07:30 - 08:30] Mobile Responsiveness & Conclusion
- **Action 1:** Open DevTools and switch viewport to 390px (Mobile iPhone).
- **Action 2:** Open the mobile slide-out drawer menu and navigate to Home.
- **Action 3:** Conclude presentation.
- **Spoken Script:**
  > "Finally, let's examine responsiveness. Switching to a 390px mobile viewport, the interface gracefully adapts: the navigation collapses into a slide-out drawer, the search island stacks cleanly, and job cards format into an intuitive single-column feed.
  > 
  > To verify backend integrity, our automated test suite runs 37 test cases covering authentication, CRUD operations, role authorization, and duplicate prevention — all passing with 100% success.
  > 
  > In summary, this Week 9 project delivers an end-to-end, resilient, and beautifully designed full-stack React portal. Thank you for your time, and I am ready for any questions!"
