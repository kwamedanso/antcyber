import { useQueryClient } from '@tanstack/react-query';

export const useUpdateCache = () => {
    const queryClient = useQueryClient();

    /**
     * @param {Array} queryKey - The React Query key (e.g., ['staff', id, 'personal'])
     * @param {Function} updater - Callback receiving oldData, returning the newData
     */
    const updateCache = (queryKey, updater) => {
        queryClient.setQueryData(queryKey, (oldData) => {
            if (!oldData) return oldData;
            return updater(oldData);
        });
    };

    return updateCache;
};