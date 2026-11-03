// utils/AuthInitializer.jsx
import { useEffect, useRef } from 'react';
import useAuth from '../hooks/useAuth';
import useRefreshToken from '../hooks/useRefreshToken';
import { axiosPrivate } from '../api/axios';
import Loader from '../components/loader/Loader';

const AuthInitializer = ({ children }) => {
    const { setAuth, setLoading, loading } = useAuth();
    const refresh = useRefreshToken();

    // Guards against React 18 StrictMode double-invoking the effect in dev,
    // and against refresh() identity changes re-running the bootstrap.
    const initializedRef = useRef(false);

    useEffect(() => {
        if (initializedRef.current) return;
        initializedRef.current = true;

        const initializeAuth = async () => {
            try {
                const accessToken = await refresh();

                // Pull full identity context now that we have a token.
                const meRes = await axiosPrivate.get('/api/auth/me', {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                const profile = meRes.data?.data ?? meRes.data;


                setAuth({
                    accessToken,
                    user: { ...profile?.user, ...profile?.staff },
                    roles: profile?.roles,
                    permissions: profile?.permissions
                });
            } catch (err) {
                // No valid session — leave auth empty, user will hit /login.
                setAuth({});
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, [refresh, setAuth, setLoading]);

    // CRITICAL: do not mount the router until auth is resolved.
    if (loading) {
        return <Loader />;
    }

    return children;
};

export default AuthInitializer;