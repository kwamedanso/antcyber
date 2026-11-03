import { axiosPrivate } from "../api/axios";
import { useEffect } from "react";
import useRefreshToken from "./useRefreshToken";
import useAuth from "./useAuth";

let isRefreshing = false;
let failedQueue = [];


export const clearAxiosPrivateQueue = () => {
    failedQueue.forEach(prom => prom.reject(new Error("Queue cleared on navigation")));
    failedQueue = [];
    isRefreshing = false;
};

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

        // 🚀 CRITICAL FIX: Skip refresh logic if this is the login route!
        if (prevRequest?.url?.includes('/api/auth/login')) {
            return Promise.reject(error); // Sends the 401 straight to onError
        }

        // Check for 401 for all other secure routes
        if (error?.response?.status === 401 && !prevRequest?.sent) {
            if (isRefreshing) {
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