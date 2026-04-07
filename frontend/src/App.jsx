import { lazy, Suspense } from "react";
import {ErrorBoundary} from "react-error-boundary";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ProtectedRoutes from "./utils/ProtectedRoutes";
import {AuthProvider} from "./utils/AuthProvider";
import AuthInitializer from "./utils/AuthInitializer";
import Authorize from "./utils/Authorize";
const Home = lazy(() => import("./pages/public/Home"));
const Login = lazy(() => import("./pages/public/Login"));
const Register = lazy(() => import("./pages/public/Register"));
const MainLayout = lazy(() => import("./pages/private/MainLayout"));
const Dashboard = lazy(() => import("./pages/private/Dashboard"));
const Users = lazy(() => import("./pages/private/Users"));
const CreateUser = lazy(() => import("./pages/private/CreateUser"));
const Settings = lazy(() => import("./pages/private/Settings"));
const NotFound = lazy(() => import("./pages/public/NotFound"));

const router = createBrowserRouter([
  //public routes
  {
    path: "*",
    element: <NotFound />,
  },
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/main",
    element: <MainLayout />,
  },

  //protected routes, only logged in users can access these routes
  {
    element: <ProtectedRoutes />,
    path: "/admin",
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
          //only allowed roles can access these routes because it is nested inside Authorize component
          element: <Authorize allowedRoles={["administrator"]} />,
          children: [
            {
              path: "users/create",
              element: <CreateUser />,
            },
          ],
        },
      ],
    }
    ],
  },
]);

function App() {

  return (
    <>
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
    <AuthProvider>
    <Suspense fallback={<div>Loading...</div>}>
      <AuthInitializer>
      <RouterProvider router={router} />
      </AuthInitializer>
    </Suspense>
    </AuthProvider>
    </ErrorBoundary>
    </>
  )
}

export default App;