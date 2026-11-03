-- ============================================================================
-- EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS pg_trgm;      -- for fuzzy/trigram search
CREATE EXTENSION IF NOT EXISTS btree_gist;   -- for EXCLUDE USING gist


-- ============================================================================
-- 1. CORE: USERS
-- ============================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE,
    password_hash TEXT NOT NULL,
    must_change_password BOOLEAN NOT NULL DEFAULT FALSE,
    user_type VARCHAR(30) NOT NULL
        CHECK (user_type IN ('employee', 'external')),
    email_verified_at TIMESTAMPTZ,
    failed_login_attempts INT DEFAULT 0,
    locked_until TIMESTAMPTZ,
    password_changed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret TEXT,
    sso_provider VARCHAR(50),
    sso_id VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_users_updated_by    ON users(updated_by);
CREATE INDEX idx_users_user_type     ON users(user_type) WHERE is_active = TRUE;
CREATE INDEX idx_users_locked_until  ON users(locked_until) WHERE locked_until IS NOT NULL;
CREATE INDEX idx_users_email_lower   ON users(LOWER(email));
CREATE INDEX idx_users_sso           ON users(sso_provider, sso_id) WHERE sso_id IS NOT NULL;


-- ============================================================================
-- 2. AUTH: PERMISSIONS, ROLES, TOKENS
-- ============================================================================
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    display_name VARCHAR(150) NOT NULL,
    category VARCHAR(50),
    description TEXT,
    module VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_resource_action UNIQUE (resource, action)
);

CREATE INDEX idx_permissions_module ON permissions(module);


CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_roles_updated_by ON roles(updated_by);


CREATE TABLE role_permissions (
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE INDEX idx_role_permissions_permission_id ON role_permissions(permission_id);


CREATE TABLE user_roles (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);


CREATE TABLE user_permissions (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, permission_id),
    granted BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_user_permissions_permission_id ON user_permissions(permission_id);
CREATE INDEX idx_user_permissions_updated_by    ON user_permissions(updated_by);


CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(512) NOT NULL UNIQUE,
    session_id UUID NOT NULL,
    replaced_by_token_hash VARCHAR(255),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMPTZ,
    ip_address INET,
    user_agent TEXT
);

CREATE INDEX idx_refresh_tokens_session_id ON refresh_tokens(session_id);
CREATE INDEX idx_refresh_tokens_user_id    ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_user_active ON refresh_tokens(user_id) WHERE revoked_at IS NULL;
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at) WHERE revoked_at IS NULL;


CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(128) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    ip_address INET
);

CREATE INDEX idx_password_reset_tokens_token_hash ON password_reset_tokens(token_hash);
CREATE INDEX idx_password_reset_tokens_user_id    ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_active     ON password_reset_tokens(user_id) WHERE used_at IS NULL;


-- ============================================================================
-- 3. LOOKUPS (must come BEFORE staffs since staffs references religions)
-- ============================================================================
CREATE TABLE religions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE address_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE contact_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE qualification_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    level_order INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE staff_identification_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);


-- ============================================================================
-- 4. STAFFS (now safe — religions exists)
-- ============================================================================
CREATE TABLE staffs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    staff_id VARCHAR(25) UNIQUE NOT NULL,
    UNIQUE(user_id),

    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    full_name VARCHAR(500) GENERATED ALWAYS AS (
        TRIM(BOTH FROM first_name || ' ' || COALESCE(middle_name || ' ', '') || last_name)
    ) STORED,

    date_of_birth DATE,
    gender VARCHAR(20),
    title VARCHAR(50),
    rank VARCHAR(500),

    employment_date DATE,
    employment_status VARCHAR(30) NOT NULL DEFAULT 'active'
        CHECK (
            employment_status IN (
                'active', 'suspended', 'study_leave',
                'retired', 'resigned', 'terminated'
            )
        ),

    religion_id UUID REFERENCES religions(id) ON DELETE SET NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_staffs_updated_by        ON staffs(updated_by);
CREATE INDEX idx_staffs_religion_id       ON staffs(religion_id);
CREATE INDEX idx_staffs_employment_status ON staffs(employment_status) WHERE employment_status = 'active';
CREATE INDEX idx_staffs_last_name         ON staffs(last_name);
CREATE INDEX idx_staffs_full_name_trgm    ON staffs USING gin (full_name gin_trgm_ops);


-- ============================================================================
-- 5. USERS SEARCH INDEX
-- ============================================================================
CREATE TABLE users_search_index (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('employee', 'external')),
    entity_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    search_text TEXT NOT NULL,
    search_vector TSVECTOR NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_entity_search UNIQUE (entity_type, entity_id)
);

CREATE INDEX idx_users_search_vector ON users_search_index USING GIN (search_vector);


-- ============================================================================
-- 6. STAFFS SEARCH INDEX
-- ============================================================================
CREATE TABLE staffs_search_index (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id VARCHAR(25) NOT NULL REFERENCES staffs(staff_id) ON DELETE CASCADE,
    search_text TEXT NOT NULL,
    search_vector TSVECTOR NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (entity_id)
);

CREATE INDEX idx_staffs_search_vector ON staffs_search_index USING GIN (search_vector);


-- ============================================================================
-- 7. STAFF SUB-TABLES
-- ============================================================================
CREATE TABLE staff_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id VARCHAR(25) NOT NULL REFERENCES staffs(staff_id) ON DELETE CASCADE,
    contact_type VARCHAR(20) NOT NULL CHECK (
        contact_type IN ('phone', 'email', 'postal_address', 'digital')
    ),
    value TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_staff_contacts_staff_id ON staff_contacts(staff_id);
CREATE INDEX idx_staff_contacts_type     ON staff_contacts(contact_type);


CREATE TABLE staff_identifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id VARCHAR(25) NOT NULL REFERENCES staffs(staff_id) ON DELETE CASCADE,
    id_type VARCHAR(20) NOT NULL CHECK (
        id_type IN ('ghana_card', 'ssnit', 'passport', 'voters_id', 'drivers_license', 'tax_id', 'other')
    ),
    id_number VARCHAR(50) NOT NULL,
    issue_date DATE,
    expiry_date DATE,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT unique_staff_id_type UNIQUE (staff_id, id_type)
);

CREATE INDEX idx_staff_identifications_id_number ON staff_identifications(id_number);
CREATE INDEX idx_staff_identifications_staff_id  ON staff_identifications(staff_id);


CREATE TABLE staff_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id VARCHAR(25) NOT NULL REFERENCES staffs(staff_id) ON DELETE CASCADE,
    address_type VARCHAR(20) NOT NULL CHECK (
        address_type IN ('residential', 'postal', 'work', 'other')
    ),
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    region VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    postal_code VARCHAR(10) NOT NULL,
    notes TEXT,
    longitude DOUBLE PRECISION,
    latitude DOUBLE PRECISION,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE (staff_id, address_type)
);

CREATE INDEX idx_staff_addresses_staff_id ON staff_addresses(staff_id);


CREATE TABLE staff_education (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id VARCHAR(25) NOT NULL REFERENCES staffs(staff_id) ON DELETE CASCADE,
    qualification_type VARCHAR(20) NOT NULL CHECK (
        qualification_type IN ('certificate', 'diploma', 'degree', 'masters', 'phd', 'professional', 'other')
    ),
    qualification_name VARCHAR(255) NOT NULL,
    institution_name VARCHAR(255) NOT NULL,
    start_year INT,
    end_year INT,
    grade_obtained VARCHAR(50),
    is_verified BOOLEAN DEFAULT FALSE,
    document_url TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_staff_education_staff_id ON staff_education(staff_id);


-- ============================================================================
-- 8. TASK MODULE: PROJECTS, MEMBERS, TASKS, ASSIGNEES, SEARCH
-- ============================================================================
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_projects_created_by ON projects(created_by);


CREATE TABLE project_members (
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id    UUID NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (project_id, user_id)
);

CREATE INDEX idx_project_members_user ON project_members(user_id);


CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    due_date DATE NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'medium'
        CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(30) NOT NULL DEFAULT 'todo'
        CHECK (status IN ('todo', 'in_progress', 'blocked', 'done', 'cancelled')),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_tasks_project    ON tasks(project_id);
CREATE INDEX idx_tasks_status     ON tasks(status);
CREATE INDEX idx_tasks_due_date   ON tasks(due_date);
CREATE INDEX idx_tasks_priority   ON tasks(priority);
CREATE INDEX idx_tasks_created_by ON tasks(created_by);
CREATE INDEX idx_tasks_updated_by ON tasks(updated_by);


CREATE TABLE task_assignees (
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (task_id, user_id)
);

CREATE INDEX idx_task_assignees_user ON task_assignees(user_id);


CREATE TABLE task_search_index (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    search_text TEXT NOT NULL,
    search_vector TSVECTOR NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (entity_id)
);

CREATE INDEX idx_task_search_vector ON task_search_index USING GIN (search_vector);


-- ============================================================================
-- 9. REPORTS MODULE
-- ============================================================================
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_number VARCHAR(30) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    report_type VARCHAR(20) NOT NULL CHECK (report_type IN ('daily', 'weekly', 'monthly', 'annual')),
    prepared_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    submitted_to UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    summary TEXT NOT NULL,
    recommendations TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'submitted', 'awaiting_receipt', 'received')),
    reviewer_notes TEXT,
    allow_edit BOOLEAN NOT NULL DEFAULT FALSE,
    reviewed_at TIMESTAMPTZ,   -- fixed typo (was TITIMESTAMPTZ)
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_reports_project     ON reports(project_id);
CREATE INDEX idx_reports_prepared_by ON reports(prepared_by);
CREATE INDEX idx_reports_submitted_to ON reports(submitted_to);
CREATE INDEX idx_reports_status      ON reports(status);
CREATE INDEX idx_reports_created_at  ON reports(created_at DESC);


CREATE TABLE report_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size INT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_report_attachments_report ON report_attachments(report_id);


CREATE TABLE report_search_index (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    search_text TEXT NOT NULL,
    search_vector TSVECTOR NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (entity_id)
);

CREATE INDEX idx_report_search_vector ON report_search_index USING GIN (search_vector);


-- ============================================================================
-- 10. NOTIFICATIONS
-- ============================================================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    entity_type VARCHAR(50),
    entity_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_unread  ON notifications(user_id) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_created      ON notifications(created_at DESC);
CREATE INDEX idx_notifications_entity       ON notifications(entity_type, entity_id) WHERE entity_id IS NOT NULL;
CREATE INDEX idx_notifications_actor        ON notifications(actor_id) WHERE actor_id IS NOT NULL;