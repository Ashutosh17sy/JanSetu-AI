# JanSetu AI — Smart Civic Management Platform

An AI-powered municipal complaint management platform where citizens report civic issues with photos + GPS, an AI engine auto-classifies the problem (category, severity, priority, department), and municipal officers and field workers manage the complaint lifecycle end-to-end.

Built for a national-level Smart City hackathon.

---

## Features

### Citizens
- Report a civic issue with photo upload + GPS location picker
- AI auto-detects: complaint category, severity, priority, recommended department
- AI generates complaint title, description, and summary
- Duplicate complaint detection (same category within 200m / 48h)
- Track complaint status with a full timeline
- Leave feedback (star rating + note) on resolved complaints
- Real-time notifications on status changes

### Municipal Admin
- Municipal-wide dashboard with live stats and charts
- Analytics: complaint trends, department performance, ward reports, worker efficiency
- Manage all users (change roles, activate/deactivate)
- Manage departments and assign field workers
- Interactive complaint map with heatmap

### Department Officers
- Department-scoped dashboard with a department switcher
- View and assign complaints to field workers
- Update complaint status, reject with reason
- Department analytics (by category, ward, status)

### Field Workers
- View assigned tasks
- Start a task (marks in-progress)
- Navigate to complaint location via maps
- Upload before/after photos
- Add completion notes and mark resolved

### Platform
- 13 complaint categories across 7 departments
- JWT authentication with role-based access control
- Real-time notifications via Supabase Realtime
- Dark / light mode
- Fully responsive (mobile → desktop)
- Glassmorphism cards, animated landing page, loading skeletons, toast notifications
- CSV export of complaints
- 404 page

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS, React Router, Framer Motion, React Hook Form, Recharts, React-Leaflet |
| Backend / Database | Supabase (PostgreSQL, Auth, Realtime, Storage, Edge Functions) |
| AI Analysis | Serverless Edge Function (Deno) with a rule-based classification engine |
| Maps | Leaflet + OpenStreetMap (no API key required) |

---

## User Roles

1. **Citizen** — reports and tracks civic issues
2. **Municipal Admin** — oversees all operations, users, departments
3. **Department Officer** — manages complaints within a department
4. **Field Worker** — executes assigned tasks in the field

---

## Complaint Categories

Garbage Collection, Illegal Dumping, Road Potholes, Broken Roads, Broken Traffic Lights, Street Light Issues, Water Leakage, Sewer Overflow, Open Manholes, Construction Debris, Public Property Damage, Fallen Trees, Other Civic Issues.

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation
```bash
npm install
```

### Environment Variables
The project uses Supabase. The following are pre-populated in `.env`:

```
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Type Check
```bash
npm run typecheck
```

---

## Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI primitives (Button, Card, Input, Modal, etc.)
│   ├── dashboard/       # Sidebar, Topbar, nav config
│   ├── landing/         # Landing page sections
│   ├── complaints/      # ComplaintCard, ComplaintList
│   └── maps/            # Leaflet map components
├── hooks/               # useAuth, useTheme, useToast, useNotifications, useMediaQuery
├── layouts/             # AuthLayout, DashboardLayout
├── pages/
│   ├── auth/            # Login, Signup, Forgot/Reset Password
│   ├── citizen/         # Citizen dashboard, Create complaint
│   ├── admin/           # Admin dashboard, Analytics, Manage users/departments
│   ├── department/      # Department dashboard
│   ├── worker/          # Worker dashboard, Tasks, Task execution
│   ├── complaints/      # Complaints list, Complaint detail
│   ├── LandingPage.tsx
│   ├── ProfilePage.tsx
│   ├── SettingsPage.tsx
│   ├── MapViewPage.tsx
│   └── NotFoundPage.tsx
├── services/            # Supabase client, types, API layer, AI service, constants, utils, stats
└── App.tsx              # Routes + providers

supabase/
└── functions/
    └── analyze-complaint/   # AI analysis edge function
```

---

## Database Schema

Managed via Supabase migrations (RLS enabled on every table):

| Table | Purpose |
|-------|---------|
| `profiles` | Extends `auth.users` with role, name, phone, ward |
| `departments` | 7 municipal departments |
| `complaint_categories` | 13 issue categories with department mapping |
| `workers` | Field worker profiles linked to departments |
| `complaints` | Core complaint records with AI analysis fields |
| `complaint_timeline` | Status-change audit trail |
| `notifications` | In-app notifications (realtime) |
| `feedback` | Citizen ratings on resolved complaints |

### Row Level Security
- Citizens see only their own complaints
- Officers/admins see all complaints in scope
- Workers see complaints assigned to them
- Notifications are owner-scoped
- A trigger auto-creates a `profiles` row on signup

---

## AI Analysis

The `analyze-complaint` Edge Function (Deno) receives the citizen's note, address, ward, GPS, and file name, then:

1. **Detects category** — keyword scoring against all 13 categories
2. **Estimates severity** — base severity per category, escalated by danger/urgency keywords
3. **Predicts priority** — mapped from severity (low → low, critical → urgent)
4. **Generates title & description** — templated from category + severity + location
5. **Recommends department** — mapped from category
6. **Detects duplicates** — queries nearby open complaints (same category, within 200m, last 48h)

---

## API Layer

All data access goes through `src/services/api.ts` which wraps the Supabase client:

- `createComplaint` — inserts complaint + timeline entry + notification
- `assignWorker` — updates complaint, adds timeline, notifies citizen + worker
- `updateComplaintStatus` — updates status, timeline, notifies citizen
- `completeWork` — marks resolved, stores after-photo + notes
- `fetchComplaints` — with filters (status, department, worker, category, ward, search)
- `uploadImage` — Supabase Storage public URL

---

## Deployment

### Frontend (Vite)
The build outputs static files to `dist/`. Deploy to any static host (Vercel, Netlify, Cloudflare Pages):

```bash
npm run build
# deploy dist/
```

### Supabase
The Supabase project is already provisioned. Migrations and the edge function are applied via the Supabase MCP tools. No manual database setup required.

---

## Sample Data

Departments and complaint categories are seeded automatically by the initial migration. To test the full flow:

1. Sign up as a **Citizen** → report a complaint with a photo + GPS
2. Sign up as a **Department Officer** (separate account) → assign a worker
3. Sign up as a **Field Worker** → start the task, upload after photo, mark resolved
4. Back as the citizen → leave feedback

---

## License

Built for hackathon demonstration purposes.
