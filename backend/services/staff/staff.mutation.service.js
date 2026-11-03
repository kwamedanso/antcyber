// staff.service.js
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { query, startTransaction } = require('../../utils/database/connection');
const { sendMail } = require('../email/email.service');
const { assignRoles, sendWelcomeEmail } = require('../auth/auth.service');

// ============================================================================
// CONSTANTS
// ============================================================================

const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 12;
const RESET_TOKEN_EXPIRY_MINUTES =
    Number(process.env.RESET_TOKEN_EXPIRY_MINUTES) || 60;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ============================================================================
// HELPERS (mirrors auth.service — kept local so staff service is self-contained)
// ============================================================================

const withTransaction = async (callback) => {
    const tx = await startTransaction();
    try {
        const result = await callback(tx.client);
        await tx.commit();
        return result;
    } catch (error) {
        try {
            await tx.rollback();
        } catch (rollbackError) {
            console.error('[Staff Service] Rollback failed:', rollbackError);
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
    const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (typeof value !== 'string' || !uuidRegex.test(value)) {
        const error = new Error(`${fieldName} must be a valid UUID.`);
        error.statusCode = 400;
        throw error;
    }
    return value;
};

const requireEmail = (value, fieldName = 'Email') => {
    requireValue(value, fieldName);
    const normalized = String(value).trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalized)) {
        const error = new Error(`${fieldName} is invalid.`);
        error.statusCode = 400;
        throw error;
    }
    return normalized;
};

const hashToken = (token) =>
    crypto.createHash('sha256').update(token).digest('hex');

const normalizeOptionalString = (value) => {
    if (value === undefined || value === null) return null;
    const s = String(value).trim();
    return s.length ? s : null;
};

const normalizeDate = (value, fieldName) => {
    if (value === undefined || value === null || value === '') return null;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) {
        const error = new Error(`${fieldName} is not a valid date.`);
        error.statusCode = 400;
        throw error;
    }
    return d.toISOString().slice(0, 10); // YYYY-MM-DD
};

// ============================================================================
// STAFF ID GENERATOR
// ----------------------------------------------------------------------------
// Format: GTV-<YY><NNNN>  e.g. GTV-250001
// Adjust the prefix / width to match your institutional convention.
// ============================================================================

const STAFF_ID_PREFIX = process.env.STAFF_ID_PREFIX || 'ACE';

const generateStaffId = async (client) => {
    const yearSuffix = String(new Date().getFullYear()).slice(-2);

    // Sequence per year; falls back to a single count because the number
    // of staff created in the current year is small in practice.
    const result = await client.query(
        `SELECT staff_id
         FROM staffs
         WHERE staff_id LIKE $1
         ORDER BY staff_id DESC
         LIMIT 1`,
        [`${STAFF_ID_PREFIX}-${yearSuffix}%`]
    );

    let nextNumber = 1;

    if (result.rows.length) {
        const last = result.rows[0].staff_id; // e.g. GTV-250042
        const parts = last.split('-');
        const seq = parseInt(parts[parts.length - 1], 10);
        if (!Number.isNaN(seq)) nextNumber = seq + 1;
    }

    const padded = String(nextNumber).padStart(4, '0');
    return `${STAFF_ID_PREFIX}-${yearSuffix}-${padded}`;
};

// ============================================================================
// SEARCH INDEX (staffs_search_index)
// ----------------------------------------------------------------------------
// Builds the searchable text for a staff row and inserts/updates the
// corresponding row in staffs_search_index.
//
// The previous version of this app included current_pos / current_place /
// current_rank / placements / organisational units. Those are removed here.
// ============================================================================

const buildStaffSearchText = (staff, contacts = []) => {
    const parts = [
        staff.staff_id,
        staff.first_name,
        staff.middle_name,
        staff.last_name,
        staff.full_name,
        staff.title,
        staff.gender,
        staff.employment_status,
        staff.email
    ];

    for (const c of contacts) {
        if (c.value) parts.push(c.value);
    }

    return parts
        .filter((p) => p !== undefined && p !== null && p !== '')
        .join(' ')
        .toLowerCase();
};

const upsertStaffSearchIndex = async (client, staff, contacts = []) => {
    const searchText = buildStaffSearchText(staff, contacts);

    await client.query(
        `INSERT INTO staffs_search_index
            (entity_id, search_text, search_vector, is_active, updated_at)
         VALUES ($1, $2, to_tsvector('simple', $2), TRUE, NOW())
         ON CONFLICT (entity_id) DO UPDATE
            SET search_text   = EXCLUDED.search_text,
                search_vector = EXCLUDED.search_vector,
                is_active     = TRUE,
                updated_at    = NOW()`,
        [staff.staff_id, searchText]
    );
};

// ============================================================================
// USERS SEARCH INDEX
// ----------------------------------------------------------------------------
// users_search_index is keyed by users.id and entity_type. It feeds the
// generic "find any user" search (employees + externals).
// ============================================================================

const buildUserSearchText = (user, staff = null) => {
    const parts = [user.email, user.user_type];

    if (staff) {
        parts.push(
            staff.staff_id,
            staff.first_name,
            staff.middle_name,
            staff.last_name,
            staff.full_name,
            staff.title
        );
    }

    return parts
        .filter((p) => p !== undefined && p !== null && p !== '')
        .join(' ')
        .toLowerCase();
};

const upsertUserSearchIndex = async (client, user, staff = null) => {
    const searchText = buildUserSearchText(user, staff);

    await client.query(
        `INSERT INTO users_search_index
            (entity_type, entity_id, search_text, search_vector, is_active, updated_at)
         VALUES ($1, $2, $3, to_tsvector('simple', $3), TRUE, NOW())
         ON CONFLICT (entity_type, entity_id) DO UPDATE
            SET search_text   = EXCLUDED.search_text,
                search_vector = EXCLUDED.search_vector,
                is_active     = TRUE,
                updated_at    = NOW()`,
        [user.user_type, user.id, searchText]
    );
};

// ============================================================================
// CONTACTS
// ============================================================================

const insertStaffContact = async (client, staffId, contact) => {
    const {
        contact_type_id,
        value,
        is_primary = false,
        is_verified = false
    } = contact;

    requireUUID(contact_type_id, 'Contact type ID');
    requireValue(value, 'Contact value');

    const result = await client.query(
        `INSERT INTO staff_contacts
            (staff_id, contact_type_id, value, is_primary, is_verified)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, staff_id, contact_type_id, value, is_primary, is_verified,
                   created_at, updated_at`,
        [staffId, contact_type_id, String(value).trim(), !!is_primary, !!is_verified]
    );

    return result.rows[0];
};

// Resolve a contact_type by name (e.g. 'email') so callers don't have to
// look up UUIDs themselves when wiring in the primary email.
const getContactTypeIdByName = async (client, name) => {
    requireValue(name, 'Contact type name');
    const result = await client.query(
        `SELECT id FROM contact_types WHERE name = $1 LIMIT 1`,
        [name]
    );
    if (!result.rows.length) {
        const error = new Error(`Contact type "${name}" is not configured.`);
        error.statusCode = 500;
        throw error;
    }
    return result.rows[0].id;
};

// ============================================================================
// CORE — createStaff
// ----------------------------------------------------------------------------
// Public function. Creates:
//   1. users row (with a random temporary password, must_change_password=TRUE)
//   2. staffs row (staff_id auto-generated unless provided)
//   3. staff_contacts rows (email + any extra contacts supplied)
//   4. staffs_search_index + users_search_index rows
//   5. optional role assignments via assignRoles()
//   6. welcome email with set-password link (sent AFTER commit)
//
// Any failure before commit rolls everything back.

// =======================REQUEST BODY START======================
// {
//   "email": "jane.doe@company.com",
//   "first_name": "Jane",
//   "middle_name": "A.",
//   "last_name": "Doe",
//   "title": "Ms",
//   "gender": "female",
//   "date_of_birth": "1994-03-12",
//   "employment_date": "2025-01-06",
//   "employment_status": "active",
//   "roleIds": ["<uuid-1>", "<uuid-2>"],
//   "contacts": [
//     {
//       "contact_type_id": "<phone-type-uuid>",
//       "value": "+233...",
//       "is_primary": true
//     }
//   ]
// }
// ============================================================================

const createStaff = async (payload, metaData = {}) => {
    const {
        email,
        first_name,
        middle_name = null,
        last_name,
        date_of_birth = null,
        gender = null,
        title = null,
        employment_date = null,
        employment_status = 'active',
        religion_id = null,
        staff_id: providedStaffId = null,
        contacts = [],
        roleIds = null,
        user_type = 'employee'
    } = payload;

    const { ip_address = null } = metaData;

    // ------------------------------------------------------------------
    // 1. Validate input shape (cheap checks before hitting the DB)
    // ------------------------------------------------------------------
    const normalizedEmail = requireEmail(email, 'Email');
    requireValue(first_name, 'First name');
    requireValue(last_name, 'Last name');

    if (!['employee', 'external'].includes(user_type)) {
        const error = new Error('user_type must be "employee" or "external".');
        error.statusCode = 400;
        throw error;
    }

    if (providedStaffId && !/^[A-Za-z0-9-]{3,25}$/.test(providedStaffId)) {
        const error = new Error('staff_id is invalid (3–25 alphanumeric/dash).');
        error.statusCode = 400;
        throw error;
    }

    // ------------------------------------------------------------------
    // 2. Preflight — email must be unique. Cheap, outside the tx, so a
    //    common failure returns quickly without opening a transaction.
    // ------------------------------------------------------------------
    const existing = await query(
        `SELECT id FROM users WHERE email = $1 LIMIT 1`,
        [normalizedEmail]
    );

    if (existing.rows.length) {
        const error = new Error('A user with this email already exists.');
        error.statusCode = 409;
        error.code = 'EMAIL_TAKEN';
        throw error;
    }

    // ------------------------------------------------------------------
    // 3. Hash a random temporary password. The user will receive a
    //    set-password link via email, so the actual password is never
    //    returned to the caller.
    // ------------------------------------------------------------------
    const tempPassword = crypto.randomBytes(32).toString('hex');
    const passwordHash = await bcrypt.hash(tempPassword, BCRYPT_ROUNDS);

    // ------------------------------------------------------------------
    // 4. Run the write side inside a single transaction.
    // ------------------------------------------------------------------
    const result = await withTransaction(async (client) => {
        // 4a. users row
        const userInsert = await client.query(
            `INSERT INTO users
                (email, password_hash, user_type, must_change_password,
                 email_verified_at, is_active)
             VALUES ($1, $2, $3, TRUE, NULL, TRUE)
             RETURNING id, email, user_type, is_active, must_change_password,
                       created_at, updated_at`,
            [normalizedEmail, passwordHash, user_type]
        );
        const user = userInsert.rows[0];

        // 4b. staff_id resolution
        const staffId = providedStaffId || (await generateStaffId(client));

        // Guard against an explicit staff_id colliding.
        const collision = await client.query(
            `SELECT 1 FROM staffs WHERE staff_id = $1 LIMIT 1`,
            [staffId]
        );
        if (collision.rows.length) {
            const error = new Error(`Staff ID "${staffId}" is already in use.`);
            error.statusCode = 409;
            error.code = 'STAFF_ID_TAKEN';
            throw error;
        }

        // 4c. staffs row
        const staffInsert = await client.query(
            `INSERT INTO staffs
                (user_id, staff_id, first_name, middle_name, last_name,
                 date_of_birth, gender, title,
                 employment_date, employment_status, religion_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
             RETURNING id, user_id, staff_id, first_name, middle_name, last_name,
                       full_name, date_of_birth, gender, title,
                       employment_date, employment_status, created_at, updated_at`,
            [
                user.id,
                staffId,
                String(first_name).trim(),
                normalizeOptionalString(middle_name),
                String(last_name).trim(),
                normalizeDate(date_of_birth, 'Date of birth'),
                normalizeOptionalString(gender),
                normalizeOptionalString(title),
                normalizeDate(employment_date, 'Employment date'),
                employment_status,
                religion_id || null
            ]
        );
        const staff = staffInsert.rows[0];

        // 4d. contacts — the primary email is always inserted so the
        //     staff_contacts table carries the login identity.
        const insertedContacts = [];

        try {
            const emailTypeId = await getContactTypeIdByName(client, 'email');

            const emailContact = await insertStaffContact(client, staff.staff_id, {
                contact_type_id: emailTypeId,
                value: normalizedEmail,
                is_primary: true,
                is_verified: false
            });
            insertedContacts.push(emailContact);
        } catch (err) {
            // If contact_types isn't seeded yet, don't fail the whole
            // staff creation — the email still lives on users.email.
            if (err.statusCode === 500) {
                console.warn(
                    '[Staff Service] contact_types not seeded; skipping primary email contact.'
                );
            } else {
                throw err;
            }
        }

        for (const contact of contacts) {
            const inserted = await insertStaffContact(client, staff.staff_id, contact);
            insertedContacts.push(inserted);
        }

     // 4e. Search indexes
        await upsertStaffSearchIndex(client, staff, insertedContacts);
        await upsertUserSearchIndex(client, user, staff);

        // 4f. Persist a setup token so /set-password?token=… can be validated later.
        const setupToken = crypto.randomBytes(32).toString('hex');
        const setupTokenHash = hashToken(setupToken);

        await client.query(
            `INSERT INTO password_reset_tokens
                (user_id, token_hash, expires_at, ip_address)
             VALUES ($1, $2, NOW() + ($3 * INTERVAL '1 minute'), $4)`,
            [user.id, setupTokenHash, RESET_TOKEN_EXPIRY_MINUTES, ip_address]
        );

        return {
            user,
            staff,
            contacts: insertedContacts,
            setupToken
        };
    });

    // ------------------------------------------------------------------
    // 5. Optional role assignment.
    //    Runs in its own transaction (assignRoles already wraps one),
    //    after the user exists. A role failure shouldn't roll back the
    //    account — the admin can assign roles again from the UI.
    // ------------------------------------------------------------------
    let assignedRoles = null;

    if (Array.isArray(roleIds) && roleIds.length) {
        try {
            assignedRoles = await assignRoles(result.user.id, roleIds);
        } catch (roleError) {
            console.error(
                `[Staff Service] Role assignment failed for user ${result.user.id}:`,
                roleError
            );
        }
    }

    // ------------------------------------------------------------------
    // 6. Send welcome / set-password email AFTER commit.
    //    A random opaque token is used — we don't store it here; if you
    //    want it to be single-use, persist it in password_reset_tokens
    //    the same way requestPasswordReset does.
    // ------------------------------------------------------------------

    try {
        await sendWelcomeEmail(
            result.user.email,
            result.setupToken,
            user_type,
            {
                first_name: result.staff.first_name,
                last_name: result.staff.last_name
            },
            result.user.id
        );
    } catch (mailError) {
        // Non-fatal — creation succeeded. Log for the operator.
        console.error('[Staff Service] Welcome email failed:', mailError);
    }

    // ------------------------------------------------------------------
    // 7. Response
    // ------------------------------------------------------------------
    return {
        user: result.user,
        staff: result.staff,
        contacts: result.contacts,
        assignedRoles,
        setupToken: result.setupToken // returned only so an admin UI can surface it if email fails
    };
};

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
    createStaff,
    insertStaffContact,
    getContactTypeIdByName,
    upsertStaffSearchIndex,
    upsertUserSearchIndex,
    generateStaffId,
    buildStaffSearchText,
    buildUserSearchText
};