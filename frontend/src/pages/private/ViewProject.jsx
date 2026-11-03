// pages/projects/ViewProject.jsx
import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  FiArrowLeft,
  FiEdit2,
  FiCalendar,
  FiFolder,
  FiUsers,
  FiFileText,
  FiUser,
} from 'react-icons/fi';
import Button from '../../components/ui/Button';
import { usePrivateQuery } from '../../hooks/usePrivateQuery';
import styles from './styles/ViewProject.module.css';

const ViewProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'View Project | Ant Cyber Portal';
  }, []);

  // --- Fetch Project ---
  const { data: response, isLoading, isError } = usePrivateQuery(
    ['projects', id],
    `/api/projects/${id}`,
    {},
    { enabled: Boolean(id) }
  );

  const project = response?.data?.id ? response.data : response;

  // --- Loading / Error States ---
  if (isLoading || !project) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.pageContainer}>
          {isError ? (
            <div className={styles.stateCard}>
              <h2 className={styles.stateTitle}>Error Loading Project</h2>
              <p className={styles.stateText}>There was a problem loading this project.</p>
              <Button onClick={() => navigate('/admin/projects')}>Go to Projects</Button>
            </div>
          ) : (
            <div className={styles.stateCard}>
              <div className={styles.spinner} />
              <p className={styles.stateText}>Loading project details...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.pageContainer}>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => navigate(-1)}
        >
          <FiArrowLeft size={14} />
          <span>Back</span>
        </button>

        <motion.div
          className={styles.card}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Header */}
          <header className={styles.header}>
            <div className={styles.headerMain}>
              <h1 className={styles.title}>{project.name}</h1>
              <div className={styles.metaBadges}>
                <span className={styles.projectBadge}>
                  <FiFolder size={12} style={{ marginRight: '4px' }} />
                  Project
                </span>
              </div>
            </div>
          </header>

          <div className={styles.divider} />

          {/* Details Grid */}
          <div className={styles.detailsGrid}>
            <div className={styles.detailItem}>
              <div className={styles.detailIcon}><FiCalendar /></div>
              <div>
                <span className={styles.detailLabel}>Created On</span>
                <span className={styles.detailValue}>
                  {format(new Date(project.created_at), 'MMMM d, yyyy')}
                </span>
              </div>
            </div>

            <div className={styles.detailItem}>
              <div className={styles.detailIcon}><FiUsers /></div>
              <div>
                <span className={styles.detailLabel}>Total Members</span>
                <span className={styles.detailValue}>
                  {project.members?.length || 0} Members
                </span>
              </div>
            </div>
          </div>

          <div className={styles.divider} />

          {/* Description */}
          <div className={styles.descriptionSection}>
            <div className={styles.descriptionHeader}>
              <FiFileText />
              <h3>Description</h3>
            </div>
            <div className={styles.descriptionBody}>
              {project.description ? (
                project.description.split('\n').map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))
              ) : (
                <span className={styles.detailValueEmpty}>No description provided.</span>
              )}
            </div>
          </div>

          <div className={styles.divider} />

          {/* Team Members List */}
          <div className={styles.membersSection}>
            <div className={styles.descriptionHeader}>
              <FiUsers />
              <h3>Team Members</h3>
            </div>
            
            {project.members && project.members.length > 0 ? (
              <div className={styles.membersGrid}>
                {project.members.map((member) => (
                  <div key={member.user_id} className={styles.memberCard}>
                    <div className={styles.avatar}>
                      {member.full_name ? member.full_name.charAt(0).toUpperCase() : <FiUser />}
                    </div>
                    <div className={styles.memberInfo}>
                      <span className={styles.memberName}>
                        {member.full_name || 'Unknown Member'}
                      </span>
                      <span className={styles.memberEmail}>{member.email}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <span className={styles.detailValueEmpty}>No members assigned yet.</span>
            )}
          </div>

          {/* Footer Actions */}
          <div className={styles.footer}>
            <div className={styles.footerMeta}>
              Last updated {format(new Date(project.updated_at), 'MMM d, yyyy')}
            </div>
            <div className={styles.footerActions}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => navigate(-1)}
              >
                Close
              </button>
              <Button onClick={() => navigate(`/admin/projects/${project.id}/edit`)}>
                <FiEdit2 size={14} style={{ marginRight: '6px' }} />
                Edit Project
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ViewProject;