// pages/reports/CreateReport.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { toast, Toaster } from 'sonner';
import { 
  FiArrowLeft, 
  FiUploadCloud, 
  FiFile, 
  FiX, 
  FiHash,
  FiSave,
  FiSend
} from 'react-icons/fi';
import TextInput from '../../components/ui/TextInput';
import TextAreaInput from '../../components/ui/TextAreaInput';
import SelectInput from '../../components/ui/SelectInput';
import MultiSearchableSelect from '../../components/ui/MultiSearchableSelect';
import Button from '../../components/ui/Button';
import { usePrivateQuery } from '../../hooks/usePrivateQuery';
import { usePrivateMutation } from '../../hooks/usePrivateMutation';
import styles from './styles/CreateReport.module.css';

// ----------------------------------------------------------------------------
// Validation
// ----------------------------------------------------------------------------
const reportSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters'),
  report_type: z.enum(['daily', 'weekly', 'monthly', 'annual'], {
    message: 'Please select a report type',
  }),
  submitted_to: z.string().min(1, 'Submitted to is required'),
  project_id: z.string().optional(),
  summary: z.string().trim().min(1, 'Summary is required'), // <-- Enforced strictly
  recommendations: z.string().optional(),
});

const REPORT_TYPE_OPTIONS = [
  { value: 'daily', label: 'Daily Report' },
  { value: 'weekly', label: 'Weekly Report' },
  { value: 'monthly', label: 'Monthly Report' },
  { value: 'annual', label: 'Annual Report' },
];

const CreateReport = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    report_type: 'weekly',
    submitted_to: '',
    project_id: '',
    summary: '',
    recommendations: '',
  });
  
  const [errors, setErrors] = useState({});
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  // Search states for the dropdowns
  const [staffSearch, setStaffSearch] = useState('');
  const [projectSearch, setProjectSearch] = useState('');

  useEffect(() => {
    document.title = 'Create Report | Ant Cyber Portal';
  }, []);

  // --------------------------------------------------------------------------
  // Fetch Next Reference Number (Preview)
  // --------------------------------------------------------------------------
  const { data: refData } = usePrivateQuery(
    ['reports', 'next-reference'],
    '/api/reports/next-reference',
    {},
    { staleTime: 0, cacheTime: 0 }
  );
  const nextReference = refData?.data?.reference_number || 'Generating...';

  // --------------------------------------------------------------------------
  // Fetch Staff (for Submitted To)
  // --------------------------------------------------------------------------
  const { data: staffResponse, isLoading: staffLoading } = usePrivateQuery(
    ['all-staff', { q: staffSearch }],
    '/api/projects/all-staff',
    { q: staffSearch, limit: 50 },
    { staleTime: 60_000 }
  );

  const staffOptions = useMemo(() => {
    const list = staffResponse?.data ?? staffResponse ?? [];
    return list.map((s) => ({
      value: s.user_id || s.id,
      label: s.full_name || s.email,
    }));
  }, [staffResponse]);

  // --------------------------------------------------------------------------
  // Fetch Projects
  // --------------------------------------------------------------------------
  const { data: projectsResponse, isLoading: projectsLoading } = usePrivateQuery(
    ['projects', { q: projectSearch }],
    '/api/projects',
    { q: projectSearch, limit: 50 },
    { staleTime: 60_000 }
  );

  const projectOptions = useMemo(() => {
    const list = projectsResponse?.data?.results ?? projectsResponse ?? [];
    return list.map((p) => ({ value: p.id, label: p.name }));
  }, [projectsResponse]);

  // --------------------------------------------------------------------------
  // File Upload Handlers
  // --------------------------------------------------------------------------
  const handleFileChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (indexToRemove) => {
    setFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // --------------------------------------------------------------------------
  // Submit Mutation
  // --------------------------------------------------------------------------
  const { mutate: createReport, isPending } = usePrivateMutation({
    targetQueryKey: ['reports'],
    onSuccess: (data, variables) => {
      const isDraft = variables.data.get('status') === 'draft';
      toast.success(
        isDraft ? 'Report saved as draft.' : 'Report submitted successfully.', 
        { duration: 3500 }
      );
      navigate('/admin/reports');
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || 'Could not save report.',
        { duration: 4000 }
      );
    },
  });

  const handleSubmit = (e, status) => {
    e.preventDefault();

    const result = reportSchema.safeParse(formData);

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

    // Build FormData for multipart/form-data (required for file uploads)
    const data = new FormData();
    data.append('title', result.data.title);
    data.append('report_type', result.data.report_type);
    data.append('submitted_to', result.data.submitted_to);
    if (result.data.project_id) data.append('project_id', result.data.project_id);
    data.append('summary', result.data.summary);
    if (result.data.recommendations) data.append('recommendations', result.data.recommendations);
    
    // Append the status requested by the button clicked
    data.append('status', status);

    // Append files
    files.forEach((file) => {
      data.append('files', file);
    });

    createReport({
      url: '/api/reports',
      method: 'POST',
      data: data,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  };

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
            <div className={styles.headerTop}>
              <div>
                <h1 className={styles.title}>Create Report</h1>
                <p className={styles.subtitle}>
                  Draft a new report, attach files, and submit to staff.
                </p>
              </div>
              
              {/* Reference Number Preview */}
              <div className={styles.referenceBox}>
                <FiHash className={styles.refIcon} />
                <div>
                  <span className={styles.refLabel}>Reference No.</span>
                  <span className={styles.refValue}>{nextReference}</span>
                </div>
              </div>
            </div>
          </header>

          <form className={styles.form} noValidate>
            
            {/* Row 1: Title & Report Type */}
            <div className={styles.row}>
              <div className={styles.inputGroup}>
                <TextInput
                  id="title"
                  name="title"
                  label="Report Title"
                  placeholder="e.g. Q3 Financial Summary"
                  value={formData.title}
                  onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                  style={{ fontSize: '15px', borderColor: errors.title ? '#e11d48' : '#d3d3d3' }}
                />
                {errors.title && <span className={styles.errorText}>{errors.title}</span>}
              </div>

              <div className={styles.inputGroup}>
                <SelectInput
                  id="report_type"
                  label="Report Type"
                  options={REPORT_TYPE_OPTIONS}
                  value={formData.report_type}
                  onChange={(e) => setFormData(p => ({ ...p, report_type: e.target.value }))}
                  error={errors.report_type}
                />
                {errors.report_type && <span className={styles.errorText}>{errors.report_type}</span>}
              </div>
            </div>

            {/* Row 2: Submitted To */}
            <div className={styles.row}>
              <div className={styles.inputGroup}>
                <label className={styles.fieldLabel}>Submitted To <span className={styles.required}>*</span></label>
                <MultiSearchableSelect
                  id="submitted_to"
                  label={undefined}
                  placeholder="Search staff..."
                  options={staffOptions}
                  value={formData.submitted_to ? [formData.submitted_to] : []}
                  onChange={(next) => setFormData(p => ({ ...p, submitted_to: next[0] || '' }))}
                  onSearchChange={setStaffSearch}
                  isLoading={staffLoading}
                  error={errors.submitted_to}
                />
                {errors.submitted_to && <span className={styles.errorText}>{errors.submitted_to}</span>}
              </div>
            </div>

            {/* Row 3: Project (Optional) */}
            <div className={styles.inputGroup}>
              <label className={styles.fieldLabel}>Associated Project (Optional)</label>
              <MultiSearchableSelect
                id="project_id"
                label={undefined}
                placeholder="Search projects..."
                options={projectOptions}
                value={formData.project_id ? [formData.project_id] : []}
                onChange={(next) => setFormData(p => ({ ...p, project_id: next[0] || '' }))}
                onSearchChange={setProjectSearch}
                isLoading={projectsLoading}
                error={errors.project_id}
              />
            </div>

            {/* Row 4: Summary & Recommendations */}
            <div className={styles.inputGroup}>
              <TextAreaInput
                id="summary"
                name="summary"
                label="Report Summary"
                rows={4}
                placeholder="Provide a brief overview of the report..."
                value={formData.summary}
                onChange={(e) => setFormData(p => ({ ...p, summary: e.target.value }))}
                error={errors.summary}
              />
              {errors.summary && <span className={styles.errorText}>{errors.summary}</span>}
            </div>

            <div className={styles.inputGroup}>
              <TextAreaInput
                id="recommendations"
                name="recommendations"
                label="Recommendations (Optional)"
                rows={4}
                placeholder="What actions should be taken based on this report?"
                value={formData.recommendations}
                onChange={(e) => setFormData(p => ({ ...p, recommendations: e.target.value }))}
                error={errors.recommendations}
              />
            </div>

            {/* Row 5: File Upload Zone */}
            <div className={styles.inputGroup}>
              <label className={styles.fieldLabel}>Attachments</label>
              
              <div 
                className={`${styles.dropzone} ${isDragging ? styles.dropzoneActive : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  multiple
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className={styles.fileInput}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                <div className={styles.dropzoneContent}>
                  <div className={styles.uploadIconWrapper}>
                    <FiUploadCloud size={24} />
                  </div>
                  <p className={styles.dropzoneTitle}>
                    Click to upload or drag and drop
                  </p>
                  <p className={styles.dropzoneSub}>
                    PDF, DOCX, JPG, or PNG (max 10MB each)
                  </p>
                </div>
              </div>

              {/* List of selected files */}
              {files.length > 0 && (
                <ul className={styles.fileList}>
                  {files.map((file, index) => (
                    <li key={index} className={styles.fileItem}>
                      <div className={styles.fileIcon}><FiFile size={16} /></div>
                      <div className={styles.fileDetails}>
                        <span className={styles.fileName}>{file.name}</span>
                        <span className={styles.fileSize}>{formatFileSize(file.size)}</span>
                      </div>
                      <button
                        type="button"
                        className={styles.removeFileBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(index);
                        }}
                      >
                        <FiX size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer Actions */}
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => navigate(-1)}
                disabled={isPending}
              >
                Cancel
              </button>
              
              <div className={styles.splitActions}>
                <button
                  type="button"
                  className={styles.draftButton}
                  onClick={(e) => handleSubmit(e, 'draft')}
                  disabled={isPending}
                >
                  <FiSave size={16} />
                  <span>Save as Draft</span>
                </button>
                <Button 
                  type="button" 
                  onClick={(e) => handleSubmit(e, 'submitted')}
                  isLoading={isPending}
                >
                  <FiSend size={16} style={{ marginRight: '6px' }} />
                  Save & Submit
                </Button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateReport;