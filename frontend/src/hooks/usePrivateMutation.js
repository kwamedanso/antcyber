import { useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosPrivate from './useAxiosPrivate';

export const usePrivateMutation = ({ 
    cacheConfig, 
    targetQueryKey, 
    onSuccess, 
    onError, 
    onSettled, 
    ...options 
} = {}) => {
    const axiosPrivate = useAxiosPrivate();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ url, method = 'POST', data = {}, ...restConfig }) => {
            // Allows passing headers, params, etc. through ...restConfig
            const response = await axiosPrivate({ url, method, data, ...restConfig });
            return response.data?.data ?? response.data; // Safe fallback for empty/flat responses
        },
        onSuccess: async (responseData, variables, context) => {
            if (cacheConfig?.queryKey && cacheConfig?.action) {
                const { queryKey, action, idKey = 'id', explicitTargetId } = cacheConfig;

                queryClient.setQueriesData({ queryKey }, (oldResponse) => {
                    if (!oldResponse) return oldResponse;

                    // Cleanly extract the target ID from string or object safely
                    const cleanUrl = variables.url.endsWith('/') ? variables.url.slice(0, -1) : variables.url;
                    const targetId = explicitTargetId || variables.data?.ids || variables.data?.[idKey] || cleanUrl.split('/').pop();

                    // Defensive structural checker
                    let oldArray = [];
                    let structureType = 'array';

                    if (Array.isArray(oldResponse)) {
                        oldArray = oldResponse;
                        structureType = 'array';
                    } else if (oldResponse.data && Array.isArray(oldResponse.data)) {
                        oldArray = oldResponse.data;
                        structureType = 'envelope';
                    } else if (oldResponse.data?.results && Array.isArray(oldResponse.data.results)) {
                        oldArray = oldResponse.data.results;
                        structureType = 'paginated';
                    } else if (oldResponse.data && typeof oldResponse.data === 'object' && !Array.isArray(oldResponse.data)) {
                        // Handle single item envelope cache (e.g., ["domains", id])
                        if (action === 'edit' && String(oldResponse.data[idKey]) === String(responseData[idKey])) {
                            return { ...oldResponse, data: { ...oldResponse.data, ...responseData } };
                        }
                        return oldResponse;
                    } else {
                        return oldResponse; 
                    }

                    // Initialize to oldArray so unknown actions don't wipe the cache
                    let updatedArray = oldArray;

                    if (action === 'add') {
                        updatedArray = [responseData, ...oldArray];
                    }

                    if (action === 'edit') {
                        updatedArray = oldArray.map((item) =>
                            String(item[idKey]) === String(responseData[idKey]) ? {...item, ...responseData} : item
                        );
                    }

                    if (action === 'delete') {
                        const idsToDelete = Array.isArray(targetId) 
                            ? targetId.map(id => String(id)) 
                            : [String(targetId)];

                        updatedArray = oldArray.filter((item) => !idsToDelete.includes(String(item[idKey])));
                    }

                    // Build back up into the specific structure usePrivateQuery received
                    if (structureType === 'array') return updatedArray;
                    if (structureType === 'envelope') return { ...oldResponse, data: updatedArray };
                    if (structureType === 'paginated') {
                        return {
                            ...oldResponse,
                            data: {
                                ...oldResponse.data,
                                results: updatedArray
                            }
                        };
                    }
                    return oldResponse;
                });
            }

            // Always run an invalidation fallback as a safety measure for cross-page sync
            if (targetQueryKey) {
                await queryClient.invalidateQueries({ 
                    queryKey: targetQueryKey,
                    exact: false 
                });
            }

            // Safely execute external onSuccess if provided in options
            if (onSuccess) {
                await onSuccess(responseData, variables, context);
            }
        },
        onError: async (error, variables, context) => {
            if (onError) await onError(error, variables, context);
        },
        onSettled: async (data, error, variables, context) => {
            if (onSettled) await onSettled(data, error, variables, context);
        },
        ...options
    });
};



/*
 * USAGE EXAMPLES:
 * 
 * 1. AUTOMATIC REFETCH (Easiest - Triggers a new GET request)
 *    const { mutate } = usePrivateMutation({ targetQueryKey: ['todos'] });
 *    mutate({ url: '/api/todos', method: 'POST', data: { title: 'New Task' } });
 * 
 * 2. AUTOMATIC CACHE ADD (Appends server response to cached list array)
 *    const { mutate } = usePrivateMutation({
 *        cacheConfig: { queryKey: ['todos'], action: 'add' }
 *    });
 *    mutate({ url: '/api/todos', method: 'POST', data: { title: 'New Task' } });
 * 
 * 3. AUTOMATIC CACHE EDIT (Finds item by ID and merges it with server response)
 *    const { mutate } = usePrivateMutation({
 *        cacheConfig: { queryKey: ['todos'], action: 'edit', idKey: '_id' }
 *    });
 *    mutate({ url: '/api/todos/123', method: 'PATCH', data: { completed: true } });
 * 
 * 4. AUTOMATIC CACHE DELETE (Removes item from local cache array)
 *    const { mutate } = usePrivateMutation({
 *        cacheConfig: { queryKey: ['todos'], action: 'delete' }
 *    });
 *    mutate({ url: '/api/todos/123', method: 'DELETE' });
 *
 * 5. CUSTOM CALLBACKS & HEADERS (Safely executes alongside cache updates)
 *    const { mutate } = usePrivateMutation({
 *        cacheConfig: { queryKey: ['todos'], action: 'add' },
 *        onSuccess: (data) => toast.success('Added!'),
 *        onError: (err) => toast.error('Failed')
 *    });
 *    mutate({ 
 *        url: '/api/todos/upload', 
 *        method: 'POST', 
 *        data: formData,
 *        headers: { 'Content-Type': 'multipart/form-data' } // Extra Axios config
 *    });
 *
 * 6. EXPLICIT TARGET ID (For non-standard DELETE/EDIT URLs where ID is not at the end)
 *    const { mutate } = usePrivateMutation({
 *        cacheConfig: { queryKey: ['todos'], action: 'delete', explicitTargetId: '123' }
 *    });
 *    mutate({ url: '/api/todos/123/remove', method: 'POST' });
 */