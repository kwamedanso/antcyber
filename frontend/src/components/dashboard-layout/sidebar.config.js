// config/sidebar.config.js

/**
 * Sidebar navigation tree, grouped into sections.
 *
 * Structure:
 *   [
 *     {
 *       section: 'People' | null,   // null = no header
 *       items: [ ... ]
 *     }
 *   ]
 *
 * Each item can declare:
 *   public: true                  → always visible
 *   resource + action             → single permission check
 *   any:    [[r, a], ...]         → user must have at least one
 *   all:    [[r, a], ...]         → user must have all
 *   children: [...]               → nested items (rendered collapsible)
 *   icon: string                  → key from iconMap.util.js
 *
 * IMPORTANT: resource/action strings must match exactly what your backend
 * seeds into the `permissions` table. A typo means the link silently hides.
 */
export const sidebarConfig = [
    // ---------------------------------------------------------------------
    // Standalone (no section header)
    // ---------------------------------------------------------------------
    {
        section: null,
        items: [
            {
                label: 'Dashboard',
                to: '/admin/dashboard',
                icon: 'dashboard',
                public: true
            }
        ]
    },

    {
        section: "Workflows",
        items: [
            {
                label: "Projects",
                icon: "project_diagram",
                to: "/admin/projects",
                resource: "projects", 
                action: "view",
            },
            {
                label: "Tasks",
                icon: "tasks",
                to: "/admin/tasks",
                resource: "tasks", 
                action: "view",
            },
            {
                label: "Reports",
                to: "/admin/reports",
                icon: "report",
                resource: "reports",
                action: "view"
            }
        ]
    },

     {
        section: "Organization",
        items: [
            {
                label: "Staff Details",
                icon: "people",
                to: "/admin/staff",
                resource: "staff", 
                action: "view",
            },
            
        ]
    },

    // ---------------------------------------------------------------------
    // People
    // ---------------------------------------------------------------------
    // {
    //     section: 'People',
    //     items: [
    //         {
    //             label: 'Staff',
    //             icon: 'users',
    //             children: [
    //                 { label: 'All Staff',       to: '/admin/staff',                 resource: 'staff',                action: 'view',   icon: 'users' },
    //                 { label: 'Add Staff',       to: '/admin/staff/create',          resource: 'staff',                action: 'create', icon: 'user_plus' },
    //                 { label: 'Import',          to: '/admin/staff/import',          resource: 'staff',                action: 'import', icon: 'clipboard' },
    //                 { label: 'Placements',      to: '/admin/staff/placements',      resource: 'staff.placement',      action: 'view',   icon: 'location' },
    //                 { label: 'Rank History',    to: '/admin/staff/rank-history',    resource: 'staff.rank',           action: 'view',   icon: 'award' },
    //                 { label: 'Identifications', to: '/admin/staff/identifications', resource: 'staff.identification', action: 'view',   icon: 'file' },
    //                 { label: 'Staff Details',       to: '/admin/staff',       resource: 'staff.relation',       action: 'view',   icon: 'users' }
    //             ]
    //         },
    //         {
    //             label: 'Documents',
    //             icon: 'file',
    //             children: [
    //                 { label: 'All Documents', to: '/admin/documents',            resource: 'document',          action: 'view', icon: 'file' },
    //                 { label: 'Categories',    to: '/admin/documents/categories', resource: 'document.category', action: 'view', icon: 'layers' }
    //             ]
    //         },
    //         {
    //             label: 'External Users',
    //             icon: 'user_plus',
    //             children: [
    //                 { label: 'All External Users', to: '/admin/external-users',        resource: 'user', action: 'view',   icon: 'users' },
    //                 { label: 'Add External User',  to: '/admin/external-users/create', resource: 'user', action: 'create', icon: 'user_plus' }
    //             ]
    //         }
    //     ]
    // },

    // ---------------------------------------------------------------------
    // Performance
    // ---------------------------------------------------------------------
    {
        section: 'Performance',
        items: [
            {
                label: 'Appraisal',
                icon: 'clipboard',
                children: [
                    { label: 'Cycles',     to: '/admin/appraisal/cycles',     resource: 'appraisal.cycle',     action: 'view',   icon: 'calendar' },
                    { label: 'New Cycle',  to: '/admin/appraisal/cycles/new', resource: 'appraisal.cycle',     action: 'create', icon: 'calendar' },
                    { label: 'Appraisals', to: '/admin/appraisal/create',       resource: 'appraisal',           action: 'view',   icon: 'award' },
                    { label: 'Exceptions', to: '/admin/appraisal/exceptions', resource: 'appraisal.exception', action: 'view',   icon: 'alert' },
                    { label: 'Signatures', to: '/admin/appraisal/signatures', resource: 'appraisal.signature', action: 'view',   icon: 'check' }
                ]
            }
        ]
    },

    // ---------------------------------------------------------------------
    // Configuration
    // ---------------------------------------------------------------------
    {
        section: 'Configuration',
        items: [
            {
                label: 'Payroll',
                icon: 'banknote',
                children: [
                    { label: 'Occupational Groups', to: '/admin/payroll/occupational-groups', resource: 'occupational.group', action: 'view', icon: 'grid' },
                    { label: 'Salary Grades',       to: '/admin/payroll/salary-grades',       resource: 'salary.grade',      action: 'view', icon: 'banknote' },
                    { label: 'Salary Scale',        to: '/admin/payroll/salary-scale',        resource: 'salary.scale',      action: 'view', icon: 'banknote' },
                    { label: 'Job Ranks',           to: '/admin/payroll/job-ranks',           resource: 'job.rank',          action: 'view', icon: 'award' }
                ]
            },
            {
                label: 'Organisation',
                icon: 'building',
                children: [
                    { label: 'Org Units', to: '/admin/org/units',     resource: 'organizational.unit', action: 'view', icon: 'grid' },
                    { label: 'Positions', to: '/admin/org/positions', resource: 'position',            action: 'view', icon: 'briefcase' },
                    { label: 'Regions',   to: '/admin/org/regions',   resource: 'region',              action: 'view', icon: 'location' },
                    { label: 'Districts', to: '/admin/org/districts', resource: 'district',            action: 'view', icon: 'location' }
                ]
            },
            {
                label: 'Settings',
                icon: 'settings',
                children: [
                    { label: 'General',          to: '/admin/settings',              resource: 'settings',        action: 'view', icon: 'settings' },
                    { label: 'Nationalities',    to: '/admin/lookups/nationalities', resource: 'nationality',     action: 'view', icon: 'globe' },
                    { label: 'Religions',        to: '/admin/lookups/religions',     resource: 'religion',        action: 'view', icon: 'globe' },
                    { label: 'Marital Status',   to: '/admin/lookups/marital',       resource: 'marital.status',  action: 'view', icon: 'globe' },
                    { label: 'Languages',        to: '/admin/lookups/languages',     resource: 'language',        action: 'view', icon: 'globe' },
                    { label: 'Disability Types', to: '/admin/lookups/disabilities',  resource: 'disability.type', action: 'view', icon: 'alert' },
                    { label: 'Relation Types',   to: '/admin/lookups/relations',     resource: 'relation.type',   action: 'view', icon: 'users' }
                ]
            }
        ]
    },

    // ---------------------------------------------------------------------
    // Access
    // ---------------------------------------------------------------------
    {
        section: 'Access',
        items: [
            {
                label: 'Users & Access',
                icon: 'shield',
                children: [
                    { label: 'Users',       to: '/admin/users',       resource: 'user',       action: 'view', icon: 'users' },
                    { label: 'Roles',       to: '/admin/roles',       resource: 'role',       action: 'view', icon: 'shield' },
                    { label: 'Permissions', to: '/admin/permissions', resource: 'permission', action: 'view', icon: 'shield' }
                ]
            }
        ]
    },

    {
        section: "Access",
        items: [
            {
                label: "Roles & Permissions",
                icon: "shield",
                to: "/admin/roles",
                resource: "roles", 
                action: "view",
            },
            
        ]
    }
];