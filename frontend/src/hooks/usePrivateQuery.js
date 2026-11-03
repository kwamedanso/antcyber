import { useQuery, keepPreviousData } from '@tanstack/react-query';
import useAxiosPrivate from './useAxiosPrivate';

export const usePrivateQuery = (queryKey, url, params = {}, options = {}, axiosConfig = {}) => {
    const axiosPrivate = useAxiosPrivate();

    return useQuery({
        queryKey,
        queryFn: async ({ signal }) => {
            const { data } = await axiosPrivate.get(url, { 
                params, 
                signal,
                ...axiosConfig // Allows passing custom headers, responseType, etc.
            });
            return data;
        },
        // refetchOnMount: false,
        // refetchOnWindowFocus: false,
        placeholderData: keepPreviousData,
        ...options
    });
};


/* USAGE EXAMPLES:

1. Basic usage with automatic re-fetch on mount/focus:
    const { data, isLoading, error } = usePrivateQuery(['todos'], '/api/todos');

2. With custom query parameters:
    const { data } = usePrivateQuery(
        ['todos', { status: 'active' }], 
        '/api/todos', 
        { status: 'active' } // Params object
    );

3. Using manual refetch:
    const { data, refetch } = usePrivateQuery(['todos'], '/api/todos');
    // Call refetch() manually when needed

4. Disabling automatic re-fetch on mount/focus:
    const { data } = usePrivateQuery(
        ['todos'], 
        '/api/todos',
        {},
        {
            refetchOnMount: false,   // Don't refetch when component mounts
            refetchOnWindowFocus: false, // Don't refetch when window regains focus
            refetchOnReconnect: false, // Don't refetch on network reconnect
            retry: 1                 // Limit retries to 1 instead of default 3
        }
    );

5. Passing custom Axios config (headers, responseType, etc.):
    const { data } = usePrivateQuery(
        ['todos'], 
        '/api/todos/export', 
        {},
        {},
        {
            responseType: 'blob', // For file downloads
            headers: { 'Accept': 'text/csv' } // Custom headers
        }
    );

6. Combining with placeholderData:
    import { keepPreviousData } from '@tanstack/react-query';
    
    const { data } = usePrivateQuery(
        ['todos'], 
        '/api/todos',
        {},
        {
            placeholderData: keepPreviousData // Shows previous data while loading new data
        }
    );

7. Error handling:
    const { data, error, isLoading, isError } = usePrivateQuery(['todos'], '/api/todos');
    if (isError) {
        console.error('Error fetching todos:', error.message);
    }

8. Manual refetch with custom options:
    const { data, refetch } = usePrivateQuery(['todos'], '/api/todos');
    
    // Refetch with additional query parameters
    const handleRefetch = () => {
        refetch({
            queryKey: ['todos', { filter: 'updated' }], // New query key
            refetchType: 'active' // Only refetch if query is active
        });
    };

*/