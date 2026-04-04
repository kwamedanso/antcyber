import { axiosPrivate } from "../api/axios";
import { useEffect } from "react";
import useRefreshToken from "./useRefreshToken";
import useAuth from "./useAuth";

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

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

                // Check for 401
                if (error?.response?.status === 401 && !prevRequest?.sent) {
                    // Note: Depending on your backend, you can restrict this explicitly by message
                    // if (error?.response?.data?.message === 'Access token expired') {

                    if (isRefreshing) {
                        // Queue concurrent requests while token is actively refreshing
                        try {
                            const token = await new Promise((resolve, reject) => {
                                failedQueue.push({ resolve, reject });
                            });
                            prevRequest.headers['Authorization'] = `Bearer ${token}`;
                            return axiosPrivate(prevRequest);
                        } catch (err) {
                            return Promise.reject(err);
                        }
                    }

                    prevRequest.sent = true;
                    isRefreshing = true;

                    try {
                        const newAccessToken = await refresh();
                        processQueue(null, newAccessToken);
                        
                        prevRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                        return axiosPrivate(prevRequest);
                    } catch (refreshError) {
                        processQueue(refreshError, null);
                        
                        // If refresh fails, redirect to login
                        console.log('Refresh token expired, redirecting to login');
                        window.location.href = '/login';
                        return Promise.reject(refreshError);
                    } finally {
                        isRefreshing = false;
                    }
                }

                // For 403 (invalid token) or other errors, don't retry
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