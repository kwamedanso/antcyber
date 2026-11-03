// pages/staff/ViewStaff.jsx
import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  FiArrowLeft,
  FiUser,
  FiMapPin,
  FiPhone,
  FiBriefcase,
  FiEdit2,
  FiMail,
  FiShield,
  FiExternalLink,
} from 'react-icons/fi';
import Button from '../../components/ui/Button';
import { usePrivateQuery } from '../../hooks/usePrivateQuery';
import styles from './styles/ViewStaff.module.css';

const ViewStaff = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'View Staff | Ant Cyber Portal';
  }, []);

  // Fetch Staff Data
  const { data: staffResponse, isLoading, isError } = usePrivateQuery(
    ['staff', id],
    `/api/staff/${id}`,
    {},
    { enabled: Boolean(id) }
  );

  const staff = staffResponse?.data || staffResponse;

  if (isLoading || !staff) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.pageContainer}>
          <div className={styles.stateCard}>
            <div className={styles.spinner} />
            <p className={styles.stateText}>Loading staff profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.pageContainer}>
          <button type="button" className={styles.backButton} onClick={() => navigate('/admin/staff')}>
            <FiArrowLeft size={14} /><span>Back to Staff</span>
          </button>
          <div className={styles.stateCard}>
            <h2 className={styles.stateTitle}>Staff Not Found</h2>
            <Button onClick={() => navigate('/admin/staff')}>Go to Staff List</Button>
          </div>
        </div>
      </div>
    );
  }

  // Extract data
  const primaryEmail = staff.contacts?.find(c => c.contact_type === 'email' && c.is_primary)?.value || staff.email;
  const primaryPhone = staff.contacts?.find(c => c.contact_type === 'phone')?.value || 'Not Provided';
  const residentialAddress = staff.addresses?.find(a => a.address_type === 'residential');
  
  // Calculate age if DOB exists
  let age = null;
  if (staff.date_of_birth) {
    const birthDate = new Date(staff.date_of_birth);
    const ageDifMs = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDifMs);
    age = Math.abs(ageDate.getUTCFullYear() - 1970);
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.pageContainer}>
        
        {/* Top Navigation */}
        <div className={styles.topActions}>
          <button type="button" className={styles.backButton} onClick={() => navigate(-1)}>
            <FiArrowLeft size={14} /><span>Back</span>
          </button>
          <Button onClick={() => navigate(`/admin/staff/${staff.staff_id}/edit`)}>
            <FiEdit2 size={14} style={{ marginRight: '6px' }} /> Edit Full Profile
          </Button>
        </div>

        {/* Dashboard Grid */}
        <motion.div 
          className={styles.gridContainer}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* ================================================================
              LEFT COLUMN
              ================================================================ */}
          <div className={styles.column}>
            
            {/* Personal Information */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitleGroup}>
                  <FiUser className={styles.cardIcon} />
                  <h2 className={styles.cardTitle}>Personal Information</h2>
                </div>
                <button className={styles.editBtn} onClick={() => navigate(`/admin/staff/${staff.staff_id}/edit`)}>
                  <FiEdit2 size={12} /> Edit
                </button>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Full Name</span>
                    <span className={styles.infoValue}>{staff.full_name}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Gender</span>
                    <span className={styles.infoValue}>{staff.gender || 'N/A'}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Date of Birth</span>
                    <span className={styles.infoValue}>{staff.date_of_birth ? format(new Date(staff.date_of_birth), 'dd MMM yyyy') : 'N/A'}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Age</span>
                    <span className={styles.infoValue}>{age || 'N/A'}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Title</span>
                    <span className={styles.infoValue}>{staff.title || 'N/A'}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Staff ID</span>
                    <span className={styles.infoValue}>{staff.staff_id}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitleGroup}>
                  <FiMapPin className={styles.cardIcon} />
                  <h2 className={styles.cardTitle}>Address Information</h2>
                </div>
                <button className={styles.editBtn} onClick={() => navigate(`/admin/staff/${staff.staff_id}/edit`)}>
                  <FiEdit2 size={12} /> Edit
                </button>
              </div>
              <div className={styles.cardBody}>
                {staff.addresses && staff.addresses.length > 0 ? (
                  staff.addresses.map((addr, idx) => (
                    <div key={idx} className={styles.addressBlock}>
                      <div className={styles.addressHeader}>
                        <span className={styles.infoLabel}>{addr.address_type.charAt(0).toUpperCase() + addr.address_type.slice(1)} Address</span>
                        <button className={styles.linkBtn}>View on Map <FiExternalLink size={12} /></button>
                      </div>
                      <p className={styles.addressText}>
                        {addr.address}, {addr.city}, {addr.region}, {addr.country} {addr.postal_code}
                      </p>
                      {addr.notes && (
                        <div className={styles.noteBox}>
                          <span className={styles.noteLabel}>Notes</span>
                          <p>{addr.notes}</p>
                        </div>
                      )}
                      {idx < staff.addresses.length - 1 && <div className={styles.divider} />}
                    </div>
                  ))
                ) : (
                  <p className={styles.emptyText}>No addresses recorded.</p>
                )}
              </div>
            </div>

          </div>

          {/* ================================================================
              RIGHT COLUMN
              ================================================================ */}
          <div className={styles.column}>
            
            {/* Contact Information */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitleGroup}>
                  <FiPhone className={styles.cardIcon} />
                  <h2 className={styles.cardTitle}>Contact Information</h2>
                </div>
                <button className={styles.editBtn} onClick={() => navigate(`/admin/staff/${staff.staff_id}/edit`)}>
                  <FiEdit2 size={12} /> Edit
                </button>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.contactSection}>
                  <span className={styles.sectionSubLabel}>Personal Contact</span>
                  <div className={styles.contactGrid}>
                    <div className={styles.contactItem}>
                      <span className={styles.infoLabel}>Phone Number</span>
                      <span className={styles.contactValue}>{primaryPhone}</span>
                    </div>
                    <div className={styles.contactItem}>
                      <span className={styles.infoLabel}>Email</span>
                      <span className={styles.contactValue}>{primaryEmail}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Employment Overview */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitleGroup}>
                  <FiBriefcase className={styles.cardIcon} />
                  <h2 className={styles.cardTitle}>Employment Overview</h2>
                </div>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Date Started</span>
                    <span className={styles.infoValue}>
                      {staff.employment_date ? format(new Date(staff.employment_date), 'MMM yyyy') : 'N/A'} - Current
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>User Type</span>
                    <span className={styles.infoValue} style={{ textTransform: 'capitalize' }}>{staff.user_type}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Employment Status</span>
                    <span className={`${styles.statusBadge} ${styles.statusActive}`}>
                      {staff.employment_status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Portal Access</span>
                    <span className={`${styles.statusBadge} ${staff.is_active ? styles.statusActive : styles.statusInactive}`}>
                      {staff.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Roles & Identifications (Extra section based on your data) */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitleGroup}>
                  <FiShield className={styles.cardIcon} />
                  <h2 className={styles.cardTitle}>Identifications</h2>
                </div>
              </div>
              <div className={styles.cardBody}>
                {staff.identifications && staff.identifications.length > 0 ? (
                  <div className={styles.infoGrid}>
                    {staff.identifications.map((idn) => (
                      <div key={idn.id} className={styles.infoItem}>
                        <span className={styles.infoLabel}>{idn.id_type.replace('_', ' ').toUpperCase()}</span>
                        <span className={styles.infoValue} style={{ fontFamily: 'monospace' }}>{idn.id_number}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={styles.emptyText}>No identifications recorded.</p>
                )}
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ViewStaff;