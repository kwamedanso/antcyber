const { query } = require('../../utils/database/connection');
const createQueryBuilder = require('../../utils/database/queryBuilder'); // Adjust path if needed

// ==========================================
// 1. USERS
// ==========================================
const getUsers = async (filters = {}, page = 1, limit = 50, sortBy = 'created_at', sortOrder = 'DESC') => {
    const builder = createQueryBuilder(
        'SELECT * FROM users', 
        [], 
        { defaultOrderBy: 'ORDER BY created_at DESC' }
    );

    // Exact match filters
    builder.where('staff_id', '=', filters.staff_id);
    builder.where('email', '=', filters.email);
    builder.where('user_type', '=', filters.user_type);
    
    // Boolean filters (ensure they are actual booleans if passed as strings)
    if (filters.must_change_password !== undefined) {
        builder.where('must_change_password', '=', filters.must_change_password);
    }
    if (filters.is_active !== undefined) {
        builder.where('is_active', '=', filters.is_active);
    }

    // Multi-column search
    if (filters.search) {
        builder.search(filters.search, ['staff_id', 'email']);
    }

    // Sorting & Pagination
    builder.sort(sortBy, sortOrder).paginate(page, limit);

    const { query: sql, countQuery, params } = builder.build();

    // Execute main query and count query in parallel
    const [dataResult, countResult] = await Promise.all([
        query(sql, params),
        query(countQuery, params)
    ]);

    const total = parseInt(countResult.rows[0].total, 10);

    return {
        data: dataResult.rows,
        pagination: {
            total,
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            totalPages: Math.ceil(total / limit)
        }
    };
};


// ==========================================
// 2. ROLES
// ==========================================
const getRoles = async (filters = {}, page = 1, limit = 50, sortBy = 'created_at', sortOrder = 'DESC') => {
    const builder = createQueryBuilder(
        'SELECT * FROM roles',
        [],
        { defaultOrderBy: 'ORDER BY created_at DESC' }
    );

    // Exact match filters
    builder.where('name', '=', filters.name);
    builder.where('display_name', '=', filters.display_name);
    
    if (filters.is_active !== undefined) {
        builder.where('is_active', '=', filters.is_active);
    }

    // Multi-column search
    if (filters.search) {
        builder.search(filters.search, ['name', 'display_name']);
    }

    // Sorting & Pagination
    builder.sort(sortBy, sortOrder).paginate(page, limit);

    const { query: sql, countQuery, params } = builder.build();

    const [dataResult, countResult] = await Promise.all([
        query(sql, params),
        query(countQuery, params)
    ]);

    const total = parseInt(countResult.rows[0].total, 10);

    return {
        data: dataResult.rows,
        pagination: {
            total,
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            totalPages: Math.ceil(total / limit)
        }
    };
};


// ==========================================
// 3. ROLE PERMISSIONS (For Role Detail Page)
// ==========================================
const getRolePermissions = async (roleId) => {
    // For a specific role, we typically don't need pagination—just fetch all assigned permissions.
    const sql = `
        SELECT p.* 
        FROM permissions p
        JOIN role_permissions rp ON p.id = rp.permission_id
        WHERE rp.role_id = $1
        ORDER BY p.module ASC, p.resource ASC, p.action ASC
    `;
    
    const { rows } = await query(sql, [roleId]);
    return rows;
};


// ==========================================
// 4. PERMISSIONS (Fetch All)
// ==========================================
const getPermissions = async (filters = {}, page = 1, limit = 50, sortBy = 'module', sortOrder = 'ASC') => {
    const builder = createQueryBuilder(
        'SELECT * FROM permissions',
        [],
        { defaultOrderBy: 'ORDER BY module ASC, resource ASC' }
    );

    // Exact match filters
    builder.where('resource', '=', filters.resource);
    builder.where('action', '=', filters.action);
    builder.where('category', '=', filters.category);
    builder.where('module', '=', filters.module);

    // Multi-column search
    if (filters.search) {
        builder.search(filters.search, [
            'resource', 
            'action', 
            'display_name', 
            'category', 
            'description', 
            'module'
        ]);
    }

    // Sorting & Pagination
    builder.sort(sortBy, sortOrder).paginate(page, limit);

    const { query: sql, countQuery, params } = builder.build();

    const [dataResult, countResult] = await Promise.all([
        query(sql, params),
        query(countQuery, params)
    ]);

    const total = parseInt(countResult.rows[0].total, 10);

    return {
        data: dataResult.rows,
        pagination: {
            total,
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            totalPages: Math.ceil(total / limit)
        }
    };
};


module.exports = {
    getUsers,
    getRoles,
    getRolePermissions,
    getPermissions,
};