    // auth.service.js
    const bcrypt = require('bcrypt');
    const jwt = require('jsonwebtoken');
    const crypto = require('crypto');
    const { query, startTransaction } = require('../../utils/database/connection');
    const { sendMail } = require('../email/email.service');

    // ============================================================================
    // CONFIGURATION
    // ============================================================================

    const JWT_SECRET = process.env.ACCESS_TOKEN_SECRET;
    if (!JWT_SECRET) throw new Error('JWT_SECRET environment variable is required.');

    const JWT_EXPIRY = '15m';
    const MAX_LOGIN_ATTEMPTS = 5;
    const ACCOUNT_LOCK_MINUTES = 15;
    const BCRYPT_ROUNDS = 12;
    const MIN_PASSWORD_LENGTH = 8;
    const RESET_TOKEN_EXPIRY_MINUTES = 60;

    const REFRESH_TOKEN_EXPIRY = {
        DEFAULT: 1,
        REMEMBER: 30
    };

    // ============================================================================
    // HELPERS
    // ============================================================================

    const withTransaction = async (callback) => {
        const tx = await startTransaction();

        try {
            const result = await callback(tx.client);
            await tx.commit();
            return result;
        } catch (error) {
            try { await tx.rollback(); } catch (rollbackError) {
                console.error('[Auth Service] Rollback failed:', rollbackError);
            }
            throw error;
        }
    };

    const isEmpty = (value) => value === undefined || value === null || value === '';

    const requireValue = (value, fieldName) => {
        if (isEmpty(value)) {
            const error = new Error(`${fieldName} is required.`);
            error.statusCode = 400;
            throw error;
        }
        return value;
    };

    const requireUUID = (value, fieldName) => {
        requireValue(value, fieldName);

        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

        if (typeof value !== 'string' || !uuidRegex.test(value)) {
            const error = new Error(`${fieldName} must be a valid UUID.`);
            error.statusCode = 400;
            throw error;
        }

        return value;
    };

    const normalizeIdArray = (ids, fieldName) => {
        if (!Array.isArray(ids)) {
            const error = new Error(`${fieldName} must be an array.`);
            error.statusCode = 400;
            throw error;
        }

        if (ids.length === 0) {
            const error = new Error(`${fieldName} cannot be empty.`);
            error.statusCode = 400;
            throw error;
        }

        const normalized = ids.map((id) => requireUUID(id, `${fieldName} item`));
        const unique = [...new Set(normalized)];

        if (unique.length !== normalized.length) {
            const error = new Error(`${fieldName} contains duplicate IDs.`);
            error.statusCode = 400;
            throw error;
        }

        return unique;
    };

    const validatePassword = (password, fieldName = 'Password') => {
        if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
            const error = new Error(`${fieldName} must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
            error.statusCode = 400;
            throw error;
        }

        if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
            const error = new Error(`${fieldName} must contain uppercase, lowercase, and numeric characters.`);
            error.statusCode = 400;
            throw error;
        }

        return password;
    };

    const hashToken = (token) => crypto.createHash('sha512').update(token).digest('hex');

    const generateTokens = (userId, roles) => {
        const accessToken = jwt.sign({ userId, roles }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
        const refreshToken = crypto.randomUUID();
        return { accessToken, refreshToken };
    };

    const sanitizeUser = (user) => {
        if (!user) return null;

        const {
            password_hash,
            two_factor_secret,
            failed_login_attempts,
            locked_until,
            created_at,
            updated_at,
            updated_by,
            two_factor_enabled,
            password_changed_at,
            last_login_at,
            must_change_password,
            sso_provider,
            sso_id,
            email_verified_at,
            ...safeUser
        } = user;

        return safeUser;
    };



    const getUserById = async (userId, client = null) => {
    const queryFn = client
        ? (sql, params) => client.query(sql, params)
        : query;

    const result = await queryFn(
        `SELECT id, email, user_type, is_active, email_verified_at,
                two_factor_enabled, sso_provider, sso_id,
                last_login_at, password_changed_at,
                created_at, updated_at, updated_by
        FROM users
        WHERE id = $1
        LIMIT 1`,
        [userId]
    );

    return result.rows[0] || null;
};




// ============================================================================
// LOGIN
// ============================================================================

// MODULE CONSTANTS
// ============================================================================


const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ============================================================================
// LOGIN
// ============================================================================

/**
 * Authenticate a user by staff ID and password.
 *
 * Returns a full session ({ accessToken, refreshToken, user, payload })
 * on success.
 *
 * Throws (with .statusCode and optionally .code) on failure:
 *   401 INVALID_CREDENTIALS       — staff not found or wrong password
 *   403 ACCOUNT_DEACTIVATED       — is_active = FALSE
 *   403 ACCOUNT_LOCKED            — too many failed attempts
 *   403 PASSWORD_CHANGE_REQUIRED  — must_change_password = TRUE
 *   403 TWO_FACTOR_REQUIRED       — two_factor_enabled = TRUE
 */
const loginUser = async (credentials, metaData = {}) => {
    const { email, password, rememberMe = false } = credentials;
    const { ip_address, user_agent } = metaData;

    // ---------------------------------------------------------------------
    // 1. Shape validation
    // ---------------------------------------------------------------------
    if (typeof email !== 'string' || typeof password !== 'string') {
        const error = new Error('Invalid credentials.');
        error.statusCode = 401;
        throw error;
    }

    const normalizedEmail = email.trim();

    // if (!EMAIL_REGEX.test(normalizedEmail) || !password) {
    //     const error = new Error('Invalid credentials.');
    //     error.statusCode = 401;
    //     throw error;
    // }

    // ---------------------------------------------------------------------
    // 2. Look up user by email
    // ---------------------------------------------------------------------
    const userResult = await query(
        `SELECT u.id, u.email, u.user_type, u.is_active, u.email_verified_at,
                u.two_factor_enabled, u.sso_provider, u.sso_id,
                u.password_hash, u.failed_login_attempts, u.locked_until,
                u.password_changed_at, u.last_login_at, u.must_change_password,
                u.created_at, u.updated_at, u.updated_by,
                s.first_name, s.middle_name, s.last_name, s.full_name,
                s.date_of_birth, s.gender, s.title, s.rank,
                s.employment_date, s.employment_status
         FROM users u
         LEFT JOIN staffs s ON u.id = s.user_id
         WHERE u.email = $1
         LIMIT 1`,
        [normalizedEmail]
    );

    const user = userResult.rows[0];


    if (!user) {
        const error = new Error('Invalid credentials.');
        error.statusCode = 401;
        throw error;
    }

    // ---------------------------------------------------------------------
    // 3. Pre-flight account checks
    // ---------------------------------------------------------------------
    if (!user.is_active) {
        const error = new Error('Account is deactivated.');
        error.statusCode = 403;
        error.code = 'ACCOUNT_DEACTIVATED';
        throw error;
    }

    if (user.locked_until && new Date(user.locked_until) > new Date()) {
        const error = new Error('Account is temporarily locked due to too many failed login attempts.');
        error.statusCode = 403;
        error.code = 'ACCOUNT_LOCKED';
        throw error;
    }

    // ---------------------------------------------------------------------
    // 4. Verify password
    // ---------------------------------------------------------------------
    const passwordValid = await bcrypt.compare(password, user.password_hash);

    if (!passwordValid) {
        // Increment failure counter and lock the account if the threshold
        // is reached. Atomic — a single UPDATE keeps counter and lock in
        // sync even under concurrency.
        await query(
            `UPDATE users
             SET failed_login_attempts = LEAST(COALESCE(failed_login_attempts, 0) + 1, $1),
                 locked_until = CASE
                     WHEN COALESCE(failed_login_attempts, 0) + 1 >= $1
                         THEN NOW() + ($2 * INTERVAL '1 minute')
                     ELSE locked_until
                 END,
                 updated_at = NOW()
             WHERE id = $3`,
            [MAX_LOGIN_ATTEMPTS, ACCOUNT_LOCK_MINUTES, user.id]
        );

        const error = new Error('Invalid credentials.');
        error.statusCode = 401;
        error.code = 'INVALID_CREDENTIALS';
        throw error;
    }

    // ---------------------------------------------------------------------
    // 5. Password is correct — clear failure counters and stamp last login.
    // ---------------------------------------------------------------------
    const successUpdate = await query(
        `UPDATE users
         SET failed_login_attempts = 0,
             locked_until = NULL,
             last_login_at = NOW(),
             updated_at = NOW()
         WHERE id = $1
         RETURNING last_login_at`,
        [user.id]
    );

    // Reflect the fresh timestamp on the object we're about to sanitize,
    // so the response doesn't carry a stale value.
    user.last_login_at = successUpdate.rows[0].last_login_at;

    // ---------------------------------------------------------------------
    // 6. Forced password change gate.
    //
    // The password is correct, but the account was flagged for a mandatory
    // password change (e.g. imported via bulk upload with a default
    // password). No tokens are issued — the user must change their
    // password first, then log in again.
    //
    // This runs AFTER the counter reset (a correct password shouldn't
    // penalize the user) and BEFORE the 2FA check (2FA on an account that
    // can't fully log in yet would be confusing).
    // ---------------------------------------------------------------------
    if (user.must_change_password) {
        const error = new Error('Password change required before login.');
        error.statusCode = 403;
        error.code = 'PASSWORD_CHANGE_REQUIRED';
        throw error;
    }

    // ---------------------------------------------------------------------
    // 7. Two-factor gate.
    // ---------------------------------------------------------------------
    if (user.two_factor_enabled) {
        const error = new Error('Two-factor authentication is enabled for this account and must be completed before login.');
        error.statusCode = 403;
        error.code = 'TWO_FACTOR_REQUIRED';
        throw error;
    }

    // ---------------------------------------------------------------------
    // 8. Load authorisation context
    // ---------------------------------------------------------------------
    const roles = await getUserRoles(user.id);
    const permissions = await getUserPermissions(user.id);
    // ---------------------------------------------------------------------
    // 9. Issue tokens
    // ---------------------------------------------------------------------
    const { accessToken, refreshToken } = generateTokens(
        user.id,
        roles.map((role) => role.name)
    );
    
    
    const expiryDays = Boolean(rememberMe)
    ? REFRESH_TOKEN_EXPIRY.REMEMBER
    : REFRESH_TOKEN_EXPIRY.DEFAULT;
    
    const expiresAt = new Date(
        Date.now() + expiryDays * 24 * 60 * 60 * 1000
    );


    const tokenHash = hashToken(refreshToken);
    const sessionId = crypto.randomUUID();

    await query(
        `INSERT INTO refresh_tokens
            (user_id, token_hash, session_id, expires_at, ip_address, user_agent)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
            user.id,
            tokenHash,
            sessionId,
            expiresAt,
            ip_address || null,
            user_agent || null
        ]
    );

    // ---------------------------------------------------------------------
    // 10. Response
    // ---------------------------------------------------------------------
    return {
        accessToken,
        refreshToken,
        user: sanitizeUser(user),
        sessionId,
        refreshTokenExpiresAt: expiresAt,
        payload: {
            roles,
            permissions
        }
    };
};


// ============================================================================
// CHANGE PASSWORD (UNAUTHENTICATED — for forced first-login change)
// ============================================================================

/**
 * Allows a user whose account is flagged `must_change_password` to set a
 * new password without first logging in.
 *
 * Security:
 *   - Same lockout logic as login (shared counter, same thresholds).
 *   - Only works while `must_change_password = TRUE`. Once cleared, this
 *     endpoint refuses — the user must use the authenticated flow.
 *   - Revokes all refresh tokens on success.
 */
const changePasswordWithCredentials = async (
    email,
    oldPassword,
    newPassword,
    metaData = {}
) => {
    const { ip_address: _ip } = metaData;

    // 1. Basic shape check
    if (typeof email !== 'string' || typeof oldPassword !== 'string' || typeof newPassword !== 'string') {
        const error = new Error('Invalid credentials.');
        error.statusCode = 401;
        error.code = 'INVALID_CREDENTIALS';
        throw error;
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 2. Validate new password strength
    validatePassword(newPassword, 'New password');

    if (oldPassword === newPassword) {
        const error = new Error('New password must be different from current password.');
        error.statusCode = 400;
        error.code = 'NEW_PASSWORD_SAME';
        throw error;
    }

    // 3. Fetch the user
    const userResult = await query(
        `SELECT id, is_active, password_hash,
                failed_login_attempts, locked_until, must_change_password
         FROM users
         WHERE email = $1
         LIMIT 1`,
        [normalizedEmail]
    );

    const user = userResult.rows[0];

    if (!user || !user.is_active) {
        const error = new Error('Invalid credentials.');
        error.statusCode = 401;
        throw error;
    }

    // 4. Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
        const error = new Error('Account is temporarily locked due to too many failed login attempts.');
        error.statusCode = 403;
        throw error;
    }

    // 5. Ensure this route is only used for FORCED password changes
    if (!user.must_change_password) {
        const error = new Error('This account does not require a forced password change.');
        error.statusCode = 403;
        error.code = 'FORCED_CHANGE_NOT_REQUIRED';
        throw error;
    }

    // 6. Verify the old password
    const passwordValid = await bcrypt.compare(oldPassword, user.password_hash);

    if (!passwordValid) {
        // Increment failed attempts (security measure)
        await query(
            `UPDATE users
             SET failed_login_attempts = LEAST(COALESCE(failed_login_attempts, 0) + 1, $1),
                 locked_until = CASE
                     WHEN COALESCE(failed_login_attempts, 0) + 1 >= $1
                         THEN NOW() + ($2 * INTERVAL '1 minute')
                     ELSE locked_until
                 END,
                 updated_at = NOW()
             WHERE id = $3`,
            [MAX_LOGIN_ATTEMPTS, ACCOUNT_LOCK_MINUTES, user.id]
        );

        const error = new Error('Invalid credentials.');
        error.statusCode = 401;
        throw error;
    }

    // 7. Update to the new password
    const newHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

    await withTransaction(async (txClient) => {
        await txClient.query(
            `UPDATE users
             SET password_hash = $1,
                 password_changed_at = NOW(),
                 must_change_password = FALSE, -- Unlocks the account
                 failed_login_attempts = 0,
                 locked_until = NULL,
                 updated_at = NOW()
             WHERE id = $2`,
            [newHash, user.id]
        );

        // Revoke all active sessions so they are forced to log in with the new password
        await txClient.query(
            `UPDATE refresh_tokens
             SET revoked_at = NOW()
             WHERE user_id = $1 AND revoked_at IS NULL`,
            [user.id]
        );
    });

    return true;
};

// ============================================================================
// REFRESH TOKEN
// ============================================================================

const refreshAccessToken = async (refreshToken) => {
    requireValue(refreshToken, 'Refresh token');

    const tokenHash = hashToken(refreshToken);

    return withTransaction(async (txClient) => {
        const tokenResult = await txClient.query(
            `SELECT id, user_id, token_hash, session_id, replaced_by_token_hash,
                    expires_at, created_at, revoked_at, ip_address, user_agent
             FROM refresh_tokens
             WHERE token_hash = $1
             FOR UPDATE`,
            [tokenHash]
        );

        const storedToken = tokenResult.rows[0];

        if (!storedToken) {
            const error = new Error('Invalid or expired refresh token. Please login again.');
            error.statusCode = 401;
            throw error;
        }

        // ------------------------------------------------------------------
        // Reuse / concurrent-refresh handling.
        //
        // If this token was already rotated, it MIGHT be:
        //   (a) a legitimate retry — the previous rotation succeeded but the
        //       client never received the new token (network drop, parallel
        //       request, tab race).
        //   (b) a genuine theft — an attacker replaying a leaked token.
        //
        // We distinguish by looking at the replacement token:
        //   - If the replacement is STILL ACTIVE → treat as (a): hand back
        //     the replacement.
        //   - If the replacement is REVOKED      → treat as (b): the chain
        //     was used out of order. Revoke the entire session.
        // ------------------------------------------------------------------
        if (storedToken.revoked_at && storedToken.replaced_by_token_hash) {
            const replacementResult = await txClient.query(
                `SELECT id, user_id, session_id, token_hash, expires_at, created_at, revoked_at
                 FROM refresh_tokens
                 WHERE token_hash = $1
                 FOR UPDATE`,
                [storedToken.replaced_by_token_hash]
            );

            const replacement = replacementResult.rows[0];

            const replacementActive =
                replacement &&
                !replacement.revoked_at &&
                new Date(replacement.expires_at) > new Date();

            if (replacementActive) {
                const user = await getUserById(replacement.user_id, txClient);

                if (!user || !user.is_active) {
                    const error = new Error('User account is no longer active.');
                    error.statusCode = 401;
                    throw error;
                }

                const roles = await getUserRoles(user.id, txClient);

                const { accessToken } = generateTokens(
                    user.id,
                    roles.map((role) => role.name)
                );

                // Concurrent-retry branch: rotate unconditionally so the
                // retrying client gets a fresh cookie and the race window
                // closes cleanly. Half-life rules don't apply here.
                const rotated = await rotateInPlace(
                    txClient,
                    replacement,
                    user.id
                );

                return {
                    accessToken,
                    refreshToken: rotated.token,
                    refreshTokenExpiresAt: rotated.expiresAt
                };
            }

            // Chain used out of order → session is compromised.
            await txClient.query(
                `UPDATE refresh_tokens
                 SET revoked_at = COALESCE(revoked_at, NOW())
                 WHERE session_id = $1
                 AND revoked_at IS NULL`,
                [storedToken.session_id]
            );

            const error = new Error('Refresh token reuse detected. Please login again.');
            error.statusCode = 401;
            error.code = 'REFRESH_TOKEN_REUSE';
            throw error;
        }

        // ------------------------------------------------------------------
        // Ordinary failure paths.
        // ------------------------------------------------------------------
        if (storedToken.revoked_at || new Date(storedToken.expires_at) <= new Date()) {
            const error = new Error('Invalid or expired refresh token. Please login again.');
            error.statusCode = 401;
            throw error;
        }

        const user = await getUserById(storedToken.user_id, txClient);

        if (!user || !user.is_active) {
            const error = new Error('User account is no longer active.');
            error.statusCode = 401;
            throw error;
        }

        const roles = await getUserRoles(user.id, txClient);

        const { accessToken, refreshToken: newRefreshToken } = generateTokens(
            user.id,
            roles.map((role) => role.name)
        );

        // ------------------------------------------------------------------
        // Half-life rotation check.
        //
        // The refresh token is only rotated once it has crossed 50% of its
        // total lifespan. Before that, the client keeps the same refresh
        // token and only receives a fresh access token.
        // ------------------------------------------------------------------
        const lifespanMs =
            new Date(storedToken.expires_at) - new Date(storedToken.created_at);

        const elapsedMs =
            Date.now() - new Date(storedToken.created_at).getTime();

        const shouldRotate = elapsedMs > lifespanMs / 2;

        if (!shouldRotate) {
            // No rotation — reuse the existing refresh token.
            return {
                accessToken,
                refreshToken,                              // unchanged
                refreshTokenExpiresAt: storedToken.expires_at
            };
        }

        // ------------------------------------------------------------------
        // Past half-life → rotate.
        //
        // Preserve the original token's total lifespan (so a "remember me"
        // session stays 30 days) and reuse the session_id (same device).
        // ------------------------------------------------------------------
        const newTokenHash = hashToken(newRefreshToken);
        const newExpiresAt = new Date(Date.now() + lifespanMs);

        // Mark the old token as rotated.
        await txClient.query(
            `UPDATE refresh_tokens
             SET revoked_at = NOW(),
                 replaced_by_token_hash = $1
             WHERE id = $2
             AND revoked_at IS NULL`,
            [newTokenHash, storedToken.id]
        );

        // Insert its successor.
        await txClient.query(
            `INSERT INTO refresh_tokens
                (user_id, token_hash, session_id, expires_at, ip_address, user_agent)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
                user.id,
                newTokenHash,
                storedToken.session_id,
                newExpiresAt,
                storedToken.ip_address,
                storedToken.user_agent
            ]
        );

        return {
            accessToken,
            refreshToken: newRefreshToken,
            refreshTokenExpiresAt: newExpiresAt
        };
    });
};

// ============================================================================
// INTERNAL HELPER — used by the concurrent-refresh branch above.
// Rotates a token whose plaintext is no longer available.
//
// Returns { token, expiresAt } so the caller can set the cookie maxAge from
// the exact same Date written to the DB (avoids drift).
// ============================================================================
const rotateInPlace = async (txClient, currentToken, userId) => {
    const { refreshToken: freshToken } = generateTokens(userId, []);
    const freshHash = hashToken(freshToken);

    const lifespanMs =
        new Date(currentToken.expires_at) - new Date(currentToken.created_at);
    const freshExpiresAt = new Date(Date.now() + lifespanMs);

    await txClient.query(
        `UPDATE refresh_tokens
         SET revoked_at = NOW(),
             replaced_by_token_hash = $1
         WHERE id = $2
         AND revoked_at IS NULL`,
        [freshHash, currentToken.id]
    );

    await txClient.query(
        `INSERT INTO refresh_tokens
            (user_id, token_hash, session_id, expires_at, ip_address, user_agent)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
            userId,
            freshHash,
            currentToken.session_id,
            freshExpiresAt,
            currentToken.ip_address,
            currentToken.user_agent
        ]
    );

    return { token: freshToken, expiresAt: freshExpiresAt };
};



    // ============================================================================
    // PERMISSIONS
    // ============================================================================




// ============================================================================
// PERMISSIONS
// ============================================================================

/**
 * Check whether a user is allowed to perform `action` on `resource`,
 * at a minimum of `minimumScope`.
 *
 * Scope hierarchy (narrow → broad):
 *   own < team < unit < region < institution < organization
 *
 * A grant at a broader scope satisfies checks for narrower scopes.
 *
 * Precedence:
 *   1. Direct deny  → DENY
 *   2. Direct allow → ALLOW
 *   3. Role grants  → ALLOW if any active role grants at >= minimumScope
 *
 * @param {string} userId
 * @param {string} resource
 * @param {string} action
 *   If omitted/null, the scope filter is skipped — any grant on
 *   (resource, action) satisfies the check. Use this for "does the user
 *   have this permission at all?" questions.
 *
 * @returns {Promise<boolean>}
 */
const checkPermissions = async (userId, resource, action) => {
    requireUUID(userId, 'User ID');

    if (typeof resource !== 'string' || !resource.trim()) return false;
    if (typeof action !== 'string' || !action.trim()) return false;

    const result = await query(
        `SELECT COALESCE(
             (
                 SELECT up.granted
                 FROM user_permissions up
                 JOIN permissions p ON p.id = up.permission_id
                 WHERE up.user_id = $1
                   AND p.resource = $2
                   AND p.action = $3
                 LIMIT 1
             ),
             EXISTS (
                 SELECT 1
                 FROM user_roles ur
                 JOIN roles r ON r.id = ur.role_id AND r.is_active = TRUE
                 JOIN role_permissions rp ON rp.role_id = ur.role_id
                 JOIN permissions p ON p.id = rp.permission_id
                 WHERE ur.user_id = $1
                   AND p.resource = $2
                   AND p.action = $3
             )
         ) AS allowed`,
        [userId, resource.trim(), action.trim()]
    );

    return result.rows[0]?.allowed === true;
};


    // ============================================================================
    // BULK ROLE MANAGEMENT
    // ============================================================================

    const assignRoles = async (userId, roleIds) => {
        requireUUID(userId, 'User ID');
        const ids = normalizeIdArray(roleIds, 'Role IDs');

        return withTransaction(async (txClient) => {
            const userResult = await txClient.query(
                `SELECT id FROM users WHERE id = $1 LIMIT 1`,
                [userId]
            );

            if (!userResult.rows.length) {
                const error = new Error('User not found.');
                error.statusCode = 404;
                throw error;
            }

            const rolesResult = await txClient.query(
                `SELECT id FROM roles WHERE id = ANY($1::uuid[]) AND is_active = TRUE`,
                [ids]
            );

            if (rolesResult.rows.length !== ids.length) {
                const error = new Error('One or more roles were not found or are inactive.');
                error.statusCode = 404;
                throw error;
            }

            const result = await txClient.query(
                `INSERT INTO user_roles (user_id, role_id)
                SELECT $1, UNNEST($2::uuid[])
                ON CONFLICT (user_id, role_id) DO NOTHING
                RETURNING role_id`,
                [userId, ids]
            );

            return {
                addedRoleIds: result.rows.map((row) => row.role_id),
                requestedRoleIds: ids
            };
        });
    };

    const removeRoles = async (userId, roleIds) => {
    requireUUID(userId, 'User ID');
    const ids = normalizeIdArray(roleIds, 'Role IDs');

    return withTransaction(async (txClient) => {
        const userResult = await txClient.query(
            `SELECT id FROM users WHERE id = $1 LIMIT 1`,
            [userId]
        );

        if (!userResult.rows.length) {
            const error = new Error('User not found.');
            error.statusCode = 404;
            throw error;
        }

        const result = await txClient.query(
            `DELETE FROM user_roles
             WHERE user_id = $1
             AND role_id = ANY($2::uuid[])
             RETURNING role_id`,
            [userId, ids]
        );

        return {
            removedRoleIds: result.rows.map((row) => row.role_id),
            requestedRoleIds: ids
        };
    });
};




    // ============================================================================
    // BULK DIRECT PERMISSION MANAGEMENT
    // ============================================================================

const assignDirectPermissions = async (
    userId,
    permissionIds,
    granted = true,
    updatedBy
) => {
    requireUUID(userId, 'User ID');
    requireUUID(updatedBy, 'Updated by');
    const ids = normalizeIdArray(permissionIds, 'Permission IDs');

    if (typeof granted !== 'boolean') {
        const error = new Error('Granted must be true or false.');
        error.statusCode = 400;
        throw error;
    }

    return withTransaction(async (txClient) => {
        const userResult = await txClient.query(
            `SELECT id FROM users WHERE id = $1 LIMIT 1`,
            [userId]
        );

        if (!userResult.rows.length) {
            const error = new Error('User not found.');
            error.statusCode = 404;
            throw error;
        }

        const permissionsResult = await txClient.query(
            `SELECT id
             FROM permissions
             WHERE id = ANY($1::uuid[])`,
            [ids]
        );

        if (permissionsResult.rows.length !== ids.length) {
            const error = new Error('One or more permissions were not found.');
            error.statusCode = 404;
            throw error;
        }

        const result = await txClient.query(
            `INSERT INTO user_permissions
                (user_id, permission_id, granted, created_at, updated_at, updated_by)
             SELECT $1, UNNEST($2::uuid[]), $3, NOW(), NOW(), $4
             ON CONFLICT (user_id, permission_id)
             DO UPDATE SET
                 granted = EXCLUDED.granted,
                 updated_at = NOW(),
                 updated_by = EXCLUDED.updated_by
             RETURNING permission_id, granted`,
            [userId, ids, granted, updatedBy]
        );

        return {
            permissions: result.rows,
            requestedPermissionIds: ids
        };
    });
};

  const removeDirectPermissions = async (userId, permissionIds) => {
    requireUUID(userId, 'User ID');
    const ids = normalizeIdArray(permissionIds, 'Permission IDs');

    return withTransaction(async (txClient) => {
        const userResult = await txClient.query(
            `SELECT id FROM users WHERE id = $1 LIMIT 1`,
            [userId]
        );

        if (!userResult.rows.length) {
            const error = new Error('User not found.');
            error.statusCode = 404;
            throw error;
        }

        const result = await txClient.query(
            `DELETE FROM user_permissions
             WHERE user_id = $1
             AND permission_id = ANY($2::uuid[])
             RETURNING permission_id`,
            [userId, ids]
        );

        return {
            removedPermissionIds: result.rows.map((row) => row.permission_id),
            requestedPermissionIds: ids
        };
    });
};


    // ============================================================================
    // ACTIVATE USER PORTAL
    // ============================================================================

const activateUserPortal = async (userId, updatedBy) => {
    requireUUID(userId, 'User ID');
    requireUUID(updatedBy, 'Updated by');

    const user = await getUserById(userId);

    if (!user) {
        const error = new Error('User not found.');
        error.statusCode = 404;
        throw error;
    }

    if (user.is_active) {
        const error = new Error('User is already active.');
        error.statusCode = 400;
        throw error;
    }

    return withTransaction(async (txClient) => {
        await txClient.query(
            `UPDATE users
             SET is_active = TRUE,
                 failed_login_attempts = 0,
                 locked_until = NULL,
                 updated_at = NOW(),
                 updated_by = $1
             WHERE id = $2`,
            [updatedBy, userId]
        );

        return {
            success: true,
            message: 'User portal access activated successfully.',
            user: await getUserProfile(userId)
        };
    });
};

    // ============================================================================
    // DEACTIVATE USER PORTAL
    // ============================================================================

const deactivateUserPortal = async (userId, updatedBy) => {
    requireUUID(userId, 'User ID');
    requireUUID(updatedBy, 'Updated by');

    const userResult = await query(
        `SELECT id, user_type, is_active
         FROM users
         WHERE id = $1
         LIMIT 1`,
        [userId]
    );

    const user = userResult.rows[0];

    if (!user) {
        const error = new Error('User not found.');
        error.statusCode = 404;
        throw error;
    }

    if (!user.is_active) {
        const error = new Error('User is already deactivated.');
        error.statusCode = 400;
        throw error;
    }

    return withTransaction(async (txClient) => {
        await txClient.query(
            `UPDATE users
             SET is_active = FALSE,
                 updated_at = NOW(),
                 updated_by = $1
             WHERE id = $2`,
            [updatedBy, userId]
        );

        await txClient.query(
            `UPDATE refresh_tokens
             SET revoked_at = NOW()
             WHERE user_id = $1
             AND revoked_at IS NULL`,
            [userId]
        );

        return {
            success: true,
            message: 'User portal access deactivated successfully.',
            user: {
                id: user.id,
                staff_id: user.staff_id,
                user_type: user.user_type,
                is_active: false
            }
        };
    });
};


// ============================================================================
// CREATE USER PORTAL ACCESS
// ============================================================================

/**
 * Grants portal access to an existing employee (staff) or external user.
 *
 * Creates a `users` row linked to the entity, assigns optional roles, and
 * issues a one-time setup token. The user's login email is derived from
 * their PRIMARY email contact — it is not accepted as an argument, so
 * `users.email` can never drift from `staff_contacts.value` /
 * `external_contacts.value`.
 *
 * The account is created with a random placeholder password (bcrypt-hashed
 * and discarded) and `must_change_password = TRUE`. The user cannot log in
 * until they use the setup link to set a real password.
 */
const createUserPortalAccess = async ({
    entityType,
    entityId,
    staffId,
    roleIds = [],
    updatedBy
}) => {
    // ---------------------------------------------------------------------
    // 1. Input validation
    // ---------------------------------------------------------------------
    if (!['employee', 'external'].includes(entityType)) {
        const error = new Error('Entity type must be employee or external.');
        error.statusCode = 400;
        throw error;
    }

    requireUUID(entityId, 'Entity ID');
    requireUUID(updatedBy, 'Updated by');

    if (typeof staffId !== 'string' || !STAFF_ID_REGEX.test(staffId.trim())) {
        const error = new Error('Staff ID is required and must be numeric.');
        error.statusCode = 400;
        throw error;
    }

    const normalizedStaffId = staffId.trim();
    const normalizedRoleIds = roleIds.length
        ? normalizeIdArray(roleIds, 'Role IDs')
        : [];

    // ---------------------------------------------------------------------
    // 2. Entity configuration
    //
    // NOTE: staff_contacts.staff_id references staffs(staff_id) — the
    // VARCHAR business key — while external_contacts.external_user_id
    // references external_users(id) — the UUID surrogate.
    //
    // `contactsKey` resolves the correct value from the fetched entity row.
    // ---------------------------------------------------------------------
    const entityConfig = {
        employee: {
            table: 'staffs',
            select: `SELECT id, staff_id, first_name, middle_name, last_name, user_id
                     FROM staffs WHERE id = $1`,
            contactsTable: 'staff_contacts',
            contactsFk: 'staff_id',
            contactsKey: (e) => e.staff_id,      // VARCHAR business key
            name: (e) => [e.first_name, e.middle_name, e.last_name]
                .filter(Boolean).join(' ')
        },
        external: {
            table: 'external_users',
            select: `SELECT id, external_user_id, first_name, middle_name, last_name, user_id
                     FROM external_users WHERE id = $1`,
            contactsTable: 'external_contacts',
            contactsFk: 'external_user_id',
            contactsKey: (e) => e.id,            // UUID surrogate
            name: (e) => [e.first_name, e.middle_name, e.last_name]
                .filter(Boolean).join(' ')
        }
    };

    const config = entityConfig[entityType];

    // ---------------------------------------------------------------------
    // 3. Load entity first, then contacts using the entity-specific key.
    // ---------------------------------------------------------------------
    const entityResult = await query(config.select, [entityId]);

    if (!entityResult.rows.length) {
        const error = new Error(`${entityType} not found.`);
        error.statusCode = 404;
        throw error;
    }

    const entity = entityResult.rows[0];

    if (entity.user_id) {
        const error = new Error(`${entityType} already has a portal account.`);
        error.statusCode = 409;
        throw error;
    }

    const contactsKey = config.contactsKey(entity);

    const emailResult = await query(
        `SELECT value
         FROM ${config.contactsTable}
         WHERE ${config.contactsFk} = $1
           AND contact_type = 'email'
           AND is_primary = TRUE
         LIMIT 1`,
        [contactsKey]
    );

    // Email is optional. If present, it becomes `users.email` and the
    // setup link is emailed. If absent, the account still gets portal
    // access — the setup token must be delivered out-of-band (HR, print).
    const normalizedEmail = emailResult.rows.length
        ? emailResult.rows[0].value.trim().toLowerCase()
        : null;

    // ---------------------------------------------------------------------
    // 4. Pre-flight uniqueness checks
    // ---------------------------------------------------------------------
    const existingUserResult = await query(
        `SELECT id FROM users
         WHERE staff_id = $1
            OR ($2::text IS NOT NULL AND email = $2)
         LIMIT 1`,
        [normalizedStaffId, normalizedEmail]
    );

    if (existingUserResult.rows.length) {
        const error = new Error('Email or staff ID is already registered.');
        error.statusCode = 409;
        throw error;
    }

    // ---------------------------------------------------------------------
    // 5. Hash a placeholder password.
    // ---------------------------------------------------------------------
    const placeholderHash = await bcrypt.hash(normalizedStaffId, BCRYPT_ROUNDS);

    // ---------------------------------------------------------------------
    // 6. Transaction
    // ---------------------------------------------------------------------
    return withTransaction(async (txClient) => {
        const lockedEntity = await txClient.query(
            `SELECT id, user_id FROM ${config.table} WHERE id = $1 FOR UPDATE`,
            [entityId]
        );

        if (!lockedEntity.rows.length) {
            const error = new Error(`${entityType} not found.`);
            error.statusCode = 404;
            throw error;
        }

        if (lockedEntity.rows[0].user_id) {
            const error = new Error(`${entityType} already has a portal account.`);
            error.statusCode = 409;
            throw error;
        }

        if (normalizedRoleIds.length) {
            const rolesResult = await txClient.query(
                `SELECT id FROM roles
                 WHERE id = ANY($1::uuid[]) AND is_active = TRUE`,
                [normalizedRoleIds]
            );

            if (rolesResult.rows.length !== normalizedRoleIds.length) {
                const error = new Error('One or more roles were not found or are inactive.');
                error.statusCode = 404;
                throw error;
            }
        }

        const userResult = await txClient.query(
            `INSERT INTO users
                (staff_id, email, password_hash, user_type, is_active,
                 email_verified_at, must_change_password,
                 created_at, updated_at, updated_by)
             VALUES ($1, $2, $3, $4, TRUE, NULL, TRUE, NOW(), NOW(), $5)
             RETURNING id`,
            [
                normalizedStaffId,
                normalizedEmail,
                placeholderHash,
                entityType,
                updatedBy
            ]
        );

        const userId = userResult.rows[0].id;

        if (normalizedRoleIds.length) {
            await txClient.query(
                `INSERT INTO user_roles (user_id, role_id)
                 SELECT $1, UNNEST($2::uuid[])
                 ON CONFLICT DO NOTHING`,
                [userId, normalizedRoleIds]
            );
        }

        await txClient.query(
            `UPDATE ${config.table}
             SET user_id = $1,
                 updated_at = NOW(),
                 updated_by = $2
             WHERE id = $3`,
            [userId, updatedBy, entityId]
        );

        const setupToken = crypto.randomBytes(32).toString('hex');
        const setupTokenHash = hashToken(setupToken);
        const setupExpiresAt = new Date(
            Date.now() + RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000
        );

        await txClient.query(
            `INSERT INTO password_reset_tokens
                (user_id, token_hash, expires_at)
             VALUES ($1, $2, $3)`,
            [userId, setupTokenHash, setupExpiresAt]
        );

        const userProfile = await getUserProfile(userId);

        return {
            success: true,
            message: `${entityType} portal access created successfully.`,
            user: userProfile,
            entity: {
                id: entityId,
                table: config.table,
                name: config.name(entity)
            },
            setupToken
        };
    }).then(async (result) => {
        if (normalizedEmail) {
            await sendWelcomeEmail(
                normalizedEmail,
                result.setupToken,
                entityType,
                entity,
                result.user?.user?.id
            );

            delete result.setupToken;
        }

        return result;
    });
};

    // ============================================================================
    // DEFAULT PASSWORD GENERATOR
    // ============================================================================
    // Kept as a utility for callers that still need to generate passwords.

    const generateDefaultPassword = (length = 16) => {
        if (!Number.isInteger(length) || length < 8) {
            const error = new Error('Password length must be an integer of at least 8.');
            error.statusCode = 400;
            throw error;
        }

        const alphabet =
            'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';

        let password = '';
        for (let i = 0; i < length; i++) {
            password += alphabet[
                crypto.randomInt(0, alphabet.length)
            ];
        }

        return password;
    };

    // ============================================================================
    // WELCOME / PASSWORD SETUP EMAIL
    // ============================================================================

    const sendWelcomeEmail = async (
        email,
        setupToken,
        entityType,
        entity,
        userId = null
    ) => {
        // Guard: silently no-op when no email is on file. The caller is
        // responsible for delivering the setup token via another channel.
        if (!email) return false;

        const entityName =
            entity.name ||
            `${entity.first_name || ''} ${entity.last_name || ''}`.trim();

        const frontendUrl = process.env.FRONTEND_URL;

        if (!frontendUrl) {
            throw new Error('FRONTEND_URL environment variable is required.');
        }

        const setupUrl =
            `${frontendUrl}/set-password?token=${encodeURIComponent(setupToken)}`;

        const appName =
            process.env.APP_NAME || 'Application';

        await sendMail({
            to: email,
            subject: `Welcome to ${appName} - Set Up Your Portal Access`,
            html: `
                <h2>Welcome to ${appName}</h2>
                <p>Dear ${entityName || 'User'},</p>
                <p>Your ${entityType} portal access has been created.</p>
                <p>Please use the link below to create your password:</p>
                <p>
                    <a href="${setupUrl}"
                    target="_blank"
                    rel="noopener noreferrer"
                    style="padding:10px 20px;background:#007bff;color:#fff;text-decoration:none;border-radius:5px;">
                        Set Your Password
                    </a>
                </p>
                <p>This setup link expires in ${RESET_TOKEN_EXPIRY_MINUTES} minutes.</p>
                <p>If you did not request this account, please contact your system administrator.</p>
            `
        });

        return true;
    };

    // ============================================================================
    // CHANGE PASSWORD
    // ============================================================================

    const changePassword = async (
        userId,
        oldPassword,
        newPassword,
        currentRefreshToken = null
    ) => {
        requireUUID(userId, 'User ID');
        validatePassword(oldPassword, 'Current password');
        validatePassword(newPassword, 'New password');

        if (oldPassword === newPassword) {
            const error = new Error('New password must be different from current password.');
            error.statusCode = 400;
            throw error;
        }

        const userResult = await query(
            `SELECT password_hash
            FROM users
            WHERE id = $1
            AND is_active = TRUE
            LIMIT 1`,
            [userId]
        );

        const user = userResult.rows[0];

        if (!user) {
            const error = new Error('User not found.');
            error.statusCode = 404;
            throw error;
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password_hash);

        if (!isMatch) {
            const error = new Error('Current password is incorrect.');
            error.statusCode = 401;
            throw error;
        }

        const newHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

        // Resolve the current session_id from the refresh token, if provided.
        // If we can't (missing cookie, invalid token), we fall back to
        // revoking everything — safe default.
        let currentSessionId = null;

        if (currentRefreshToken) {
            const tokenHash = hashToken(currentRefreshToken);
            const tokenResult = await query(
                `SELECT session_id
             FROM refresh_tokens
             WHERE token_hash = $1
               AND user_id = $2
               AND revoked_at IS NULL
             LIMIT 1`,
                [tokenHash, userId]
            );

            currentSessionId = tokenResult.rows[0]?.session_id || null;
        }

        await withTransaction(async (txClient) => {
            await txClient.query(
                `UPDATE users
             SET password_hash = $1,
                 password_changed_at = NOW(),
                 must_change_password = FALSE,
                 updated_at = NOW()
             WHERE id = $2`,
            [newHash, userId]
        );

        // Revoke every session EXCEPT the current one.
        if (currentSessionId) {
            await txClient.query(
                `UPDATE refresh_tokens
                 SET revoked_at = NOW()
                 WHERE user_id = $1
                   AND session_id <> $2
                   AND revoked_at IS NULL`,
                [userId, currentSessionId]
            );
        } else {
            await txClient.query(
                `UPDATE refresh_tokens
                 SET revoked_at = NOW()
                 WHERE user_id = $1
                   AND revoked_at IS NULL`,
                [userId]
            );
        }
    });

    return true;
};


// FOR NEW USER SET INITIAL PASSWORD
const setPasswordWithSetupToken = async (plainToken, newPassword) => {
  requireValue(plainToken, 'Setup token');
  validatePassword(newPassword, 'New password');

  const tokenHash = hashToken(plainToken);
  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

  return withTransaction(async (txClient) => {
    const tokenResult = await txClient.query(
      `SELECT id, user_id, used_at, expires_at
         FROM password_reset_tokens
        WHERE token_hash = $1
          FOR UPDATE`,
      [tokenHash]
    );

    const resetToken = tokenResult.rows[0];

    if (!resetToken) {
      const error = new Error('Setup link is invalid.');
      error.statusCode = 400;
      error.code = 'TOKEN_INVALID';
      throw error;
    }

    if (resetToken.used_at) {
      const error = new Error('Setup link has already been used.');
      error.statusCode = 400;
      error.code = 'TOKEN_USED';
      throw error;
    }

    if (new Date(resetToken.expires_at) <= new Date()) {
      const error = new Error('Setup link has expired.');
      error.statusCode = 400;
      error.code = 'TOKEN_EXPIRED';
      throw error;
    }

    await txClient.query(
      `UPDATE password_reset_tokens
          SET used_at = NOW()
        WHERE id = $1`,
      [resetToken.id]
    );

    await txClient.query(
      `UPDATE users
          SET password_hash         = $1,
              password_changed_at   = NOW(),
              must_change_password  = FALSE,
              failed_login_attempts = 0,
              locked_until          = NULL,
              updated_at            = NOW()
        WHERE id = $2`,
      [passwordHash, resetToken.user_id]
    );

    // Invalidate any lingering refresh tokens.
    await txClient.query(
      `UPDATE refresh_tokens
          SET revoked_at = NOW()
        WHERE user_id = $1
          AND revoked_at IS NULL`,
      [resetToken.user_id]
    );

    return true;
  });
};

    // ============================================================================
    // BULK SESSION INVALIDATION
    // ============================================================================

   const invalidateSessions = async (
    userId,
    sessionIds = null
) => {
    requireUUID(userId, 'User ID');

    if (sessionIds === null) {
        const result = await query(
            `UPDATE refresh_tokens
             SET revoked_at = NOW()
             WHERE user_id = $1
             AND revoked_at IS NULL
             RETURNING session_id`,
            [userId]
        );

        return {
            success: true,
            revokedCount: result.rowCount,
            revokedSessionIds: result.rows.map((r) => r.session_id)
        };
    }

    const ids = normalizeIdArray(sessionIds, 'Session IDs');

    const result = await query(
        `UPDATE refresh_tokens
         SET revoked_at = NOW()
         WHERE user_id = $1
         AND session_id = ANY($2::uuid[])
         AND revoked_at IS NULL
         RETURNING session_id`,
        [userId, ids]
    );

    return {
        success: true,
        revokedCount: result.rowCount,
        revokedSessionIds: result.rows.map((r) => r.session_id)
    };
};



// ============================================================================
// LOGOUT CURRENT SESSION
// ============================================================================

/**
 * Revoke only the session that owns the given refresh token.
 *
 * - Idempotent: a missing/expired/forged token still returns success with
 *   revokedCount = 0. Logout should never fail just because the token was
 *   already gone.
 * - Scoped to userId: a stolen refresh token cannot be used to revoke a
 *   different user's session.
 *
 * @param {string} userId
 * @param {string} refreshToken  plaintext refresh token from the cookie
 * @returns {Promise<{ success: true, revokedCount: number, revokedSessionIds: string[] }>}
 */
const logoutCurrent = async (userId, refreshToken) => {
    requireUUID(userId, 'User ID');
    requireValue(refreshToken, 'Refresh token');

    const tokenHash = hashToken(refreshToken);

    return withTransaction(async (txClient) => {
        // Resolve session_id from the token. Match on user_id too so a token
        // from another user can't be used to revoke someone else's session.
        const tokenResult = await txClient.query(
            `SELECT session_id
             FROM refresh_tokens
             WHERE token_hash = $1
               AND user_id = $2
             LIMIT 1`,
            [tokenHash, userId]
        );

        // Token not found (already revoked, expired, or forged) → success,
        // nothing to revoke. Logout is idempotent.
        if (!tokenResult.rows.length) {
            return {
                success: true,
                revokedCount: 0,
                revokedSessionIds: []
            };
        }

        const { session_id } = tokenResult.rows[0];

        // Revoke every active token in that session. In practice there's
        // exactly one (the latest in the rotation chain), but the WHERE
        // clause is written defensively in case multiple active rows exist.
        const result = await txClient.query(
            `UPDATE refresh_tokens
             SET revoked_at = NOW()
             WHERE user_id = $1
               AND session_id = $2
               AND revoked_at IS NULL
             RETURNING session_id`,
            [userId, session_id]
        );

        return {
            success: true,
            revokedCount: result.rowCount,
            revokedSessionIds: result.rows.map((r) => r.session_id)
        };
    });
};



// ============================================================================
// LOGOUT BY REFRESH TOKEN
// ============================================================================

/**
 * Revoke a session (or all sessions) using only the refresh token.
 *
 * Unlike `logoutCurrent(userId, refreshToken)`, this does NOT require the
 * caller to already know the user's ID. The user_id is resolved from the
 * token itself. This lets the logout endpoint work without the
 * authenticateToken middleware — so users can log out even when their
 * access token has expired.
 *
 * Idempotent:
 *   - Missing / expired / forged token → returns success with 0 revoked.
 *   - Reuse detection is NOT triggered here — logging out should never
 *     fail because the token was already rotated.
 *
 * @param {string} refreshToken    plaintext token from the cookie
 * @param {object} [options]
 * @param {boolean} [options.all]  if true, revoke EVERY active session for
 *                                 the user, not just this one.
 * @returns {Promise<{ success: true, revokedCount: number, revokedSessionIds: string[] }>}
 */
const logoutByRefreshToken = async (refreshToken, { all = false } = {}) => {
    requireValue(refreshToken, 'Refresh token');

    const tokenHash = hashToken(refreshToken);

    return withTransaction(async (txClient) => {
        // Resolve user_id + session_id from the token.
        const tokenResult = await txClient.query(
            `SELECT user_id, session_id
             FROM refresh_tokens
             WHERE token_hash = $1
             LIMIT 1`,
            [tokenHash]
        );

        // Token not found → idempotent success. Nothing to revoke.
        if (!tokenResult.rows.length) {
            return {
                success: true,
                revokedCount: 0,
                revokedSessionIds: []
            };
        }

        const { user_id: userId, session_id: sessionId } = tokenResult.rows[0];

        // ------------------------------------------------------------------
        // ALL sessions for this user.
        // ------------------------------------------------------------------
        if (all) {
            const result = await txClient.query(
                `UPDATE refresh_tokens
                 SET revoked_at = NOW()
                 WHERE user_id = $1
                   AND revoked_at IS NULL
                 RETURNING session_id`,
                [userId]
            );

            return {
                success: true,
                revokedCount: result.rowCount,
                revokedSessionIds: result.rows.map((r) => r.session_id)
            };
        }

        // ------------------------------------------------------------------
        // Only the session that owns this token.
        // ------------------------------------------------------------------
        const result = await txClient.query(
            `UPDATE refresh_tokens
             SET revoked_at = NOW()
             WHERE user_id = $1
               AND session_id = $2
               AND revoked_at IS NULL
             RETURNING session_id`,
            [userId, sessionId]
        );

        return {
            success: true,
            revokedCount: result.rowCount,
            revokedSessionIds: result.rows.map((r) => r.session_id)
        };
    });
};



    // ============================================================================
    // REQUEST PASSWORD RESET
    // ============================================================================

    const requestPasswordReset = async (
        email,
        ipAddress = null
    ) => {
        if (
            typeof email !== 'string' ||
            !email.trim()
        ) {
            return true;
        }

        const normalizedEmail =
            email.trim().toLowerCase();

                const userResult =
            await query(
                `SELECT id, email
                FROM users
                WHERE email = $1
                AND is_active = TRUE
                LIMIT 1`,
                [normalizedEmail]
            );

        const user = userResult.rows[0];

        // Always return true to prevent account enumeration.
        if (!user) return true;

        // Extra safety — the query matched by email, so this is defensive
        // only. Guards against unexpected NULLs in the row.
        if (!user.email) return true;

        const plainToken =
            crypto.randomBytes(32).toString('hex');

        const tokenHash =
            hashToken(plainToken);

        const expiresAt =
            new Date(
                Date.now() +
                RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000
            );

        await withTransaction(async (txClient) => {
            await txClient.query(
                `UPDATE password_reset_tokens
                SET used_at = NOW()
                WHERE user_id = $1
                AND used_at IS NULL`,
                [user.id]
            );

            await txClient.query(
                `INSERT INTO password_reset_tokens
                    (user_id, token_hash, expires_at, ip_address)
                VALUES ($1,$2,$3,$4)`,
                [
                    user.id,
                    tokenHash,
                    expiresAt,
                    ipAddress
                ]
            );
        });

        const frontendUrl =
            process.env.FRONTEND_URL;

        if (!frontendUrl) {
            throw new Error(
                'FRONTEND_URL environment variable is required.'
            );
        }

        const resetUrl =`${frontendUrl}/reset-password?token=${encodeURIComponent(plainToken)}`;


        try {
            await sendMail({
                to: user.email,
                subject: `Password Reset Request - ${process.env.APP_NAME || 'Application'}`,
                html: `
                <h2>Password Reset Request</h2>
                <p>You requested to reset your password.</p>
                <p>
                    <a href="${resetUrl}"
                    target="_blank"
                    rel="noopener noreferrer">
                        Reset Password
                    </a>
                </p>
                <p>This link expires in ${RESET_TOKEN_EXPIRY_MINUTES} minutes.</p>
                <p>If you did not request this, you can safely ignore this email.</p>
            `
            });
        } catch (mailError) {
            // Log and swallow. The caller must not be able to distinguish
            // "email exists but SMTP failed" from "email doesn't exist".
            console.error('[Auth Service] Password reset email failed:', mailError);
        }

        return true;
    };



    // ============================================================================
    // RESET PASSWORD WITH TOKEN
    // ============================================================================

    const resetPasswordWithToken = async (
    plainToken,
    newPassword
) => {
    requireValue(plainToken, 'Reset token');
    validatePassword(newPassword, 'New password');

    const tokenHash = hashToken(plainToken);

    // Hash BEFORE the transaction — bcrypt is CPU-heavy and we must not
    // hold row locks while it runs.
    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

    return withTransaction(async (txClient) => {
        const tokenResult = await txClient.query(
            `SELECT id, user_id, used_at, expires_at
             FROM password_reset_tokens
             WHERE token_hash = $1
               AND used_at IS NULL
               AND expires_at > NOW()
             FOR UPDATE`,
            [tokenHash]
        );

        const resetToken = tokenResult.rows[0];

        if (!resetToken) {
            const error = new Error('Password reset token is invalid or has expired.');
            error.statusCode = 400;
            throw error;
        }

        const userResult = await txClient.query(
            `SELECT id, is_active
             FROM users
             WHERE id = $1
             FOR UPDATE`,
            [resetToken.user_id]
        );

        const user = userResult.rows[0];

        if (!user || !user.is_active) {
            const error = new Error('User account is unavailable.');
            error.statusCode = 400;
            throw error;
        }

        // Consume the token. If another request beat us to it, this UPDATE
        // affects 0 rows and we bail — no password change.
        const consumeResult = await txClient.query(
            `UPDATE password_reset_tokens
             SET used_at = NOW()
             WHERE id = $1
               AND used_at IS NULL
             RETURNING id`,
            [resetToken.id]
        );

        if (!consumeResult.rows.length) {
            const error = new Error('Password reset token has already been used.');
            error.statusCode = 400;
            throw error;
        }

        await txClient.query(
            `UPDATE users
             SET password_hash = $1,
                 password_changed_at = NOW(),
                 must_change_password = FALSE,
                 failed_login_attempts = 0,
                 locked_until = NULL,
                 updated_at = NOW(),
                 updated_by = $2
             WHERE id = $3`,
            [passwordHash, user.id, user.id]
        );

        await txClient.query(
            `UPDATE refresh_tokens
             SET revoked_at = NOW()
             WHERE user_id = $1
               AND revoked_at IS NULL`,
            [user.id]
        );

        return true;
    });
};

    // ============================================================================
    // USER ROLES
    // ============================================================================

    const getUserRoles = async (
        userId,
        client = null
    ) => {
        requireUUID(userId, 'User ID');

        const queryFn = client
            ? (sql, params) => client.query(sql, params)
            : query;

        const result = await queryFn(
            `SELECT r.id, r.name, r.display_name
            FROM roles r
            JOIN user_roles ur ON ur.role_id = r.id
            WHERE ur.user_id = $1
            AND r.is_active = TRUE
            ORDER BY r.name`,
            [userId]
        );

        return result.rows;
    };


    // ============================================================================
    // USER PERMISSIONS
    // ============================================================================

    const getUserPermissions = async (userId) => {
        requireUUID(userId, 'User ID');

        const result = await query(
            `SELECT DISTINCT
                p.resource,
                p.action,
                COALESCE(up.granted, TRUE) AS granted,
                CASE
                    WHEN up.permission_id IS NOT NULL THEN 'direct'
                    ELSE 'role'
                END AS source
            FROM permissions p
            LEFT JOIN (
                SELECT DISTINCT ON (permission_id)
                    permission_id,
                    granted
                FROM user_permissions
                WHERE user_id = $1
                ORDER BY permission_id
            ) up ON up.permission_id = p.id
            LEFT JOIN role_permissions rp
                ON rp.permission_id = p.id
            LEFT JOIN user_roles ur
                ON ur.role_id = rp.role_id
            LEFT JOIN roles r
                ON r.id = ur.role_id
                AND r.is_active = TRUE
            WHERE up.permission_id IS NOT NULL
                OR ur.user_id = $1
            ORDER BY p.resource, p.action`,
            [userId]
        );

        const permissionMap = {};

        for (const row of result.rows) {
            if (!permissionMap[row.resource]) {
                permissionMap[row.resource] = [];
            }

            const existing =
                permissionMap[row.resource]
                    .find(
                        (action) =>
                            action.name ===
                            row.action
                    );

            if (existing) {
                /**
                 * Direct user permission always wins over role permission.
                 */
                if (row.source === 'direct') {
                    existing.granted = row.granted;
                    existing.source = 'direct';
                }

                continue;
            }

            permissionMap[row.resource].push({
                name: row.action,
                granted: row.granted,
                source: row.source
            });
        }

        /**
         * Keep only effective granted permissions in the public permission map.
         */
        const effectivePermissions = {};

        for (const [resource, actions] of Object.entries(permissionMap)) {
            const grantedActions = actions
                .filter((action) => action.granted)
                .map((action) => action.name);

            if (grantedActions.length) {
                effectivePermissions[resource] = grantedActions;
            }
        }

        return effectivePermissions;
    };


    // ============================================================================
    // USER PROFILE
    // ============================================================================

const getUserProfile = async (userId) => {
    requireUUID(userId, 'User ID');

    const result = await query(
        `SELECT
             u.id, u.email, u.user_type,
             s.staff_id, s.first_name, s.middle_name, s.last_name, s.full_name,
             s.date_of_birth, s.gender, s.title, s.rank,
             s.employment_date, s.employment_status
         FROM users u
         LEFT JOIN staffs s ON s.user_id = u.id
         WHERE u.id = $1
         LIMIT 1`,
        [userId]
    );

    if (!result.rows.length) return null;

    const row = result.rows[0];

    const user = {
        id: row.id,
        staff_id: row.staff_id,
        email: row.email,
        user_type: row.user_type
    };

    // Present only for user_type = 'employee' with a linked staffs row.
    const staff = row.first_name
        ? {
              first_name: row.first_name,
              middle_name: row.middle_name,
              last_name: row.last_name,
              full_name: row.full_name,
              date_of_birth: row.date_of_birth,
              gender: row.gender,
              title: row.title,
              employment_date: row.employment_date,
              employment_status: row.employment_status,
              rank: row.rank
          }
        : null;

    const [roles, permissions] = await Promise.all([
        getUserRoles(userId),
        getUserPermissions(userId)
    ]);

    return {
        user,
        staff,
        roles,
        permissions
    };
};

    // ============================================================================
    // EXPORTS
    // ============================================================================

    module.exports = {
        loginUser,
        refreshAccessToken,

        checkPermissions,

        assignRoles,
        removeRoles,


        assignDirectPermissions,
        removeDirectPermissions,


        changePassword,
        setPasswordWithSetupToken,
        changePasswordWithCredentials,
        invalidateSessions,
        logoutCurrent,
        logoutByRefreshToken,

        requestPasswordReset,
        resetPasswordWithToken,

        getUserRoles,
        getUserPermissions,
        getUserProfile,

        activateUserPortal,
        deactivateUserPortal,
        createUserPortalAccess,

        generateDefaultPassword
    };