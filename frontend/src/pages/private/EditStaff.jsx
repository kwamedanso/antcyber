// pages/staff/EditStaff.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { toast, Toaster } from 'sonner';
import {
  FiArrowLeft, FiUser, FiShield, FiPlus, FiTrash2, FiCheck, FiChevronDown, FiChevronRight, FiMail
} from 'react-icons/fi';
import TextInput from '../../components/ui/TextInput';
import SelectInput from '../../components/ui/SelectInput';
import DatePickerInput from '../../components/ui/DatePickerInput';
import Button from '../../components/ui/Button';
import { usePrivateQuery } from '../../hooks/usePrivateQuery';
import { usePrivateMutation } from '../../hooks/usePrivateMutation';
import styles from './styles/EditStaff.module.css';

// ----------------------------------------------------------------------------
// Validation & Constants
// ----------------------------------------------------------------------------
const staffSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  middle_name: z.string().optional(),
  title: z.string().optional(),
  rank: z.string().optional(),
  gender: z.string().optional(),
  date_of_birth: z.string().optional(),
  employment_date: z.string().optional(),
  employment_status: z.enum(['active', 'suspended', 'study_leave', 'retired', 'resigned', 'terminated']),
});

const CONTACT_TYPES = [
  { value: 'phone', label: 'Phone' },
  { value: 'postal_address', label: 'Postal Address' },
  { value: 'digital', label: 'Digital (e.g. LinkedIn)' },
];
const ID_TYPES = [
  { value: 'ghana_card', label: 'Ghana Card' },
  { value: 'ssnit', label: 'SSNIT' },
  { value: 'passport', label: 'Passport' },
  { value: 'drivers_license', label: 'Driver\'s License' },
];
const ADDRESS_TYPES = [
  { value: 'residential', label: 'Residential' },
  { value: 'postal', label: 'Postal' },
  { value: 'work', label: 'Work' },
];
const EDU_TYPES = [
  { value: 'certificate', label: 'Certificate' },
  { value: 'diploma', label: 'Diploma' },
  { value: 'degree', label: 'Degree' },
  { value: 'masters', label: 'Masters' },
  { value: 'phd', label: 'PhD' },
  { value: 'professional', label: 'Professional' },
];

const EditStaff = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('details');
  const [errors, setErrors] = useState({});
  const [isInitialized, setIsInitialized] = useState(false);
  
  const [formData, setFormData] = useState({
    first_name: '', middle_name: '', last_name: '',
    title: '', gender: '', date_of_birth: '', 
    employment_date: '', employment_status: 'active',
    contacts: [], identifications: [], addresses: [], education: [],
    role_ids: [], permission_ids: [],
  });

  useEffect(() => { document.title = 'Edit Staff | Ant Cyber Portal'; }, []);

  // --------------------------------------------------------------------------
  // Fetch Data
  // --------------------------------------------------------------------------
  const { data: staffResponse, isLoading: staffLoading, isError } = usePrivateQuery(
    ['staff', id], `/api/staff/${id}`, {}, { enabled: Boolean(id) }
  );
  const staff = staffResponse?.data || staffResponse;

  const { data: accessResponse, isLoading: accessLoading } = usePrivateQuery(
    ['user-access', staff?.user_id],
    `/api/rbac/users/${staff?.user_id}/access`,
    {},
    { enabled: Boolean(staff?.user_id) }
  );
  const userAccess = accessResponse?.data || accessResponse;

  // Fetch ALL available roles and permissions for the checkboxes
  const { data: rolesResponse } = usePrivateQuery(['roles'], '/api/rbac/roles', {}, { staleTime: Infinity });
  const roles = rolesResponse?.data || [];

  const { data: permsResponse, isLoading: permsLoading } = usePrivateQuery(['permissions'], '/api/rbac/permissions', {}, { staleTime: Infinity });
  const permissions = permsResponse?.data || [];

  // Group permissions by Module -> Resource
  const groupedPermissions = useMemo(() => {
    const groups = {};
    permissions.forEach(p => {
      const module = p.module || 'General';
      const res = p.resource || 'other';
      if (!groups[module]) groups[module] = {};
      if (!groups[module][res]) groups[module][res] = [];
      groups[module][res].push(p);
    });
    return groups;
  }, [permissions]);

  const [expandedModules, setExpandedModules] = useState({});

  // --------------------------------------------------------------------------
  // Initialize Form State
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (staff && userAccess && !isInitialized) {
      const otherContacts = staff.contacts?.filter(c => !(c.contact_type === 'email' && c.is_primary)) || [];

      setFormData({
        first_name: staff.first_name || '',
        middle_name: staff.middle_name || '',
        last_name: staff.last_name || '',
        title: staff.title || '',
        rank: staff.rank || '',
        gender: staff.gender || '',
        date_of_birth: staff.date_of_birth ? staff.date_of_birth.split('T')[0] : '',
        employment_date: staff.employment_date ? staff.employment_date.split('T')[0] : '',
        employment_status: staff.employment_status || 'active',
        contacts: otherContacts,
        identifications: staff.identifications || [],
        addresses: staff.addresses || [],
        education: staff.education || [],
        
        role_ids: userAccess.role_ids || [],
        permission_ids: userAccess.permission_ids || [], // Array of UUIDs
      });

      // Auto-expand modules that have selected permissions
      const modulesWithSelections = {};
      if (userAccess.permission_ids?.length > 0) {
        permissions.forEach(p => {
          if (userAccess.permission_ids.includes(p.id)) {
            modulesWithSelections[p.module || 'General'] = true;
          }
        });
      }
      setExpandedModules(modulesWithSelections);

      setIsInitialized(true);
    }
  }, [staff, userAccess, permissions, isInitialized]);

  // --------------------------------------------------------------------------
  // Mutations
  // --------------------------------------------------------------------------
  const { mutate: updateStaff, isPending: isUpdating } = usePrivateMutation({
    targetQueryKey: [['staff'], ['staff', id], ['user-access', staff?.user_id]],
    onSuccess: () => toast.success('Staff profile updated.', { duration: 3000 }),
    onError: (error) => toast.error(error?.response?.data?.message || 'Failed to update.', { duration: 4000 }),
  });

  const { mutate: toggleAccess, isPending: isTogglingAccess } = usePrivateMutation({
    targetQueryKey: [['staff'], ['staff', id]],
    onSuccess: () => toast.success('Portal access updated.', { duration: 3000 }),
    onError: (error) => toast.error(error?.response?.data?.message || 'Failed to toggle access.', { duration: 4000 }),
  });

  // --------------------------------------------------------------------------
  // Handlers
  // --------------------------------------------------------------------------
  const handleToggleAccess = () => {
    if (!staff?.user_id) return;
    toggleAccess({
      url: `/api/staff/portal-access/${staff.user_id}`,
      method: 'PATCH',
      data: { is_active: !staff.is_active }
    });
  };

  const addItem = (listName, defaultObj) => setFormData(prev => ({ ...prev, [listName]: [...prev[listName], { ...defaultObj }] }));
  const removeItem = (listName, index) => setFormData(prev => ({ ...prev, [listName]: prev[listName].filter((_, i) => i !== index) }));
  const updateItem = (listName, index, field, value) => {
    setFormData(prev => {
      const newList = [...prev[listName]];
      newList[index] = { ...newList[index], [field]: value };
      return { ...prev, [listName]: newList };
    });
  };

  // --- Permission Selection Logic ---
  const toggleModule = (moduleName) => {
    setExpandedModules(prev => ({ ...prev, [moduleName]: !prev[moduleName] }));
  };

  const handlePermissionToggle = (permId) => {
    setFormData(prev => {
      const isSel = prev.permission_ids.includes(permId);
      return {
        ...prev,
        permission_ids: isSel ? prev.permission_ids.filter(id => id !== permId) : [...prev.permission_ids, permId]
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = staffSchema.safeParse(formData);
    
    if (!result.success) {
      const formatted = {};
      result.error.issues.forEach((issue) => { formatted[issue.path[0]] = issue.message; });
      setErrors(formatted);
      setActiveTab('details');
      toast.error('Please fix the highlighted fields.');
      return;
    }

    setErrors({});
    updateStaff({
      url: `/api/staff/${id}`,
      method: 'PATCH',
      data: formData,
    });
  };

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  if (staffLoading || accessLoading || !isInitialized) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.pageContainer}>
          <div className={styles.stateCard}>
            <div className={styles.spinner} />
            <p className={styles.stateText}>Loading staff details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError || (!staffLoading && !staff)) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.pageContainer}>
          <button type="button" className={styles.backButton} onClick={() => navigate('/admin/staff')}>
            <FiArrowLeft size={14} /><span>Back to Staff</span>
          </button>
          <div className={styles.stateCard}>
            <h2 className={styles.stateTitle}>Staff Not Found</h2>
            <Button onClick={() => navigate('/admin/staff')}>Go to Staff List</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <Toaster position="top-right" richColors />

      <div className={styles.pageContainer}>
        <button type="button" className={styles.backButton} onClick={() => navigate(-1)}>
          <FiArrowLeft size={14} /><span>Back</span>
        </button>

        <motion.div className={styles.card} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          
          <header className={styles.header}>
            <div className={styles.headerMain}>
              <div className={styles.headerIcon}><FiUser size={24} /></div>
              <div>
                <h1 className={styles.title}>{staff.full_name}</h1>
                <p className={styles.subtitle}>Staff ID: {staff.staff_id}</p>
              </div>
            </div>
            
            <div className={styles.accessControl}>
              <span className={styles.accessLabel}>
                Portal Access: <strong>{staff.is_active ? 'Active' : 'Inactive'}</strong>
              </span>
              <label className={`${styles.toggleSwitch} ${isTogglingAccess ? styles.toggleDisabled : ''}`}>
                <input type="checkbox" checked={staff.is_active || false} onChange={handleToggleAccess} disabled={isTogglingAccess} />
                <span className={styles.slider}></span>
              </label>
            </div>
          </header>

          <div className={styles.tabsContainer}>
            <button className={`${styles.tab} ${activeTab === 'details' ? styles.tabActive : ''}`} onClick={() => setActiveTab('details')}>
              <FiUser size={16} /> Staff Details
            </button>
            <button className={`${styles.tab} ${activeTab === 'permissions' ? styles.tabActive : ''}`} onClick={() => setActiveTab('permissions')}>
              <FiShield size={16} /> Roles & Permissions
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {activeTab === 'details' && (
              <motion.div className={styles.tabContent} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {/* ... (Keep all your existing details inputs exactly as they are) ... */}
                <h3 className={styles.sectionTitle}>Basic Information</h3>
                <div className={styles.row}>
                  <div className={styles.inputGroup}><TextInput label="First Name *" value={formData.first_name} onChange={e => setFormData(p => ({...p, first_name: e.target.value}))} error={errors.first_name} /></div>
                  <div className={styles.inputGroup}><TextInput label="Middle Name" value={formData.middle_name} onChange={e => setFormData(p => ({...p, middle_name: e.target.value}))} /></div>
                  <div className={styles.inputGroup}><TextInput label="Last Name *" value={formData.last_name} onChange={e => setFormData(p => ({...p, last_name: e.target.value}))} error={errors.last_name} /></div>
                </div>
                <div className={styles.row}>
                  <div className={styles.inputGroup}><TextInput label="Title" value={formData.title} onChange={e => setFormData(p => ({...p, title: e.target.value}))} /></div>
                  <div className={styles.inputGroup}><SelectInput label="Gender" options={[{value:'male', label:'Male'}, {value:'female', label:'Female'}]} value={formData.gender} onChange={e => setFormData(p => ({...p, gender: e.target.value}))} /></div>
                  <div className={styles.inputGroup}><DatePickerInput label="Date of Birth" value={formData.date_of_birth} onChange={v => setFormData(p => ({...p, date_of_birth: v}))} /></div>
                </div>
                <h3 className={styles.sectionTitle}>Employment Details</h3>
                <div className={styles.row}>
                  <div className={styles.inputGroup}><TextInput label="Rank *" value={formData.rank} onChange={e => setFormData(p => ({...p, rank: e.target.value}))} error={errors.rank} /></div>
                  <div className={styles.inputGroup}><DatePickerInput label="Employment Date" value={formData.employment_date} onChange={v => setFormData(p => ({...p, employment_date: v}))} /></div>
                  <div className={styles.inputGroup}><SelectInput label="Employment Status" options={['active','suspended','study_leave','retired','resigned','terminated'].map(s => ({value:s, label:s}))} value={formData.employment_status} onChange={e => setFormData(p => ({...p, employment_status: e.target.value}))} /></div>
                </div>
                <div className={styles.dynamicSectionHeader}>
                  <h3 className={styles.sectionTitle}>Contacts</h3>
                  <button type="button" className={styles.addBtn} onClick={() => addItem('contacts', { contact_type: 'phone', value: '' })}><FiPlus /> Add Contact</button>
                </div>
                <div className={styles.readOnlyGroup}>
                  <span className={styles.readOnlyLabel}>Primary Email (Login)</span>
                  <div className={styles.readOnlyValue}><FiMail size={16} /><span>{staff.email}</span></div>
                </div>
                {formData.contacts.map((c, i) => (
                  <div key={i} className={styles.dynamicRow}>
                    <select className={styles.inlineSelect} value={c.contact_type} onChange={e => updateItem('contacts', i, 'contact_type', e.target.value)}>
                      {CONTACT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                    <input className={styles.inlineInput} placeholder="Value" value={c.value} onChange={e => updateItem('contacts', i, 'value', e.target.value)} />
                    <button type="button" className={styles.removeBtn} onClick={() => removeItem('contacts', i)}><FiTrash2 /></button>
                  </div>
                ))}
                <div className={styles.dynamicSectionHeader}>
                  <h3 className={styles.sectionTitle}>Identifications</h3>
                  <button type="button" className={styles.addBtn} onClick={() => addItem('identifications', { id_type: 'ghana_card', id_number: '' })}><FiPlus /> Add ID</button>
                </div>
                {formData.identifications.map((idn, i) => (
                  <div key={i} className={styles.dynamicRow}>
                    <select className={styles.inlineSelect} value={idn.id_type} onChange={e => updateItem('identifications', i, 'id_type', e.target.value)}>
                      {ID_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                    <input className={styles.inlineInput} placeholder="ID Number" value={idn.id_number} onChange={e => updateItem('identifications', i, 'id_number', e.target.value)} />
                    <button type="button" className={styles.removeBtn} onClick={() => removeItem('identifications', i)}><FiTrash2 /></button>
                  </div>
                ))}
                <div className={styles.dynamicSectionHeader}>
                  <h3 className={styles.sectionTitle}>Addresses</h3>
                  <button type="button" className={styles.addBtn} onClick={() => addItem('addresses', { address_type: 'residential', address: '', city: '', region: '', country: '', postal_code: '' })}><FiPlus /> Add Address</button>
                </div>
                {formData.addresses.map((addr, i) => (
                  <div key={i} className={styles.dynamicGrid}>
                    <select className={styles.inlineSelect} value={addr.address_type} onChange={e => updateItem('addresses', i, 'address_type', e.target.value)}>
                      {ADDRESS_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                    <input className={styles.inlineInput} placeholder="Address Line" value={addr.address} onChange={e => updateItem('addresses', i, 'address', e.target.value)} />
                    <input className={styles.inlineInput} placeholder="City" value={addr.city} onChange={e => updateItem('addresses', i, 'city', e.target.value)} />
                    <input className={styles.inlineInput} placeholder="Region" value={addr.region} onChange={e => updateItem('addresses', i, 'region', e.target.value)} />
                    <button type="button" className={styles.removeBtn} onClick={() => removeItem('addresses', i)}><FiTrash2 /></button>
                  </div>
                ))}
                <div className={styles.dynamicSectionHeader}>
                  <h3 className={styles.sectionTitle}>Education</h3>
                  <button type="button" className={styles.addBtn} onClick={() => addItem('education', { qualification_type: 'degree', qualification_name: '', institution_name: '' })}><FiPlus /> Add Education</button>
                </div>
                {formData.education.map((edu, i) => (
                  <div key={i} className={styles.dynamicGrid}>
                    <select className={styles.inlineSelect} value={edu.qualification_type} onChange={e => updateItem('education', i, 'qualification_type', e.target.value)}>
                      {EDU_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                    <input className={styles.inlineInput} placeholder="Qualification Name" value={edu.qualification_name} onChange={e => updateItem('education', i, 'qualification_name', e.target.value)} />
                    <input className={styles.inlineInput} placeholder="Institution" value={edu.institution_name} onChange={e => updateItem('education', i, 'institution_name', e.target.value)} />
                    <button type="button" className={styles.removeBtn} onClick={() => removeItem('education', i)}><FiTrash2 /></button>
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === 'permissions' && (
              <motion.div className={styles.tabContent} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                
                <h3 className={styles.sectionTitle}>Assigned Roles</h3>
                <div className={styles.rolesGrid}>
                  {roles.map(role => (
                    <label key={role.id} className={`${styles.roleCard} ${formData.role_ids.includes(role.id) ? styles.roleCardActive : ''}`}>
                      <input type="checkbox" checked={formData.role_ids.includes(role.id)} onChange={(e) => {
                        if (e.target.checked) setFormData(p => ({ ...p, role_ids: [...p.role_ids, role.id] }));
                        else setFormData(p => ({ ...p, role_ids: p.role_ids.filter(id => id !== role.id) }));
                      }} className={styles.hiddenCheckbox} />
                      <div className={styles.checkboxIndicator}>{formData.role_ids.includes(role.id) && <FiCheck size={12} />}</div>
                      <span>{role.display_name}</span>
                    </label>
                  ))}
                </div>

                <div className={styles.divider} />

                <h3 className={styles.sectionTitle}>Direct Permissions</h3>
                {permsLoading ? (
                  <div className={styles.loading}>Loading permissions...</div>
                ) : (
                  <div className={styles.accordion}>
                    {Object.entries(groupedPermissions).map(([moduleName, resources]) => {
                      const isExpanded = expandedModules[moduleName];
                      const moduleIds = Object.values(resources).flat().map(p => p.id);
                      const allModuleSelected = moduleIds.length > 0 && moduleIds.every(id => formData.permission_ids.includes(id));

                      return (
                        <div key={moduleName} className={styles.accordionItem}>
                          <div className={styles.accordionHeader}>
                            <button type="button" className={styles.expandBtn} onClick={() => toggleModule(moduleName)}>
                              {isExpanded ? <FiChevronDown size={18} /> : <FiChevronRight size={18} />}
                              <span className={styles.moduleName}>{moduleName}</span>
                            </button>
                            <label className={styles.selectAllLabel}>
                              <input type="checkbox" checked={allModuleSelected} onChange={() => handleModuleToggleAll(resources)} />
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
                                      <button type="button" className={styles.selectGroupBtn} onClick={() => handleGroupToggle(perms)}>
                                        {allResourceSelected ? 'Unselect Group' : 'Select Group'}
                                      </button>
                                    </div>
                                    <div className={styles.permissionsGrid}>
                                      {perms.map(perm => {
                                        const isSelected = formData.permission_ids.includes(perm.id);
                                        return (
                                          <label key={perm.id} className={`${styles.permCard} ${isSelected ? styles.permCardActive : ''}`}>
                                            <input type="checkbox" checked={isSelected} onChange={() => handlePermissionToggle(perm.id)} className={styles.hiddenCheckbox} />
                                            <div className={styles.checkboxIndicator}>{isSelected && <FiCheck size={12} />}</div>
                                            <span>{perm.display_name}</span>
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

              </motion.div>
            )}

            <div className={styles.actions}>
              <button type="button" className={styles.secondaryButton} onClick={() => navigate(-1)}>Cancel</button>
              <Button type="submit" isLoading={isUpdating}>Save Changes</Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default EditStaff;