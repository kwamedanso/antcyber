import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const Authorize = ({ allowedRoles }) => {
  const { auth } = useAuth();
  const location = useLocation();

  if (!auth?.accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = JSON.parse(localStorage.getItem("user")).role;
  console.log(userRole);

  if (!allowedRoles.includes(userRole)) {
    // Redirect to a "Unauthorized" page or back to dashboard
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Outlet />;
};

export default Authorize;