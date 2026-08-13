# 🏥 Hospital Appointment Management System

A full-stack hospital appointment management system designed to streamline **patient registration, doctor management, appointment booking, queue management, notifications, and emergency services** through a role-based web application.

## 🚀 Live Demo

**Frontend:**
https://hospital-appointment-management-sys-chi.vercel.app/

**Backend API:**
https://hospital-appointment-management-system-qqxm.onrender.com

> The frontend is deployed on Vercel and the backend API is deployed on Render.

---

## ✨ Key Features

### 👤 Role-Based Access

* Patient
* Doctor
* Receptionist
* Admin

Each role has access to dedicated dashboards and functionality.

### 🧑‍⚕️ Doctor Management

* Doctor profiles
* Department management
* Doctor schedules
* Patient management
* Appointment management
* Doctor queue

### 📅 Appointment Management

* Book appointments
* Reschedule appointments
* Cancel appointments
* Manage appointments
* Follow-up scheduling
* Appointment status tracking

### 🏥 Patient Management

* Patient registration
* Patient profiles
* Patient search
* Appointment history
* QR-based check-in

### 🚨 Emergency & Queue Management

* Emergency appointment booking
* Ambulance request management
* Queue management
* Queue status tracking
* Estimated waiting time

### 🔔 Notifications & Reminders

* Appointment notifications
* Automated appointment reminders
* Reminder scheduling
* Notification management

### 📊 Analytics

* Hospital statistics
* Appointment analytics
* Operational insights

---

## 🛠️ Tech Stack

### Frontend

* React
* TypeScript
* JavaScript
* Vite
* React Router
* Tailwind CSS
* Lucide React
* Motion

### Backend

* Node.js
* Express.js
* REST APIs
* JavaScript
* ESBuild

### Database & Services

* Supabase
* PostgreSQL
* Google Gemini API

### Deployment

* Vercel — Frontend
* Render — Backend

### Development Tools

* Git
* GitHub
* npm

---

## 🏗️ Project Architecture

```text
hospital-appointment-management-system/
│
├── backend/
│   └── src/
│       ├── routes/
│       ├── services/
│       ├── middleware/
│       └── server.js
│
├── src/
│   ├── components/
│   ├── context/
│   ├── layouts/
│   ├── pages/
│   ├── services/
│   ├── styles/
│   └── utils/
│
├── public/
├── package.json
├── vite.config.js
└── README.md
```

---

## 🔐 User Roles

| Role             | Main Capabilities                                                                    |
| ---------------- | ------------------------------------------------------------------------------------ |
| **Patient**      | Register, search doctors, book appointments, manage appointments, check queue status |
| **Doctor**       | Manage schedule, view appointments, manage patients, monitor queue                   |
| **Receptionist** | Manage appointments, patients, queues and emergency requests                         |
| **Admin**        | Manage doctors, departments, patients, receptionists and system analytics            |

---

## ⚙️ Local Setup

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd hospital_appointment_management_system
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file and add the required configuration:

```env
PORT=5000

VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

GOOGLE_API_KEY=your_google_api_key
```

Use your actual project environment variables rather than committing secrets to GitHub.

### 4. Run the frontend

```bash
npm run dev
```

### 5. Run the backend

```bash
npm run dev:backend
```

---

## 🌐 Deployment

### Frontend — Vercel

The React/Vite frontend is deployed using Vercel.

**Live application:**
https://hospital-appointment-management-sys-chi.vercel.app/

### Backend — Render

The Node.js backend is deployed using Render.

**Backend API:**
https://hospital-appointment-management-system-qqxm.onrender.com

The frontend communicates with the deployed backend through the API configuration.

---

## 📱 Demo

### Demo Video

**Demo video:** `ADD_YOUR_VIDEO_LINK_HERE`

The demonstration covers:

1. Application landing page
2. User authentication
3. Role-based dashboards
4. Doctor management
5. Patient management
6. Appointment booking
7. Appointment management
8. Queue management
9. Emergency services
10. Notifications and reminders
11. Analytics

---

## 🔗 Project Links

| Resource              | Link                                                             |
| --------------------- | ---------------------------------------------------------------- |
                                    |
| **Live Frontend**     | https://hospital-appointment-management-sys-chi.vercel.app/      |
| **Backend API**       | https://hospital-appointment-management-system-qqxm.onrender.com |


---

## 🎯 Project Objective

The objective of this project is to provide a centralized digital platform for managing hospital operations and appointments while improving coordination between **patients, doctors, receptionists, and administrators**.

The system reduces manual appointment handling, improves queue visibility, simplifies hospital administration, and provides patients with a more convenient way to access healthcare services.

---

## 👩‍💻 Contributors

Developed as a collaborative project for demonstrating full-stack web development, database integration, REST API development, authentication, deployment, and hospital workflow management.
