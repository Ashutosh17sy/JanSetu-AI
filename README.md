# JanSetu AI

## AI-Powered Smart Civic Complaint Management Platform

JanSetu AI is an AI-powered civic complaint management platform designed to improve communication between citizens and municipal authorities. Citizens can report civic issues using photographs and GPS location, while an AI-assisted analysis engine classifies complaints, estimates severity and priority, recommends the responsible department, and enables authorities to manage complaints through a complete end-to-end workflow.

Developed as part of the **AI FIRST HACKATHON 2026**.

---

# Live Project

### Live MVP

https://jan-setu-ai-one.vercel.app/

### Demo Video

https://www.loom.com/share/0798525d52444c8e9c4935a12c81c900

### Source Code

https://github.com/Ashutosh17sy/JanSetu-AI

---

# Problem Statement

Municipal corporations receive thousands of complaints every day regarding garbage collection, road damage, water leakage, sewer overflow, broken streetlights, illegal dumping, and other civic issues.

Traditional complaint management systems often rely on manual classification and routing, which leads to:

- Slow complaint processing
- Incorrect department assignment
- Duplicate complaints
- Limited transparency
- Poor complaint tracking
- Inefficient resource allocation

JanSetu AI addresses these challenges by introducing AI-assisted complaint analysis and a role-based complaint management system.

---

# Proposed Solution

JanSetu AI provides a complete digital workflow for managing civic complaints.

The workflow begins when a citizen submits a complaint with an image and GPS location. The AI engine analyzes the complaint, predicts its category, severity, priority, and responsible department, and stores the complaint securely. Municipal officers assign the complaint to field workers, who update the complaint status after completing the assigned task. Citizens receive notifications throughout the process and can provide feedback after resolution.

---

# Key Features

## Citizen Portal

- Secure Registration and Login
- Photo Upload
- GPS-based Location Selection
- AI-assisted Complaint Classification
- Automatic Complaint Title and Description
- Severity and Priority Prediction
- Duplicate Complaint Detection
- Complaint Timeline
- Complaint Status Tracking
- Feedback and Rating System
- Real-time Notifications

---

## Municipal Administrator

- Centralized Dashboard
- Complaint Analytics
- User Management
- Department Management
- Worker Management
- Interactive Complaint Heatmap
- Performance Analytics
- CSV Export

---

## Department Officer

- Department Dashboard
- Complaint Assignment
- Worker Assignment
- Complaint Status Updates
- Department Analytics

---

## Field Worker

- Assigned Complaint List
- Task Progress Updates
- Navigation Support
- Before and After Image Upload
- Completion Notes
- Mark Complaint as Resolved

---

# AI Analysis Engine

The AI complaint analysis engine automatically performs:

- Complaint Category Classification
- Severity Prediction
- Priority Prediction
- Responsible Department Recommendation
- Automatic Complaint Title Generation
- Automatic Complaint Description Generation
- Duplicate Complaint Detection

The system currently supports **13 civic complaint categories** mapped across **7 municipal departments**.

---

# Complaint Workflow

```
Citizen
    │
    ▼
Upload Complaint
(Image + GPS)
    │
    ▼
AI Complaint Analysis
(Category • Severity • Priority)
    │
    ▼
Department Recommendation
    │
    ▼
Complaint Registration
    │
    ▼
Department Officer
    │
    ▼
Worker Assignment
    │
    ▼
Field Worker
    │
    ▼
Complaint Resolution
    │
    ▼
Citizen Feedback
```

---

# User Roles

- Citizen
- Municipal Administrator
- Department Officer
- Field Worker

---

# Complaint Categories

- Garbage Collection
- Illegal Dumping
- Road Potholes
- Broken Roads
- Broken Traffic Lights
- Street Light Issues
- Water Leakage
- Sewer Overflow
- Open Manholes
- Construction Debris
- Public Property Damage
- Fallen Trees
- Other Civic Issues

---

# Technology Stack

| Layer | Technology |
|--------|------------|
| Frontend | React 18, Vite, TypeScript |
| Styling | Tailwind CSS, Framer Motion |
| Backend | Supabase |
| Database | PostgreSQL |
| Authentication | Supabase Authentication |
| Storage | Supabase Storage |
| Realtime | Supabase Realtime |
| AI Engine | Supabase Edge Functions (Deno) |
| Maps | React Leaflet + OpenStreetMap |
| Charts | Recharts |
| Deployment | Vercel |

---

# Project Structure

```
src/
├── components/
├── hooks/
├── layouts/
├── pages/
├── services/
├── App.tsx

supabase/
├── migrations/
└── functions/
```

---

# Database

The application uses PostgreSQL through Supabase.

Main database tables include:

- profiles
- departments
- complaint_categories
- complaints
- workers
- complaint_timeline
- notifications
- feedback

Row Level Security (RLS) is enabled to ensure secure role-based access across the application.

---

# Security

- JWT Authentication
- Role-Based Access Control
- Row Level Security (RLS)
- Protected Routes
- Secure Storage Policies

---

# Installation

Clone the repository

```bash
git clone https://github.com/Ashutosh17sy/JanSetu-AI.git
```

Install dependencies

```bash
npm install
```

Configure environment variables

```env
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

Run the application

```bash
npm run dev
```

Build for production

```bash
npm run build
```

---

# Future Enhancements

- AI Vision-based Image Classification
- Voice-based Complaint Registration
- WhatsApp Integration
- Multilingual Support
- Predictive Civic Analytics
- IoT-based Smart City Integration
- Mobile Application (Android & iOS)

---

# Team

**Team Name:** A Square

### Team Leader

Ashutosh Singh Yadav

### Team Member

Ashutosh Kumar Yadav

---

# License

Copyright © 2026 Team A Square. All Rights Reserved.

This project was developed as part of the **AI FIRST HACKATHON 2026**.

The source code and documentation are shared exclusively for hackathon evaluation purposes. No part of this project may be copied, modified, redistributed, or used for commercial purposes without prior written permission from the authors.

---

## Acknowledgements

We sincerely thank the organizers of **AI FIRST HACKATHON 2026** for providing an opportunity to design and develop innovative AI-driven solutions for real-world civic challenges.

JanSetu AI demonstrates how Artificial Intelligence can be used to improve municipal governance through intelligent complaint classification, efficient workflow management, and transparent citizen engagement.
