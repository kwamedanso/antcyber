import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LuArrowLeft, 
  LuShieldAlert, 
  LuCloud, 
  LuFileCheck, 
  LuCheck,
  LuArrowRight
} from 'react-icons/lu';
import styles from './styles/CloudCybersecurity.module.css';
import Footer from '../../components/Footer';
import Header from '../../components/Header';

const CloudCybersecurity = () => {
  useEffect(() => {
    document.title = "Cloud & Cybersecurity Services | Ant Cyber";
  }, []);

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
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

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    hover: { 
      y: -8,
      borderColor: 'var(--primary-accent)',
      boxShadow: '0 20px 40px rgba(184, 204, 133, 0.12)',
      transition: { duration: 0.3 }
    }
  };

  const roadmapCardVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
    hover: { 
      y: -8,
      borderColor: 'var(--primary-accent)',
      boxShadow: '0 20px 40px rgba(184, 204, 133, 0.12)',
      transition: { duration: 0.3 }
    }
  };

  const capabilities = [
    {
      icon: LuShieldAlert,
      iconBg: 'accent',
      title: 'Penetration Testing',
      description: 'Ethical hacking and deep threat modeling designed to find systemic security vulnerabilities in web applications, APIs, and cloud perimeters before bad actors do.',
      features: ['Code Audits', 'System Spoofing', 'API Vulnerability Scanning']
    },
    {
      icon: LuCloud,
      iconBg: 'dark',
      title: 'Secure Cloud Migration',
      description: 'Transitioning legacy structures or databases safely into Amazon Web Services (AWS) or Google Cloud with zero operational downtime and hardened configurations.',
      features: ['Zero-Downtime Migration', 'Database Hardening', 'IAM Least Privilege Setup']
    },
    {
      icon: LuFileCheck,
      iconBg: 'accent',
      title: 'Compliance Audits',
      description: 'Comprehensive mapping to regulatory frameworks. We prep educational, banking, and clinical systems for strict privacy reviews and standard compliance.',
      features: ['NIST Compliance', 'OWASP Top-10 Audit', 'Employee Security Training']
    }
  ];

  const roadmapPhases = [
    {
      phase: '01',
      title: 'Discovery & Audit',
      description: 'We deep-scan your active servers, APIs, and cloud resources to build a comprehensive risk matrix mapping every possible point of compromise.',
      progress: '33%'
    },
    {
      phase: '02',
      title: 'Hardening & Remediate',
      description: 'Our cybersecurity architects actively patch application vulnerability points, restrict network access lists, and implement strict IAM privileges.',
      progress: '66%'
    },
    {
      phase: '03',
      title: 'Continuous Guard',
      description: 'Deploying 24/7 automated perimeter monitoring with real-time alerting systems, securing your systems against future emerging cyber threats.',
      progress: '100%'
    }
  ];

  const caseStudies = [
    {
      client: 'Ministry of Education, Ghana',
      title: 'E-Payment Security Architecture',
      description: 'Implemented rigorous penetration testing and cloud perimeters to secure a digital teachers\' allowance platform processing over thousands of banking records daily.',
      delay: 0
    },
    {
      client: 'Ministry of Health, Ghana',
      title: 'Kortext Deployment Cloud Audit',
      description: 'Configured secure cloud infrastructures and compliance paths to protect nationwide healthcare digital library access, ensuring strict access protocol controls.',
      delay: 200
    }
  ];

  const techTags = ['NIST Cyber Framework', 'OWASP Application Top 10', 'OSSTMM Auditing'];

  // Terminal animation lines
  const terminalLines = [
    '// Initializing threat scanning...',
    '✓ Integrity check: OSSTMM compliant',
    '✓ SSL / TLS: Grade A Handshake verified',
    '✓ Encryption: AES-256 active'
  ];

  return (
    <>
    <Header />
    <div className={styles.cloudSecurity}>
      {/* Back Navigation */}
      <nav className={styles.nav}>
        <div className={styles.navContainer}>
          <Link to="/services" className={styles.backLink}>
            <LuArrowLeft size={16} className={styles.backIcon} />
            <span className={styles.backText}>Our Capabilities</span>
          </Link>
          <Link to="/contact" className={styles.auditButton}>
            Request Audit
          </Link>
        </div>
      </nav>

      {/* Services Detail Hero */}
      <header className={styles.hero}>
        <div className={styles.gridPattern}></div>
        <div className={styles.heroContainer}>
          <div className={styles.heroGrid}>
            <motion.div 
              className={styles.heroContent}
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
            >
              <span className={styles.heroTag}>Critical Infrastructure</span>
              <h1 className={styles.heroTitle}>
                Resilient Cloud <br />& Cybersecurity.
              </h1>
              <p className={styles.heroSubtitle}>
                We build secure corporate perimeters and high-scale cloud environments. Guarding patient data, educational networks, and transaction platforms with uncompromising compliance standardizations.
              </p>
              <div className={styles.techTags}>
                {techTags.map((tag, index) => (
                  <span key={index} className={styles.techTag}>
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Interactive Visual Cyber Console */}
            <motion.div 
              className={styles.cyberConsole}
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: 0.2 }}
            >
              <div className={styles.console}>
                <div className={styles.consoleHeader}>
                  <div className={styles.consoleDots}>
                    <div className={styles.dotRed}></div>
                    <div className={styles.dotYellow}></div>
                    <div className={styles.dotGreen}></div>
                  </div>
                  <span className={styles.consoleTitle}>ACTIVE PORTAL SHIELD</span>
                </div>
                <div className={styles.consoleContent}>
                  {terminalLines.map((line, index) => (
                    <motion.p 
                      key={index}
                      className={line.includes('✓') ? styles.consoleSuccess : styles.consoleText}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + (index * 0.1) }}
                    >
                      {line}
                    </motion.p>
                  ))}
                  <div className={styles.consoleFooter}>
                    <div>
                      <p className={styles.perimeterLabel}>Perimeter Guard</p>
                      <p className={styles.perimeterValue}>Zero Breach</p>
                    </div>
                    <div className={styles.pulseDot}></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Core Capabilities Breakdown */}
      <section className={styles.capabilitiesSection}>
        <div className={styles.container}>
          <motion.div 
            className={styles.sectionHeader}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, threshold: 0.1 }}
            variants={fadeInUp}
          >
            <span className={styles.sectionTag}>Our Operations</span>
            <h2 className={styles.sectionTitle}>Full-Spectrum Cloud Protection.</h2>
            <p className={styles.sectionSubtitle}>How we keep institutional applications and digital assets completely secure.</p>
          </motion.div>

          <motion.div 
            className={styles.capabilitiesGrid}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, threshold: 0.1 }}
            variants={staggerContainer}
          >
            {capabilities.map((cap, index) => (
              <motion.div
                key={index}
                className={styles.capabilityCard}
                variants={cardVariants}
                whileHover="hover"
              >
                <div className={`${styles.cardIcon} ${styles[`iconBg${cap.iconBg}`]}`}>
                  <cap.icon size={24} />
                </div>
                <h3 className={styles.cardTitle}>{cap.title}</h3>
                <p className={styles.cardDescription}>{cap.description}</p>
                <ul className={styles.featuresList}>
                  {cap.features.map((feature, idx) => (
                    <li key={idx} className={styles.featureItem}>
                      <LuCheck size={16} className={styles.checkIcon} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Path to Hardened Defense (The Roadmap) */}
      <section className={styles.roadmapSection}>
        <div className={styles.roadmapContainer}>
          <motion.div 
            className={styles.roadmapHeader}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, threshold: 0.1 }}
            variants={fadeInUp}
          >
            <span className={styles.roadmapTag}>The Protection Roadmap</span>
            <h2 className={styles.roadmapTitle}>Path to Hardened Security</h2>
          </motion.div>

          <motion.div 
            className={styles.roadmapGrid}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, threshold: 0.1 }}
            variants={staggerContainer}
          >
            {roadmapPhases.map((phase, index) => (
              <motion.div
                key={index}
                className={styles.roadmapCard}
                variants={roadmapCardVariants}
                whileHover="hover"
              >
                <span className={styles.phaseNumber}>Phase {phase.phase}</span>
                <h3 className={styles.phaseTitle}>{phase.title}</h3>
                <p className={styles.phaseDescription}>{phase.description}</p>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill} 
                    style={{ width: phase.progress }}
                  ></div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Project Proof Points (Selected Cases) */}
      <section className={styles.casesSection}>
        <div className={styles.container}>
          <div className={styles.casesHeader}>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, threshold: 0.1 }}
              variants={fadeInUp}
            >
              <span className={styles.sectionTag}>Selected Success Cases</span>
              <h2 className={styles.casesTitle}>Security in Action.</h2>
            </motion.div>
          </div>

          <motion.div 
            className={styles.casesGrid}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, threshold: 0.1 }}
            variants={staggerContainer}
          >
            {caseStudies.map((study, index) => (
              <motion.div
                key={index}
                className={styles.caseCard}
                variants={cardVariants}
                whileHover="hover"
              >
                <span className={styles.caseClient}>{study.client}</span>
                <h4 className={styles.caseTitle}>{study.title}</h4>
                <p className={styles.caseDescription}>{study.description}</p>
                <Link to="#" className={styles.caseLink}>
                  Explore Case Study <LuArrowRight size={16} />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Final Consultation Call To Action */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <motion.div 
            className={styles.ctaCard}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, threshold: 0.1 }}
            variants={fadeInUp}
          >
            <div className={styles.ctaContent}>
              <h2 className={styles.ctaTitle}>Ready to Harden Your <br />Digital Perimeter?</h2>
              <p className={styles.ctaSubtitle}>
                Secure your system, standardize under global protocols, and deploy resilient cloud pipelines. Get a direct architectural security evaluation.
              </p>
              <div className={styles.ctaButtons}>
                <button className={styles.ctaPrimary}>Schedule Cloud/Security Audit</button>
                <button className={styles.ctaSecondary}>Our Compliance Specs</button>
              </div>
            </div>
            <div className={styles.ctaDecoration}></div>
          </motion.div>
        </div>
      </section>
    </div>
    <Footer />
    </>
  );
};

export default CloudCybersecurity;