import { Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoutes = () => {
    const { auth, loading } = useAuth();
    const location = useLocation();

    // Wait for the initial auth check to complete
    if (loading) {
        return <div>Loading...</div>; // Show loading dots
    }

    // If user is not logged in, redirect to login page
    if (!auth?.accessToken) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If user is logged in, show the protected routes
    return <Outlet />;
};

export default ProtectedRoutes;