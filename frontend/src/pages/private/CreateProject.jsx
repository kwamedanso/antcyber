// pages/projects/CreateProject.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const CreateProject = () => {
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
    document.title = 'Create Project | Ant Cyber Portal';
  }, []);

  // --------------------------------------------------------------------------
  // All staff (searchable) — excludes already-selected members on the
  // server so the dropdown never shows someone twice.
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
    for (const id of formData.member_ids) {
      if (!seen.has(id)) {
        fetched.push({
          value: id,
          label: selectedMemberLabels[id] || id,
        });
        seen.add(id);
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
  // Create mutation
  // --------------------------------------------------------------------------
  const { mutate: createProject, isPending } = usePrivateMutation({
    targetQueryKey: ['projects'],
    onSuccess: () => {
      toast.success('Project created successfully.', { duration: 3500 });
      navigate('/admin/projects'); // Adjust route if needed
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          'Could not create the project. Please try again.',
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

    createProject({
      url: '/api/projects',
      method: 'POST',
      data: {
        name: result.data.name,
        description: result.data.description || null,
        member_ids: formData.member_ids,
      },
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
            <h1 className={styles.title}>Create Project</h1>
            <p className={styles.subtitle}>
              Set up a new project and invite your team. Fields marked with{' '}
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
                You'll be added as a member automatically.
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
                Create Project
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateProject;