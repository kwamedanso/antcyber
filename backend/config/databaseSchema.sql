create table users (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 name VARCHAR(100),
 email VARCHAR(255) UNIQUE NOT NULL,
 password_hash TEXT NOT NULL,
 role VARCHAR(50),
 created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
)

INSERT INTO users (name, email, password_hash, role) VALUES ('Kwame', 'kwame@gmail.com', '$2b$12$ZGhlGnbqlwH4Own82zcKzeoxmBeLsZZRq2Y9lnTXTn0GNhFKNUa.m', 'admin');


CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Adjust the data type (e.g., UUID or INTEGER) to match your users.id column
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    token VARCHAR(512) NOT NULL UNIQUE,
    
    -- TIMESTAMP WITH TIME ZONE is best practice for globally aware timestamps
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

	ip_address INET,
    user_agent TEXT
);




----------------------ANT-CYBER SECURITY----------------------
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

ALTER TABLE users DROP COLUMN staff_id; -- drop before running this


CREATE TABLE users_search_index (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('employee', 'external')),
    entity_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, 
    search_text TEXT NOT NULL,
    search_vector TSVECTOR NOT NULL,
    -- search_text_trgm tsvector,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure we never create duplicate search entries for the same entity
    CONSTRAINT unique_entity_search UNIQUE (entity_type, entity_id)
);


CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource VARCHAR(100) NOT NULL, -- eg. 'appraisal.cycle', 
    action VARCHAR(50) NOT NULL, -- eg. 'create', 'update', 'delete', 'approve', 'view', 'cancel', 'Override'
    display_name VARCHAR(150) NOT NULL,
    category VARCHAR(50),
    description TEXT,
    module VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_resource_action UNIQUE (resource, action)
);



CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE role_permissions (
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);


CREATE TABLE user_roles (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE user_permissions (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, permission_id),
    granted BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(512) NOT NULL UNIQUE, 
    session_id UUID NOT NULL, -- Ties the token to a specific device login instance
    replaced_by_token_hash VARCHAR(255), 
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMPTZ, -- Soft delete for auditing
    ip_address INET,
    user_agent TEXT
);

CREATE INDEX idx_refresh_tokens_session_id ON refresh_tokens(session_id);


CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(128) NOT NULL, -- SHA-512 hash of the 64-char hex string
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ, -- Set to NOW() once the token is successfully used
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    ip_address INET
);


------------STAFFS----------------
CREATE TABLE staffs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE RESTRICT, 
    staff_id VARCHAR(25) UNIQUE NOT NULL, 
    UNIQUE(user_id),
    
    -- Names
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    full_name VARCHAR(500) GENERATED ALWAYS AS (TRIM ( BOTH FROM first_name || ' ' || COALESCE(middle_name || ' ', '') || last_name)) STORED,

    -- Core Personal Details
    date_of_birth DATE,
    gender VARCHAR(20),
    title VARCHAR(50),
    rank VARCHAR(500), -- Chief Technology Officer, Accountant, etc

    -- Employment Details
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


CREATE TABLE staffs_search_index (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id VARCHAR(25) NOT NULL REFERENCES staffs(staff_id) ON DELETE CASCADE, 
    search_text TEXT NOT NULL,
    search_vector TSVECTOR NOT NULL,
    -- search_text_trgm tsvector,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure we never create duplicate search entries for the same entity
    UNIQUE (entity_id)
);


CREATE TABLE contact_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE, -- phone, email, postal_address, digital
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);



CREATE TABLE staff_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id VARCHAR(25) NOT NULL REFERENCES staffs(staff_id) ON DELETE CASCADE,
    
    contact_type VARCHAR(20) NOT NULL 
    CHECK (
        contact_type IN ('phone', 'email', 'postal_address', 'digital')
    ),
    
    value TEXT NOT NULL, -- TEXT allows long postal addresses, VARCHAR is fine for emails/phones
    
    is_primary BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE, -- Good for tracking if HR has verified an email/phone
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE staff_identification_types(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL, -- 'ghana_card', 'ssnit', 'passport', 'voters_id', 'drivers_license', 'tax_id', 'other'
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE staff_identifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id VARCHAR(25) NOT NULL REFERENCES staffs(staff_id) ON DELETE CASCADE,
    
    id_type VARCHAR(20) NOT NULL 
    CHECK (
        id_type IN ('ghana_card', 'ssnit', 'passport', 'voters_id', 'drivers_license', 'tax_id', 'other')
    ),
    id_number VARCHAR(50) NOT NULL,
    
    -- Often needed for compliance (e.g., SSNIT numbers change if someone formalizes a new card)
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





CREATE TABLE address_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,   -- 'residential', 'postal', 'work', etc.
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE staff_addresses(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id VARCHAR(25) NOT NULL REFERENCES staffs(staff_id) ON DELETE CASCADE,
    address_type VARCHAR(20) NOT NULL 
    CHECK (
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


CREATE TABLE religions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL -- e.g., 'Christianity', 'Islam', 'Traditional'
);



CREATE TABLE qualification_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL, --  'certificate', 'diploma', 'degree', 'masters', 'phd', 'professional', 'other'
    description TEXT, 
    level_order INT NOT NULL, -- 15, 13
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE staff_education (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id VARCHAR(25) NOT NULL REFERENCES staffs(staff_id) ON DELETE CASCADE,
    
    qualification_type VARCHAR(20) NOT NULL 
    CHECK (
        qualification_type IN ('certificate', 'diploma', 'degree', 'masters', 'phd', 'professional', 'other')
    ),
    qualification_name VARCHAR(255) NOT NULL, -- e.g., 'BSc Computer Science', 'ACCA'
    institution_name VARCHAR(255) NOT NULL,    -- e.g., 'KNUST', 'University of Ghana'
    
    start_year INT,
    end_year INT,
    grade_obtained VARCHAR(50),               -- e.g., 'First Class', '3.8 GPA'
    
    is_verified BOOLEAN DEFAULT FALSE,        -- Has HR seen the certificate?
    document_url TEXT,            -- Link to uploaded file in S3/Cloud
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);






---------------------TASK MODULE--------------------

-- ============================================================================
-- projects
-- ----------------------------------------------------------------------------
-- Minimal table so tasks can reference a project. Adjust columns to match
-- what your projects feature actually needs — this is the smallest shape
-- that the task service depends on.
-- ============================================================================
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================================
-- tasks
-- ============================================================================
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

    -- The user who created the task (admin / manager / staff).
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,

    -- When the task was marked done (populated by the service).
    completed_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_tasks_project   ON tasks(project_id);
CREATE INDEX idx_tasks_status    ON tasks(status);
CREATE INDEX idx_tasks_due_date  ON tasks(due_date);
CREATE INDEX idx_tasks_priority  ON tasks(priority);
CREATE INDEX idx_tasks_created_by ON tasks(created_by);

-- ============================================================================
-- task_assignees
-- ----------------------------------------------------------------------------
-- Many-to-many between tasks and users. `user_id` matches whatever
-- "members" endpoint you used on the frontend (member.user_id || member.id).
-- ============================================================================
CREATE TABLE task_assignees (
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (task_id, user_id)
);

CREATE INDEX idx_task_assignees_user ON task_assignees(user_id);

-- ============================================================================
-- task_search_index (optional — mirrors your other *_search_index tables)
-- ============================================================================
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



CREATE TABLE IF NOT EXISTS project_members (
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id    UUID NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (project_id, user_id)
);


CREATE INDEX IF NOT EXISTS idx_project_members_user ON project_members(user_id);






--------REPORTS MODULE--------

-- ============================================================================
-- REPORTS
-- ============================================================================
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Structured reference number, e.g., "REP-2026-00001"
    reference_number VARCHAR(30) UNIQUE NOT NULL,
    
    title VARCHAR(255) NOT NULL,
    
    report_type VARCHAR(20) NOT NULL CHECK (report_type IN ('daily', 'weekly', 'monthly', 'annual')),
        
    prepared_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    
    -- Kept as text in case it's an external client or a team name
    submitted_to UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT, 
    
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    
    summary TEXT NOT NULL,
    
    recommendations TEXT,
    
    status VARCHAR(30) NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'submitted', 'awaiting_receipt', 'received')),
    
    reviewer_notes TEXT,
    allow_edit BOOLEAN NOT NULL DEFAULT FALSE,
    reviewed_at TITIMESTAMPTZ,
        
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

ALTER TABLE reports ADD COLUMN reviewed_at TIMESTAMPTZ;

CREATE INDEX idx_reports_project ON reports(project_id);
CREATE INDEX idx_reports_prepared_by ON reports(prepared_by);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);

-- ============================================================================
-- REPORT ATTACHMENTS
-- ============================================================================
CREATE TABLE report_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL, -- The URL from S3, Cloudinary, etc.
    file_size INT NOT NULL, -- Size in bytes
    mime_type VARCHAR(100) NOT NULL,
    
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_report_attachments_report ON report_attachments(report_id);

-- ============================================================================
-- REPORT SEARCH INDEX (Optional but recommended for fast text search)
-- ============================================================================
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





CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- The user who receives the notification
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- The user who triggered the notification (optional, e.g., the task creator)
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Type helps the UI pick icons/colors (e.g., 'task_assigned', 'report_submitted')
    type VARCHAR(50) NOT NULL, 
    
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    -- Link to redirect the user when clicked (e.g., '/admin/tasks/123')
    link TEXT,
    
    -- Track read/unread status
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    
    -- Generic reference for future modules (e.g., 'task', 'report', 'project')
    entity_type VARCHAR(50),
    entity_id UUID,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast lookups of a user's unread notifications
CREATE INDEX idx_notifications_user_unread ON notifications(user_id) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);