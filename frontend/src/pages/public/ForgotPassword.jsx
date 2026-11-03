// pages/auth/ForgotPassword.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { toast, Toaster } from 'sonner';
import { FiArrowLeft } from 'react-icons/fi';
import TextInput from '../../components/ui/TextInput';
import Button from '../../components/ui/Button';
import Header from '../../components/Header';
import { usePrivateMutation } from '../../hooks/usePrivateMutation';
import styles from './styles/ForgotPassword.module.css';

const forgotSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
});

const ForgotPassword = () => {
  const [formData, setFormData] = useState({ email: '' });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    document.title = 'Forgot Password | Ant Cyber Portal';
  }, []);

  const { mutate: requestReset, isPending } = usePrivateMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success(
        'If an account exists for that email, a reset link has been sent.',
        { duration: 5000 }
      );
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          'Could not process your request. Please try again.',
        { duration: 4000 }
      );
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const result = forgotSchema.safeParse(formData);

    if (!result.success) {
      const formatted = {};
      result.error.issues.forEach((issue) => {
        formatted[issue.path[0]] = issue.message;
      });
      setErrors(formatted);
      toast.error('Please fix the highlighted field.');
      return;
    }

    setErrors({});
    requestReset({
      url: '/api/auth/forgot-password',
      method: 'POST',
      data: { email: result.data.email },
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
          <Link to="/login" className={styles.backLink}>
            <FiArrowLeft size={14} />
            <span>Back to login</span>
          </Link>

          <div className={styles.logoSection}>
            <div className={styles.logo}>
              <div className={styles.logoIcon}></div>
            </div>
            <span className={styles.logoText}>ANT CYBER</span>
          </div>

          {submitted ? (
            <div className={styles.successBlock}>
              <h1 className={styles.title}>Check your inbox</h1>
              <p className={styles.subtitle}>
                If an account exists for{' '}
                <strong>{formData.email}</strong>, you'll receive an email
                shortly with instructions to reset your password.
              </p>
              <p className={styles.subtitle}>
                Didn't receive it? Check your spam folder, or{' '}
                <button
                  type="button"
                  className={styles.linkButton}
                  onClick={() => setSubmitted(false)}
                >
                  try another email
                </button>
                .
              </p>
            </div>
          ) : (
            <>
              <div className={styles.headerSection}>
                <h1 className={styles.title}>Forgot password?</h1>
                <p className={styles.subtitle}>
                  Enter the email tied to your account and we'll send you a
                  link to reset your password.
                </p>
              </div>

              <form
                className={styles.form}
                onSubmit={handleSubmit}
                noValidate
              >
                <div className={styles.inputGroup}>
                  <TextInput
                    label="Corporate Email"
                    name="email"
                    type="email"
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    style={{
                      fontSize: '16px',
                      borderColor: errors.email ? '#e11d48' : '#d3d3d3',
                    }}
                  />
                  {errors.email && (
                    <span className={styles.errorText}>{errors.email}</span>
                  )}
                </div>

                <Button type="submit" isLoading={isPending}>
                  Send Reset Link
                </Button>
              </form>
            </>
          )}

          <p className={styles.footerText}>
            Remembered it?{' '}
            <Link to="/login" className={styles.footerLink}>
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;