// pages/auth/SetPassword.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { toast, Toaster } from 'sonner';
import { FiCheck, FiX } from 'react-icons/fi';
import PasswordInput from '../../components/ui/PasswordInput';
import Button from '../../components/ui/Button';
import Header from '../../components/Header';
import { usePrivateMutation } from '../../hooks/usePrivateMutation';
import styles from './styles/SetPassword.module.css';

// ----------------------------------------------------------------------------
// Password rules — kept identical to what backend's validatePassword expects
// (min 8 chars, at least 1 letter, 1 number). Adjust here + in auth.service
// if you tighten the rules.
// ----------------------------------------------------------------------------
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Za-z]/, 'Password must contain a letter')
  .regex(/[0-9]/, 'Password must contain a number');

const setPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const passwordRules = [
  { id: 'length', label: 'At least 8 characters', test: (v) => v.length >= 8 },
  { id: 'letter', label: 'Contains a letter', test: (v) => /[A-Za-z]/.test(v) },
  { id: 'number', label: 'Contains a number', test: (v) => /[0-9]/.test(v) },
];

const SetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    document.title = 'Set Password | Ant Cyber Portal';
  }, []);

  // Live password rule indicators
  const ruleStatus = useMemo(
    () =>
      passwordRules.map((rule) => ({
        ...rule,
        passed: rule.test(formData.password),
      })),
    [formData.password]
  );

  const { mutate: setPassword, isPending } = usePrivateMutation({
    onSuccess: () => {
      toast.success('Password set successfully. Please log in.', {
        duration: 4000,
      });
      setTimeout(() => navigate('/login', { replace: true }), 900);
    },
    onError: (error) => {
      const code = error?.response?.data?.code;
      const message = error?.response?.data?.message;

      if (code === 'TOKEN_EXPIRED') {
        toast.error(
          'This setup link has expired. Please request a new one.',
          { duration: 5000 }
        );
        return;
      }

      if (code === 'TOKEN_INVALID' || code === 'TOKEN_USED') {
        toast.error(
          'This setup link is invalid or has already been used.',
          { duration: 5000 }
        );
        return;
      }

      toast.error(message || 'Could not set password. Please try again.', {
        duration: 4000,
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!token) {
      toast.error('Missing setup token. Please use the link from your email.');
      return;
    }

    const result = setPasswordSchema.safeParse(formData);

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

    setPassword({
      url: '/api/auth/set-password',
      method: 'POST',
      data: {
        token,
        password: result.data.password,
      },
    });
  };

  // No token in URL — dead-end. Show a friendly redirect instead of a form.
  if (!token) {
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
            <div className={styles.headerSection}>
              <h1 className={styles.title}>Link is invalid</h1>
              <p className={styles.subtitle}>
                This page needs a valid setup link. Please open the link from
                your welcome email, or request a new one.
              </p>
            </div>
            <Link to="/forgot-password" className={styles.primaryLink}>
              Request a new link
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

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
          <div className={styles.logoSection}>
            <div className={styles.logo}>
              <div className={styles.logoIcon}></div>
            </div>
            <span className={styles.logoText}>ANT CYBER</span>
          </div>

          <div className={styles.headerSection}>
            <h1 className={styles.title}>Set your password</h1>
            <p className={styles.subtitle}>
              Create a secure password to activate your portal access.
            </p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={styles.inputGroup}>
              <PasswordInput
                label="New Password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                style={{
                  fontSize: '16px',
                  borderColor: errors.password ? '#e11d48' : '#d3d3d3',
                }}
              />
              {errors.password && (
                <span className={styles.errorText}>{errors.password}</span>
              )}

              {/* Live rule checklist */}
              <ul className={styles.rules}>
                {ruleStatus.map((rule) => (
                  <li
                    key={rule.id}
                    className={
                      rule.passed ? styles.rulePassed : styles.rulePending
                    }
                  >
                    {rule.passed ? (
                      <FiCheck size={14} />
                    ) : (
                      <FiX size={14} />
                    )}
                    <span>{rule.label}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.inputGroup}>
              <PasswordInput
                label="Confirm Password"
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    confirmPassword: e.target.value,
                  })
                }
                style={{
                  fontSize: '16px',
                  borderColor: errors.confirmPassword
                    ? '#e11d48'
                    : '#d3d3d3',
                }}
              />
              {errors.confirmPassword && (
                <span className={styles.errorText}>
                  {errors.confirmPassword}
                </span>
              )}
            </div>

            <Button type="submit" isLoading={isPending}>
              Set Password
            </Button>
          </form>

          <p className={styles.footerText}>
            Already set?{' '}
            <Link to="/login" className={styles.footerLink}>
              Go to login
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default SetPassword;