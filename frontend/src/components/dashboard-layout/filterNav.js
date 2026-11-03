// utils/filterNav.js

/**
 * Recursively filter a nav tree by the user's permissions.
 *
 * Rules:
 *   - public: true             → always kept
 *   - resource + action        → kept if user `has(resource, action)`
 *   - any: [[r, a], ...]       → kept if user has AT LEAST ONE
 *   - all: [[r, a], ...]       → kept if user has ALL
 *   - no permission field      → kept (treat as public)
 *   - children                 → filtered recursively; parent kept only if
 *                                at least one child survives
 *
 * Never mutates the input config.
 */
export const filterNavByPermissions = (items, permApi) => {
    if (!Array.isArray(items)) return [];

    const { has, hasAny, hasAll } = permApi;

    const isAllowed = (item) => {
        if (item.public === true) return true;
        if (item.resource && item.action) return has(item.resource, item.action);
        if (Array.isArray(item.any) && item.any.length > 0) return hasAny(item.any);
        if (Array.isArray(item.all) && item.all.length > 0) return hasAll(item.all);
        // No permission metadata → treat as public.
        return true;
    };

    return items.reduce((acc, item) => {
        if (Array.isArray(item.children)) {
            const children = filterNavByPermissions(item.children, permApi);

            // Drop the parent when all children were filtered out.
            if (children.length === 0) return acc;

            acc.push({ ...item, children });
            return acc;
        }

        if (isAllowed(item)) acc.push(item);
        return acc;
    }, []);
};