# Advanced Fullstack Starter Template

A robust, production-ready starter template built with **React (Vite)**, **Node.js (Express)**, and **PostgreSQL**.

This template comes fully configured out of the box with a secure JWT authentication flow (using both access and HTTP-only refresh tokens), protected routing, and efficient data caching.

---

## 🚀 Features

### Frontend (React + Vite)

- **Vite** for blazing fast HMR and optimized builds.
- **React Router DOM** pre-configured with public, private routes, and layout wrappers.
- **Tanstack Query (React Query)** pre-configured for data fetching, caching, and state management.
- **Axios Interceptors** setup for automatically attaching credentials to API requests.
- **Solid Auth Flow**: Ready-to-go `Login`, `Register`, `Dashboard` and `Users` pages with context providers managing the auth state.

### Backend (Node.js + PostgreSQL)

- **Express.js** API with pre-configured CORS, Cookie-Parser, and JSON body parsing.
- **PostgreSQL Database** integration (`pg` module) with structured schemas for Users and Refresh Tokens.
- **Secure Authentication**:
  - Passwords hashed via `bcryptjs`.
  - Dual token system (`jsonwebtoken`): short-lived access tokens and long-lived HTTP-only, secure refresh cookies.
- **Form validation workflows** pre-written for login and registration handlers.

---

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed on your machine:

- [Node.js](https://nodejs.org/en) (v18 or newer recommended)
- [PostgreSQL](https://www.postgresql.org/download/)

---

## 📦 Setup Instructions

### 1. Database Setup

Ensure PostgreSQL is running on your machine.

1. Connect to PostgreSQL and create a database (e.g., `starter`).
2. Run the SQL schema script provided in `backend/config/databaseSchema.sql` to initialize your `users` and `refresh_tokens` tables.

### 2. Backend Initialization

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Create your environment variables:
   Copy `.env.example` to a new `.env` file and fill in your database credentials:
   ```bash
   cp .env.example .env
   ```
   _Note: Update the DB_PASSWORD, DB_NAME, DB_PORT based on your Postgres configuration._
4. Start the server:
   ```bash
   npm start
   ```
   The backend should now be running on `http://localhost:5177` (or your defined `PORT`).

### 3. Frontend Initialization

1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend will launch and typically be accessible at `http://localhost:5173`.
   _(Note: Vite is pre-configured to automatically proxy `/api` requests directly to your backend, avoiding pesky CORS issues during development!)_

---

## 📂 Project Structure Overview

```text
├── backend/
│   ├── config/              # Database connection logic & SQL schemas
│   ├── controllers/         # Authentication and route handlers
│   ├── middleware/          # JWT Verification middlewares
│   ├── routes/              # Express API Routes
│   ├── utils/               # DB Queries, Validation logic, Mailer setup
│   ├── .env.example         # Template for environment variables
│   └── server.js            # Entry point for the Node application
│
└── frontend/
    ├── src/
    │   ├── api/             # Axios configurations
    │   ├── components/      # Reusable React components
    │   ├── hooks/           # Custom hooks (e.g., useAuth)
    │   ├── pages/           # Page views (public/private)
    │   ├── utils/           # Context Providers, Protected Routes
    │   ├── App.jsx          # Main Router Setup
    │   └── main.jsx         # React application entry (& React Query wrap)
    └── vite.config.js       # Vite proxy settings
```

---

## Next Steps

- Consider replacing the manually written validation utilities with a library like **Zod** or **Express-Validator** for robust edge-case handling.
- Build upon the `database.js` connection pool to include an ORM (like Prisma or Drizzle) or a query builder.
