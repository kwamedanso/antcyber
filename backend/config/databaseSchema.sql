create table users (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 name VARCHAR(100),
 email VARCHAR(255) UNIQUE NOT NULL,
 password_hash TEXT NOT NULL,
 role VARCHAR(50),
 created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
)


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