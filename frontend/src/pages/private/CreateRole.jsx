// pages/rbac/CreateRole.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { toast, Toaster } from 'sonner';
import { FiArrowLeft, FiCheck, FiChevronDown, FiChevronRight, FiShield } from 'react-icons/fi';
import TextInput from '../../components/ui/TextInput';
import TextAreaInput from '../../components/ui/TextAreaInput';
import Button from '../../components/ui/Button';
import { usePrivateQuery } from '../../hooks/usePrivateQuery';
import { usePrivateMutation } from '../../hooks/usePrivateMutation';
import styles from './styles/CreateRole.module.css';

// ----------------------------------------------------------------------------
// Validation
// ----------------------------------------------------------------------------
const roleSchema = z.object({
  display_name: z.string().trim().min(3, 'Role name must be at least 3 characters'),
  description: z.string().optional(),
  permission_ids: z.array(z.string()).optional(),
});

const CreateRole = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    display_name: '',
    description: '',
    permission_ids: [],
  });
  const [errors, setErrors] = useState({});
  const [expandedModules, setExpandedModules] = useState({});

  useEffect(() => {
    document.title = 'Create Role | Ant Cyber Portal';
  }, []);

  // --------------------------------------------------------------------------
  // Fetch Permissions
  // --------------------------------------------------------------------------
  const { data: permissionsResponse, isLoading: permissionsLoading } = usePrivateQuery(
    ['permissions'],
    '/api/rbac/permissions',
    {},
    { staleTime: Infinity } // Permissions rarely change
  );

  const permissions = permissionsResponse?.data || [];

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
    setExpandedModules(prev => ({
      ...prev,
      [moduleName]: !prev[moduleName]
    }));
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
        // Unselect all in group
        return { ...prev, permission_ids: prev.permission_ids.filter(id => !groupIds.includes(id)) };
      } else {
        // Select all in group
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
  // Submit Mutation
  // --------------------------------------------------------------------------
  const { mutate: createRole, isPending } = usePrivateMutation({
    targetQueryKey: ['roles'],
    onSuccess: () => {
      toast.success('Role created successfully.', { duration: 3500 });
      navigate('/admin/roles');
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || 'Could not create role.',
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

    createRole({
      url: '/api/rbac/roles',
      method: 'POST',
      data: {
        display_name: result.data.display_name,
        description: result.data.description,
        permission_ids: result.data.permission_ids,
      },
    });
  };

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
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
            <div>
              <h1 className={styles.title}>Create Role</h1>
              <p className={styles.subtitle}>
                Define a new role and assign the specific permissions it should have.
              </p>
            </div>
          </header>

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            
            {/* Basic Info */}
            <div className={styles.inputGroup}>
              <TextInput
                id="display_name"
                name="display_name"
                label="Role Name"
                placeholder="e.g. HR Manager"
                value={formData.display_name}
                onChange={(e) => setFormData(p => ({ ...p, display_name: e.target.value }))}
                style={{ fontSize: '15px', borderColor: errors.display_name ? '#e11d48' : '#d3d3d3' }}
              />
              {errors.display_name && <span className={styles.errorText}>{errors.display_name}</span>}
            </div>

            <div className={styles.inputGroup}>
              <TextAreaInput
                id="description"
                name="description"
                label="Description (Optional)"
                rows={2}
                placeholder="Briefly describe what this role is for..."
                value={formData.description}
                onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
              />
            </div>

            <div className={styles.divider} />

            {/* Permissions Section */}
            <div className={styles.permissionsHeader}>
              <h2>Assign Permissions</h2>
              <span className={styles.selectedCount}>
                {formData.permission_ids.length} selected
              </span>
            </div>

            {permissionsLoading ? (
              <div className={styles.loadingPermissions}>Loading permissions...</div>
            ) : Object.keys(groupedPermissions).length === 0 ? (
              <div className={styles.loadingPermissions}>No permissions found in the system.</div>
            ) : (
              <div className={styles.accordion}>
                {Object.entries(groupedPermissions).map(([moduleName, resources]) => {
                  const isExpanded = expandedModules[moduleName];
                  const moduleIds = Object.values(resources).flat().map(p => p.id);
                  const allModuleSelected = moduleIds.length > 0 && moduleIds.every(id => formData.permission_ids.includes(id));

                  return (
                    <div key={moduleName} className={styles.accordionItem}>
                      {/* Module Header */}
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

                      {/* Module Body */}
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
            )}

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
                Create Role
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateRole;