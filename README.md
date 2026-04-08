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

## 📖 Frontend Developer API Reference

This template is built on a highly modular, decoupled architecture. Below is a guide to the core hooks and components you will use to build out the frontend.

### 🌐 API Context & Tokens

- **`axios.js`**: Defines the Axios instances. Contains the standard `axios` for public requests (like login/register), and an `axiosPrivate` instance built specifically with `withCredentials: true` to ensure HTTP-Only refresh cookies are sent to the backend.
- **`useAxiosPrivate.js`**: This is the engine of the Auth flow. It acts as an interceptor hook. It automatically attaches the active `accessToken` to all outbound requests. If a request responds with `401 Unauthorized`, it automatically queues the failed requests, triggers a silent token refresh, and seamlessly retries the requests.
- **`useRefreshToken.js`**: Hits the `/api/auth/refresh` backend endpoint to use the HTTP-Only cookie to retrieve a new short-lived access token, updating the global context automatically.

### 📡 Fetching Secure Data: `usePrivateQuery`

The **`usePrivateQuery`** hook is a custom wrapper around Tanstack's `useQuery` designed for fetching data from protected endpoints. It natively integrates the `useAxiosPrivate` interceptors to ensure that access tokens are automatically attached to the request, and token rotation (refreshing) is handled seamlessly behind the scenes.

#### Arguments

The hook (`usePrivateQuery(queryKey, url, params, options)`) accepts the following arguments:

1. **`queryKey`** _(Array | String)_: The unique key for the query to manage caching and invalidation. Include any dynamic variables (like `queryParams`) in this array so the query automatically refetches when those dependencies change.
2. **`url`** _(String)_: The relative backend API endpoint to fetch data from (e.g., `'/api/template-customization/admin/list'`).
3. **`params`** _(Object, optional)_: URL search parameters to attach to the query string (e.g., pagination, search filters). Defaults to `{}`.
4. **`options`** _(Object, optional)_: Overrides for standard Tanstack Query options (e.g., `enabled: false`, `staleTime: 5000`). Defaults to `{}`.

_Note: Internally, it is pre-configured with `placeholderData: keepPreviousData` for smoother UI transitions during pagination or filtering._

#### Example Usage

```jsx
import { usePrivateQuery } from "../hooks/usePrivateQuery";
import Loader from "../components/loader/Loader";

const Users = ({
  currentPage,
  pageSize,
  debouncedSearch,
  statusFilter,
  paymentStatus,
}) => {
  // 1. Define your query variables for filtering/pagination
  const queryParams = {
    page: currentPage,
    limit: pageSize,
    search: debouncedSearch,
    status: statusFilter,
    paymentStatus: paymentStatus,
  };

  // 2. Invoke the hook
  const { data, isLoading, isError } = usePrivateQuery(
    ["users", queryParams], // Query key (including variables triggers re-fetch on change)
    "/api/users", // Endpoint URL
    queryParams, // Axios params
  );

  if (isLoading) return <Loader />;
  if (isError) return <div>Error loading requests</div>;

  return (
    <ul>
      {data?.items?.map((item) => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
};
```

### 🔐 Auth Context & Initialization

- **`AuthProvider.jsx`**: The React Context Provider that wraps the entire application tree, storing the globally accessible session state (e.g., `accessToken` and the `user` object payload).
- **`useAuth.js`**: A lightweight hook that consumes the `AuthProvider`, allowing any component to easily grab the user's role or access token via `const { auth, setAuth } = useAuth();`.
- **`AuthInitializer.jsx`**: Wrapped just outside the Router. the moment a user hard-refreshes the page, this component fires first. It attempts a silent `useRefreshToken()` call to check if a valid session cookie exists and silently restores the `auth` state, preventing a "flash of unauthenticated content" before rendering the app.

### 🛣️ Routing & Role-Based Access Control (RBAC)

The `createBrowserRouter` configuration inside **`App.jsx`** organizes security logically by utilizing Layout Wrappers:

- **`ProtectedRoutes.jsx`**: A React Router `<Outlet />` wrapper. It checks if `auth?.accessToken` exists. If the user isn't logged in, they are forcibly redirected to `/login`, while preserving their originally intended destination in strict state.
- **`Authorize.jsx`**: The role-based restriction wrapper. It takes an array prop (`allowedRoles={[...]} `). It checks `auth.user.role` against the array. If the user is logged in but doesn't map to an authorized role, it redirects them out of the unauthorized area.

_Example usage in `App.jsx`:_

```jsx
{
  element: <ProtectedRoutes />, // Blocks unauthenticated users
  children: [
    {
      element: <Authorize allowedRoles={["administrator"]} />, // Blocks non-admins
      children: [
        { path: "users/create", element: <CreateUser /> },
      ],
    }
  ],
}
```

- **`DashboardLayout.jsx`**: A role-aware UI Layout component. It dynamically reads your context and filters rendering elements based on roles. For example, the Sidebar configuration automatically filters out navigation links that the logged-in user isn't authorized to visit:

```jsx
const navItems = [
  {
    path: "/admin/dashboard",
    label: "Dashboard",
    roles: ["administrator", "staff"],
  },
  { path: "/admin/users", label: "Users", roles: ["administrator"] },
];
// Automatically filters out the "Users" button if a "staff" member logs in
```

---

## Next Steps

- Consider replacing the manually written validation utilities with a library like **Zod** or **Express-Validator** for robust edge-case handling.
- Build upon the `database.js` connection pool to include an ORM (like Prisma or Drizzle) or a query builder.
