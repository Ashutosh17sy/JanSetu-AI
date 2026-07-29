# 🚀 JanSetu AI

> **AI-Powered Smart Civic Complaint Management Platform**

JanSetu AI is an intelligent municipal complaint management platform designed to modernize civic issue reporting and resolution. Citizens can report issues using photos and GPS location, while an AI-powered engine automatically classifies complaints, predicts severity and priority, recommends the responsible department, detects duplicate complaints, and enables authorities to resolve issues efficiently through a role-based workflow.

🏆 Built for **AI FIRST HACKATHON 2026**

---

# 🌐 Live Project

## 🚀 Live MVP
https://jan-setu-ai-one.vercel.app/

## 🎥 Demo Video
https://www.loom.com/share/0798525d52444c8e9c4935a12c81c900

## 💻 GitHub Repository
https://github.com/Ashutosh17sy/JanSetu-AI

---

# 📌 Problem Statement

Municipal corporations receive thousands of civic complaints every day, including garbage overflow, potholes, water leakage, broken streetlights, damaged public property, and sewer issues.

Most existing complaint systems rely heavily on manual classification and routing, leading to:

- Slow complaint processing
- Duplicate complaints
- Incorrect department assignment
- Lack of transparency
- Poor citizen experience

JanSetu AI solves these challenges through intelligent AI-assisted complaint management.

---

# 💡 Solution

JanSetu AI provides an end-to-end digital complaint management ecosystem where:

- Citizens submit complaints using photos and GPS.
- AI automatically analyzes the complaint.
- Appropriate departments receive complaints instantly.
- Officers assign field workers.
- Workers resolve issues and upload completion evidence.
- Citizens receive real-time updates and provide feedback.

---

# ✨ Key Features

## 👤 Citizen

- Register & Login
- Photo Upload
- GPS Location Selection
- AI Complaint Classification
- AI Generated Complaint Summary
- Duplicate Complaint Detection
- Complaint Timeline
- Live Status Tracking
- Feedback & Ratings
- Real-time Notifications

---

## 🏛 Municipal Administrator

- Dashboard Analytics
- Complaint Statistics
- User Management
- Department Management
- Worker Management
- Complaint Heatmap
- Performance Analytics
- CSV Export

---

## 👮 Department Officer

- Department Dashboard
- Assign Workers
- Complaint Management
- Status Updates
- Department Analytics

---

## 👷 Field Worker

- Assigned Tasks
- Navigation Support
- Before/After Image Upload
- Completion Notes
- Mark Complaint Resolved

---

# 🤖 AI Capabilities

JanSetu AI includes an intelligent AI complaint analysis engine that automatically performs:

- Complaint Category Detection
- Severity Prediction
- Priority Prediction
- Department Recommendation
- AI Generated Title
- AI Generated Description
- Duplicate Complaint Detection

The AI engine currently supports **13 civic complaint categories** mapped across **7 municipal departments**.

---

# 🏗 System Architecture

```
Citizen
     │
     ▼
React + Vite Frontend
     │
     ▼
Supabase Backend
(Auth • PostgreSQL • Storage • Realtime)
     │
     ▼
AI Analysis Engine
(Category • Severity • Priority • Department)
     │
     ▼
Department Officer
     │
     ▼
Field Worker
     │
     ▼
Citizen Feedback
```

---

# 🔄 Workflow

```
Citizen
     │
Upload Complaint
     │
Photo + GPS
     │
AI Analysis
     │
Category
Severity
Priority
Department
Duplicate Detection
     │
Complaint Created
     │
Officer Assignment
     │
Worker Execution
     │
Complaint Resolution
     │
Citizen Feedback
```

---

# 👥 User Roles

1. Citizen
2. Municipal Administrator
3. Department Officer
4. Field Worker

---

# 🛠 Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, TypeScript |
| UI | Tailwind CSS, Framer Motion |
| Backend | Supabase |
| Database | PostgreSQL |
| Authentication | Supabase Auth |
| Storage | Supabase Storage |
| Realtime | Supabase Realtime |
| AI Engine | Deno Edge Functions |
| Maps | React Leaflet + OpenStreetMap |
| Charts | Recharts |

---

# 📂 Project Structure

```
src/
 ├── components/
 ├── hooks/
 ├── layouts/
 ├── pages/
 ├── services/
 ├── App.tsx

supabase/
 ├── functions/
 └── migrations/
```

---

# 🔒 Security

- JWT Authentication
- Role Based Access Control
- Row Level Security (RLS)
- Protected Routes
- Secure Storage Policies

---

# 🚀 Getting Started

## Install

```bash
npm install
```

## Environment Variables

```env
VITE_SUPABASE_URL=YOUR_URL
VITE_SUPABASE_ANON_KEY=YOUR_KEY
```

## Run

```bash
npm run dev
```

## Production Build

```bash
npm run build
```

---

# 🌟 Why JanSetu AI?

- AI Powered Complaint Analysis
- Smart City Ready
- Fully Responsive
- Real-time Notifications
- Duplicate Complaint Detection
- Interactive Maps
- Analytics Dashboard
- Secure Authentication
- Role Based Access
- Modern UI/UX

---

# 🔮 Future Scope

- AI Vision Based Image Detection
- Voice Complaint Registration
- WhatsApp Complaint Bot
- Multilingual AI Assistant
- Predictive Civic Analytics
- IoT Smart City Integration

---

# 👨‍💻 Team

## Team Name

**A Square**

### Team Leader

Ashutosh Singh Yadav

### Team Member

Ashutosh Kumar Yadav

---

# 📜 License

Built for **AI FIRST HACKATHON 2026** demonstration purposes.

© 2026 Team A Square
