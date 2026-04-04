import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const Authorize = ({ allowedRoles }) => {
  const { auth } = useAuth();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/admin/dashboard";

  if (!auth?.accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(auth?.user?.role)) {
    // Redirect to a "Unauthorized" page or back to dashboard
    return <Navigate to={from} replace />;
  }

  return <Outlet />;
};

export default Authorize;