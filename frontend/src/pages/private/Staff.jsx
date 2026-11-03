// pages/staff/Staff.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast, Toaster } from 'sonner';
import { format } from 'date-fns';
import {
  FiPlus,
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiMoreVertical,
  FiEdit2,
  FiEye,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiUserCheck,
  FiUserX,
} from 'react-icons/fi';
import { createPortal } from 'react-dom';
import Button from '../../components/ui/Button';
import { usePrivateQuery } from '../../hooks/usePrivateQuery';
import { usePrivateMutation } from '../../hooks/usePrivateMutation';
import styles from './styles/Staff.module.css';

// Status Badge Helper
const getStatusStyle = (status) => {
  switch (status) {
    case 'active': return { color: '#16a34a', bg: '#dcfce7' };
    case 'suspended': return { color: '#ea580c', bg: '#ffedd5' };
    case 'study_leave': return { color: '#2563eb', bg: '#dbeafe' };
    case 'retired':
    case 'resigned':
    case 'terminated': return { color: '#dc2626', bg: '#fee2e2' };
    default: return { color: '#6b7280', bg: '#f3f4f6' };
  }
};

// Action Menu Component (Portal-based)
const ActionMenu = ({ staff, onView, onEdit, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const toggleMenu = (e) => {
    e.stopPropagation();
    if (!isOpen) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 4,
        left: rect.right - 160,
      });
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

  return (
    <>
      <button ref={buttonRef} className={styles.actionBtn} onClick={toggleMenu}>
        <FiMoreVertical size={18} />
      </button>

      {isOpen && createPortal(
        <div className={styles.actionDropdown} ref={menuRef} style={{ top: menuPosition.top, left: menuPosition.left, position: 'fixed' }}>
          <button className={styles.dropdownItem} onClick={() => { setIsOpen(false); onView(); }}>
            <FiEye size={14} /> <span>View Staff</span>
          </button>
          <button className={styles.dropdownItem} onClick={() => { setIsOpen(false); onEdit(); }}>
            <FiEdit2 size={14} /> <span>Edit Staff</span>
          </button>
          <div className={styles.dropdownDivider} />
          <button className={`${styles.dropdownItem} ${styles.dropdownDelete}`} onClick={() => { setIsOpen(false); onDelete(); }}>
            <FiTrash2 size={14} /> <span>Delete</span>
          </button>
        </div>,
        document.body
      )}
    </>
  );
};

// Main Component
const Staff = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Default to 'all' or 'employee'
  const activeTab = searchParams.get('type') || 'employee';

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  
  const [filters, setFilters] = useState({ employment_status: '' });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef(null);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);

  useEffect(() => { document.title = 'Staff | Ant Cyber Portal'; }, []);

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

  useEffect(() => {
    setPage(1);
  }, [activeTab, debouncedSearch, filters.employment_status, limit]);

  // --- Query ---
  const queryParams = {
    page,
    limit,
    search: debouncedSearch || undefined,
    employment_status: filters.employment_status || undefined,
    user_type: activeTab === 'external' ? 'external' : 'employee',
  };

  const { data: response, isLoading, isFetching, refetch } = usePrivateQuery(
    ['staff', activeTab, queryParams],
    '/api/staff',
    queryParams,
    { keepPreviousData: true, staleTime: 30_000 }
  );

  const staffList = response?.data?.results || [];
  const pagination = response?.data?.pagination || { page: 1, total_pages: 1, total: 0 };

  // --- Mutations ---
  const { mutate: deleteStaff, isPending: isDeleting } = usePrivateMutation({
    targetQueryKey: ['staff'],
    onSuccess: () => {
      toast.success('Staff deleted successfully.', { duration: 3000 });
      setDeleteModalOpen(false);
      setStaffToDelete(null);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to delete staff.', { duration: 4000 });
    },
  });

  const { mutate: togglePortal } = usePrivateMutation({
    targetQueryKey: ['staff'],
    onSuccess: () => toast.success('Portal access updated.', { duration: 3000 }),
    onError: (error) => toast.error(error?.response?.data?.message || 'Failed to toggle portal access.', { duration: 4000 }),
  });

  // --- Handlers ---
  const handleTabChange = (tab) => {
    setSearchParams({ type: tab });
    setSearch('');
    setFilters({ employment_status: '' });
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ employment_status: '' });
    setIsFilterOpen(false);
  };

  const handleTogglePortal = (userId, currentStatus) => {
    togglePortal({
      url: `/api/staff/portal-access/${userId}`,
      method: 'PATCH',
      data: { is_active: !currentStatus }
    });
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className={styles.pageWrapper}>
      <Toaster position="top-right" richColors />

      <div className={styles.pageContainer}>
        {/* Header */}
        <header className={styles.pageHeader}>
          <div>
            <h1 className={styles.title}>Staff Directory</h1>
            <p className={styles.subtitle}>Manage employee records and portal access.</p>
          </div>
          <Button onClick={() => navigate('/admin/staff/create')}>
            <FiPlus size={16} style={{ marginRight: '6px' }} />
            Create Staff
          </Button>
        </header>

        {/* Tabs */}
        <div className={styles.tabsContainer}>
          <button className={`${styles.tab} ${activeTab === 'employee' ? styles.tabActive : ''}`} onClick={() => handleTabChange('employee')}>
            Employees
          </button>
          <button className={`${styles.tab} ${activeTab === 'external' ? styles.tabActive : ''}`} onClick={() => handleTabChange('external')}>
            External
          </button>
        </div>

        {/* Card Container */}
        <motion.div className={styles.card} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {/* Toolbar */}
          <div className={styles.toolbar}>
            <div className={styles.searchBox}>
              <FiSearch className={styles.searchIcon} />
              <input type="text" placeholder="Search by name, email, or staff ID..." value={search} onChange={(e) => setSearch(e.target.value)} className={styles.searchInput} />
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
                      <label className={styles.filterLabel}>Employment Status</label>
                      <select value={filters.employment_status} onChange={(e) => handleFilterChange('employment_status', e.target.value)} className={styles.filterSelect}>
                        <option value="">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                        <option value="study_leave">Study Leave</option>
                        <option value="retired">Retired</option>
                        <option value="resigned">Resigned</option>
                        <option value="terminated">Terminated</option>
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

          {/* Table */}
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Staff Member</th>
                  <th>Staff ID</th>
                  <th>Rank</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Portal Access</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan="6" className={styles.emptyState}>Loading staff...</td></tr>
                ) : staffList.length === 0 ? (
                  <tr><td colSpan="6" className={styles.emptyState}>No staff found.</td></tr>
                ) : (
                  staffList.map((staff) => {
                    const statusStyle = getStatusStyle(staff.employment_status);
                    return (
                      <tr key={staff.id} className={styles.tableRow}>
                        <td>
                          <div className={styles.staffNameCell}>
                            <div className={styles.staffAvatar}>
                              {staff.first_name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className={styles.staffName}>{staff.full_name}</div>
                              <div className={styles.staffTitle}>{staff.title || 'No title'}</div>
                            </div>
                          </div>
                        </td>
                        <td><span className={styles.staffId}>{staff.staff_id}</span></td>
                        <td><span className={styles.staffId}>{staff?.rank ?? '-'}</span></td>
                        <td><span className={styles.emailText}>{staff.email}</span></td>
                        <td>
                          <span className={styles.statusBadge} style={{ color: statusStyle.color, backgroundColor: statusStyle.bg }}>
                            {staff.employment_status.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <button
                            // onClick={() => handleTogglePortal(staff.user_id, staff.is_active)}
                            className={`${styles.portalToggle} ${staff.is_active ? styles.portalActive : styles.portalInactive}`}
                            title="Toggle Portal Access"
                          >
                            {staff.is_active ? <FiUserCheck size={14} /> : <FiUserX size={14} />}
                            <span>{staff.is_active ? 'Active' : 'Inactive'}</span>
                          </button>
                        </td>
                        <td>
                          <div className={styles.rowActions}>
                            <ActionMenu
                              staff={staff}
                              onView={() => navigate(`/admin/staff/${staff.staff_id}`)}
                              onEdit={() => navigate(`/admin/staff/${staff.staff_id}/edit`)}
                              onDelete={() => {
                                setStaffToDelete(staff);
                                setDeleteModalOpen(true);
                              }}
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

          {/* Pagination */}
          <div className={styles.pagination}>
            <div className={styles.pageInfo}>
              Showing {(pagination.page - 1) * pagination.limit + 1}–
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
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

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && createPortal(
        <div className={styles.modalOverlay}>
          <motion.div className={styles.modalContent} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <h3 className={styles.modalTitle}>Delete Staff Member</h3>
            <p className={styles.modalText}>
              Are you sure you want to permanently delete <strong>{staffToDelete?.full_name}</strong>? 
              This will remove their portal access and all associated records (contacts, education, etc). This action cannot be undone.
            </p>
            <div className={styles.modalActions}>
              <button type="button" className={styles.modalCancel} onClick={() => setDeleteModalOpen(false)} disabled={isDeleting}>
                Cancel
              </button>
              <button 
                type="button" 
                className={styles.modalConfirm} 
                onClick={() => deleteStaff({ url: `/api/staff/${staffToDelete.staff_id}`, method: 'DELETE' })} 
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Staff'}
              </button>
            </div>
          </motion.div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Staff;