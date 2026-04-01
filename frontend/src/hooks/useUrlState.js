import { useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom'; // Assuming react-router-dom v6+

/**
 * Custom hook for managing state (like filters/search) in the URL query string.
 * This ensures state persists across navigation and is shareable.
 * @param {string} key - The query parameter key (e.g., 'search', 'category')
 * @param {string} defaultValue - The default value if not present in the URL
 * @returns {[string, (newValue: string) => void]} [currentValue, setValue]
 */
export const useUrlState = (key, defaultValue = '') => {
    const [searchParams, setSearchParams] = useSearchParams();

    const value = useMemo(() => {
        return searchParams.get(key) || defaultValue;
    }, [searchParams, key, defaultValue]);

    const setValue = useCallback((newValue) => {
        setSearchParams(prev => {
            if (newValue === defaultValue || newValue === null || newValue === '') {
                prev.delete(key);
            } else {
                prev.set(key, newValue);
            }
            return prev;
        }, { replace: true });
    }, [key, defaultValue, setSearchParams]);

    return [value, setValue];
};