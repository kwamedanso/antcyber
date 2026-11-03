// pages/staff/CreateStaff.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { z } from 'zod';
import { toast, Toaster } from 'sonner';
import {
  FiArrowLeft, FiUser, FiBriefcase, FiPlus, FiTrash2, FiShield, FiCheck, FiChevronDown, FiChevronRight
} from 'react-icons/fi';
import TextInput from '../../components/ui/TextInput';
import SelectInput from '../../components/ui/SelectInput';
import DatePickerInput from '../../components/ui/DatePickerInput';
import Button from '../../components/ui/Button';
import { usePrivateQuery } from '../../hooks/usePrivateQuery';
import { usePrivateMutation } from '../../hooks/usePrivateMutation';
import styles from './styles/CreateStaff.module.css';

// ----------------------------------------------------------------------------
// Validation Schema
// ----------------------------------------------------------------------------
const staffSchema = z.object({
  email: z.string().email('Invalid email address'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  middle_name: z.string().optional(),
  user_type: z.enum(['employee', 'external']),
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

const CreateStaff = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');
  const [errors, setErrors] = useState({});

  // --- Form State ---
  const [formData, setFormData] = useState({
    email: '', first_name: '', middle_name: '', last_name: '',
    title: '', rank: '', gender: '', date_of_birth: '', user_type: 'employee',
    employment_date: '', employment_status: 'active',
    contacts: [], identifications: [], addresses: [], education: [],
    role_ids: [], permission_ids: [],
  });

  useEffect(() => { document.title = 'Create Staff | Ant Cyber Portal'; }, []);

  // --------------------------------------------------------------------------
  // Fetch Roles & Permissions for Tab 2
  // --------------------------------------------------------------------------
  const { data: rolesResponse } = usePrivateQuery(['roles'], '/api/rbac/roles', {}, { staleTime: Infinity });
  const roles = rolesResponse?.data || [];

  const { data: permsResponse, isLoading: permsLoading } = usePrivateQuery(['permissions'], '/api/rbac/permissions', {}, { staleTime: Infinity });
  const permissions = permsResponse?.data || [];

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
  // Handlers for dynamic lists
  // --------------------------------------------------------------------------
  const addItem = (listName, defaultObj) => {
    setFormData(prev => ({
      ...prev,
      [listName]: [...prev[listName], { ...defaultObj }]
    }));
  };

  const removeItem = (listName, index) => {
    setFormData(prev => ({
      ...prev,
      [listName]: prev[listName].filter((_, i) => i !== index)
    }));
  };

  const updateItem = (listName, index, field, value) => {
    setFormData(prev => {
      const newList = [...prev[listName]];
      newList[index] = { ...newList[index], [field]: value };
      return { ...prev, [listName]: newList };
    });
  };

  const handlePermToggle = (permId) => {
    setFormData(prev => {
      const isSel = prev.permission_ids.includes(permId);
      return {
        ...prev,
        permission_ids: isSel 
          ? prev.permission_ids.filter(id => id !== permId)
          : [...prev.permission_ids, permId]
      };
    });
  };

  // --------------------------------------------------------------------------
  // Submit Mutation
  // --------------------------------------------------------------------------
  const { mutate: createStaff, isPending } = usePrivateMutation({
    targetQueryKey: ['staff'],
    onSuccess: (res) => {
      toast.success(
        <div>
          <p>Staff created successfully!</p>
          <p style={{ fontSize: '0.75rem', marginTop: '4px' }}>
            Default Password: <strong>{res.data?.defaultPassword}</strong>
          </p>
        </div>,
        { duration: 8000 }
      );
      navigate('/admin/staff');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Could not create staff.', { duration: 4000 });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const result = staffSchema.safeParse(formData);
    if (!result.success) {
      const formatted = {};
      result.error.issues.forEach((issue) => {
        formatted[issue.path[0]] = issue.message;
      });
      setErrors(formatted);
      setActiveTab('details'); // Switch back to details tab if validation fails
      toast.error('Please fix the highlighted fields.');
      return;
    }

    setErrors({});
    createStaff({
      url: '/api/staff',
      method: 'POST',
      data: formData,
    });
  };

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  return (
    <div className={styles.pageWrapper}>
      <Toaster position="top-right" richColors />

      <div className={styles.pageContainer}>
        <button type="button" className={styles.backButton} onClick={() => navigate(-1)}>
          <FiArrowLeft size={14} /><span>Back</span>
        </button>

        <motion.div className={styles.card} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          
          <header className={styles.header}>
            <div className={styles.headerIcon}><FiUser size={24} /></div>
            <div>
              <h1 className={styles.title}>Create Staff Profile</h1>
              <p className={styles.subtitle}>
                Add a new staff member to the system. A default password will be generated automatically.
              </p>
            </div>
          </header>

          {/* Tabs */}
          <div className={styles.tabsContainer}>
            <button
              className={`${styles.tab} ${activeTab === 'details' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('details')}
            >
              <FiUser size={16} /> Staff Details
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'permissions' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('permissions')}
            >
              <FiShield size={16} /> Roles & Permissions
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            
            {/* ================================================================
                TAB 1: DETAILS
                ================================================================ */}
            {activeTab === 'details' && (
              <motion.div className={styles.tabContent} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                
                {/* Basic Info */}
                <h3 className={styles.sectionTitle}>Basic Information</h3>
                <div className={styles.row}>
                  <div className={styles.inputGroup}>
                    <TextInput label="First Name *" value={formData.first_name} onChange={e => setFormData(p => ({...p, first_name: e.target.value}))} error={errors.first_name} />
                  </div>
                  <div className={styles.inputGroup}>
                    <TextInput label="Middle Name" value={formData.middle_name} onChange={e => setFormData(p => ({...p, middle_name: e.target.value}))} />
                  </div>
                  <div className={styles.inputGroup}>
                    <TextInput label="Last Name *" value={formData.last_name} onChange={e => setFormData(p => ({...p, last_name: e.target.value}))} error={errors.last_name} />
                  </div>
                </div>
                <div className={styles.row}>
                  <div className={styles.inputGroup}>
                    <TextInput label="Email Address *" type="email" value={formData.email} onChange={e => setFormData(p => ({...p, email: e.target.value}))} error={errors.email} />
                  </div>
                  <div className={styles.inputGroup}>
                    <SelectInput label="User Type" options={[{value:'employee', label:'Employee'}, {value:'external', label:'External'}]} value={formData.user_type} onChange={e => setFormData(p => ({...p, user_type: e.target.value}))} />
                  </div>
                </div>
                <div className={styles.row}>
                  <div className={styles.inputGroup}>
                    <TextInput label="Title (e.g. Mr, Dr)" value={formData.title} onChange={e => setFormData(p => ({...p, title: e.target.value}))} />
                  </div>
                  <div className={styles.inputGroup}>
                    <SelectInput label="Gender" options={[{value:'male', label:'Male'}, {value:'female', label:'Female'}]} value={formData.gender} onChange={e => setFormData(p => ({...p, gender: e.target.value}))} />
                  </div>
                  <div className={styles.inputGroup}>
                    <DatePickerInput label="Date of Birth" value={formData.date_of_birth} onChange={v => setFormData(p => ({...p, date_of_birth: v}))} />
                  </div>
                </div>

                {/* Employment */}
                <h3 className={styles.sectionTitle}>Employment Details</h3>
                <div className={styles.row}>
                  <div className={styles.inputGroup}>
                    <TextInput label="Rank *" value={formData.rank} onChange={e => setFormData(p => ({...p, rank: e.target.value}))} error={errors.rank} />
                  </div>
                  <div className={styles.inputGroup}>
                    <DatePickerInput label="Employment Date" value={formData.employment_date} onChange={v => setFormData(p => ({...p, employment_date: v}))} />
                  </div>
                  <div className={styles.inputGroup}>
                    <SelectInput label="Employment Status" options={['active','suspended','study_leave','retired','resigned','terminated'].map(s => ({value:s, label:s}))} value={formData.employment_status} onChange={e => setFormData(p => ({...p, employment_status: e.target.value}))} />
                  </div>
                </div>

                {/* Contacts */}
                <div className={styles.dynamicSectionHeader}>
                  <h3 className={styles.sectionTitle}>Contacts</h3>
                  <button type="button" className={styles.addBtn} onClick={() => addItem('contacts', { contact_type: 'phone', value: '' })}><FiPlus /> Add Contact</button>
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

                {/* Identifications */}
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

                {/* Addresses */}
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

                {/* Education */}
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

            {/* ================================================================
                TAB 2: ROLES & PERMISSIONS
                ================================================================ */}
            {activeTab === 'permissions' && (
              <motion.div className={styles.tabContent} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                
                {/* Roles */}
                <h3 className={styles.sectionTitle}>Assign Roles</h3>
                <div className={styles.rolesGrid}>
                  {roles.map(role => (
                    <label key={role.id} className={`${styles.roleCard} ${formData.role_ids.includes(role.id) ? styles.roleCardActive : ''}`}>
                      <input
                        type="checkbox"
                        checked={formData.role_ids.includes(role.id)}
                        onChange={(e) => {
                          if (e.target.checked) setFormData(p => ({ ...p, role_ids: [...p.role_ids, role.id] }));
                          else setFormData(p => ({ ...p, role_ids: p.role_ids.filter(id => id !== role.id) }));
                        }}
                        className={styles.hiddenCheckbox}
                      />
                      <div className={styles.checkboxIndicator}>
                        {formData.role_ids.includes(role.id) && <FiCheck size={12} />}
                      </div>
                      <span>{role.display_name}</span>
                    </label>
                  ))}
                </div>

                <div className={styles.divider} />

                {/* Direct Permissions */}
                <h3 className={styles.sectionTitle}>Direct Permissions</h3>
                <p className={styles.helperText}>Grant specific permissions beyond what the roles provide.</p>
                
                {permsLoading ? (
                  <div className={styles.loading}>Loading permissions...</div>
                ) : (
                  <div className={styles.accordion}>
                    {Object.entries(groupedPermissions).map(([module, resources]) => (
                      <div key={module} className={styles.accordionItem}>
                        <button type="button" className={styles.accordionHeader} onClick={() => setExpandedModules(p => ({ ...p, [module]: !p[module] }))}>
                          {expandedModules[module] ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
                          <span>{module}</span>
                        </button>
                        
                        {expandedModules[module] && (
                          <div className={styles.accordionBody}>
                            {Object.entries(resources).map(([resource, perms]) => (
                              <div key={resource} className={styles.resourceGroup}>
                                <span className={styles.resourceName}>{resource}</span>
                                <div className={styles.permissionsGrid}>
                                  {perms.map(perm => (
                                    <label key={perm.id} className={`${styles.permCard} ${formData.permission_ids.includes(perm.id) ? styles.permCardActive : ''}`}>
                                      <input type="checkbox" checked={formData.permission_ids.includes(perm.id)} onChange={() => handlePermToggle(perm.id)} className={styles.hiddenCheckbox} />
                                      <div className={styles.checkboxIndicator}>
                                        {formData.permission_ids.includes(perm.id) && <FiCheck size={12} />}
                                      </div>
                                      <span>{perm.display_name}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

              </motion.div>
            )}

            {/* Footer Actions */}
            <div className={styles.actions}>
              <button type="button" className={styles.secondaryButton} onClick={() => navigate(-1)}>Cancel</button>
              <Button type="submit" isLoading={isPending}>Create Staff</Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateStaff;