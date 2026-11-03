import { lazy, Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { createBrowserRouter, RouterProvider, ScrollRestoration, Outlet } from "react-router-dom"; // Added Outlet
import ProtectedRoutes from "./utils/ProtectedRoutes";
import { AuthProvider } from "./utils/AuthProvider";
import AuthInitializer from "./utils/AuthInitializer";
import Authorize from "./utils/Authorize";

const Home = lazy(() => import("./pages/public/Home"));
const Login = lazy(() => import("./pages/public/Login"));
const Register = lazy(() => import("./pages/public/Register"));
const MainLayout = lazy(() => import("./components/dashboard-layout/MainLayout"));
const Dashboard = lazy(() => import("./pages/private/Dashboard"));
const Users = lazy(() => import("./pages/private/Users"));
const CreateUser = lazy(() => import("./pages/private/CreateUser"));
const Settings = lazy(() => import("./pages/private/Settings"));
const NotFound = lazy(() => import("./pages/public/NotFound"));
const Loader = lazy(() => import("./components/loader/Loader"));
const About = lazy(() => import("./pages/public/About"));
const Services = lazy(() => import("./pages/public/Services"));
const Contact = lazy(() => import("./pages/public/Contact"));
// const Projects = lazy(() => import("./pages/public/Projects"));
const ProjectDetails = lazy(() => import("./pages/public/ProjectDetails"));
const WebEngineering = lazy(() => import("./pages/public/WebEngineering"));
const CloudCybersecurity = lazy(() => import("./pages/public/CloudCybersecurity"));
const SetPassword = lazy(() => import("./pages/public/SetPassword"));
const ForgotPassword = lazy(() => import("./pages/public/ForgotPassword"));
const CreateTask = lazy(() => import("./pages/private/CreateTask"));
const EditTask = lazy(() => import("./pages/private/EditTask"));
const CreateProject = lazy(() => import("./pages/private/CreateProject"));
const EditProject = lazy(() => import("./pages/private/EditProject"));
const Tasks = lazy(() => import("./pages/private/Tasks"));
const ViewTask = lazy(() => import("./pages/private/ViewTask"));
const Projects = lazy(() => import("./pages/private/Projects"));
const ViewProject = lazy(() => import("./pages/private/ViewProject"));
const CreateReport = lazy(() => import("./pages/private/CreateReport"));
const Reports = lazy(() => import("./pages/private/Reports"));
const EditReport = lazy(() => import("./pages/private/EditReport"));
const ViewReport = lazy(() => import("./pages/private/ViewReport"));

const CreateRole = lazy(() => import("./pages/private/CreateRole"));
const EditRole = lazy(() => import("./pages/private/EditRole"));
const Roles = lazy(() => import("./pages/private/Roles"));

const CreateStaff = lazy(() => import("./pages/private/CreateStaff"));
const EditStaff = lazy(() => import("./pages/private/EditStaff"));
const Staff = lazy(() => import("./pages/private/Staff"));
const ViewStaff = lazy(() => import("./pages/private/ViewStaff"));
const Setup = lazy(() => import("./pages/public/Setup"));
const ForcedChangePassword = lazy(() => import("./pages/public/ForcedChangePassword"));

// 1. Create a Root Layout to wrap the application and inject ScrollRestoration
function RootLayout() {
  return (
    <>
      <ScrollRestoration />
      <Outlet />
    </>
  );
}

// 2. Wrap all existing routes inside this RootLayout
const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      // public routes
      {
        path: "*",
        element: <NotFound />,
      },
      {
        index: true, // Replaced path: "/" with index: true for the home page
        element: <Home />,
      },
      {
        path: "about",
        element: <About />,
      },
      {
        path: "services",
        element: <Services />,
      },
      {
        path: "services/web-engineering",
        element: <WebEngineering />,
      },
      {
        path: "services/cloud-cybersecurity",
        element: <CloudCybersecurity />,
      },
      {
        path: "contact",
        element: <Contact />,
      },
      {
        path: "projects",
        element: <Projects />,
      },
      {
        path: "projects/:id",
        element: <ProjectDetails />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "setup",
        element: <Setup />,
      },
      {
        path: "main",
        element: <MainLayout />,
      },
      {
        path: "set-password",
        element: <SetPassword />,
      },
      {
        path: "forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "/change-default-password",
        element: <ForcedChangePassword />
      },

      // protected routes
      {
        element: <ProtectedRoutes />,
        path: "admin",
        children: [
          {
            element: <MainLayout />,
            children: [
              {
                path: "dashboard",
                element: <Dashboard />,
              },
              {
                path: "users",
                element: <Users />,
              },
              {
                path: "settings",
                element: <Settings />,
              },
              {
                path: "tasks",
                element: <Tasks />,
              },
              {
                path: "tasks/create",
                element: <CreateTask />,
              },
              {
                path: "tasks/:id",
                element: <ViewTask />,
              },
              {
                path: "tasks/:id/edit",
                element: <EditTask />,
              },
              {
                path: "projects",
                element: <Projects />,
              },
              {
                path: "projects/create",
                element: <CreateProject />,
              },
              {
                path: "projects/:id/edit",
                element: <EditProject />,
              },
              {
                path: "projects/:id",
                element: <ViewProject />,
              },
              {
                path: "reports",
                element: <Reports />,
              },
              {
                path: "reports/create",
                element: <CreateReport />,
              },
              {
                path: "reports/:id/edit",
                element: <EditReport />,
              },
              {
                path: "reports/:id",
                element: <ViewReport />,
              },
              {
                path: "roles/create",
                element: <CreateRole />,
              },
              {
                path: "roles/:id/edit",
                element: <EditRole />,
              },
              {
                path: "roles",
                element: <Roles />,
              },
              {
                path: "staff/create",
                element: <CreateStaff />,
              },
              {
                path: "staff/:id",
                element: <ViewStaff />,
              },
              {
                path: "staff/:id/edit",
                element: <EditStaff />,
              },
              {
                path: "staff",
                element: <Staff />,
              },
              {
                element: <Authorize allowedRoles={["administrator"]} />,
                children: [
                  {
                    path: "users/create",
                    element: <CreateUser />,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
]);

function App() {
  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <AuthProvider>
        <AuthInitializer>
          <Suspense fallback={<Loader />}>
            <RouterProvider router={router} />
          </Suspense>
        </AuthInitializer>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
