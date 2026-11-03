// pages/auth/ForcedChangePassword.jsx
import React, { useEffect, useMemo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { toast, Toaster } from 'sonner';
import { FiCheck, FiX, FiLock } from 'react-icons/fi';
import PasswordInput from '../../components/ui/PasswordInput';
import Button from '../../components/ui/Button';
import Header from '../../components/Header';
import { usePrivateMutation } from '../../hooks/usePrivateMutation';
import styles from './styles/ForcedChangePassword.module.css';

// Password rules matching the backend requirements
const passwordRules = [
  { id: 'length', label: 'At least 8 characters', test: (v) => v.length >= 8 },
  { id: 'letter', label: 'Contains a letter', test: (v) => /[A-Za-z]/.test(v) },
  { id: 'number', label: 'Contains a number', test: (v) => /[0-9]/.test(v) },
];

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Za-z]/, 'Password must contain a letter')
  .regex(/[0-9]/, 'Password must contain a number');

const changePasswordSchema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const ForcedChangePassword = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve credentials passed from the Login page
  const email = location.state?.email;
  const oldPassword = location.state?.oldPassword;

  const [formData, setFormData] = React.useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = React.useState({});

  useEffect(() => {
    document.title = 'Set New Password | Ant Cyber Portal';
    
    // If the user navigates here directly without logging in first, kick them back
    if (!email || !oldPassword) {
      toast.error('Please log in first to change your password.');
      navigate('/login', { replace: true });
    }
  }, [email, oldPassword, navigate]);

  // Live password rule indicators
  const ruleStatus = useMemo(
    () =>
      passwordRules.map((rule) => ({
        ...rule,
        passed: rule.test(formData.newPassword),
      })),
    [formData.newPassword]
  );

  const { mutate: changePassword, isPending } = usePrivateMutation({
    onSuccess: () => {
      toast.success('Password set successfully. Please log in with your new password.', {
        duration: 5000,
      });
      navigate('/login', { replace: true });
    },
    onError: (error) => {
      const code = error?.response?.data?.code;
      const message = error?.response?.data?.message;

      if (code === 'NEW_PASSWORD_SAME') {
        toast.error('New password must be different from the old password.');
        return;
      }

      if (code === 'FORCED_CHANGE_NOT_REQUIRED') {
        toast.info('Your account does not require a password change. Please log in.');
        navigate('/login', { replace: true });
        return;
      }

      toast.error(message || 'Could not update password. Please try again.', {
        duration: 4000,
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const result = changePasswordSchema.safeParse(formData);

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

    changePassword({
      url: '/api/auth/force-change-password',
      method: 'POST',
      data: {
        email,
        oldPassword,
        newPassword: result.data.newPassword,
      },
    });
  };

  return (
    <div className={styles.pageWrapper}>
      <Header />
      <Toaster position="top-right" richColors />

      <div className={styles.loginContainer}>
        <div className={styles.backgroundEffects}>
          <div className={styles.bgBlob1}></div>
          <div className={styles.bgBlob2}></div>
        </div>

        <motion.div
          className={styles.formWrapper}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* <div className={styles.logoSection}>
            <div className={styles.logo}>
              <div className={styles.logoIcon}></div>
            </div>
            <span className={styles.logoText}>ANT CYBER</span>
          </div> */}

          <div className={styles.headerSection}>
            <div className={styles.iconWrapper}>
              <FiLock size={24} />
            </div>
            <h1 className={styles.title}>Update Password</h1>
            <p className={styles.subtitle}>
              For security reasons, you must change your default password before continuing.
            </p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={styles.inputGroup}>
              <PasswordInput
                label="New Password"
                name="newPassword"
                placeholder="••••••••"
                value={formData.newPassword}
                onChange={(e) =>
                  setFormData({ ...formData, newPassword: e.target.value })
                }
                style={{
                  fontSize: '16px',
                  borderColor: errors.newPassword ? '#e11d48' : '#d3d3d3',
                }}
              />
              {errors.newPassword && (
                <span className={styles.errorText}>{errors.newPassword}</span>
              )}

              {/* Live rule checklist */}
              <ul className={styles.rules}>
                {ruleStatus.map((rule) => (
                  <li
                    key={rule.id}
                    className={rule.passed ? styles.rulePassed : styles.rulePending}
                  >
                    {rule.passed ? <FiCheck size={14} /> : <FiX size={14} />}
                    <span>{rule.label}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.inputGroup}>
              <PasswordInput
                label="Confirm New Password"
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                style={{
                  fontSize: '16px',
                  borderColor: errors.confirmPassword ? '#e11d48' : '#d3d3d3',
                }}
              />
              {errors.confirmPassword && (
                <span className={styles.errorText}>{errors.confirmPassword}</span>
              )}
            </div>

            <Button type="submit" isLoading={isPending}>
              Update Password
            </Button>
          </form>

          <p className={styles.footerText}>
            <Link to="/login" className={styles.footerLink}>
              Back to login
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ForcedChangePassword;