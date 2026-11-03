// pages/tasks/Tasks.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiPlus, FiSearch, FiFilter, FiRefreshCw, FiMoreVertical, FiEdit2, FiEye, FiChevronLeft, FiChevronRight, FiPlayCircle,
} from 'react-icons/fi';
import { format } from 'date-fns';
import { toast, Toaster } from 'sonner';
import { createPortal } from 'react-dom';
import useAuth from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import { usePrivateQuery } from '../../hooks/usePrivateQuery';
import { usePrivateMutation } from '../../hooks/usePrivateMutation';
import styles from './styles/Tasks.module.css';

// --- Styling Helpers ---
const getPriorityStyle = (priority) => {
  switch (priority) {
    case 'urgent': return { color: '#e11d48', bg: '#ffe4e6' };
    case 'high': return { color: '#ea580c', bg: '#ffedd5' };
    case 'medium': return { color: '#ca8a04', bg: '#fef9c3' };
    case 'low': return { color: '#16a34a', bg: '#dcfce7' };
    default: return { color: '#6b7280', bg: '#f3f4f6' };
  }
};

const getStatusStyle = (status) => {
  switch (status) {
    case 'done': return { color: '#16a34a' };
    case 'in_progress': return { color: '#2563eb' };
    case 'blocked': return { color: '#dc2626' };
    case 'cancelled': return { color: '#6b7280' };
    default: return { color: '#ea580c' };
  }
};

// --- Action Menu (Portal) ---
const ActionMenu = ({ task, canEdit, onView, onEdit, onMarkInProgress, isUpdating }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const toggleMenu = (e) => {
    e.stopPropagation();
    if (!isOpen) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({ top: rect.bottom + 4, left: rect.right - 160 });
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target) && !buttonRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleScroll = () => setIsOpen(false);
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll, true); 
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen]);

  const canMarkInProgress = task.status === 'todo' || task.status === 'blocked';

  return (
    <>
      <button ref={buttonRef} className={styles.actionBtn} onClick={toggleMenu} disabled={isUpdating}>
        <FiMoreVertical size={18} />
      </button>

      {isOpen && createPortal(
        <div className={styles.actionDropdown} ref={menuRef} style={{ top: menuPosition.top, left: menuPosition.left, position: 'fixed' }}>
          <button className={styles.dropdownItem} onClick={() => { setIsOpen(false); onView(); }}>
            <FiEye size={14} /> <span>View Task</span>
          </button>
          {canEdit && (
            <button className={styles.dropdownItem} onClick={() => { setIsOpen(false); onEdit(); }}>
              <FiEdit2 size={14} /> <span>Edit Task</span>
            </button>
          )}
          {canMarkInProgress && (
            <>
              <div className={styles.dropdownDivider} />
              <button className={styles.dropdownItem} onClick={() => { setIsOpen(false); onMarkInProgress(); }}>
                <FiPlayCircle size={14} /> <span>Mark In Progress</span>
              </button>
            </>
          )}
        </div>,
        document.body
      )}
    </>
  );
};

// --- Main Component ---
const Tasks = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const currentUserId = auth?.user?.id;
  
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'assigned';
  
  useEffect(() => { document.title = 'Tasks | Ant Cyber Portal'; }, []);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  
  const [filters, setFilters] = useState({ status: '', priority: '' });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef(null);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) setIsFilterOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => { setPage(1); }, [activeTab, debouncedSearch, filters.status, filters.priority, limit]);

  // --- Query ---
  const queryParams = {
    page,
    limit,
    search: debouncedSearch || undefined,
    status: filters.status || undefined,
    priority: filters.priority || undefined,
    ...(activeTab === 'assigned' ? { assignee_id: currentUserId } : {}),
    ...(activeTab === 'created' ? { created_by: currentUserId } : {}),
  };

  const { data: response, isLoading, isFetching, refetch } = usePrivateQuery(
    ['tasks', activeTab, queryParams],
    '/api/tasks',
    queryParams,
    { 
      keepPreviousData: true, 
      staleTime: 30_000,
      enabled: Boolean(currentUserId) // <-- Prevents fetching until user ID is available
    }
  );

  const tasks = response?.data?.results || [];
  const pagination = response?.data?.pagination || { page: 1, total_pages: 1, total: 0 };

  // --- Mutations ---
  const { mutate: updateTaskStatus } = usePrivateMutation({
    targetQueryKey: ['tasks'],
    onSuccess: () => toast.success('Task status updated to In Progress', { duration: 3000 }),
    onError: (error) => toast.error(error?.response?.data?.message || 'Failed to update task', { duration: 4000 }),
  });

  const handleMarkInProgress = (taskId) => {
    updateTaskStatus({ url: `/api/tasks/${taskId}`, method: 'PATCH', data: { status: 'in_progress' } });
  };

  // --- Handlers ---
  const handleTabChange = (tab) => {
    setSearchParams({ tab });
    setSearch('');
    setFilters({ status: '', priority: '' });
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const renderAssignees = (assignees) => {
    if (!assignees || assignees.length === 0) return <span style={{ color: '#9ca3af' }}>Unassigned</span>;
    const getFirstName = (fullName) => (fullName ? fullName.split(' ')[0] : 'Unknown');
    
    if (assignees.length === 1) return <span className={styles.assigneeText}>{getFirstName(assignees[0].full_name)}</span>;
    if (assignees.length === 2) return <span className={styles.assigneeText}>{getFirstName(assignees[0].full_name)}, {getFirstName(assignees[1].full_name)}</span>;

    return (
      <span className={styles.assigneeText}>
        {getFirstName(assignees[0].full_name)}, {getFirstName(assignees[1].full_name)} 
        <span className={styles.moreAssignees}> +{assignees.length - 2} more</span>
      </span>
    );
  };

  return (
    <div className={styles.pageWrapper}>
      <Toaster position="top-right" richColors />

      <div className={styles.pageContainer}>
        <header className={styles.pageHeader}>
          <div>
            <h1 className={styles.title}>Tasks</h1>
            <p className={styles.subtitle}>Manage and track your assigned work.</p>
          </div>
          <Button onClick={() => navigate('./create')}>
            <FiPlus size={16} style={{ marginRight: '6px' }} /> Create Task
          </Button>
        </header>

        <div className={styles.tabsContainer}>
          <button className={`${styles.tab} ${activeTab === 'assigned' ? styles.tabActive : ''}`} onClick={() => handleTabChange('assigned')}>
            Assigned to Me
          </button>
          <button className={`${styles.tab} ${activeTab === 'created' ? styles.tabActive : ''}`} onClick={() => handleTabChange('created')}>
            Created by Me
          </button>
        </div>

        <motion.div className={styles.card} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className={styles.toolbar}>
            <div className={styles.searchBox}>
              <FiSearch className={styles.searchIcon} />
              <input type="text" placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)} className={styles.searchInput} />
            </div>

            <div className={styles.toolbarActions}>
              <div className={styles.filterWrapper} ref={filterRef}>
                <button className={`${styles.iconBtn} ${activeFilterCount ? styles.iconBtnActive : ''}`} onClick={() => setIsFilterOpen(!isFilterOpen)}>
                  <FiFilter size={16} /> <span>Filters</span>
                  {activeFilterCount > 0 && <span className={styles.filterBadge}>{activeFilterCount}</span>}
                </button>

                {isFilterOpen && (
                  <div className={styles.filterPopover}>
                    <div className={styles.filterHeader}>
                      <span>Filters</span>
                      <button onClick={clearFilters} className={styles.clearBtn}>Clear all</button>
                    </div>
                    <div className={styles.filterBody}>
                      <label className={styles.filterLabel}>Status</label>
                      <select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)} className={styles.filterSelect}>
                        <option value="">All Statuses</option>
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="blocked">Blocked</option>
                        <option value="done">Done</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <label className={styles.filterLabel} style={{ marginTop: '12px' }}>Priority</label>
                      <select value={filters.priority} onChange={(e) => handleFilterChange('priority', e.target.value)} className={styles.filterSelect}>
                        <option value="">All Priorities</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <button className={styles.iconBtn} onClick={() => refetch()} disabled={isFetching}>
                <FiRefreshCw size={16} className={isFetching ? styles.spin : ''} /> <span>Refresh</span>
              </button>
            </div>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Project</th>
                  <th>Assignees</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Due Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan="7" className={styles.emptyState}>Loading tasks...</td></tr>
                ) : tasks.length === 0 ? (
                  <tr><td colSpan="7" className={styles.emptyState}>No tasks found. Try adjusting your filters.</td></tr>
                ) : (
                  tasks.map((task) => {
                    const priorityStyle = getPriorityStyle(task.priority);
                    const statusStyle = getStatusStyle(task.status);
                    const canEdit = activeTab === 'created';

                    return (
                      <tr key={task.id} className={styles.tableRow}>
                        <td><div className={styles.taskTitle}>{task.title}</div></td>
                        <td><span className={styles.projectName}>{task.project_name}</span></td>
                        <td>{renderAssignees(task.assignees)}</td>
                        <td>
                          <span className={styles.priorityBadge} style={{ color: priorityStyle.color, backgroundColor: priorityStyle.bg }}>
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                          </span>
                        </td>
                        <td>
                          <div className={styles.statusWrapper}>
                            <span className={styles.statusDot} style={{ backgroundColor: statusStyle.color }} />
                            <span style={{ color: statusStyle.color, textTransform: 'capitalize' }}>{task.status.replace('_', ' ')}</span>
                          </div>
                        </td>
                        <td><span className={styles.dueDate}>{format(new Date(task.due_date), 'MMM d, yyyy')}</span></td>
                        <td>
                          <div className={styles.rowActions}>
                            <ActionMenu 
                              task={task} 
                              canEdit={canEdit} 
                              onView={() => navigate(`/admin/tasks/${task.id}`)} 
                              onEdit={() => navigate(`/admin/tasks/${task.id}/edit`)} 
                              onMarkInProgress={() => handleMarkInProgress(task.id)} 
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className={styles.pagination}>
            <div className={styles.pageInfo}>
              Showing {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
            </div>
            
            <div className={styles.pageControls}>
              <div className={styles.rowsPerPage}>
                <span>Rows per page:</span>
                <select value={limit} onChange={(e) => setLimit(Number(e.target.value))} className={styles.pageSelect}>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div className={styles.pageNav}>
                <button className={styles.pageBtn} disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
                  <FiChevronLeft size={16} />
                </button>
                {Array.from({ length: Math.min(5, pagination.total_pages || 1) }, (_, i) => {
                  let pageNum = i + 1;
                  if (pagination.total_pages > 5 && page > 3) pageNum = page - 2 + i;
                  if (pageNum > pagination.total_pages) return null;
                  return (
                    <button key={pageNum} className={`${styles.pageNum} ${page === pageNum ? styles.pageNumActive : ''}`} onClick={() => setPage(pageNum)}>
                      {pageNum}
                    </button>
                  );
                })}
                <button className={styles.pageBtn} disabled={page >= pagination.total_pages} onClick={() => setPage(p => Math.min(pagination.total_pages, p + 1))}>
                  <FiChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Tasks;