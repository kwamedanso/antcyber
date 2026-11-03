// pages/tasks/CreateTask.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import styles from './styles/CreateTask.module.css';

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

const CreateTask = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    project_id: '',
    assignees: [],
    due_date: '',
    priority: 'medium',
    title: '',
    description: '',
  });
  const [errors, setErrors] = useState({});

  const [projectSearch, setProjectSearch] = useState('');
  const [memberSearch, setMemberSearch] = useState('');

  // Remember { id -> label } for everyone the user selects, so chips keep
  // rendering names after the option is excluded from the dropdown.
  const [selectedMemberLabels, setSelectedMemberLabels] = useState({});

  // Same idea for the project — since it's a single-select via the
  // multi-select component, keeping its label cached avoids the UUID
  // falling through if the project ever scrolls out of the current page.
  const [selectedProjectLabel, setSelectedProjectLabel] = useState('');

  useEffect(() => {
    document.title = 'Create Task | Ant Cyber Portal';
  }, []);

  // --------------------------------------------------------------------------
  // Projects (searchable)
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

    // Ensure the currently-selected project is always represented so the
    // input can render its name instead of its UUID.
    if (
      formData.project_id &&
      !options.some((o) => o.value === formData.project_id)
    ) {
      options.push({
        value: formData.project_id,
        label: selectedProjectLabel || formData.project_id,
      });
    }

    return options;
  }, [projectsResponse, formData.project_id, selectedProjectLabel]);

  // --------------------------------------------------------------------------
  // All staff (searchable) — excludes already-selected assignees on the
  // server so the dropdown never shows someone twice.
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

    // Options returned by the server (already excludes selected IDs)
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

    // Re-add currently-selected IDs using their remembered labels so the
    // chips render names, not UUIDs.
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
  // Create mutation
  // --------------------------------------------------------------------------
  const { mutate: createTask, isPending } = usePrivateMutation({
    targetQueryKey: ['tasks'],
    onSuccess: () => {
      toast.success('Task created successfully.', { duration: 3500 });
      navigate('/admin/tasks');
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          'Could not create the task. Please try again.',
        { duration: 4000 }
      );
    },
  });

  // --------------------------------------------------------------------------
  // Handlers
  // --------------------------------------------------------------------------
  const handleProjectChange = (next) => {
    const picked = next[0] || '';

    // Cache the label for the newly-picked project before the fetch swaps
    // the options array out.
    if (picked && picked !== formData.project_id) {
      const opt = projectOptions.find((o) => o.value === picked);
      if (opt) setSelectedProjectLabel(opt.label);
    }

    if (!picked) setSelectedProjectLabel('');

    setFormData((prev) => ({
      ...prev,
      project_id: picked,
    }));
  };

  const handleAssigneesChange = (next) => {
    // Record labels for any newly-selected IDs before the exclude refetch
    // pulls them out of `memberOptions`.
    const newlySelected = next.filter(
      (id) => !formData.assignees.includes(id)
    );

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

    createTask({
      url: '/api/tasks',
      method: 'POST',
      data: {
        project_id: result.data.project_id,
        assignee_ids: result.data.assignees,
        due_date: result.data.due_date,
        priority: result.data.priority,
        title: result.data.title,
        description: result.data.description,
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
            <h1 className={styles.title}>Create Task</h1>
            <p className={styles.subtitle}>
              Assign work to your team. Fields marked with{' '}
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

            {/* Assignees — any active staff in the system */}
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

            {/* Due date + Priority */}
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
                    setFormData((prev) => ({
                      ...prev,
                      priority: e.target.value,
                    }))
                  }
                  error={errors.priority}
                />
                {errors.priority && (
                  <span className={styles.errorText}>{errors.priority}</span>
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
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
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
                Create Task
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateTask;