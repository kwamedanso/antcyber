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
const Projects = lazy(() => import("./pages/public/Projects"));
const ProjectDetails = lazy(() => import("./pages/public/ProjectDetails"));
const WebEngineering = lazy(() => import("./pages/public/WebEngineering"));
const CloudCybersecurity = lazy(() => import("./pages/public/CloudCybersecurity"));

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
        path: "register",
        element: <Register />,
      },
      {
        path: "main",
        element: <MainLayout />,
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
      {/* <AuthProvider> */}
        <Suspense fallback={<Loader />}>
          {/* <AuthInitializer> */}
            <RouterProvider router={router} />
          {/* </AuthInitializer> */}
        </Suspense>
      {/* </AuthProvider> */}
    </ErrorBoundary>
  );
}

export default App;
