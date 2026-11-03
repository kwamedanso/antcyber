// pages/rbac/EditRole.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { toast, Toaster } from 'sonner';
import { FiArrowLeft, FiCheck, FiChevronDown, FiChevronRight, FiShield } from 'react-icons/fi';
import TextInput from '../../components/ui/TextInput';
import TextAreaInput from '../../components/ui/TextAreaInput';
import Button from '../../components/ui/Button';
import { usePrivateQuery } from '../../hooks/usePrivateQuery';
import { usePrivateMutation } from '../../hooks/usePrivateMutation';
import styles from './styles/EditRole.module.css';

// ----------------------------------------------------------------------------
// Validation
// ----------------------------------------------------------------------------
const roleSchema = z.object({
  display_name: z.string().trim().min(3, 'Role name must be at least 3 characters'),
  description: z.string().optional(),
  is_active: z.boolean(),
  permission_ids: z.array(z.string()).optional(),
});

const EditRole = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    display_name: '',
    description: '', // Roles table doesn't have description, we will mock it or ignore
    is_active: true,
    permission_ids: [],
  });
  const [errors, setErrors] = useState({});
  const [expandedModules, setExpandedModules] = useState({});
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    document.title = 'Edit Role | Ant Cyber Portal';
  }, []);

  // --------------------------------------------------------------------------
  // Fetch Role
  // --------------------------------------------------------------------------
  const { data: roleResponse, isLoading: roleLoading, isError: roleError } = usePrivateQuery(
    ['roles', id],
    `/api/rbac/roles/${id}`,
    {},
    { enabled: Boolean(id) }
  );

  const role = roleResponse?.data || roleResponse;

  // --------------------------------------------------------------------------
  // Fetch Permissions
  // --------------------------------------------------------------------------
  const { data: permissionsResponse, isLoading: permissionsLoading } = usePrivateQuery(
    ['permissions'],
    '/api/rbac/permissions',
    {},
    { staleTime: Infinity }
  );

  const permissions = permissionsResponse?.data || [];

  // Populate form once data loads
  useEffect(() => {
    if (role && !isInitialized) {
      setFormData({
        display_name: role.display_name || '',
        description: '', // Add description to roles table if needed
        is_active: role.is_active ?? true,
        permission_ids: (role.permissions || []).map(p => p.id),
      });
      
      // Auto-expand modules that have selected permissions
      const modulesWithSelections = {};
      if (role.permissions && role.permissions.length > 0) {
        role.permissions.forEach(p => {
          const moduleName = p.module || 'General';
          modulesWithSelections[moduleName] = true;
        });
      }
      setExpandedModules(modulesWithSelections);

      setIsInitialized(true);
    }
  }, [role, isInitialized]);

  // Group permissions by Module -> Resource
  const groupedPermissions = useMemo(() => {
    const groups = {};
    permissions.forEach(p => {
      const moduleName = p.module || 'General';
      const resourceName = p.resource || 'other';
      if (!groups[moduleName]) groups[moduleName] = {};
      if (!groups[moduleName][resourceName]) groups[moduleName][resourceName] = [];
      groups[moduleName][resourceName].push(p);
    });
    return groups;
  }, [permissions]);

  // --------------------------------------------------------------------------
  // Handlers
  // --------------------------------------------------------------------------
  const toggleModule = (moduleName) => {
    setExpandedModules(prev => ({ ...prev, [moduleName]: !prev[moduleName] }));
  };

  const handlePermissionToggle = (permissionId) => {
    setFormData(prev => {
      const isSelected = prev.permission_ids.includes(permissionId);
      return {
        ...prev,
        permission_ids: isSelected 
          ? prev.permission_ids.filter(id => id !== permissionId)
          : [...prev.permission_ids, permissionId]
      };
    });
  };

  const handleGroupToggle = (groupPermissions) => {
    const groupIds = groupPermissions.map(p => p.id);
    const allSelected = groupIds.every(id => formData.permission_ids.includes(id));

    setFormData(prev => {
      if (allSelected) {
        return { ...prev, permission_ids: prev.permission_ids.filter(id => !groupIds.includes(id)) };
      } else {
        const newIds = new Set([...prev.permission_ids, ...groupIds]);
        return { ...prev, permission_ids: Array.from(newIds) };
      }
    });
  };

  const handleModuleToggleAll = (moduleData) => {
    const allIdsInModule = Object.values(moduleData).flat().map(p => p.id);
    const allSelected = allIdsInModule.every(id => formData.permission_ids.includes(id));

    setFormData(prev => {
      if (allSelected) {
        return { ...prev, permission_ids: prev.permission_ids.filter(id => !allIdsInModule.includes(id)) };
      } else {
        const newIds = new Set([...prev.permission_ids, ...allIdsInModule]);
        return { ...prev, permission_ids: Array.from(newIds) };
      }
    });
  };

  // --------------------------------------------------------------------------
  // Update Mutation
  // --------------------------------------------------------------------------
  const { mutate: updateRole, isPending } = usePrivateMutation({
    targetQueryKey: ['roles'],
    onSuccess: () => {
      toast.success('Role updated successfully.', { duration: 3500 });
      navigate('/admin/roles');
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || 'Could not update role.',
        { duration: 4000 }
      );
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const result = roleSchema.safeParse(formData);

    if (!result.success) {
      const formatted = {};
      result.error.issues.forEach((issue) => {
        formatted[issue.path[0]] = issue.message;
      });
      setErrors(formatted);
      toast.error('Please fix the highlighted fields.');
      return;
    }

    setErrors({});

    updateRole({
      url: `/api/rbac/roles/${id}`,
      method: 'PATCH',
      data: {
        display_name: result.data.display_name,
        is_active: result.data.is_active,
        permission_ids: result.data.permission_ids,
      },
    });
  };

  // --------------------------------------------------------------------------
  // Loading / Error States
  // --------------------------------------------------------------------------
  if (roleLoading || permissionsLoading || !isInitialized) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.pageContainer}>
          <div className={styles.stateCard}>
            <div className={styles.spinner} />
            <p className={styles.stateText}>Loading role details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (roleError || (!roleLoading && !role)) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.pageContainer}>
          <button type="button" className={styles.backButton} onClick={() => navigate('/admin/roles')}>
            <FiArrowLeft size={14} /><span>Back to Roles</span>
          </button>
          <div className={styles.stateCard}>
            <h2 className={styles.stateTitle}>Role not found</h2>
            <p className={styles.stateText}>The role you're trying to edit doesn't exist.</p>
            <Button onClick={() => navigate('/admin/roles')}>Go to Roles</Button>
          </div>
        </div>
      </div>
    );
  }

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
          <header className={styles.header}>
            <div className={styles.headerIcon}>
              <FiShield size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <h1 className={styles.title}>Edit Role: {role.display_name}</h1>
              <p className={styles.subtitle}>
                Update the role details and manage its assigned permissions.
              </p>
            </div>
            
            {/* Active Toggle */}
            <label className={styles.toggleSwitch}>
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData(p => ({ ...p, is_active: e.target.checked }))}
              />
              <span className={styles.slider}></span>
              <span className={styles.toggleLabel}>
                {formData.is_active ? 'Active' : 'Inactive'}
              </span>
            </label>
          </header>

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            
            <div className={styles.inputGroup}>
              <TextInput
                id="display_name"
                name="display_name"
                label="Role Name"
                value={formData.display_name}
                onChange={(e) => setFormData(p => ({ ...p, display_name: e.target.value }))}
                style={{ fontSize: '15px', borderColor: errors.display_name ? '#e11d48' : '#d3d3d3' }}
              />
              {errors.display_name && <span className={styles.errorText}>{errors.display_name}</span>}
            </div>

            <div className={styles.divider} />

            {/* Permissions Section */}
            <div className={styles.permissionsHeader}>
              <h2>Assigned Permissions</h2>
              <span className={styles.selectedCount}>
                {formData.permission_ids.length} selected
              </span>
            </div>

            <div className={styles.accordion}>
              {Object.entries(groupedPermissions).map(([moduleName, resources]) => {
                const isExpanded = expandedModules[moduleName];
                const moduleIds = Object.values(resources).flat().map(p => p.id);
                const allModuleSelected = moduleIds.length > 0 && moduleIds.every(id => formData.permission_ids.includes(id));

                return (
                  <div key={moduleName} className={styles.accordionItem}>
                    <div className={styles.accordionHeader}>
                      <button
                        type="button"
                        className={styles.expandBtn}
                        onClick={() => toggleModule(moduleName)}
                      >
                        {isExpanded ? <FiChevronDown size={18} /> : <FiChevronRight size={18} />}
                        <span className={styles.moduleName}>{moduleName}</span>
                      </button>

                      <label className={styles.selectAllLabel}>
                        <input
                          type="checkbox"
                          checked={allModuleSelected}
                          onChange={() => handleModuleToggleAll(resources)}
                        />
                        Select All
                      </label>
                    </div>

                    {isExpanded && (
                      <div className={styles.accordionBody}>
                        {Object.entries(resources).map(([resourceName, perms]) => {
                          const resourceIds = perms.map(p => p.id);
                          const allResourceSelected = resourceIds.every(id => formData.permission_ids.includes(id));

                          return (
                            <div key={resourceName} className={styles.resourceGroup}>
                              <div className={styles.resourceHeader}>
                                <span className={styles.resourceName}>{resourceName}</span>
                                <button
                                  type="button"
                                  className={styles.selectGroupBtn}
                                  onClick={() => handleGroupToggle(perms)}
                                >
                                  {allResourceSelected ? 'Unselect Group' : 'Select Group'}
                                </button>
                              </div>

                              <div className={styles.permissionsGrid}>
                                {perms.map(perm => {
                                  const isSelected = formData.permission_ids.includes(perm.id);
                                  return (
                                    <label 
                                      key={perm.id} 
                                      className={`${styles.permissionCard} ${isSelected ? styles.permissionCardActive : ''}`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => handlePermissionToggle(perm.id)}
                                        className={styles.hiddenCheckbox}
                                      />
                                      <div className={styles.checkboxIndicator}>
                                        {isSelected && <FiCheck size={12} />}
                                      </div>
                                      <div className={styles.permText}>
                                        <span className={styles.permTitle}>{perm.display_name}</span>
                                        <span className={styles.permAction}>{perm.action}</span>
                                      </div>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => navigate(-1)}
                disabled={isPending}
              >
                Cancel
              </button>
              <Button type="submit" isLoading={isPending}>
                Save Changes
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default EditRole;