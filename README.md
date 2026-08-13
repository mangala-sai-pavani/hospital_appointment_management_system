# Hospital Appointment Management System

A full-stack Hospital Appointment Management System with multi-role access control for **Patients**, **Doctors**, **Receptionists**, and **Admins**.

## Tech Stack
- **Frontend**: React + Vite, React Router, Plain CSS (No Tailwind)
- **Backend**: Node.js Native HTTP Server (No Express), `@supabase/supabase-js`, `dotenv`
- **Database & Auth**: Supabase PostgreSQL + Supabase Auth (Email/Password, Metadata-based Roles)

## Project Structure
```
hospital-appointment-system/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── context/
│   │   ├── utils/
│   │   ├── styles/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── src/
│   │   ├── server.js
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── validations/
│   ├── package.json
│   └── .env
├── database/
│   ├── schema.sql
│   └── seed.sql
└── README.md
```

## Setup & Running
1. Configure `.env` with `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `PORT=3000`.
2. Run database setup using `database/schema.sql` and `database/seed.sql` in Supabase SQL Editor.
3. Run backend & frontend server with `npm run dev`.
