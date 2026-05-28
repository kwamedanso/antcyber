import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LuArrowLeft, 
  LuBriefcase, 
  LuMail,
} from 'react-icons/lu';
import { CiHome } from "react-icons/ci";

import styles from '../public/styles/NotFound.module.css';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const NotFound = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "404 - Page Not Found | Ant Cyber";
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
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const bentoItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.5 } 
    },
    hover: { 
      y: -5,
      borderColor: 'var(--primary-accent)',
      boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
      transition: { duration: 0.3 }
    }
  };

  const floatingAnimation = {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "loop"
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const quickLinks = [
    {
      icon: LuBriefcase,
      title: 'Services',
      description: 'What we do',
      path: '/services'
    },
    {
      icon: LuMail,
      title: 'Support',
      description: 'Get in touch',
      path: '/contact'
    }
  ];

  return (
    <>
    <Header />
    <main className={styles.notFound}>
      {/* Decorative background elements */}
      <div className={styles.bgDecoration1}></div>
      <div className={styles.bgDecoration2}></div>

      <div className={styles.container}>
        <div className={styles.content}>
          {/* Glitch / Error Code Section */}
          <motion.div 
            className={styles.glitchWrapper}
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <h1 className={styles.errorCode}>404</h1>
            <motion.div 
              className={styles.errorOverlay}
              animate={floatingAnimation}
            >
              <span className={styles.errorTitle}>Lost in the System.</span>
            </motion.div>
          </motion.div>

          <motion.p 
            className={styles.errorMessage}
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ delay: 0.2 }}
          >
            The page you are looking for has been moved, deleted, or never existed in our digital ecosystem. Let's get you back on track.
          </motion.p>

          {/* Action Buttons */}
          <motion.div 
            className={styles.actionButtons}
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp}>
              <Link to="/" className={styles.primaryButton}>
                <CiHome size={16} /> Return Home
              </Link>
            </motion.div>
            <motion.div variants={fadeInUp}>
              <button onClick={handleGoBack} className={styles.secondaryButton}>
                <LuArrowLeft size={16} /> Go Back
              </button>
            </motion.div>
          </motion.div>

          {/* Quick Navigation Bento */}
          <motion.div 
            className={styles.bentoGrid}
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {quickLinks.map((link, index) => (
              <motion.div
                key={index}
                variants={bentoItemVariants}
                whileHover="hover"
              >
                <Link to={link.path} className={styles.bentoItem}>
                  <link.icon size={24} className={styles.bentoIcon} />
                  <h3 className={styles.bentoTitle}>{link.title}</h3>
                  <p className={styles.bentoDescription}>{link.description}</p>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </main>
    <Footer />
    </>
  );
};

export default NotFound;