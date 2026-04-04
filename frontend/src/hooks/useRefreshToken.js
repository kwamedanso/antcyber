import { axiosPrivate } from '../api/axios';
import useAuth from './useAuth';

const useRefreshToken = () => {
    const {setAuth } = useAuth();

    const refresh = async () => {
        const response = await axiosPrivate.get('/api/auth/refresh', {
            withCredentials: true
        });
        setAuth({ accessToken: response.data.accessToken, user: response.data.user });
        return response.data.accessToken;
    }
    return refresh;
};

export default useRefreshToken;