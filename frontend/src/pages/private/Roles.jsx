// pages/rbac/Roles.jsx
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
  FiTrash2,
  FiShield,
} from 'react-icons/fi';
import { createPortal } from 'react-dom';
import Button from '../../components/ui/Button';
import { usePrivateQuery } from '../../hooks/usePrivateQuery';
import { usePrivateMutation } from '../../hooks/usePrivateMutation';
import styles from './styles/Roles.module.css';

// ----------------------------------------------------------------------------
// Action Menu Component
// ----------------------------------------------------------------------------
const ActionMenu = ({ role, onEdit, onDelete }) => {
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
      <button ref={buttonRef} className={styles.actionBtn} onClick={toggleMenu}>
        <FiMoreVertical size={18} />
      </button>

      {isOpen && createPortal(
        <div
          className={styles.actionDropdown}
          ref={menuRef}
          style={{ top: menuPosition.top, left: menuPosition.left, position: 'fixed' }}
        >
          <button className={styles.dropdownItem} onClick={() => { setIsOpen(false); onEdit(); }}>
            <FiEdit2 size={14} /> <span>Edit Role</span>
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

// ----------------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------------
const Roles = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);

  useEffect(() => {
    document.title = 'Roles | Ant Cyber Portal';
  }, []);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(handler);
  }, [search]);

  // --- Query ---
  const { data: response, isLoading, isFetching, refetch } = usePrivateQuery(
    ['roles', { search: debouncedSearch }],
    '/api/rbac/roles',
    { search: debouncedSearch || undefined },
    { keepPreviousData: true, staleTime: 30_000 }
  );

  // Handle both envelope { data: [...] } and direct array [...]
  const roles = response?.data || response || [];

  // Filter locally if backend doesn't support search (optional fallback)
  const filteredRoles = debouncedSearch 
    ? roles.filter(r => 
        r.display_name.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
        r.name.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    : roles;

  // --- Mutations ---
  const { mutate: deleteRole, isPending: isDeleting } = usePrivateMutation({
    targetQueryKey: ['roles'],
    onSuccess: () => {
      toast.success('Role deleted successfully.', { duration: 3000 });
      setDeleteModalOpen(false);
      setRoleToDelete(null);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to delete role.', { duration: 4000 });
    },
  });

  const confirmDelete = () => {
    if (!roleToDelete) return;
    deleteRole({
      url: `/api/rbac/roles/${roleToDelete.id}`,
      method: 'DELETE',
    });
  };

  return (
    <div className={styles.pageWrapper}>
      <Toaster position="top-right" richColors />

      <div className={styles.pageContainer}>
        {/* Header */}
        <header className={styles.pageHeader}>
          <div>
            <h1 className={styles.title}>Roles & Permissions</h1>
            <p className={styles.subtitle}>Manage system roles and their access levels.</p>
          </div>
          <Button onClick={() => navigate('/admin/roles/create')}>
            <FiPlus size={16} style={{ marginRight: '6px' }} />
            Create Role
          </Button>
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
                placeholder="Search roles..."
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
                  <th>Role Name</th>
                  <th>System Slug</th>
                  <th>Status</th>
                  <th>Permissions</th>
                  <th>Created</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className={styles.emptyState}>Loading roles...</td>
                  </tr>
                ) : filteredRoles.length === 0 ? (
                  <tr>
                    <td colSpan="6" className={styles.emptyState}>
                      No roles found.
                    </td>
                  </tr>
                ) : (
                  filteredRoles.map((role) => (
                    <tr key={role.id} className={styles.tableRow}>
                      <td>
                        <div className={styles.roleNameCell}>
                          <div className={styles.roleIcon}>
                            <FiShield size={16} />
                          </div>
                          <span className={styles.roleName}>{role.display_name}</span>
                        </div>
                      </td>
                      <td>
                        <span className={styles.slugText}>{role.name}</span>
                      </td>
                      <td>
                        <span className={`${styles.statusBadge} ${role.is_active ? styles.statusActive : styles.statusInactive}`}>
                          {role.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <span className={styles.permCount}>
                          {role.permission_count} permissions
                        </span>
                      </td>
                      <td>
                        <span className={styles.dateText}>
                          {role.created_at ? format(new Date(role.created_at), 'MMM d, yyyy') : 'N/A'}
                        </span>
                      </td>
                      <td>
                        <div className={styles.rowActions}>
                          <ActionMenu
                            role={role}
                            onEdit={() => navigate(`/admin/roles/${role.id}/edit`)}
                            onDelete={() => {
                              setRoleToDelete(role);
                              setDeleteModalOpen(true);
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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
          >
            <h3 className={styles.modalTitle}>Delete Role</h3>
            <p className={styles.modalText}>
              Are you sure you want to delete the <strong>{roleToDelete?.display_name}</strong> role? 
              Users assigned to this role will lose its permissions. This action cannot be undone.
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
                {isDeleting ? 'Deleting...' : 'Delete Role'}
              </button>
            </div>
          </motion.div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Roles;