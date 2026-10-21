# EduTrack — Student Management System (Frontend)

A clean, beginner-friendly, and responsive **Student Management System** dashboard interface built using standard **HTML5**, modern **CSS3**, and **Vanilla JavaScript (ES6+)**.

This project does not rely on any heavy front-end frameworks (like React, Angular, or Vue), UI libraries (like Bootstrap or Tailwind), or back-end servers. It is a pure, lightweight, self-contained client-side web application.

---

## 📸 Key Features & UI Layout

- **Modern Blue-and-White Dashboard**: Crisp typography (Google Font *Inter*), subtle glassmorphism header, card elevation, soft borders, and an enterprise blue color palette.
- **Dynamic Metrics Overview**:
  - **Total Enrolled Students Card**: Highlights the live count of students and updates instantly on record creation or deletion.
  - **Available Courses Card**: Overview of active academic departments.
- **Accessible "Add Student" Form**:
  - Includes: **Student ID**, **Full Name**, **Email Address**, **Phone Number**, and **Course** dropdown.
  - Semantic `<label>` elements linked to inputs with corresponding `id` attributes.
  - **Comprehensive Validation**:
    - **Required Fields**: Ensures no field is left blank.
    - **Email Validation**: Checks for standard email address syntax (`user@domain.com`).
    - **10-Digit Phone Number**: Enforces exactly 10 numeric digits.
    - **Case-Insensitive Duplicate ID Prevention**: Rejects duplicate IDs (e.g. `stu-001` vs `STU-001`).
  - **Unique Internal Key Generation**: Automatically generates a collision-free internal key (e.g. `stu_1729412345678_k9x2w1p`) for every student record.
  - Inline error validation tags with accessible `aria-describedby` hints and dynamic feedback.
  - Interactive Reset button to clear inputs and error markers.
- **Interactive Student Records Table**:
  - Displays: **ID**, **Name**, **Email**, **Phone**, **Course** (with distinct department color pill badges), and **Actions** (Edit & Delete UI placeholders for future stages).
  - Dynamically renders new rows as students are added.
  - Shows an accessible, friendly empty state when no students are registered yet.
- **Live Search Bar**:
  - Filters records in real-time by Student ID, Name, Email, or Course.
  - Dedicated Clear button `(×)` to instantly reset search queries.
- **Status & Notification Banner**:
  - Accessible banner (`role="alert"`) informing users about successful additions, updates, deletions, and validation errors.
- **Friendly Empty State**:
  - Shows when no students are registered or when a search query returns zero matches, complete with an SVG icon, explanatory message, and an action button to quickly reset filters or focus on registration.
- **Fully Responsive**:
  - Fluid two-column workspace on desktop screens.
  - Clean stacked layout on tablets and mobile screens.

---

## 📁 Project Structure & File Explanations

```text
d:/project/
├── index.html     # Semantic HTML5 markup, dashboard structure, and accessible layout
├── style.css      # Vanilla CSS3 styles, CSS custom properties, responsive layout, animations
├── script.js      # Vanilla JavaScript logic, DOM manipulation, form validation, event handling
└── README.md      # Project overview, architecture explanation, and running instructions
```

### 1. [`index.html`](file:///d:/project/index.html)
- **Role**: Provides the semantic structure and skeleton of the dashboard.
- **Highlights**:
  - Configures standard HTML5 metadata (`viewport`, `charset`, `description`).
  - Loads Google Font (*Inter*) and links the external stylesheet [`style.css`](file:///d:/project/style.css).
  - Implements the top navigation bar with branding, a live system status indicator, and administrator profile badge.
  - Sets up the metrics grid with the **Total Enrolled Students** card.
  - Implements the registration form with accessible labels, input icons, and field error containers.
  - Defines the responsive table structure with `<table role="table">`, `<thead>`, and `<tbody id="student-table-body">`.
  - Embeds the empty state illustration and load status footer.
  - Links [`script.js`](file:///d:/project/script.js) right before the closing `</body>` tag for non-blocking rendering.

### 2. [`style.css`](file:///d:/project/style.css)
- **Role**: Delivers all visual styling, responsive design rules, and micro-interactions.
- **Highlights**:
  - **CSS Variables (`:root`)**: Organized palette of blues (`--primary-50` to `--primary-950`), clean surfaces, neutral grays, semantic alert colors, and elevation shadows.
  - **Typography & Reset**: Resets margins and paddings, specifies border-box sizing, and enforces smooth scrolling and anti-aliasing.
  - **Glassmorphism**: Sticky header with `backdrop-filter: blur(12px)` for a polished modern feel.
  - **Card & Grid Layouts**: Uses CSS Grid for the metrics row and workspace (`grid-template-columns: 400px minmax(0, 1fr)`).
  - **Interactive States**: Subtle hover elevations (`translateY(-2px)`), button active states, and custom focus rings (`:focus`) for accessibility.
  - **Responsive Media Queries**: Breakpoints at `1024px`, `768px`, and `480px` ensuring smooth presentation on phones, tablets, and wide monitors.

### 3. [`script.js`](file:///d:/project/script.js)
- **Role**: Powers client-side interactivity, DOM rendering, form validation, and data management.
- **Highlights**:
  - **In-Memory Seed Data**: Includes 3 realistic student records initially to showcase how the UI looks with active data.
  - **Validation Engine**: Ensures all required fields are filled, checks for duplicate Student IDs, enforces valid email patterns, and verifies phone length before submission.
  - **Dynamic Rendering**: Re-renders table rows dynamically with `document.createElement()` and sanitizes strings using HTML escaping to protect against XSS.
  - **Reactive Metrics**: Calculates and updates the `Total Enrolled Students` metric counter in real-time.
  - **Search & Filter**: Real-time filtering as you type into the search bar, with fallback to an empty state view.
  - **Event Delegation**: Efficient event listeners on table actions (Edit & Delete).

### 4. [`README.md`](file:///d:/project/README.md)
- **Role**: Explains project setup, code organization, and execution instructions for developers and evaluators.

---

## 🚀 How to Run the Application Locally

Because this application is built with standard web technologies and has **no external dependencies or build tools**, you can run it immediately using any of the following methods:

### Method 1: Direct Browser Launch (Simplest)
1. Open your file explorer and navigate to `d:\project`.
2. Double-click [`index.html`](file:///d:/project/index.html), or right-click `index.html` and choose **Open with** &rarr; **Google Chrome**, **Microsoft Edge**, **Mozilla Firefox**, or **Safari**.
3. The dashboard will load instantly!

---

### Method 2: Python Built-in HTTP Server (Recommended)
If you have Python installed, you can serve the directory over a local web server:

1. Open PowerShell or Command Prompt in the project folder:
   ```powershell
   cd d:\project
   ```
2. Start the built-in HTTP server:
   ```powershell
   python -m http.server 3000
   ```
3. Open your browser and navigate to:
   ```text
   http://localhost:3000
   ```

---

### Method 3: VS Code "Live Server" Extension
1. Open the `d:\project` folder in Visual Studio Code.
2. Install the **Live Server** extension (by *Ritwick Dey*) from the Extensions marketplace.
3. Right-click on [`index.html`](file:///d:/project/index.html) and select **Open with Live Server** (or click the **Go Live** button in the bottom status bar).
4. The application will open automatically in your default browser at `http://127.0.0.1:5500`.

---

### Method 4: Node.js `npx serve` or `http-server`
If you have Node.js installed:

```powershell
npx serve d:\project
```
or
```powershell
npx http-server d:\project -p 8080
```
Then visit `http://localhost:8080`.

---

## ♿ Accessibility (a11y) Considerations

- **Explicit Label Association**: Every form input utilizes an explicit `<label for="...">` pairing.
- **Focus Indicators**: Clear focus rings (`box-shadow: 0 0 0 4px rgba(...)`) are provided for keyboard navigation.
- **Screen Reader Announcements**: The notification area utilizes `role="alert"` and `aria-live="polite"` so screen readers announce dynamic status changes.
- **Semantic Table Elements**: The records table uses proper `<thead>`, `<tbody>`, and `<th scope="col">` to maintain semantic tabular structure.
- **Color Contrast**: All text and badge color pairings meet WCAG 2.1 AA standards for contrast against white and light-blue surfaces.

---

## 🔮 Future Enhancements (Next Stages)

1. **LocalStorage / IndexedDB Persistence**: Preserve student records across browser refreshes without requiring a backend.
2. **Sorting & Column Pagination**: Sort by ID, name, or department, and handle large numbers of records.
3. **Export to CSV / PDF**: Allow users to download student rosters.
4. **Backend REST API Integration**: Connect to an Express.js, Python FastAPI, or Django backend with PostgreSQL/SQLite.
