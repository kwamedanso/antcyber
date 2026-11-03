// pages/auth/Setup.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'sonner';
import { motion } from 'framer-motion';
import TextInput from '../../components/ui/TextInput';
import PasswordInput from '../../components/ui/PasswordInput';
import Button from '../../components/ui/Button';
import { usePrivateMutation } from '../../hooks/usePrivateMutation';
import styles from './styles/Setup.module.css';

const Setup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: ''
  });

  const { mutate: setupSystem, isPending } = usePrivateMutation({
    onSuccess: () => {
      toast.success('System initialized! Please log in.', { duration: 5000 });
      navigate('/login');
    },
    onError: (error) => {
            const code = error?.response?.data?.code;

            if (code === 'SUPER_ADMIN_ALREADY_EXIST') {
                    toast.error(
                      'A Super Admin User already exist navigate to the login page.',
                      { duration: 4000 }
                    );
                    return;
                  }
      // toast.error(error?.response?.data?.message || 'Setup failed.', { duration: 4000 });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_password) {
      return toast.error('Passwords do not match.');
    }
    setupSystem({
      url: '/api/setup/super-admin',
      method: 'POST',
      data: {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password
      }
    });
  };

  return (
    <div className={styles.pageWrapper}>
      <Toaster position="top-right" richColors />
      <motion.div 
        className={styles.card}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <header className={styles.header}>
          <h1 className={styles.title}>System Initialization</h1>
          <p className={styles.subtitle}>
            Create the first Super Admin account to configure the system.
          </p>
        </header>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.row}>
            <TextInput 
              label="First Name" 
              value={formData.first_name}
              onChange={(e) => setFormData(p => ({ ...p, first_name: e.target.value }))}
              required
            />
            <TextInput 
              label="Last Name" 
              value={formData.last_name}
              onChange={(e) => setFormData(p => ({ ...p, last_name: e.target.value }))}
              required
            />
          </div>

          <TextInput 
            label="Email Address" 
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
            required
          />

          <PasswordInput 
            label="Password" 
            value={formData.password}
            onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))}
            required
          />

          <PasswordInput 
            label="Confirm Password" 
            value={formData.confirm_password}
            onChange={(e) => setFormData(p => ({ ...p, confirm_password: e.target.value }))}
            required
          />

          <Button type="submit" isLoading={isPending}>
            Initialize System
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default Setup;