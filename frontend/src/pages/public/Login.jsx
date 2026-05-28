import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LuArrowRight, LuEye, LuEyeOff, LuShield, LuCpu, LuGlobe} from 'react-icons/lu';
import { FcGoogle } from 'react-icons/fc';
import styles from './styles/Login.module.css';
import Header from '../../components/Header';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = "Login | Ant Cyber Portal";
  }, []);

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.8, 
        ease: [0.16, 1, 0.3, 1] 
      } 
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const bentoItemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      transition: { duration: 0.5 } 
    },
    hover: { 
      borderColor: 'var(--primary-accent)',
      background: 'rgba(255, 255, 255, 0.06)',
      transition: { duration: 0.3 }
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    // Simulate API call
    setTimeout(() => {
      // For demo purposes, accept any email/password
      console.log('Login attempt:', formData);
      setIsLoading(false);
      
      // Redirect to dashboard or home page
      // navigate('/dashboard');
    }, 1500);
  };

  const handleSSOLogin = () => {
    setIsLoading(true);
    // Simulate SSO login
    setTimeout(() => {
      console.log('SSO Login attempt');
      setIsLoading(false);
      navigate('/dashboard');
    }, 1500);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
    <Header />
    <div className={styles.loginContainer}>
      {/* Left Side: Login Form */}
      <main className={styles.loginForm}>
        <div className={styles.formWrapper}>
          <motion.div 
            className={styles.logoSection}
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <div className={styles.logo}>
              <div className={styles.logoIcon}></div>
            </div>
            <span className={styles.logoText}>ANT CYBER</span>
          </motion.div>

          <motion.div 
            className={styles.headerSection}
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ delay: 0.1 }}
          >
            <h1 className={styles.title}>Welcome Back.</h1>
            <p className={styles.subtitle}>Access your institutional dashboard and AI tools.</p>
          </motion.div>

          <motion.form 
            className={styles.form}
            onSubmit={handleSubmit}
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {error && (
              <motion.div 
                className={styles.errorMessage}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
              </motion.div>
            )}

            <motion.div className={styles.inputGroup} variants={fadeInUp}>
              <label className={styles.inputLabel}>Corporate Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="name@company.com"
                className={styles.inputField}
                disabled={isLoading}
              />
            </motion.div>

            <motion.div className={styles.inputGroup} variants={fadeInUp}>
              <div className={styles.passwordHeader}>
                <label className={styles.inputLabel}>Password</label>
                <Link to="/forgot-password" className={styles.forgotLink}>
                  Forgot?
                </Link>
              </div>
              <div className={styles.passwordWrapper}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className={styles.inputField}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className={styles.eyeButton}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <LuEyeOff size={16} /> : <LuEye size={16} />}
                </button>
              </div>
            </motion.div>

            <motion.div className={styles.checkboxGroup} variants={fadeInUp}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className={styles.checkbox}
                  disabled={isLoading}
                />
                <span className={styles.checkboxText}>Keep me logged in for 30 days</span>
              </label>
            </motion.div>

            <motion.button
              type="submit"
              className={styles.submitButton}
              variants={fadeInUp}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className={styles.spinner}></div>
              ) : (
                <>
                  Sign In to Portal <LuArrowRight size={16} />
                </>
              )}
            </motion.button>

            {/* <motion.button
              type="button"
              onClick={handleSSOLogin}
              className={styles.ssoButton}
              variants={fadeInUp}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
            >
              <FcGoogle size={20} />
              Continue with SSO
            </motion.button> */}
          </motion.form>

          <motion.p 
            className={styles.footerText}
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ delay: 0.3 }}
          >
            Don't have access? <Link to="/contact" className={styles.footerLink}>Contact Administrator</Link>
          </motion.p>
        </div>
      </main>

      {/* Right Side: Visual/Bento */}
      <aside className={styles.visualSide}>
        {/* Abstract Background */}
        <div className={styles.backgroundEffects}>
          <div className={styles.bgBlob1}></div>
          <div className={styles.bgBlob2}></div>
        </div>

        <div className={styles.bentoGrid}>
          {/* Large Focus Box */}
          <motion.div 
            className={`${styles.bentoBox} ${styles.bentoLarge}`}
            variants={bentoItemVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
          >
            <LuShield size={48} className={styles.bentoIcon} />
            <h3 className={styles.bentoTitle}>Enterprise Grade</h3>
            <p className={styles.bentoDescription}>
              Every connection is encrypted and monitored 24/7 by our neural security engine.
            </p>
          </motion.div>

          {/* Stats Box */}
          <motion.div 
            className={`${styles.bentoBox} ${styles.bentoStats} ${styles.accentBg}`}
            variants={bentoItemVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
          >
            <span className={styles.statsNumber}>99.9</span>
            <span className={styles.statsLabel}>Uptime SLA</span>
          </motion.div>

          {/* Icon Box */}
          <motion.div 
            className={`${styles.bentoBox} ${styles.bentoIconBox}`}
            variants={bentoItemVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
          >
            <LuCpu size={40} className={styles.iconPlaceholder} />
          </motion.div>

          {/* Map/Global Box */}
          <motion.div 
            className={`${styles.bentoBox} ${styles.bentoMap}`}
            variants={bentoItemVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
          >
            <div className={styles.globeIcon}>
              <LuGlobe size={24} className={styles.globeIconInner} />
            </div>
            <h4 className={styles.globeTitle}>Global Presence</h4>
            <p className={styles.globeText}>24 Edge locations active.</p>
          </motion.div>

          {/* Activity Box */}
          <motion.div 
            className={`${styles.bentoBox} ${styles.bentoActivity}`}
            variants={bentoItemVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
          >
            <div className={styles.statusDot}></div>
            <span className={styles.statusText}>Systems Operational</span>
          </motion.div>

          {/* Bottom Wide Box */}
          <motion.div 
            className={`${styles.bentoBox} ${styles.bentoQuote}`}
            variants={bentoItemVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
          >
            <p className={styles.quoteText}>"The future of engineering is collaborative AI."</p>
          </motion.div>
        </div>

        {/* Floating Footer Info */}
        <div className={styles.footerInfo}>
          <span>© 2024 ANT CYBER</span>
          <span>SYSTEM_V2.0.48</span>
        </div>
      </aside>
    </div>
    </>
  );
};

export default Login;