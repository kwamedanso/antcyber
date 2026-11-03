// pages/tasks/ViewTask.jsx
import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast, Toaster } from 'sonner';
import { format } from 'date-fns';
import {
  FiArrowLeft,
  FiEdit2,
  FiCalendar,
  FiFolder,
  FiUsers,
  FiFileText,
  FiCheckCircle,
  FiPlayCircle,
} from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import { usePrivateQuery } from '../../hooks/usePrivateQuery';
import { usePrivateMutation } from '../../hooks/usePrivateMutation';
import styles from './styles/ViewTask.module.css';

// Status styling helpers
const getStatusStyle = (status) => {
  switch (status) {
    case 'done': return { color: '#16a34a', bg: '#dcfce7' };
    case 'in_progress': return { color: '#2563eb', bg: '#dbeafe' };
    default: return { color: '#ea580c', bg: '#ffedd5' }; // todo
  }
};

const getPriorityStyle = (priority) => {
  switch (priority) {
    case 'high': return { color: '#ea580c', bg: '#ffedd5' };
    case 'medium': return { color: '#ca8a04', bg: '#fef9c3' };
    case 'low': return { color: '#16a34a', bg: '#dcfce7' };
    default: return { color: '#6b7280', bg: '#f3f4f6' };
  }
};

const ViewTask = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const currentUserId = auth?.user?.id;

  useEffect(() => {
    document.title = 'View Task | Ant Cyber Portal';
  }, []);

  // --- Fetch Task ---
  const { data: response, isLoading, isError } = usePrivateQuery(
    ['task', id],
    `/api/tasks/${id}`,
    {},
    { enabled: Boolean(id) }
  );

  const task = response?.data?.id ? response.data : response;
  const isCreator = task?.created_by === currentUserId;

  // --- Update Status Mutation ---
  const { mutate: updateStatus, isPending: isUpdating } = usePrivateMutation({
    cacheConfig: { queryKey: ['tasks'], action: 'edit' },
    targetQueryKey: ['task', id], 
    onSuccess: () => {
      toast.success('Task status updated successfully.', { duration: 3000 });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || 'Failed to update status.',
        { duration: 4000 }
      );
    },
  });

  const handleMarkInProgress = () => {
    updateStatus({
      url: `/api/tasks/${id}`,
      method: 'PATCH',
      data: { status: 'in_progress' },
    });
  };

  // --- Loading / Error States ---
  if (isLoading || !task?.status) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.pageContainer}>
          {isError ? (
            <div className={styles.stateCard}>
              <h2 className={styles.stateTitle}>Error Loading Task</h2>
              <p className={styles.stateText}>There was a problem loading this task.</p>
              <Button onClick={() => navigate('/admin/tasks')}>Go to Tasks</Button>
            </div>
          ) : (
            <div className={styles.stateCard}>
              <div className={styles.spinner} />
              <p className={styles.stateText}>Loading task details...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const statusStyle = getStatusStyle(task.status);
  const priorityStyle = getPriorityStyle(task.priority);

  return (
    <div className={styles.pageWrapper}>
      <Toaster position="top-right" richColors />

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
              <h1 className={styles.title}>{task.title}</h1>
              <div className={styles.metaBadges}>
                <span
                  className={styles.priorityBadge}
                  style={{ color: priorityStyle.color, backgroundColor: priorityStyle.bg }}
                >
                  {task.priority?.toUpperCase() || 'MEDIUM'} PRIORITY
                </span>
              </div>
            </div>
            
            {/* Status Action Button */}
            <div className={styles.statusControl}>
              <label className={styles.statusLabel}>Status</label>
              
              {task.status === 'todo' && (
                <button 
                  type="button" 
                  className={styles.startTaskBtn} 
                  onClick={handleMarkInProgress}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <span className={styles.spinnerSmall} />
                  ) : (
                    <FiPlayCircle size={16} />
                  )}
                  <span>{isUpdating ? 'Starting...' : 'Start Task'}</span>
                </button>
              )}

              {task.status === 'in_progress' && (
                <div className={styles.staticStatusBadge} style={{ color: statusStyle.color, backgroundColor: statusStyle.bg }}>
                  <FiPlayCircle size={16} /> In Progress
                </div>
              )}

              {task.status === 'done' && (
                <div className={styles.staticStatusBadge} style={{ color: statusStyle.color, backgroundColor: statusStyle.bg }}>
                  <FiCheckCircle size={16} /> Completed
                </div>
              )}
            </div>
          </header>

          <div className={styles.divider} />

          {/* Details Grid */}
          <div className={styles.detailsGrid}>
            <div className={styles.detailItem}>
              <div className={styles.detailIcon}><FiFolder /></div>
              <div>
                <span className={styles.detailLabel}>Project</span>
                <span className={styles.detailValue}>{task.project_name || 'Unknown'}</span>
              </div>
            </div>

            <div className={styles.detailItem}>
              <div className={styles.detailIcon}><FiCalendar /></div>
              <div>
                <span className={styles.detailLabel}>Due Date</span>
                <span className={styles.detailValue}>
                  {task.due_date ? format(new Date(task.due_date), 'MMMM d, yyyy') : 'No date set'}
                </span>
              </div>
            </div>

            <div className={`${styles.detailItem} ${styles.fullWidth}`}>
              <div className={styles.detailIcon}><FiUsers /></div>
              <div>
                <span className={styles.detailLabel}>Assignees</span>
                <div className={styles.assigneesList}>
                  {task.assignees?.length > 0 ? (
                    task.assignees.map((assignee) => (
                      <div key={assignee.user_id} className={styles.assigneeChip}>
                        <div className={styles.avatar}>
                          {assignee.full_name ? assignee.full_name.charAt(0) : '?'}
                        </div>
                        <span>{assignee.full_name || assignee.email}</span>
                      </div>
                    ))
                  ) : (
                    <span className={styles.detailValueEmpty}>Unassigned</span>
                  )}
                </div>
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
              {task.description ? (
                task.description.split('\n').map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))
              ) : (
                <span className={styles.detailValueEmpty}>No description provided.</span>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className={styles.footer}>
            <div className={styles.footerMeta}>
              Created {task.created_at ? format(new Date(task.created_at), 'MMM d, yyyy') : 'Unknown'}
            </div>
            <div className={styles.footerActions}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => navigate(-1)}
              >
                Close
              </button>
              {isCreator && (
                <Button onClick={() => navigate(`/admin/tasks/${task.id}/edit`)}>
                  <FiEdit2 size={14} style={{ marginRight: '6px' }} />
                  Edit Task
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ViewTask;