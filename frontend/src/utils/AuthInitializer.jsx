import { useEffect } from "react";
import useAuth from "../hooks/useAuth";
import useRefreshToken from "../hooks/useRefreshToken";

const AuthInitializer = ({ children }) => {
    const { setAuth, setLoading } = useAuth();
    const refresh = useRefreshToken();

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                // Try to get a new access token using the refresh token cookie
                const newAccessToken = await refresh();

                setAuth({ accessToken: newAccessToken });
            } catch (error) {
                // Refresh failed - user needs to login
                console.log("Refresh token expired or invalid");
                setAuth({});
            } finally {
                setLoading(false); // Auth check complete
            }
        };

        initializeAuth();
    }, [refresh, setAuth, setLoading]);

    return children;
};

export default AuthInitializer;