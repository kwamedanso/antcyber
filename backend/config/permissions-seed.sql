INSERT INTO permissions (resource, action, display_name, category, description, module) VALUES
-- ============================================================================
-- projects
-- ============================================================================
('projects', 'view',   'View Projects',   'Projects', 'View project details and listings',                'projects'),
('projects', 'create', 'Create Projects', 'Projects', 'Create new projects',                              'projects'),
('projects', 'update', 'Update Projects', 'Projects', 'Edit project details such as name and description','projects'),
('projects', 'delete', 'Delete Projects', 'Projects', 'Delete projects and their associated data',         'projects'),

-- ============================================================================
-- tasks
-- ============================================================================
('tasks', 'view',   'View Tasks',   'Tasks', 'View task details and listings',                          'tasks'),
('tasks', 'create', 'Create Tasks', 'Tasks', 'Create new tasks within a project',                       'tasks'),
('tasks', 'update', 'Update Tasks', 'Tasks', 'Edit task details, priority, status, and due date',       'tasks'),
('tasks', 'delete', 'Delete Tasks', 'Tasks', 'Delete tasks from a project',                             'tasks'),
('tasks', 'assign', 'Assign Tasks', 'Tasks', 'Assign or unassign users to a task',                      'tasks'),

-- ============================================================================
-- task_assignees
-- ============================================================================
('task_assignees', 'view',   'View Task Assignees',   'Task Assignees', 'View users assigned to tasks',                'task_assignees'),
('task_assignees', 'create', 'Assign Task Assignees', 'Task Assignees', 'Assign users to tasks',                       'task_assignees'),
('task_assignees', 'delete', 'Remove Task Assignees', 'Task Assignees', 'Remove users from tasks',                     'task_assignees'),

-- ============================================================================
-- project_members
-- ============================================================================
('project_members', 'view',   'View Project Members',  'Project Members', 'View members of a project',                  'project_members'),
('project_members', 'create', 'Add Project Members',   'Project Members', 'Add users as members of a project',          'project_members'),
('project_members', 'delete', 'Remove Project Members','Project Members', 'Remove users from a project',                'project_members');



INSERT INTO permissions (resource, action, display_name, category, description, module) VALUES
-- ============================================================================
-- reports
-- ============================================================================
('reports', 'view',     'View Reports',      'Reports', 'View report details and listings',                              'reports'),
('reports', 'create',   'Create Reports',    'Reports', 'Create new reports in draft status',                           'reports'),
('reports', 'update',   'Update Reports',    'Reports', 'Edit report details such as title, summary, and recommendations','reports'),
('reports', 'delete',   'Delete Reports',    'Reports', 'Delete reports and their associated attachments',              'reports'),
('reports', 'submit',   'Submit Reports',    'Reports', 'Submit a draft report to the recipient',                       'reports'),
('reports', 'receive',  'Receive Reports',   'Reports', 'Mark a submitted report as received/acknowledged',             'reports'),

-- ============================================================================
-- report_attachments
-- ============================================================================
('report_attachments', 'view',   'View Report Attachments',   'Report Attachments', 'View and download files attached to reports',  'report_attachments'),
('report_attachments', 'create', 'Upload Report Attachments', 'Report Attachments', 'Upload new files to a report',                 'report_attachments'),
('report_attachments', 'delete', 'Delete Report Attachments', 'Report Attachments', 'Remove files attached to a report',            'report_attachments');

-- =============================================================================
-- staff
-- =============================================================================

INSERT INTO permissions (resource, action, display_name, category, description, module) VALUES
-- ============================================================================
-- staff
-- ============================================================================
('staff', 'view',   'View Staff',   'Staff', 'View staff details and listings',                'staff'),
('staff', 'create', 'Create Staff', 'Staff', 'Create new staff members',                           'staff'),
('staff', 'update', 'Update Staff', 'Staff', 'Edit staff details, such as name, contact, and role','staff'),
('staff', 'delete', 'Delete Staff', 'Staff', 'Delete staff members',                             'staff'),
('staff', 'toggle_portal_access', 'Toggle Staff Portal Access', 'Staff', 'Enable or disable staff portal access', 'staff');


-- =============================================================================
-- roles
-- =============================================================================

INSERT INTO permissions (resource, action, display_name, category, description, module) VALUES
-- ============================================================================
-- roles
-- ============================================================================
('roles', 'view',   'View Roles',   'Roles', 'View role details and listings',                'roles'),
('roles', 'create', 'Create Roles', 'Roles', 'Create new roles',                           'roles'),
('roles', 'update', 'Update Roles', 'Roles', 'Edit role details, such as name, and description','roles'),
('roles', 'delete', 'Delete Roles', 'Roles', 'Delete roles',                             'roles'),
('roles', 'assign', 'Assign Roles', 'Roles', 'Assign roles to staff',                        'roles'),
('roles', 'unassign', 'Unassign Roles', 'Roles', 'Unassign roles from staff',                  'roles');