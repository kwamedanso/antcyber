INSERT INTO users (
    password_hash,
    must_change_password,
    user_type,
    email,
    email_verified_at,
    failed_login_attempts,
    locked_until,
    password_changed_at,
    two_factor_enabled,
    two_factor_secret,
    sso_provider,
    sso_id,
    is_active,
    last_login_at,
    updated_by
) VALUES (
    '$2a$12$R0qM5X8Wf8WbZtW5R5vGbeG7lG6vK3lG7lG6vK3lG7lG6vK3lG7lG',
    FALSE,                       -- force password change on first login
    'employee',
    'kwamedanso@gmail.com',
    CURRENT_TIMESTAMP,          -- treat seed email as verified
    0,
    NULL,
    CURRENT_TIMESTAMP,          -- password set now
    FALSE,
    NULL,
    NULL,                       -- no SSO
    NULL,
    TRUE,
    NULL,                       -- never logged in
    NULL                        -- no updater yet (first user)
)
RETURNING id;

INSERT INTO staffs (
    user_id,
    staff_id,
    first_name,
    middle_name,
    last_name,
    date_of_birth,
    gender,
    title,
    employment_date,
    employment_status
) VALUES (
    '484c9bcb-c590-47e6-97e7-0e8f1d287e05',
    '1607454',
    'Kwame',
    'Amoafo',                       -- no middle name provided
    'Danso',
    NULL,                       -- not provided
    'Male',                       -- not provided
    NULL,                       -- not provided (e.g., 'Mr.')
    NULL,                       -- not provided
    'active'                   -- default
);




INSERT INTO user_roles (
	user_id, role_id
) VALUES (
'484c9bcb-c590-47e6-97e7-0e8f1d287e05', '3d7ce4f7-a766-47ce-bb99-3f072167df7d'
);





INSERT INTO users (
    password_hash,
    must_change_password,
    user_type,
    email,
    email_verified_at,
    failed_login_attempts,
    locked_until,
    password_changed_at,
    two_factor_enabled,
    two_factor_secret,
    sso_provider,
    sso_id,
    is_active,
    last_login_at,
    updated_by
) VALUES (
    '$2b$12$ZGhlGnbqlwH4Own82zcKzeoxmBeLsZZRq2Y9lnTXTn0GNhFKNUa.m',
    FALSE,                       -- force password change on first login
    'employee',
    'benedictayaro@gmail.com',
    CURRENT_TIMESTAMP,          -- treat seed email as verified
    0,
    NULL,
    CURRENT_TIMESTAMP,          -- password set now
    FALSE,
    NULL,
    NULL,                       -- no SSO
    NULL,
    TRUE,
    NULL,                       -- never logged in
    NULL                        -- no updater yet (first user)
)
RETURNING id;

INSERT INTO staffs (
    user_id,
    staff_id,
    first_name,
    middle_name,
    last_name,
    date_of_birth,
    gender,
    title,
    employment_date,
    employment_status
) VALUES (
    '67b2fb06-d699-47c2-bc16-4380c5a25cd1',
    '1607455',
    'Benedicta',
    'A.',                       -- no middle name provided
    'Yaro',
    NULL,                       -- not provided
    'Female',                       -- not provided
    NULL,                       -- not provided (e.g., 'Mr.')
    NULL,                       -- not provided
    'active'                   -- default
);




INSERT INTO user_roles (
	user_id, role_id
) VALUES (
'67b2fb06-d699-47c2-bc16-4380c5a25cd1', '3d7ce4f7-a766-47ce-bb99-3f072167df7d'
);



INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'super_admin'
ON CONFLICT (role_id, permission_id) DO NOTHING;