// pages/dashboard/Dashboard.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  FiUsers,
  FiFolder,
  FiCheckSquare,
  FiFileText,
  FiArrowUpRight,
  FiClock,
  FiActivity,
  FiPlus,
} from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';
import { usePrivateQuery } from '../../hooks/usePrivateQuery';
import styles from './styles/Dashboard.module.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();

  useEffect(() => {
    document.title = 'Dashboard | Ant Cyber Portal';
  }, []);

  // --- Fetch Dashboard Metrics ---
  // Note: To optimize, you would ideally have a single `/api/dashboard` endpoint.
  // For now, we fetch from the existing list endpoints with limit=1 to get the `total` counts.
  
  const { data: staffData } = usePrivateQuery(['staff-metrics'], '/api/staff', { limit: 1, user_type: 'employee' });
  const { data: projectData } = usePrivateQuery(['project-metrics'], '/api/projects', { limit: 1 });
  const { data: taskData } = usePrivateQuery(['task-metrics'], '/api/tasks', { limit: 1, assignee_id: auth?.user?.id });
  const { data: reportData } = usePrivateQuery(['report-metrics'], '/api/reports', { limit: 1, prepared_by: auth?.user?.id });

  // --- Fetch Recent Activity ---
  const { data: recentTasks, isLoading: tasksLoading } = usePrivateQuery(
    ['recent-tasks'], 
    '/api/tasks', 
    { limit: 4, assignee_id: auth?.user?.id },
    { staleTime: 60_000 }
  );

  const { data: recentReports, isLoading: reportsLoading } = usePrivateQuery(
    ['recent-reports'], 
    '/api/reports', 
    { limit: 4, prepared_by: auth?.user?.id },
    { staleTime: 60_000 }
  );

  const tasks = recentTasks?.data?.results || [];
  const reports = recentReports?.data?.results || [];

  const metrics = [
    {
      title: 'Total Staff',
      value: staffData?.data?.pagination?.total || 0,
      icon: <FiUsers size={24} />,
      color: '#2563eb',
      bg: '#dbeafe',
      path: '/admin/staff',
    },
    {
      title: 'Active Projects',
      value: projectData?.data?.pagination?.total || 0,
      icon: <FiFolder size={24} />,
      color: '#ca8a04',
      bg: '#fef9c3',
      path: '/admin/projects',
    },
    {
      title: 'My Pending Tasks',
      value: taskData?.data?.pagination?.total || 0,
      icon: <FiCheckSquare size={24} />,
      color: '#ea580c',
      bg: '#ffedd5',
      path: '/admin/tasks',
    },
    {
      title: 'My Reports',
      value: reportData?.data?.pagination?.total || 0,
      icon: <FiFileText size={24} />,
      color: '#16a34a',
      bg: '#dcfce7',
      path: '/admin/reports',
    },
  ];

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.pageContainer}>
        
        {/* Header */}
        <header className={styles.pageHeader}>
          <div>
            <h1 className={styles.title}>Welcome back, {auth?.user?.first_name || 'User'}</h1>
            <p className={styles.subtitle}>Here is an overview of what's happening across the portal.</p>
          </div>
        </header>

        {/* Metrics Grid */}
        <motion.div 
          className={styles.metricsGrid}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ staggerChildren: 0.1 }}
        >
          {metrics.map((metric, i) => (
            <motion.div 
              key={metric.title} 
              className={styles.metricCard}
              onClick={() => navigate(metric.path)}
              whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.06)' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className={styles.metricHeader}>
                <div className={styles.iconWrapper} style={{ color: metric.color, backgroundColor: metric.bg }}>
                  {metric.icon}
                </div>
                <FiArrowUpRight className={styles.arrowIcon} />
              </div>
              <div className={styles.metricBody}>
                <h3 className={styles.metricValue}>{metric.value}</h3>
                <p className={styles.metricTitle}>{metric.title}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content Grid */}
        <div className={styles.contentGrid}>
          
          {/* Left Column: Recent Activity */}
          <div className={styles.mainColumn}>
            
            {/* Recent Tasks */}
            <motion.div className={styles.card} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}><FiActivity size={18} /> My Recent Tasks</h2>
                <button className={styles.viewAllBtn} onClick={() => navigate('/admin/tasks')}>View All</button>
              </div>
              <div className={styles.cardBody}>
                {tasksLoading ? (
                  <p className={styles.emptyState}>Loading tasks...</p>
                ) : tasks.length === 0 ? (
                  <p className={styles.emptyState}>No tasks assigned to you yet.</p>
                ) : (
                  <ul className={styles.activityList}>
                    {tasks.map((task) => (
                      <li key={task.id} className={styles.activityItem} onClick={() => navigate(`/admin/tasks/${task.id}`)}>
                        <div className={styles.activityIcon}>
                          <FiCheckSquare size={16} />
                        </div>
                        <div className={styles.activityContent}>
                          <p className={styles.activityTitle}>{task.title}</p>
                          <div className={styles.activityMeta}>
                            <span>{task.project_name}</span>
                            <span className={styles.dot}>•</span>
                            <span>Due {format(new Date(task.due_date), 'MMM d')}</span>
                          </div>
                        </div>
                        <span className={`${styles.statusBadge} ${styles['status_' + task.status]}`}>
                          {task.status.replace('_', ' ')}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.div>

            {/* Recent Reports */}
            <motion.div className={styles.card} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}><FiFileText size={18} /> My Recent Reports</h2>
                <button className={styles.viewAllBtn} onClick={() => navigate('/admin/reports')}>View All</button>
              </div>
              <div className={styles.cardBody}>
                {reportsLoading ? (
                  <p className={styles.emptyState}>Loading reports...</p>
                ) : reports.length === 0 ? (
                  <p className={styles.emptyState}>No reports created yet.</p>
                ) : (
                  <ul className={styles.activityList}>
                    {reports.map((report) => (
                      <li key={report.id} className={styles.activityItem} onClick={() => navigate(`/admin/reports/${report.id}`)}>
                        <div className={styles.activityIcon}><FiFileText size={16} /></div>
                        <div className={styles.activityContent}>
                          <p className={styles.activityTitle}>{report.title}</p>
                          <div className={styles.activityMeta}>
                            <span>{report.reference_number}</span>
                            <span className={styles.dot}>•</span>
                            <span>{report.report_type.toUpperCase()}</span>
                          </div>
                        </div>
                        <span className={styles.reportStatus}>
                          {report.status.replace('_', ' ')}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column: Quick Actions */}
          <div className={styles.sideColumn}>
            <motion.div className={styles.card} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}><FiPlus size={18} /> Quick Actions</h2>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.quickActionGrid}>
                  <button className={styles.actionBtn} onClick={() => navigate('/admin/tasks/create')}>
                    <div className={styles.actionIcon} style={{ color: '#ea580c', background: '#ffedd5' }}><FiCheckSquare /></div>
                    <span>New Task</span>
                  </button>
                  <button className={styles.actionBtn} onClick={() => navigate('/admin/reports/create')}>
                    <div className={styles.actionIcon} style={{ color: '#16a34a', background: '#dcfce7' }}><FiFileText /></div>
                    <span>New Report</span>
                  </button>
                  <button className={styles.actionBtn} onClick={() => navigate('/admin/staff/create')}>
                    <div className={styles.actionIcon} style={{ color: '#2563eb', background: '#dbeafe' }}><FiUsers /></div>
                    <span>Add Staff</span>
                  </button>
                  <button className={styles.actionBtn} onClick={() => navigate('/admin/projects/create')}>
                    <div className={styles.actionIcon} style={{ color: '#ca8a04', background: '#fef9c3' }}><FiFolder /></div>
                    <span>New Project</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;