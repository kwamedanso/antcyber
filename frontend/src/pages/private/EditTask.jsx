// pages/tasks/EditTask.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { toast, Toaster } from 'sonner';
import { FiArrowLeft } from 'react-icons/fi';
import TextInput from '../../components/ui/TextInput';
import TextAreaInput from '../../components/ui/TextAreaInput';
import SelectInput from '../../components/ui/SelectInput';
import DatePickerInput from '../../components/ui/DatePickerInput';
import MultiSearchableSelect from '../../components/ui/MultiSearchableSelect';
import Button from '../../components/ui/Button';
import { usePrivateQuery } from '../../hooks/usePrivateQuery';
import { usePrivateMutation } from '../../hooks/usePrivateMutation';
import styles from './styles/EditTask.module.css';

// ----------------------------------------------------------------------------
// Validation
// ----------------------------------------------------------------------------
const taskSchema = z.object({
  project_id: z.string().min(1, 'Please select a project'),
  assignees: z.array(z.string()).min(1, 'Assign at least one member'),
  due_date: z.string().min(1, 'Due date is required'),
  priority: z.enum(['low', 'medium', 'high'], {
    message: 'Please select a priority',
  }),
  status: z.enum(['todo', 'in_progress', 'blocked', 'done', 'cancelled'], {
    message: 'Please select a status',
  }),
  title: z
    .string()
    .trim()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title is too long'),
  description: z
    .string()
    .trim()
    .min(1, 'Description is required')
    .max(5000, 'Description is too long'),
});

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const STATUS_OPTIONS = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'done', label: 'Done' },
  { value: 'cancelled', label: 'Cancelled' },
];

const EditTask = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    project_id: '',
    assignees: [],
    due_date: '',
    priority: 'medium',
    status: 'todo',
    title: '',
    description: '',
  });
  const [errors, setErrors] = useState({});
  const [isInitialized, setIsInitialized] = useState(false);

  const [projectSearch, setProjectSearch] = useState('');
  const [memberSearch, setMemberSearch] = useState('');

  const [selectedMemberLabels, setSelectedMemberLabels] = useState({});
  const [selectedProjectLabel, setSelectedProjectLabel] = useState('');

  useEffect(() => {
    document.title = 'Edit Task | Ant Cyber Portal';
  }, []);

  // --------------------------------------------------------------------------
  // Fetch existing task
  // --------------------------------------------------------------------------
  const { data: taskResponse, isLoading: taskLoading, isError: taskError } = usePrivateQuery(
    ['task', id],
    `/api/tasks/${id}`,
    {},
    { enabled: Boolean(id) }
  );

  const existingTask = taskResponse?.data || taskResponse;

  // Populate form once task data is loaded
  useEffect(() => {
    if (existingTask && !isInitialized) {
      // Build the label map from the existing assignees
      const labels = {};
      existingTask.assignees?.forEach((a) => {
        labels[a.user_id] = a.full_name || a.email || 'Unknown';
      });
      setSelectedMemberLabels(labels);

      if (existingTask.project_name) {
        setSelectedProjectLabel(existingTask.project_name);
      }

      setFormData({
        project_id: existingTask.project_id || '',
        assignees: existingTask.assignees?.map((a) => a.user_id) || [],
        due_date: existingTask.due_date ? existingTask.due_date.split('T')[0] : '',
        priority: existingTask.priority || 'medium',
        status: existingTask.status || 'todo',
        title: existingTask.title || '',
        description: existingTask.description || '',
      });
      setIsInitialized(true);
    }
  }, [existingTask, isInitialized]);

  // --------------------------------------------------------------------------
  // Projects dropdown
  // --------------------------------------------------------------------------
  const { data: projectsResponse, isLoading: projectsLoading } = usePrivateQuery(
    ['projects', { q: projectSearch }],
    '/api/projects',
    { q: projectSearch, limit: 25 },
    { staleTime: 60_000 }
  );

  const projectOptions = useMemo(() => {
    const list = projectsResponse?.data?.results ?? projectsResponse ?? [];
    const options = list.map((p) => ({ value: p.id, label: p.name }));

    if (formData.project_id && !options.some((o) => o.value === formData.project_id)) {
      options.push({
        value: formData.project_id,
        label: selectedProjectLabel || formData.project_id,
      });
    }

    return options;
  }, [projectsResponse, formData.project_id, selectedProjectLabel]);

  // --------------------------------------------------------------------------
  // Staff dropdown
  // --------------------------------------------------------------------------
  const excludeIdsCsv = formData.assignees.join(',');

  const { data: staffResponse, isLoading: staffLoading } = usePrivateQuery(
    ['all-staff', { q: memberSearch, exclude: excludeIdsCsv }],
    '/api/projects/all-staff',
    {
      q: memberSearch,
      limit: 50,
      ...(excludeIdsCsv ? { exclude: excludeIdsCsv } : {}),
    },
    { staleTime: 30_000 }
  );

  const memberOptions = useMemo(() => {
    const list = staffResponse?.data ?? staffResponse ?? [];
    const selected = new Set(formData.assignees);

    const fetched = list
      .filter((m) => !selected.has(m.user_id || m.id))
      .map((m) => ({
        value: m.user_id || m.id,
        label:
          m.full_name ||
          m.name ||
          [m.first_name, m.last_name].filter(Boolean).join(' ') ||
          m.email ||
          'Unknown member',
      }));

    const seen = new Set(fetched.map((o) => o.value));
    for (const id of formData.assignees) {
      if (!seen.has(id)) {
        fetched.push({
          value: id,
          label: selectedMemberLabels[id] || id,
        });
        seen.add(id);
      }
    }

    return fetched;
  }, [staffResponse, formData.assignees, selectedMemberLabels]);

  // --------------------------------------------------------------------------
  // Update mutation
  // --------------------------------------------------------------------------
    const { mutate: updateTask, isPending } = usePrivateMutation({
    // Invalidate/refetch BOTH the list and the single task
    targetQueryKey: ['tasks'], 
    onSuccess: () => {
      toast.success('Task updated successfully.', { duration: 3500 });
      navigate('/admin/tasks');
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          'Could not update the task. Please try again.',
        { duration: 4000 }
      );
    },
  });

  // --------------------------------------------------------------------------
  // Handlers
  // --------------------------------------------------------------------------
  const handleProjectChange = (next) => {
    const picked = next[0] || '';
    if (picked && picked !== formData.project_id) {
      const opt = projectOptions.find((o) => o.value === picked);
      if (opt) setSelectedProjectLabel(opt.label);
    }
    if (!picked) setSelectedProjectLabel('');
    setFormData((prev) => ({ ...prev, project_id: picked }));
  };

  const handleAssigneesChange = (next) => {
    const newlySelected = next.filter((id) => !formData.assignees.includes(id));
    if (newlySelected.length) {
      const labelMap = { ...selectedMemberLabels };
      for (const id of newlySelected) {
        const opt = memberOptions.find((o) => o.value === id);
        if (opt) labelMap[id] = opt.label;
      }
      setSelectedMemberLabels(labelMap);
    }
    setFormData((prev) => ({ ...prev, assignees: next }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const result = taskSchema.safeParse(formData);

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

    updateTask({
      url: `/api/tasks/${id}`,
      method: 'PATCH',
      data: {
        project_id: result.data.project_id,
        assignee_ids: result.data.assignees,
        due_date: result.data.due_date,
        priority: result.data.priority,
        status: result.data.status,
        title: result.data.title,
        description: result.data.description,
      },
    });
  };

  // --------------------------------------------------------------------------
  // Loading / Error States
  // --------------------------------------------------------------------------
  if (taskLoading && !isInitialized) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.pageContainer}>
          <div style={{ textAlign: 'center', padding: '4rem', color: '#6b7280' }}>
            Loading task details...
          </div>
        </div>
      </div>
    );
  }

  if (taskError || (!taskLoading && !existingTask)) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.pageContainer}>
          <button
            type="button"
            className={styles.backButton}
            onClick={() => navigate('/admin/tasks')}
          >
            <FiArrowLeft size={14} />
            <span>Back to tasks</span>
          </button>
          <div style={{ textAlign: 'center', padding: '4rem', color: '#e11d48' }}>
            Task not found or you don't have permission to view it.
          </div>
        </div>
      </div>
    );
  }

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
            <h1 className={styles.title}>Edit Task</h1>
            <p className={styles.subtitle}>
              Update task details and status. Fields marked with{' '}
              <span className={styles.required}>*</span> are required.
            </p>
          </header>

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            {/* Project */}
            <div className={styles.inputGroup}>
              <label className={styles.fieldLabel} htmlFor="project_id">
                Project <span className={styles.required}>*</span>
              </label>
              <MultiSearchableSelect
                id="project_id"
                label={undefined}
                placeholder="Search projects…"
                options={projectOptions}
                value={formData.project_id ? [formData.project_id] : []}
                onChange={handleProjectChange}
                onSearchChange={setProjectSearch}
                isLoading={projectsLoading}
                error={errors.project_id}
              />
              {errors.project_id && (
                <span className={styles.errorText}>{errors.project_id}</span>
              )}
            </div>

            {/* Assignees */}
            <div className={styles.inputGroup}>
              <label className={styles.fieldLabel} htmlFor="assignees">
                Assignees <span className={styles.required}>*</span>
              </label>
              <MultiSearchableSelect
                id="assignees"
                label={undefined}
                placeholder="Search staff…"
                options={memberOptions}
                value={formData.assignees}
                onChange={handleAssigneesChange}
                onSearchChange={setMemberSearch}
                isLoading={staffLoading}
                error={errors.assignees}
              />
              {errors.assignees && (
                <span className={styles.errorText}>{errors.assignees}</span>
              )}
            </div>

            {/* Due date + Priority + Status */}
            <div className={styles.row}>
              <div className={styles.inputGroup}>
                <DatePickerInput
                  id="due_date"
                  label="Due Date"
                  placeholder="YYYY-MM-DD"
                  value={formData.due_date}
                  onChange={(val) =>
                    setFormData((prev) => ({ ...prev, due_date: val }))
                  }
                  error={errors.due_date}
                />
                {errors.due_date && (
                  <span className={styles.errorText}>{errors.due_date}</span>
                )}
              </div>

              <div className={styles.inputGroup}>
                <SelectInput
                  id="priority"
                  label="Priority"
                  options={PRIORITY_OPTIONS}
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, priority: e.target.value }))
                  }
                  error={errors.priority}
                />
                {errors.priority && (
                  <span className={styles.errorText}>{errors.priority}</span>
                )}
              </div>

              <div className={styles.inputGroup}>
                <SelectInput
                  id="status"
                  label="Status"
                  options={STATUS_OPTIONS}
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, status: e.target.value }))
                  }
                  error={errors.status}
                />
                {errors.status && (
                  <span className={styles.errorText}>{errors.status}</span>
                )}
              </div>
            </div>

            {/* Title */}
            <div className={styles.inputGroup}>
              <TextInput
                id="title"
                name="title"
                label="Title"
                placeholder="Short, descriptive title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                style={{
                  fontSize: '15px',
                  borderColor: errors.title ? '#e11d48' : '#d3d3d3',
                }}
              />
              {errors.title && (
                <span className={styles.errorText}>{errors.title}</span>
              )}
            </div>

            {/* Description */}
            <div className={styles.inputGroup}>
              <TextAreaInput
                id="description"
                name="description"
                label="Description"
                rows={8}
                placeholder="Describe the task, acceptance criteria, links, etc."
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                error={errors.description}
              />
              {errors.description && (
                <span className={styles.errorText}>{errors.description}</span>
              )}
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

export default EditTask;