const userQueries = {
  createUser: `
    INSERT INTO users (name, email, password_hash, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, email, role, created_at
  `,
  findUserByEmail: 'SELECT * FROM users WHERE email = $1',
}

const refreshTokenQueries = {
  // Create new refresh token
  createRefreshToken: `
    INSERT INTO refresh_tokens (user_id, token, expires_at, ip_address, user_agent)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, token, expires_at, created_at
  `,

  // Find userid by refresh token
  findUserIdByToken: `
  SELECT user_id
  FROM refresh_tokens
  WHERE token = $1 
`,

  // Find refresh token by userid
  findTokenByUserId: `
  SELECT token,expires_at
  FROM refresh_tokens
  WHERE token = $1 
`,

  // Find token details by token
  findTokenDetails: `
        SELECT user_id, created_at, expires_at
        FROM refresh_tokens 
        WHERE token = $1 
        AND expires_at > CURRENT_TIMESTAMP
    `,

  // Find user by refresh token
  findUserByToken: `
  SELECT u.id, u.first_name, u.last_name, u.email, u.role, u.is_active
  FROM refresh_tokens rt
  INNER JOIN users u ON rt.user_id = u.id
  WHERE rt.token = $1 
  AND rt.expires_at > CURRENT_TIMESTAMP
  AND u.is_active = true
`,

  // Find token by user ID (get all valid tokens for a user)
  findTokensByUserId: `
    SELECT id, token, expires_at, ip_address, user_agent, created_at
    FROM refresh_tokens
    WHERE user_id = $1 
    AND expires_at > CURRENT_TIMESTAMP
    ORDER BY created_at DESC
  `,

  // Delete specific token
  deleteToken: `
    DELETE FROM refresh_tokens 
    WHERE token = $1
    RETURNING id, user_id
  `,

  // Delete all tokens for a user (useful for logout all devices)
  deleteAllTokensByUserId: `
    DELETE FROM refresh_tokens 
    WHERE user_id = $1
  `,

  // Delete expired tokens (for maintenance/cron job)
  deleteExpiredTokens: `
    DELETE FROM refresh_tokens 
    WHERE expires_at <= CURRENT_TIMESTAMP
  `,

  // Get all tokens by user ID (including expired - for admin/debugging)
  getAllTokensByUserId: `
    SELECT id, token, expires_at, ip_address, user_agent, created_at
    FROM refresh_tokens
    WHERE user_id = $1
    ORDER BY created_at DESC
  `,

  // Verify token exists and is valid (quick check)
  verifyToken: `
    SELECT id, user_id, expires_at
    FROM refresh_tokens
    WHERE token = $1 
    AND expires_at > CURRENT_TIMESTAMP
  `,

  // Update token expiry (if you want to extend token life)
  updateTokenExpiry: `
    UPDATE refresh_tokens 
    SET expires_at = $1 
    WHERE token = $2
    RETURNING id, user_id, expires_at
  `
};



module.exports = { userQueries, refreshTokenQueries }