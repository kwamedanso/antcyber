// hooks/useRefreshToken.js
import { useCallback } from 'react';
import { axiosPrivate } from '../api/axios';
import useAuth from './useAuth';

const useRefreshToken = () => {
    const { auth, setAuth } = useAuth();

    const refresh = useCallback(async () => {
        const response = await axiosPrivate.post('/api/auth/refresh');

        // Support both `{ accessToken }` and `{ data: { accessToken } }`
        const payload = response.data?.data ?? response.data;
        const accessToken = payload?.accessToken;

        if (!accessToken) {
            throw new Error('Refresh response did not include an access token');
        }

        // Merge so we don't wipe user/roles/permissions on background refreshes
        setAuth(prev => ({ ...prev, accessToken }));

        return accessToken;
    }, [setAuth]);

    return refresh;
};

export default useRefreshToken;