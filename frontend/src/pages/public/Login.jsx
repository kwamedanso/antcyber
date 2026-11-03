import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { toast, Toaster } from 'sonner';
import useAuth from '../../hooks/useAuth';
import TextInput from '../../components/ui/TextInput';
import PasswordInput from '../../components/ui/PasswordInput';
import CheckboxInput from '../../components/ui/CheckboxInput';
import Button from '../../components/ui/Button';
import { usePrivateMutation } from '../../hooks/usePrivateMutation';
import { usePrivateQuery } from '../../hooks/usePrivateQuery';
import { clearAxiosPrivateQueue } from '../../hooks/useAxiosPrivate';
import Header from '../../components/Header';
import styles from './styles/Login.module.css';

// Validation Schema using Zod
const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const initialEmail = location.state?.email || '';

  const [formData, setFormData] = useState({
    email: initialEmail,
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});

  const { auth, setAuth } = useAuth();

  const from = location.state?.from?.pathname || '/admin/dashboard';

  const { mutate: login, isPending } = usePrivateMutation({
    onSuccess: (data) => {
      setAuth({
        accessToken: data.accessToken,
        user: data.user,
        sessionId: data.sessionId,
        roles: data.payload.roles,
        permissions: data.payload.permissions,
      });
      navigate(from);
    },
    onError: (error, variables) => {
      const code = error?.response?.data?.code;

      // Forced password change — redirect with the credentials that just
      // validated so the user doesn't retype them.
      if (code === 'PASSWORD_CHANGE_REQUIRED') {
        toast.info('Please set a new password to continue.', { duration: 4000 });
        navigate('/forced-change-password', {
          replace: true,
          state: {
            email: variables.data.email,
            oldPassword: variables.data.password,
          },
        });
        return;
      }

      if (code === 'INVALID_CREDENTIALS') {
        toast.error(
          'Invalid credentials. Please check your email and password.',
          { duration: 4000 }
        );
        return;
      }

      if (code === 'ACCOUNT_LOCKED') {
        toast.error(error?.response?.data?.message || 'Login failed', {
          duration: 4000,
        });
        return;
      }

      if (code === 'ACCOUNT_DEACTIVATED') {
        toast.error(error?.response?.data?.message || 'Login failed', {
          duration: 4000,
        });
        return;
      }

      toast.error(error?.response?.data?.message || 'Login failed', {
        duration: 4000,
      });
    },
  });

  useEffect(() => {
    document.title = 'Login | Ant Cyber Portal';
  }, []);

  useEffect(() => {
    if (auth?.accessToken) {
      clearAxiosPrivateQueue();
      navigate(from, { replace: true });
    }
  }, [auth.accessToken, navigate, from]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationResult = loginSchema.safeParse(formData);

    if (!validationResult.success) {
      const formattedErrors = {};
      validationResult.error.issues.forEach((err) => {
        formattedErrors[err.path[0]] = err.message;
      });
      setErrors(formattedErrors);
      toast.error('Please resolve the errors in the form.');
      return;
    }

    setErrors({});

    try {
      login({
        url: '/api/auth/login',
        data: validationResult.data,
        method: 'POST',
      });
    } catch (error) {
      console.log(error);
    }
  };

  if (auth?.accessToken) {
    return null;
  }

  return (
    <>
      {/* <Toaster /> */}
      <Header />
    <div className={styles.pageWrapper}>

      <div className={styles.loginContainer}>
        {/* Ambient background effects */}
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
          {/* Brand */}
          <div className={styles.logoSection}>
            <div className={styles.logo}>
              <div className={styles.logoIcon}></div>
            </div>
            <span className={styles.logoText}>ANT CYBER</span>
          </div>

          {/* Heading */}
          <div className={styles.headerSection}>
            <h1 className={styles.title}>Welcome Back.</h1>
            <p className={styles.subtitle}>
              Access your institutional dashboard and AI tools.
            </p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            {/* Email */}
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

            {/* Password */}
            <div className={styles.inputGroup}>
              <PasswordInput
                label="Password"
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
            </div>

            {/* Remember me + forgot password */}
            <div className={styles.formOptions}>
              <CheckboxInput
                label="Keep me logged in"
                labelPlacement="left"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={(e) =>
                  setFormData({ ...formData, rememberMe: e.target.checked })
                }
              />
              <Link to="/forgot-password" className={styles.forgotLink}>
                Forgot Password?
              </Link>
            </div>

            <Button type="submit" isLoading={isPending}>
              Sign In to Portal
            </Button>
          </form>

          <p className={styles.footerText}>
            Don't have access?{' '}
            <Link to="/contact" className={styles.footerLink}>
              Contact Administrator
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
<Toaster position="top-right" richColors />
    </>
  );
};

export default Login;