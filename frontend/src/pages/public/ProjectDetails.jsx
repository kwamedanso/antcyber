import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import {
  LuArrowLeft,
  LuShieldCheck,
  LuActivity,
  LuLock,
  LuEye,
  LuCpu,
} from 'react-icons/lu';
import styles from '../public/styles/ProjectDetails.module.css';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import { Link } from 'react-router-dom';

const ProjectDetails = () => {
  const [scrolled, setScrolled] = useState(0);
  const heroImageRef = useRef(null);

  useEffect(() => {
    document.title = "Multi-Model AI Comparison | Project Details";

    const handleScroll = () => {
      setScrolled(window.pageYOffset);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
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

  const statCardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
  };

  const approachCardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
    hover: {
      y: -10,
      borderColor: 'var(--primary-accent)',
      boxShadow: '0 20px 40px rgba(184, 204, 133, 0.15)',
      transition: { duration: 0.3 }
    }
  };

  const galleryItemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.6 } },
    hover: { scale: 1.02, transition: { duration: 0.3 } }
  };

  const projectStats = [
    { label: 'Client', value: 'HealthCore Global' },
    { label: 'Industry', value: 'Medical Technology' },
    { label: 'Timeline', value: '6 Months' },
    { label: 'Services', value: 'AI Architecture, UI/UX' }
  ];

  const approachSteps = [
    {
      title: 'Unified API Layer',
      description: 'We engineered a robust middleware that standardizes complex prompts across four distinct AI architectures simultaneously, ensuring uniform testing environments.',
      icon: LuCpu
    },
    {
      title: 'Conflict Detection',
      description: 'An automated divergence detection system that flags discrepancies between model outputs, prioritizing high-risk variations for human expert review.',
      icon: LuActivity
    },
    {
      title: 'Privacy-First Core',
      description: 'Localized data anonymization protocols ensure zero patient-identifiable information leaks to public training sets while maintaining context integrity.',
      icon: LuLock
    }
  ];

  const impactStats = [
    { value: '40%', label: 'Reduction in Diagnostic Review Time' },
    { value: '100%', label: 'HIPAA Compliance Adherence' },
    { value: '2.4x', label: 'Increase in Staff AI Tool Usage' }
  ];

  const galleryImages = [
    {
      src: 'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?auto=format&fit=crop&q=80&w=1200',
      title: 'Comparative Analysis Dashboard',
      category: 'Interface',
      span: 'large'
    },
    {
      src: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800',
      title: 'Response Loop Tracking',
      category: 'Detail',
      span: 'small'
    },
    {
      src: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1000',
      title: 'Latency Monitoring',
      category: 'Back-end',
      span: 'medium'
    },
    {
      src: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1400',
      title: 'Encryption Protocols',
      category: 'Security',
      span: 'wide'
    }
  ];

  return (
    <>
      <Header />
      <div className={styles.projectDetails}>
        {/* Back Navigation */}
        {/* <nav className={styles.nav}>
        <a href="#" className={styles.backLink}>
          <LuArrowLeft size={16} className={styles.backIcon} />
          <span className={styles.backText}>All Projects</span>
        </a>
      </nav> */}

        {/* Cinematic Project Hero */}
        <header className={styles.hero}>
          <div className={styles.heroImageContainer}>
            <motion.img
              ref={heroImageRef}
              src="https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=2000"
              className={styles.heroImage}
              alt="Hero Background"
              style={{ transform: `translateY(${scrolled * 0.3}px)` }}
            />
            <div className={styles.heroGradient}></div>
          </div>
          <div className={styles.heroContent}>
            <div className={styles.heroContainer}>
              <span className={styles.heroTag}>AI & Analytics</span>
              <h1 className={styles.heroTitle}>
                Multi-Model <br />AI Comparison.
              </h1>
              <p className={styles.heroSubtitle}>
                A proprietary benchmarking engine designed to solve the transparency crisis in institutional AI adoption.
              </p>
            </div>
          </div>
        </header>

        {/* Project Meta Detail */}
        <section className={styles.metaSection}>
          <div className={styles.container}>
            <div className={styles.statsGrid}>
              {projectStats.map((stat, index) => (
                <div key={index} className={styles.statItem}>
                  <span className={styles.statLabel}>{stat.label}</span>
                  <span className={styles.statValue}>{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Deep Dive Content */}
        <section className={styles.deepDive}>
          <div className={styles.container}>
            <div className={styles.deepDiveGrid}>
              <motion.div
                className={styles.challengeContent}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, threshold: 0.1 }}
                variants={fadeInUp}
              >
                <h3 className={styles.sectionTag}>The Challenge</h3>
                <h2 className={styles.challengeTitle}>Trust through <br />verifiable data.</h2>
                <p className={styles.challengeText}>
                  Our client faced a critical roadblock: their medical staff was hesitant to trust AI-generated diagnostic summaries. With multiple LLMs available, there was no objective way to verify accuracy or bias across different patient demographics.
                </p>
                <p className={styles.challengeText}>
                  They needed a tool that didn't just provide an answer, but showed the "work" behind it, comparing outputs from GPT-4, Claude, and proprietary medical models in a single unified dashboard.
                </p>
              </motion.div>

              <motion.div
                className={styles.integrityCard}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, threshold: 0.1 }}
                variants={fadeInUp}
                transition={{ delay: 0.2 }}
              >
                <LuShieldCheck size={80} className={styles.integrityIcon} />
                <h4 className={styles.integrityTitle}>Integrity First</h4>
                <p className={styles.integrityText}>
                  We focused on building a "Human-in-the-loop" architecture where AI assists but never overrides clinical judgement without explicit verification.
                </p>
              </motion.div>
            </div>

            {/* Our Approach Section */}
            <motion.div
              className={styles.approachSection}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, threshold: 0.1 }}
              variants={fadeInUp}
            >
              <h3 className={`${styles.sectionTag} ${styles.approachTag}`}>Our Approach</h3>
              <motion.div
                className={styles.approachGrid}
                variants={staggerContainer}
              >
                {approachSteps.map((step, index) => (
                  <motion.div
                    key={index}
                    className={styles.approachCard}
                    variants={approachCardVariants}
                    whileHover="hover"
                  >
                    <step.icon size={32} className={styles.approachIcon} />
                    <span className={styles.approachNumber}>0{index + 1} / {index === 0 ? 'ARCHITECT' : index === 1 ? 'ANALYZE' : 'SECURE'}</span>
                    <h4 className={styles.approachTitle}>{step.title}</h4>
                    <p className={styles.approachDescription}>{step.description}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Image Showcase Gallery */}
        <section className={styles.gallerySection}>
          <div className={styles.galleryContainer}>
            <div className={styles.galleryHeader}>
              <motion.div
                className={styles.galleryHeaderContent}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, threshold: 0.1 }}
                variants={fadeInUp}
              >
                <h3 className={styles.galleryTag}>Visual System</h3>
                <h2 className={styles.galleryTitle}>The Interface of Insight.</h2>
              </motion.div>
              <motion.p
                className={styles.galleryDescription}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, threshold: 0.1 }}
                variants={fadeInUp}
                transition={{ delay: 0.1 }}
              >
                A visual journey through the design and technical architecture of the benchmarking engine.
              </motion.p>
            </div>

            <motion.div
              className={styles.galleryGrid}
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, threshold: 0.1 }}
            >
              {galleryImages.map((image, index) => (
                <motion.div
                  key={index}
                  className={`${styles.galleryItem} ${styles[`span${image.span}`]}`}
                  variants={galleryItemVariants}
                  whileHover="hover"
                >
                  <img src={image.src} alt={image.title} />
                  <div className={styles.imageOverlay}>
                    <div className={styles.overlayContent}>
                      <p className={styles.overlayCategory}>{image.category}</p>
                      <h4 className={styles.overlayTitle}>{image.title}</h4>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Results Section */}
        <section className={styles.resultsSection}>
          <div className={styles.container}>
            <motion.div
              className={styles.resultsContent}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, threshold: 0.1 }}
              variants={fadeInUp}
            >
              <span className={styles.resultsTag}>The Impact</span>
              <h2 className={styles.resultsTitle}>Trust established through <br />radical transparency.</h2>
              <motion.div
                className={styles.resultsGrid}
                variants={staggerContainer}
              >
                {impactStats.map((stat, index) => (
                  <motion.div key={index} className={styles.resultCard} variants={statCardVariants}>
                    <span className={styles.resultValue}>{stat.value}</span>
                    <p className={styles.resultLabel}>{stat.label}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={styles.ctaSection}>
          <div className={styles.ctaContainer}>
            <motion.div
              className={styles.ctaContent}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, threshold: 0.1 }}
              variants={fadeInUp}
            >
              <h2 className={styles.ctaTitle}>Ready for a similar shift?</h2>
              <p className={styles.ctaSubtitle}>
                Let's collaborate to implement cutting-edge AI and digital solutions for your organization.
              </p>
              <div className={styles.ctaButtons}>
                <Link to="/Contact" className={styles.ctaPrimary}>Start a Conversation</Link>
                <Link to="/services" className={styles.ctaSecondary}>Our Services</Link>
              </div>
            </motion.div>
          </div>
          <div className={styles.ctaBackground}>
            <svg className={styles.ctaSvg} viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0,0 L100,0 L100,100 L50,100 Z" fill="url(#grad)" />
              <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: 'var(--primary-accent)', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: 'black', stopOpacity: 1 }} />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default ProjectDetails;