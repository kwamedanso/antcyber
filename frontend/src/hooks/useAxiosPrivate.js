import { axiosPrivate } from "../api/axios";
import { useEffect } from "react";
import useRefreshToken from "./useRefreshToken";
import useAuth from "./useAuth";

const useAxiosPrivate = () => {
    const refresh = useRefreshToken();
    const { auth } = useAuth();

    useEffect(() => {

        const requestIntercept = axiosPrivate.interceptors.request.use(
            config => {
                if (!config.headers['Authorization']) {
                    config.headers['Authorization'] = `Bearer ${auth?.accessToken}`;
                }
                return config;
            }, (error) => Promise.reject(error)
        );

        const responseIntercept = axiosPrivate.interceptors.response.use(
            response => response,
            async (error) => {
                const prevRequest = error?.config;

                // Check for 401 (expired token)
                if (error?.response?.status === 401 && !prevRequest?.sent) {
                    const errorMessage = error.response?.data?.message;

                    // Only refresh if the error is specifically "Access token expired"
                    if (errorMessage === 'Access token expired') {
                        prevRequest.sent = true;
                        try {
                            const newAccessToken = await refresh();
                            prevRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                            return axiosPrivate(prevRequest);
                        } catch (refreshError) {
                            // If refresh fails, redirect to login
                            console.log('Refresh token expired, redirecting to login');
                            window.location.href = '/login';
                            return Promise.reject(refreshError);
                        }
                    }
                }

                // For 403 (invalid token) or other 401 errors, don't retry
                return Promise.reject(error);
            }
        );

        return () => {
            axiosPrivate.interceptors.request.eject(requestIntercept);
            axiosPrivate.interceptors.response.eject(responseIntercept);
        }
    }, [auth, refresh])

    return axiosPrivate;
}

export default useAxiosPrivate;