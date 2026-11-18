-- Drop existing constraints and recreate with ON UPDATE CASCADE
ALTER TABLE staff_contacts DROP CONSTRAINT IF EXISTS staff_contacts_staff_id_fkey;
ALTER TABLE staff_contacts ADD CONSTRAINT staff_contacts_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES staffs(staff_id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE staff_identifications DROP CONSTRAINT IF EXISTS staff_identifications_staff_id_fkey;
ALTER TABLE staff_identifications ADD CONSTRAINT staff_identifications_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES staffs(staff_id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE staff_addresses DROP CONSTRAINT IF EXISTS staff_addresses_staff_id_fkey;
ALTER TABLE staff_addresses ADD CONSTRAINT staff_addresses_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES staffs(staff_id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE staff_education DROP CONSTRAINT IF EXISTS staff_education_staff_id_fkey;
ALTER TABLE staff_education ADD CONSTRAINT staff_education_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES staffs(staff_id) ON DELETE CASCADE ON UPDATE CASCADE;





-------------------------------------
---------ATTENDANCE MODULE-----------
-------------------------------------

-- Drop the old table if you created it with the wrong schema
DROP TABLE IF EXISTS attendance_records;

CREATE TABLE attendance_records (
    attendance_id BIGSERIAL PRIMARY KEY,

    staff_id VARCHAR(25) NOT NULL REFERENCES staffs(staff_id) ON DELETE CASCADE,

    -- The user account that performed the action
    clock_in_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    clock_out_user_id UUID REFERENCES users(id) ON DELETE RESTRICT,

    -- Clock-in information
    clock_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    clock_in_latitude NUMERIC(10, 7),
    clock_in_longitude NUMERIC(10, 7),
    clock_in_accuracy NUMERIC(10, 2),
    clock_in_address JSONB,

    -- Clock-out information
    clock_out_at TIMESTAMPTZ,
    clock_out_latitude NUMERIC(10, 7),
    clock_out_longitude NUMERIC(10, 7),
    clock_out_accuracy NUMERIC(10, 2),
    clock_out_address JSONB,

    -- Additional information
    clock_in_device TEXT,
    clock_out_device TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT valid_clock_out CHECK (clock_out_at IS NULL OR clock_out_at >= clock_in_at)
);

CREATE INDEX idx_attendance_staff ON attendance_records(staff_id);
CREATE INDEX idx_attendance_date ON attendance_records(clock_in_at);



INSERT INTO permissions (resource, action, display_name, category, description, module) VALUES
('attendance', 'view', 'View Attendance Records', 'Attendance', 'View attendance records (own or scoped by role)', 'Attendance'),
('attendance', 'view_all', 'View All Attendance Records', 'Attendance', 'View attendance records for all staff across the organization', 'Attendance'),
('attendance', 'create', 'Create Attendance Record', 'Attendance', 'Manually create an attendance record on behalf of a staff member', 'Attendance'),
('attendance', 'update', 'Update Attendance Record', 'Attendance', 'Edit an existing attendance record (e.g., correct clock-in/out times)', 'Attendance'),
('attendance', 'delete', 'Delete Attendance Record', 'Attendance', 'Soft/hard delete an attendance record', 'Attendance');


ALTER TABLE tasks
    DROP CONSTRAINT tasks_status_check;

-- 2. Re-add it with 'overdue' included
ALTER TABLE tasks
    ADD CONSTRAINT tasks_status_check
    CHECK (status IN ('todo', 'in_progress', 'blocked', 'done', 'cancelled', 'overdue'));