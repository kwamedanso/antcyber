// pages/projects/EditProject.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { toast, Toaster } from 'sonner';
import { FiArrowLeft } from 'react-icons/fi';
import TextInput from '../../components/ui/TextInput';
import TextAreaInput from '../../components/ui/TextAreaInput';
import MultiSearchableSelect from '../../components/ui/MultiSearchableSelect';
import Button from '../../components/ui/Button';
import { usePrivateQuery } from '../../hooks/usePrivateQuery';
import { usePrivateMutation } from '../../hooks/usePrivateMutation';
import styles from './styles/ProjectForm.module.css';

const projectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'Project name must be at least 3 characters')
    .max(255, 'Project name is too long'),
  description: z
    .string()
    .trim()
    .max(5000, 'Description is too long')
    .optional()
    .or(z.literal('')),
  member_ids: z.array(z.string()).optional(),
});

const EditProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    member_ids: [],
  });
  const [errors, setErrors] = useState({});
  const [memberSearch, setMemberSearch] = useState('');
  
  // Remember { id -> label } for everyone the user selects, so chips keep
  // rendering names even after the option is removed from the fetch results.
  const [selectedMemberLabels, setSelectedMemberLabels] = useState({});

  useEffect(() => {
    document.title = 'Edit Project | Ant Cyber Portal';
  }, []);

  // --------------------------------------------------------------------------
  // Load the project being edited
  // --------------------------------------------------------------------------
  const {
    data: projectResponse,
    isLoading: projectLoading,
    isError: projectError,
  } = usePrivateQuery(
    ['projects', id],
    `/api/projects/${id}`,
    {},
    { enabled: Boolean(id), staleTime: 30_000 }
  );

  const project = projectResponse?.data ?? projectResponse ?? null;

  // Seed the form once the project is loaded
  useEffect(() => {
    if (!project) return;

    // Build initial label map from the project's existing members
    const labels = {};
    (project.members || []).forEach((m) => {
      labels[m.user_id] = m.full_name || m.email || m.user_id;
    });
    setSelectedMemberLabels(labels);

    setFormData({
      name: project.name || '',
      description: project.description || '',
      member_ids: (project.members || []).map((m) => m.user_id),
    });
  }, [project]);

  // --------------------------------------------------------------------------
  // All staff (searchable) — matches the CreateProject logic
  // --------------------------------------------------------------------------
  const excludeIdsCsv = formData.member_ids.join(',');

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
    const selected = new Set(formData.member_ids);

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
    for (const memberId of formData.member_ids) {
      if (!seen.has(memberId)) {
        fetched.push({
          value: memberId,
          label: selectedMemberLabels[memberId] || memberId,
        });
        seen.add(memberId);
      }
    }

    return fetched;
  }, [staffResponse, formData.member_ids, selectedMemberLabels]);

  // --------------------------------------------------------------------------
  // Handlers
  // --------------------------------------------------------------------------
  const handleMembersChange = (next) => {
    // Record labels for any newly-selected IDs before the exclude refetch
    // pulls them out of `memberOptions`.
    const newlySelected = next.filter(
      (id) => !formData.member_ids.includes(id)
    );

    if (newlySelected.length) {
      const labelMap = { ...selectedMemberLabels };
      for (const id of newlySelected) {
        const opt = memberOptions.find((o) => o.value === id);
        if (opt) labelMap[id] = opt.label;
      }
      setSelectedMemberLabels(labelMap);
    }

    setFormData((prev) => ({ ...prev, member_ids: next }));
  };

  // --------------------------------------------------------------------------
  // Update mutation
  // --------------------------------------------------------------------------
      const { mutate: updateProject, isPending } = usePrivateMutation({
    // Passing ['projects'] will refetch BOTH the list and the single project
    targetQueryKey: ['projects'], 
    onSuccess: () => {
      toast.success('Project updated successfully.', { duration: 3500 });
      navigate('/admin/projects');
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          'Could not update the project. Please try again.',
        { duration: 4000 }
      );
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const result = projectSchema.safeParse(formData);

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

    updateProject({
      url: `/api/projects/${id}`,
      method: 'PATCH',
      data: {
        name: result.data.name,
        description: result.data.description || null,
        member_ids: formData.member_ids,
      },
    });
  };

  // --------------------------------------------------------------------------
  // Loading / error states
  // --------------------------------------------------------------------------
  if (projectLoading && !project) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.pageContainer}>
          <div className={styles.stateCard}>
            <div className={styles.spinner} />
            <p className={styles.stateText}>Loading project…</p>
          </div>
        </div>
      </div>
    );
  }

  if (projectError || (!projectLoading && !project)) {
    return (
      <div className={styles.pageWrapper}>
        <Toaster position="top-right" richColors />
        <div className={styles.pageContainer}>
          <button
            type="button"
            className={styles.backButton}
            onClick={() => navigate('/admin/projects')}
          >
            <FiArrowLeft size={14} />
            <span>Back to projects</span>
          </button>
          <div className={styles.stateCard}>
            <h2 className={styles.stateTitle}>Project not found</h2>
            <p className={styles.stateText}>
              The project you're trying to edit doesn't exist or you no longer
              have access to it.
            </p>
            <Button onClick={() => navigate('/admin/projects')}>
              Go to Projects
            </Button>
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
            <h1 className={styles.title}>Edit Project</h1>
            <p className={styles.subtitle}>
              Update the project details or change the team. Fields marked with{' '}
              <span className={styles.required}>*</span> are required.
            </p>
          </header>

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <div className={styles.inputGroup}>
              <TextInput
                id="name"
                name="name"
                label="Project Name"
                placeholder="e.g. Q4 Marketing Campaign"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                style={{
                  fontSize: '15px',
                  borderColor: errors.name ? '#e11d48' : '#d3d3d3',
                }}
              />
              {errors.name && (
                <span className={styles.errorText}>{errors.name}</span>
              )}
            </div>

            <div className={styles.inputGroup}>
              <TextAreaInput
                id="description"
                name="description"
                label="Description"
                rows={5}
                placeholder="What is this project about?"
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

            <div className={styles.inputGroup}>
              <label className={styles.fieldLabel} htmlFor="member_ids">
                Team Members
              </label>
              <MultiSearchableSelect
                id="member_ids"
                label={undefined}
                placeholder="Search team members…"
                options={memberOptions}
                value={formData.member_ids}
                onChange={handleMembersChange}
                onSearchChange={setMemberSearch}
                isLoading={staffLoading}
                error={errors.member_ids}
              />
              {errors.member_ids && (
                <span className={styles.errorText}>{errors.member_ids}</span>
              )}
              <span className={styles.helperText}>
                The project creator is always kept as a member.
              </span>
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

export default EditProject;