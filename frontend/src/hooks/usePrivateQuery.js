// hooks/useCustomQuery.js
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import useAxiosPrivate from './useAxiosPrivate';

export const usePrivateQuery = (queryKey, url, params = {}, options = {}) => {
    const axiosPrivate = useAxiosPrivate();

    return useQuery({
        queryKey,
        queryFn: async () => {
            const { data } = await axiosPrivate.get(url, { params });
            return data;
        },
        placeholderData: keepPreviousData,
        ...options
    });
};