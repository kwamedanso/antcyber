import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
const Home = lazy(() => import("./pages/public/Home"));
const Login = lazy(() => import("./pages/public/Login"));
const Register = lazy(() => import("./pages/public/Register"));
import ProtectedRoutes from "./utils/ProtectedRoutes";
import {AuthProvider} from "./utils/AuthProvider";
import AuthInitializer from "./utils/AuthInitializer";
const Dashboard = lazy(() => import("./pages/private/Dashboard"));
const Users = lazy(() => import("./pages/private/Users"));
const DashboardLayout = lazy(() => import("./pages/private/DashboardLayout"));
const CreateUser = lazy(() => import("./pages/private/CreateUser"));
import Authorize from "./utils/Authorize";

const router = createBrowserRouter([
  //public routes
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

  //protected routes
  {
    element: <ProtectedRoutes />,
    path: "/admin",
    children: [
     {
      element: <DashboardLayout />,
      children: [
        {
          path: "dashboard",
          element: <Dashboard />,
        },
        {
          path: "users",
          element: <Users />,
        },
        // {
        //   path: "users/create",
        //   element: <CreateUser />,
        // },

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
    }
    ],
  },
]);

function App() {

  return (
    <>
    <AuthProvider>
    <Suspense fallback={<div>Loading...</div>}>
      <AuthInitializer>
      <RouterProvider router={router} />
      </AuthInitializer>
    </Suspense>
    </AuthProvider>
    </>
  )
}

export default App;