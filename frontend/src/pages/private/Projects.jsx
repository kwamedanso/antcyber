// pages/projects/Projects.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast, Toaster } from 'sonner';
import { format } from 'date-fns';
import {
  FiPlus,
  FiSearch,
  FiRefreshCw,
  FiMoreVertical,
  FiEdit2,
  FiEye,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
import { createPortal } from 'react-dom';
import Button from '../../components/ui/Button';
import { usePrivateQuery } from '../../hooks/usePrivateQuery';
import { usePrivateMutation } from '../../hooks/usePrivateMutation';
import Can from '../../utils/Can';
import styles from './styles/Projects.module.css';

// ----------------------------------------------------------------------------
// Action Menu Component
// ----------------------------------------------------------------------------
const ActionMenu = ({ project, onView, onEdit, onDelete }) => {
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
        left: rect.right - 160, // Align right edge
      });
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        !buttonRef.current.contains(e.target)
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
      <button
        ref={buttonRef}
        className={styles.actionBtn}
        onClick={toggleMenu}
      >
        <FiMoreVertical size={18} />
      </button>

      {isOpen &&
        createPortal(
          <div
            className={styles.actionDropdown}
            ref={menuRef}
            style={{
              top: menuPosition.top,
              left: menuPosition.left,
              position: 'fixed',
            }}
          >
            <button
              className={styles.dropdownItem}
              onClick={() => {
                setIsOpen(false);
                onView();
              }}
            >
              <FiEye size={14} />
              <span>View Project</span>
            </button>
            <button
              className={styles.dropdownItem}
              onClick={() => {
                setIsOpen(false);
                onEdit();
              }}
            >
              <FiEdit2 size={14} />
              <span>Edit Project</span>
            </button>
            <div className={styles.dropdownDivider} />
            <button
              className={`${styles.dropdownItem} ${styles.dropdownDelete}`}
              onClick={() => {
                setIsOpen(false);
                onDelete();
              }}
            >
              <FiTrash2 size={14} />
              <span>Delete</span>
            </button>
          </div>,
          document.body
        )}
    </>
  );
};

// ----------------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------------
const Projects = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  useEffect(() => {
    document.title = 'Projects | Ant Cyber Portal';
  }, []);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(handler);
  }, [search]);

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, limit]);

  // --- Query ---
  const queryParams = {
    page,
    limit,
    search: debouncedSearch || undefined,
  };

  const { data: response, isLoading, isFetching, refetch } = usePrivateQuery(
    ['projects', queryParams],
    '/api/projects',
    queryParams,
    { keepPreviousData: true, staleTime: 30_000 }
  );

  const projects = response?.data?.results || [];
  const pagination = response?.data?.pagination || { page: 1, total_pages: 1, total: 0 };

  // --- Mutations ---
  const { mutate: deleteProject, isPending: isDeleting } = usePrivateMutation({
    targetQueryKey: ['projects'],
    onSuccess: () => {
      toast.success('Project deleted successfully.', { duration: 3000 });
      setDeleteModalOpen(false);
      setProjectToDelete(null);
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || 'Failed to delete project.',
        { duration: 4000 }
      );
    },
  });

  const handleDeleteClick = (project) => {
    setProjectToDelete(project);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (!projectToDelete) return;
    deleteProject({
      url: `/api/projects/${projectToDelete.id}`,
      method: 'DELETE',
    });
  };

  // --- Helper to format members ---
  const renderMembers = (members) => {
    if (!members || members.length === 0) {
      return <span className={styles.emptyText}>No members</span>;
    }
    return (
      <span className={styles.memberCount}>
        {members.length} {members.length === 1 ? 'member' : 'members'}
      </span>
    );
  };

  return (
    <div className={styles.pageWrapper}>
      <Toaster position="top-right" richColors />

      <div className={styles.pageContainer}>
        {/* Header */}
        <header className={styles.pageHeader}>
          <div>
            <h1 className={styles.title}>Projects</h1>
            <p className={styles.subtitle}>Manage and organize your team's projects.</p>
          </div>
          <Can resource="projects" action="create">
            <Button onClick={() => navigate('/admin/projects/create')}>
              <FiPlus size={16} style={{ marginRight: '6px' }} />
              Add Project
            </Button>
          </Can>
        </header>

        {/* Card Container */}
        <motion.div
          className={styles.card}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Toolbar */}
          <div className={styles.toolbar}>
            <div className={styles.searchBox}>
              <FiSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search projects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            <div className={styles.toolbarActions}>
              <button
                className={styles.iconBtn}
                onClick={() => refetch()}
                disabled={isFetching}
              >
                <FiRefreshCw size={16} className={isFetching ? styles.spin : ''} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Project Name</th>
                  <th>Description</th>
                  <th>Team</th>
                  <th>Created</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="5" className={styles.emptyState}>Loading projects...</td>
                  </tr>
                ) : projects.length === 0 ? (
                  <tr>
                    <td colSpan="5" className={styles.emptyState}>
                      No projects found.
                    </td>
                  </tr>
                ) : (
                  projects.map((project) => (
                    <tr key={project.id} className={styles.tableRow}>
                      <td>
                        <div className={styles.projectName}>{project.name}</div>
                      </td>
                      <td>
                        <div className={styles.projectDesc}>
                          {project.description || <span className={styles.emptyText}>No description</span>}
                        </div>
                      </td>
                      <td>{renderMembers(project.members)}</td>
                      <td>
                        <span className={styles.dateText}>
                          {format(new Date(project.created_at), 'MMM d, yyyy')}
                        </span>
                      </td>
                      <td>
                        <div className={styles.rowActions}>
                          <ActionMenu
                            project={project}
                            onView={() => navigate(`/admin/projects/${project.id}`)}
                            onEdit={() => navigate(`/admin/projects/${project.id}/edit`)}
                            onDelete={() => handleDeleteClick(project)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
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
                <select
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  className={styles.pageSelect}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div className={styles.pageNav}>
                <button
                  className={styles.pageBtn}
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  <FiChevronLeft size={16} />
                </button>

                {Array.from({ length: Math.min(5, pagination.total_pages || 1) }, (_, i) => {
                  let pageNum = i + 1;
                  if (pagination.total_pages > 5 && page > 3) {
                    pageNum = page - 2 + i;
                  }
                  if (pageNum > pagination.total_pages) return null;

                  return (
                    <button
                      key={pageNum}
                      className={`${styles.pageNum} ${page === pageNum ? styles.pageNumActive : ''}`}
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  className={styles.pageBtn}
                  disabled={page >= pagination.total_pages}
                  onClick={() => setPage(p => Math.min(pagination.total_pages, p + 1))}
                >
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
          <motion.div
            className={styles.modalContent}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <h3 className={styles.modalTitle}>Delete Project</h3>
            <p className={styles.modalText}>
              Are you sure you want to delete <strong>{projectToDelete?.name}</strong>? 
              This action cannot be undone and will permanently remove the project and its associated data.
            </p>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalCancel}
                onClick={() => setDeleteModalOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.modalConfirm}
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Project'}
              </button>
            </div>
          </motion.div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Projects;