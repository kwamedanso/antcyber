// hooks/usePermissions.js
import { useMemo } from 'react';
import useAuth from './useAuth';

/**
 * Returns a helper API for checking the current user's permissions.
 *
 * The `auth.permissions` object shape:
 *   {
 *     "appraisal.cycle": ["view", "approve"],
 *     "documents":       ["view"]
 *   }
 */
const usePermissions = () => {
    const { auth } = useAuth();
    const permissions = auth?.permissions;

    return useMemo(() => {
        /**
         * Check whether the user has a specific (resource, action).
         */
        const has = (resource, action) => {
            if (!permissions || !resource || !action) return false;
            const actions = permissions[resource];
            if (!Array.isArray(actions)) return false;
            return actions.includes(action);
        };

        /**
         * Check whether the user has ALL of the given [resource, action] pairs.
         * e.g. hasAll([['documents', 'view'], ['documents', 'update']])
         */
        const hasAll = (pairs) => {
            if (!Array.isArray(pairs)) return false;
            return pairs.every(([resource, action]) => has(resource, action));
        };

        /**
         * Check whether the user has ANY of the given [resource, action] pairs.
         */
        const hasAny = (pairs) => {
            if (!Array.isArray(pairs)) return false;
            return pairs.some(([resource, action]) => has(resource, action));
        };

        return { has, hasAll, hasAny, permissions };
    }, [permissions]);
};

export default usePermissions;