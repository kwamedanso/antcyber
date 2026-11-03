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