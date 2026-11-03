// pages/reports/EditReport.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { toast, Toaster } from 'sonner';
import { 
  FiArrowLeft, FiUploadCloud, FiFile, FiX, FiHash, FiTrash2, FiSave, FiSend, FiMessageSquare, FiInfo
} from 'react-icons/fi';
import TextInput from '../../components/ui/TextInput';
import TextAreaInput from '../../components/ui/TextAreaInput';
import SelectInput from '../../components/ui/SelectInput';
import MultiSearchableSelect from '../../components/ui/MultiSearchableSelect';
import Button from '../../components/ui/Button';
import { usePrivateQuery } from '../../hooks/usePrivateQuery';
import { usePrivateMutation } from '../../hooks/usePrivateMutation';
import styles from './styles/EditReport.module.css';

// ----------------------------------------------------------------------------
// Validation
// ----------------------------------------------------------------------------
const reportSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters'),
  report_type: z.enum(['daily', 'weekly', 'monthly', 'annual']),
  submitted_to: z.string().min(1, 'Submitted to is required'),
  project_id: z.string().optional(),
  summary: z.string().trim().min(1, 'Summary is required'),
  recommendations: z.string().optional(),
});

const REPORT_TYPE_OPTIONS = [
  { value: 'daily', label: 'Daily Report' },
  { value: 'weekly', label: 'Weekly Report' },
  { value: 'monthly', label: 'Monthly Report' },
  { value: 'annual', label: 'Annual Report' },
];

const EditReport = () => {
  const { id } = useParams();
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
  const [newFiles, setNewFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Search states
  const [staffSearch, setStaffSearch] = useState('');
  const [projectSearch, setProjectSearch] = useState('');
  
  // Labels for the dropdowns
  const [selectedStaffLabels, setSelectedStaffLabels] = useState({});
  const [selectedProjectLabel, setSelectedProjectLabel] = useState('');

  useEffect(() => {
    document.title = 'Edit Report | Ant Cyber Portal';
  }, []);

  // --------------------------------------------------------------------------
  // Fetch Existing Report
  // --------------------------------------------------------------------------
  const { data: reportResponse, isLoading: reportLoading, isError: reportError } = usePrivateQuery(
    ['reports', id],
    `/api/reports/${id}`,
    {},
    { enabled: Boolean(id) }
  );

  const report = reportResponse?.data || reportResponse;

  // Populate form once data loads
  useEffect(() => {
    if (report && !isInitialized) {
      const staffLabels = {};
      if (report.submitted_to_details) {
        staffLabels[report.submitted_to] = report.submitted_to_details.full_name || report.submitted_to_details.email;
      }
      setSelectedStaffLabels(staffLabels);

      if (report.project_details) {
        setSelectedProjectLabel(report.project_details.name);
      }

      setFormData({
        title: report.title || '',
        report_type: report.report_type || 'weekly',
        submitted_to: report.submitted_to || '',
        project_id: report.project_id || '',
        summary: report.summary || '',
        recommendations: report.recommendations || '',
      });
      setIsInitialized(true);
    }
  }, [report, isInitialized]);

  // --------------------------------------------------------------------------
  // Fetch Staff & Projects for dropdowns
  // --------------------------------------------------------------------------
  const { data: staffResponse, isLoading: staffLoading } = usePrivateQuery(
    ['all-staff', { q: staffSearch }],
    '/api/projects/all-staff',
    { q: staffSearch, limit: 50 },
    { staleTime: 60_000 }
  );

  const staffOptions = useMemo(() => {
    const list = staffResponse?.data ?? staffResponse ?? [];
    const base = list.map((s) => ({
      value: s.user_id || s.id,
      label: s.full_name || s.email,
    }));

    const seen = new Set(base.map(o => o.value));
    if (formData.submitted_to && !seen.has(formData.submitted_to)) {
      base.push({ value: formData.submitted_to, label: selectedStaffLabels[formData.submitted_to] || formData.submitted_to });
    }
    return base;
  }, [staffResponse, formData.submitted_to, selectedStaffLabels]);

  const { data: projectsResponse, isLoading: projectsLoading } = usePrivateQuery(
    ['projects', { q: projectSearch }],
    '/api/projects',
    { q: projectSearch, limit: 50 },
    { staleTime: 60_000 }
  );

  const projectOptions = useMemo(() => {
    const list = projectsResponse?.data?.results ?? projectsResponse ?? [];
    const base = list.map((p) => ({ value: p.id, label: p.name }));
    
    if (formData.project_id && !base.some(o => o.value === formData.project_id)) {
      base.push({ value: formData.project_id, label: selectedProjectLabel || formData.project_id });
    }
    return base;
  }, [projectsResponse, formData.project_id, selectedProjectLabel]);

  // --------------------------------------------------------------------------
  // File Upload Handlers
  // --------------------------------------------------------------------------
  const handleFileChange = (e) => {
    if (e.target.files) {
      setNewFiles((prev) => [...prev, ...Array.from(e.target.files)]);
    }
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      setNewFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
    }
  };

  const removeNewFile = (index) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // --------------------------------------------------------------------------
  // Mutations
  // --------------------------------------------------------------------------
  const { mutate: updateReport, isPending } = usePrivateMutation({
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
      toast.error(error?.response?.data?.message || 'Could not update report.', { duration: 4000 });
    },
  });

  const { mutate: deleteAttachment, isPending: isDeletingFile } = usePrivateMutation({
    targetQueryKey: ['reports'],
    onSuccess: () => {
      toast.success('File removed.', { duration: 3000 });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Could not remove file.', { duration: 4000 });
    },
  });

  const handleDeleteAttachment = (fileId) => {
    if (!window.confirm('Are you sure you want to remove this file?')) return;
    deleteAttachment({
      url: `/api/reports/${id}/attachments/${fileId}`,
      method: 'DELETE',
    });
  };

  // --------------------------------------------------------------------------
  // Submit Handler
  // --------------------------------------------------------------------------
  const handleSubmit = (e, status) => {
    e.preventDefault();

    const result = reportSchema.safeParse(formData);
    if (!result.success) {
      const formatted = {};
      result.error.issues.forEach((issue) => { formatted[issue.path[0]] = issue.message; });
      setErrors(formatted);
      toast.error('Please fix the highlighted fields.');
      return;
    }

    setErrors({});

    const data = new FormData();
    data.append('title', result.data.title);
    data.append('report_type', result.data.report_type);
    data.append('submitted_to', result.data.submitted_to);
    if (result.data.project_id) data.append('project_id', result.data.project_id);
    data.append('summary', result.data.summary);
    if (result.data.recommendations) data.append('recommendations', result.data.recommendations);
    data.append('status', status);

    newFiles.forEach((file) => {
      data.append('files', file);
    });

    updateReport({
      url: `/api/reports/${id}`,
      method: 'PATCH',
      data: data,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  };

  // --------------------------------------------------------------------------
  // Render States
  // --------------------------------------------------------------------------
  if (reportLoading && !isInitialized) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.pageContainer}>
          <div className={styles.stateCard}>
            <div className={styles.spinner} />
            <p className={styles.stateText}>Loading report details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (reportError || (!reportLoading && !report)) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.pageContainer}>
          <button type="button" className={styles.backButton} onClick={() => navigate('/admin/reports')}>
            <FiArrowLeft size={14} /><span>Back to Reports</span>
          </button>
          <div className={styles.stateCard}>
            <h2 className={styles.stateTitle}>Report not found</h2>
            <p className={styles.stateText}>The report you're trying to edit doesn't exist.</p>
            <Button onClick={() => navigate('/admin/reports')}>Go to Reports</Button>
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

        <motion.div
          className={styles.card}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <header className={styles.header}>
            <div className={styles.headerTop}>
              <div>
                <h1 className={styles.title}>Edit Report</h1>
                <p className={styles.subtitle}>
                  Update report details, status, or add new attachments.
                </p>
              </div>
              
              <div className={styles.referenceBox}>
                <FiHash className={styles.refIcon} />
                <div>
                  <span className={styles.refLabel}>Reference No.</span>
                  <span className={styles.refValue}>{report.reference_number}</span>
                </div>
              </div>
            </div>
          </header>

          {/* Reviewer Notes Banner */}
          {report.reviewer_notes && (
            <div className={styles.notesBanner}>
              <div className={styles.notesBannerHeader}>
                <FiMessageSquare size={18} />
                <h3>Reviewer Notes</h3>
              </div>
              <div className={styles.notesBannerBody}>
                {report.reviewer_notes.split('\n').map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
              <div className={styles.notesBannerFooter}>
                <FiInfo size={14} />
                <span>Please address the notes above before resubmitting.</span>
              </div>
            </div>
          )}

          <form className={styles.form} noValidate>
            
            <div className={styles.row}>
              <div className={styles.inputGroup}>
                <TextInput
                  id="title"
                  name="title"
                  label="Report Title"
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
              </div>
            </div>

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
              />
            </div>

            <div className={styles.inputGroup}>
              <TextAreaInput
                id="summary"
                label="Report Summary"
                rows={4}
                value={formData.summary}
                onChange={(e) => setFormData(p => ({ ...p, summary: e.target.value }))}
                error={errors.summary}
              />
              {errors.summary && <span className={styles.errorText}>{errors.summary}</span>}
            </div>

            <div className={styles.inputGroup}>
              <TextAreaInput
                id="recommendations"
                label="Recommendations (Optional)"
                rows={4}
                value={formData.recommendations}
                onChange={(e) => setFormData(p => ({ ...p, recommendations: e.target.value }))}
              />
            </div>

            {/* Existing Attachments */}
            {report.attachments && report.attachments.length > 0 && (
              <div className={styles.inputGroup}>
                <label className={styles.fieldLabel}>Existing Attachments</label>
                <ul className={styles.fileList}>
                  {report.attachments.map((file) => (
                    <li key={file.id} className={styles.fileItem}>
                      <div className={styles.fileIcon}><FiFile size={16} /></div>
                      <div className={styles.fileDetails}>
                        <a href={file.file_url} target="_blank" rel="noreferrer" className={styles.fileName}>
                          {file.file_name}
                        </a>
                        <span className={styles.fileSize}>{formatFileSize(file.file_size)}</span>
                      </div>
                      <button
                        type="button"
                        className={styles.removeFileBtn}
                        onClick={() => handleDeleteAttachment(file.id)}
                        disabled={isDeletingFile}
                        title="Delete file"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Upload New Attachments */}
            <div className={styles.inputGroup}>
              <label className={styles.fieldLabel}>Add New Attachments</label>
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
                  <p className={styles.dropzoneTitle}>Click to upload or drag and drop</p>
                  <p className={styles.dropzoneSub}>PDF, DOCX, JPG, or PNG (max 10MB each)</p>
                </div>
              </div>

              {newFiles.length > 0 && (
                <ul className={styles.fileList}>
                  {newFiles.map((file, index) => (
                    <li key={index} className={styles.fileItem}>
                      <div className={styles.fileIcon}><FiFile size={16} /></div>
                      <div className={styles.fileDetails}>
                        <span className={styles.fileName}>{file.name}</span>
                        <span className={styles.fileSize}>{formatFileSize(file.size)}</span>
                      </div>
                      <button
                        type="button"
                        className={styles.removeFileBtn}
                        onClick={(e) => { e.stopPropagation(); removeNewFile(index); }}
                      >
                        <FiX size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className={styles.actions}>
              <button type="button" className={styles.secondaryButton} onClick={() => navigate(-1)} disabled={isPending}>
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

export default EditReport;