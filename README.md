# Hostel Residency — Hostel Inventory & Governance System

A full-stack hostel management system for tracking rooms, students, inventory, and maintenance — with AI-powered stock insights and a real, database-backed authentication system.

Built with **React + TypeScript** on the frontend and **Node.js/Express + MongoDB** on the backend.

## Features

- **Room & bed management** — register rooms, track capacity, occupancy, and allocated inventory
- **Student roster** — register students, assign them to rooms/beds, track contact details
- **Inventory tracking** — stock levels, categories, search & filter, stock in/out transactions with activity logging
- **Maintenance requests** — file, track, and resolve maintenance tickets per room
- **Notifications & request approvals** — a lightweight internal request/approval workflow
- **AI-powered insights** (Google Gemini) — stock predictions, low-stock alerts, and restock recommendations
- **Dashboard analytics** — live occupancy rate, inventory health, and activity trends (Recharts)

## Security

This project went through a real security hardening pass — not just cosmetic:

- **Real authentication** — email/password login verified against MongoDB (bcrypt password hashing + JWT sessions), replacing an earlier browser-localStorage-only prototype
- **No public self-registration** — accounts are created by an admin only; the very first admin is created via a one-time seed script
- **Every API route requires a valid login** — rooms, students, inventory, maintenance, requests, notifications, stock, activity logs, dashboard stats, and AI insights are all behind auth middleware; destructive student operations (create/update/delete) are further restricted to admin/staff roles
- **No secrets leaked to logs** — JWT secret and third-party API keys are never printed to the console
- **Password reset flow** — backend-verified reset-token flow (see Known limitations below)

### Known limitations

- The password-reset flow returns the reset token directly in the API response instead of emailing it, since no email service is configured. Fine for a demo/local environment, but would need a real email provider (e.g. Resend, Nodemailer + SMTP) before production use.
- There's currently no per-resource read-only role — any logged-in user can create/edit most resource types. A public read-only "demo mode" would need explicit role-based permission checks added across the remaining controllers.

## Tech Stack

**Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Recharts, Axios, lucide-react
**Backend:** Node.js, Express 5, MongoDB (Mongoose), JWT, bcryptjs
**AI:** Google Gemini API (`@google/generative-ai`)

## Project Structure

```
├── backend/
│   ├── controllers/    # Route logic (auth, students, rooms, inventory, etc.)
│   ├── middleware/      # JWT verification & role-based authorization
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express route definitions
│   ├── seed/            # One-time admin account seed script
│   └── server.js
└── frontend/
    └── src/
        ├── components/  # Page-level React components
        ├── services/    # API client + typed service functions per resource
        ├── AppContext.tsx
        └── App.tsx
```

## Getting Started

### Prerequisites

- Node.js 18+
- A MongoDB database (local, or a free MongoDB Atlas cluster)

### 1. Clone and install

```bash
git clone <this-repo-url>
cd hostel-inventory-system

cd backend
npm install

cd ../frontend
npm install
```

### 2. Configure environment variables

In `backend/`, copy the example env file and fill in your own values:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```
PORT=5000
MONGO_URI=<your MongoDB connection string>
JWT_SECRET=<any long random string>
GEMINI_API_KEY=<optional — only needed for the AI insights routes>
```

### 3. Create your first admin account

Public registration is disabled by design, so you need to seed the first login:

```bash
cd backend
npm run seed:admin -- "Your Name" "you@example.com" "YourPassword123"
```

### 4. Run it

In one terminal:
```bash
cd backend
npm run dev
```

In a second terminal:
```bash
cd frontend
npm run dev
```

Visit `http://localhost:3000` and log in with the admin credentials from step 3.

## License

This project is for educational/portfolio purposes.