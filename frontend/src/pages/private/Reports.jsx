// pages/reports/Reports.jsx
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
  FiCheckCircle,
  FiUnlock,
} from 'react-icons/fi';
import { createPortal } from 'react-dom';
import useAuth from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import { usePrivateQuery } from '../../hooks/usePrivateQuery';
import { usePrivateMutation } from '../../hooks/usePrivateMutation';
import styles from './styles/Reports.module.css';

// Status styling helper
const getStatusStyle = (status) => {
  switch (status) {
    case 'received': return { color: '#16a34a', bg: '#dcfce7' };
    case 'submitted': return { color: '#2563eb', bg: '#dbeafe' };
    case 'awaiting_receipt': return { color: '#ea580c', bg: '#ffedd5' };
    case 'draft': return { color: '#6b7280', bg: '#f3f4f6' };
    default: return { color: '#6b7280', bg: '#f3f4f6' };
  }
};

// Action Menu Component (Portal-based)
const ActionMenu = ({ report, canEdit, onView, onEdit, onReview, onDelete, activeTab }) => {
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
      if (
        menuRef.current && !menuRef.current.contains(e.target) &&
        buttonRef.current && !buttonRef.current.contains(e.target)
      ) {
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
        <div
          className={styles.actionDropdown}
          ref={menuRef}
          style={{ top: menuPosition.top, left: menuPosition.left, position: 'fixed' }}
        >
          <button className={styles.dropdownItem} onClick={() => { setIsOpen(false); onView(); }}>
            <FiEye size={14} /> <span>View Report</span>
          </button>
          
          {/* Show Edit only if allowed */}
          {canEdit && (
            <button className={styles.dropdownItem} onClick={() => { setIsOpen(false); onEdit(); }}>
              <FiEdit2 size={14} /> <span>Edit Report</span>
            </button>
          )}

          {/* Show Review Action only if it's pending receipt */}
          {activeTab === 'submitted-to-me' && onReview && report.status === 'submitted' && (
            <button className={styles.dropdownItem} onClick={() => { setIsOpen(false); onReview(); }}>
              <FiCheckCircle size={14} /> <span>Acknowledge Receipt</span>
            </button>
          )}

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
const Reports = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const currentUserId = auth?.user?.id;

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'my-reports';

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Filters
  const [filters, setFilters] = useState({ status: '', report_type: '' });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef(null);

  // Modals State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reportToReview, setReportToReview] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [allowEdit, setAllowEdit] = useState(false);

  useEffect(() => { document.title = 'Reports | Ant Cyber Portal'; }, []);

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

  useEffect(() => { setPage(1); }, [activeTab, debouncedSearch, filters.status, filters.report_type, limit]);

  // --- Query ---
  const queryParams = {
    page,
    limit,
    search: debouncedSearch || undefined,
    status: filters.status || undefined,
    report_type: filters.report_type || undefined,
    ...(activeTab === 'my-reports' ? { prepared_by: currentUserId } : {}),
    ...(activeTab === 'submitted-to-me' ? { submitted_to: currentUserId } : {}),
  };

  const { data: response, isLoading, isFetching, refetch } = usePrivateQuery(
    ['reports', activeTab, queryParams],
    '/api/reports',
    queryParams,
    { keepPreviousData: true, staleTime: 30_000 }
  );


  const reports = response?.data?.results || [];
  const pagination = response?.data?.pagination || { page: 1, total_pages: 1, total: 0 };

  // --- Mutations ---
  const { mutate: deleteReport, isPending: isDeleting } = usePrivateMutation({
    targetQueryKey: ['reports'],
    onSuccess: () => {
      toast.success('Report deleted successfully.', { duration: 3000 });
      setDeleteModalOpen(false);
      setReportToDelete(null);
    },
    onError: (error) => toast.error(error?.response?.data?.message || 'Failed to delete report.', { duration: 4000 }),
  });

  const { mutate: reviewReport, isPending: isReviewing } = usePrivateMutation({
    targetQueryKey: ['reports'],
    onSuccess: () => {
      toast.success('Report acknowledged and notes saved.', { duration: 3000 });
      setReviewModalOpen(false);
      setReportToReview(null);
    },
    onError: (error) => toast.error(error?.response?.data?.message || 'Failed to save review.', { duration: 4000 }),
  });

  const { mutate: toggleEditAccess } = usePrivateMutation({
    targetQueryKey: ['reports'],
    onSuccess: () => toast.success('Edit access granted.', { duration: 3000 }),
    onError: (error) => toast.error(error?.response?.data?.message || 'Failed to grant access.', { duration: 4000 }),
  });

  // --- Handlers ---
  const handleTabChange = (tab) => {
    setSearchParams({ tab });
    setSearch('');
    setFilters({ status: '', report_type: '' });
  };

  const handleFilterChange = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));
  const clearFilters = () => { setFilters({ status: '', report_type: '' }); setIsFilterOpen(false); };
  const confirmDelete = () => { if (reportToDelete) deleteReport({ url: `/api/reports/${reportToDelete.id}`, method: 'DELETE' }); };

  const openReviewModal = (report) => {
    setReportToReview(report);
    setReviewNotes(report.reviewer_notes || '');
    setAllowEdit(report.allow_edit || false);
    setReviewModalOpen(true);
  };

  const handleReviewSubmit = () => {
    if (!reportToReview) return;
    const data = new FormData();
    data.append('status', 'received');
    data.append('reviewer_notes', reviewNotes);
    data.append('allow_edit', allowEdit);

    reviewReport({
      url: `/api/reports/${reportToReview.id}`,
      method: 'PATCH',
      data: data,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  };

  const handleQuickAllowEdit = (reportId) => {
    const data = new FormData();
    data.append('allow_edit', true);
    toggleEditAccess({
      url: `/api/reports/${reportId}`,
      method: 'PATCH',
      data: data,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className={styles.pageWrapper}>
      <Toaster position="top-right" richColors />

      <div className={styles.pageContainer}>
        <header className={styles.pageHeader}>
          <div>
            <h1 className={styles.title}>Reports</h1>
            <p className={styles.subtitle}>Create, manage, and track report submissions.</p>
          </div>
          <Button onClick={() => navigate('/admin/reports/create')}>
            <FiPlus size={16} style={{ marginRight: '6px' }} /> Create Report
          </Button>
        </header>

        <div className={styles.tabsContainer}>
          <button className={`${styles.tab} ${activeTab === 'my-reports' ? styles.tabActive : ''}`} onClick={() => handleTabChange('my-reports')}>
            My Reports
          </button>
          <button className={`${styles.tab} ${activeTab === 'submitted-to-me' ? styles.tabActive : ''}`} onClick={() => handleTabChange('submitted-to-me')}>
            Submitted to Me
          </button>
        </div>

        <motion.div className={styles.card} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className={styles.toolbar}>
            <div className={styles.searchBox}>
              <FiSearch className={styles.searchIcon} />
              <input type="text" placeholder="Search reports..." value={search} onChange={(e) => setSearch(e.target.value)} className={styles.searchInput} />
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
                        <option value="draft">Draft</option>
                        <option value="submitted">Submitted</option>
                        <option value="awaiting_receipt">Awaiting Receipt</option>
                        <option value="received">Received</option>
                      </select>
                      <label className={styles.filterLabel} style={{ marginTop: '12px' }}>Type</label>
                      <select value={filters.report_type} onChange={(e) => handleFilterChange('report_type', e.target.value)} className={styles.filterSelect}>
                        <option value="">All Types</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="annual">Annual</option>
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
                  <th>Ref No.</th>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Project</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th>Reviewed At</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan="7" className={styles.emptyState}>Loading reports...</td></tr>
                ) : reports.length === 0 ? (
                  <tr><td colSpan="7" className={styles.emptyState}>No reports found.</td></tr>
                ) : (
                  reports.map((report) => {
                    const statusStyle = getStatusStyle(report.status);
                    
                    // Logic for Edit button visibility
                    const canEdit = activeTab === 'my-reports' && (report.status === 'draft' || report.allow_edit);

                    return (
                      <tr key={report.id} className={styles.tableRow}>
                        <td><span className={styles.refNumber}>{report.reference_number}</span></td>
                        <td><div className={styles.reportTitle}>{report.title}</div></td>
                        <td><span className={styles.typeBadge}>{report.report_type.toUpperCase()}</span></td>
                        <td><span className={styles.projectName}>{report.project_details?.name || '—'}</span></td>
                        <td>
                          <span className={styles.statusBadge} style={{ color: statusStyle.color, backgroundColor: statusStyle.bg }}>
                            {report.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td><span className={styles.dateText}>{format(new Date(report.created_at), 'MMM d, yyyy, hh:mm a')}</span></td>
                        <td><span className={styles.dateText}>{format(new Date(report.reviewed_at), 'MMM d, yyyy, hh:mm a')}</span></td>
                        <td>
                          <div className={styles.rowActions}>
                            {/* Quick Allow Edit Button for Submitted to Me */}
                            {activeTab === 'submitted-to-me' && !report.allow_edit && report.status !== 'draft' && (
                              <button 
                                className={styles.quickActionBtn} 
                                onClick={() => handleQuickAllowEdit(report.id)}
                                title="Allow Creator to Edit"
                              >
                                <FiUnlock size={16} />
                              </button>
                            )}
                            
                            <ActionMenu
                              report={report}
                              canEdit={canEdit}
                              onView={() => navigate(`/admin/reports/${report.id}`)}
                              onEdit={() => navigate(`/admin/reports/${report.id}/edit`)}
                              onReview={() => openReviewModal(report)}
                              onDelete={() => { setReportToDelete(report); setDeleteModalOpen(true); }}
                              activeTab={activeTab}
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

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && createPortal(
        <div className={styles.modalOverlay}>
          <motion.div className={styles.modalContent} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <h3 className={styles.modalTitle}>Delete Report</h3>
            <p className={styles.modalText}>
              Are you sure you want to delete <strong>{reportToDelete?.title}</strong>? This action cannot be undone.
            </p>
            <div className={styles.modalActions}>
              <button type="button" className={styles.modalCancel} onClick={() => setDeleteModalOpen(false)} disabled={isDeleting}>Cancel</button>
              <button type="button" className={styles.modalConfirm} onClick={confirmDelete} disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Delete Report'}
              </button>
            </div>
          </motion.div>
        </div>,
        document.body
      )}

      {/* Review & Acknowledge Modal */}
      {reviewModalOpen && createPortal(
        <div className={styles.modalOverlay}>
          <motion.div className={styles.modalContent} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <h3 className={styles.modalTitle}>Acknowledge Receipt</h3>
            <p className={styles.modalText}>
              Acknowledge <strong>{reportToReview?.title}</strong> and provide your review notes.
            </p>
            
            <div className={styles.modalFormGroup}>
              <label className={styles.modalLabel}>Reviewer Notes</label>
              <textarea
                className={styles.modalTextarea}
                rows={4}
                placeholder="Add your feedback or notes here..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
              />
            </div>

            <div className={styles.modalCheckboxGroup}>
              <label className={styles.modalCheckboxLabel}>
                <input
                  type="checkbox"
                  checked={allowEdit}
                  onChange={(e) => setAllowEdit(e.target.checked)}
                />
                Allow the creator to edit this report
              </label>
            </div>

            <div className={styles.modalActions}>
              <button type="button" className={styles.modalCancel} onClick={() => setReviewModalOpen(false)} disabled={isReviewing}>
                Cancel
              </button>
              <button type="button" className={styles.modalConfirm} onClick={handleReviewSubmit} disabled={isReviewing}>
                {isReviewing ? 'Saving...' : 'Submit Review'}
              </button>
            </div>
          </motion.div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Reports;