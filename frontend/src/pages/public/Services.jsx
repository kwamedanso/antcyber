import React, { useEffect } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { 
  FiCpu, 
  FiShield, 
  FiDatabase, 
  FiHeart, 
  FiUsers, 
  FiCheck, 
  FiArrowUpRight, 
  FiLayers,
  FiCloud,
  FiServer,
  FiCode,
  FiTerminal,
  FiZap,
  FiBox
} from 'react-icons/fi';
import { LuSprout } from "react-icons/lu";
import styles from '../public/styles/Services.module.css';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const Services = () => {
  useEffect(() => {
    document.title = "Our Services | Ant Cyber Engineering Limited";
  }, []);

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
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

  const serviceCardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } },
    hover: { 
      y: -8, 
      backgroundColor: 'white',
      boxShadow: '0 20px 40px -15px rgba(0,0,0,0.1)',
      borderColor: 'var(--primary-accent)',
      transition: { duration: 0.3 }
    }
  };

  const methodologyVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6 } }
  };

  const services = [
    {
      icon: FiCpu,
      iconBg: 'accent',
      title: 'AI Orchestration',
      description: "We don't just implement AI; we orchestrate it. From predictive analytics for supply chains to automated customer engagement, we build systems that learn and adapt.",
      features: ['Predictive Insights', 'NLP & Chatbot Systems', 'Workflow Automation']
    },
    {
      icon: FiShield,
      iconBg: 'dark',
      title: 'Cybersecurity',
      description: 'Protecting your digital assets with rigorous testing and compliance. We align with global standards like NIST and OWASP to ensure your data remains your own.',
      features: ['Penetration Testing', 'Security Audits', 'Risk Assessment']
    },
    {
      icon: FiDatabase,
      iconBg: 'accent',
      title: 'ERP & Infrastructure',
      description: 'Custom-built resource planning tools that manage your HR, payroll, and logistics in one unified dashboard, designed for operational excellence.',
      features: ['Custom HR Systems', 'Automated Payroll', 'Cloud Infrastructure']
    },
    {
      icon: LuSprout,
      iconBg: 'light',
      title: 'AgriTech Solutions',
      description: 'Specialized mobile platforms connecting farmers to markets. We use AI for crop monitoring and inclusive financial tool integration.',
      features: ['Farmer Portals', 'Supply Chain Tracking', 'AI Yield Prediction']
    },
    {
      icon: FiHeart,
      iconBg: 'accent',
      title: 'Health & EdTech',
      description: 'Scaling health diagnostics and digital libraries. We build platforms that make education and healthcare accessible anywhere.',
      features: ['E-Learning Platforms', 'Diagnostic Tools', 'Data Interoperability']
    },
    {
      icon: FiUsers,
      iconBg: 'dark',
      title: 'Tech Strategy',
      description: 'Expert consulting on digital governance, technology maturity, and executive leadership to ensure your digital roadmap is sound.',
      features: ['Digital Governance', 'Capacity Building', 'CIO Advisory']
    }
  ];

  const methodologySteps = [
    {
      number: '01',
      title: 'Discovery & Audit',
      description: 'We begin by understanding your current ecosystem, identifying gaps, and defining clear KPIs for transformation.'
    },
    {
      number: '02',
      title: 'Architect & Design',
      description: 'Our team builds scalable, human-centered blueprints that prioritize security and user inclusivity.'
    },
    {
      number: '03',
      title: 'Agile Deployment',
      description: 'Rapid implementation with continuous feedback loops ensuring the final product exceeds expectations.'
    }
  ];

  const techStack = ['Google Cloud', 'AWS', 'React', 'Python', 'FastAPI', 'PostgreSQL'];

  return (
    <>
    <Header />
    <div className={styles.services}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.blobBg}></div>
        <div className={styles.heroContainer}>
          <motion.div 
            className={styles.heroContent}
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <span className={styles.heroTag}>Our Expertise</span>
            <h1 className={styles.heroTitle}>
              Digital solutions <br />crafted for <span className={styles.italicText}>scale.</span>
            </h1>
            <p className={styles.heroSubtitle}>
              From AI orchestration to robust cybersecurity, we provide the technical foundations that empower organizations across Africa and the UK.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Detailed Services Grid */}
      <section className={styles.servicesGrid}>
        <div className={styles.container}>
          <motion.div 
            className={styles.servicesGridContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, threshold: 0.1 }}
            variants={staggerContainer}
          >
            {services.map((service, index) => (
              <motion.div
                key={index}
                className={`${styles.serviceCard} ${styles[`serviceCardDelay${index}`]}`}
                variants={serviceCardVariants}
                whileHover="hover"
                custom={index}
              >
                <div className={`${styles.serviceIcon} ${styles[`iconBg${service.iconBg}`]}`}>
                  <service.icon size={28} />
                </div>
                <h3 className={styles.serviceTitle}>{service.title}</h3>
                <p className={styles.serviceDescription}>{service.description}</p>
                <ul className={styles.serviceFeatures}>
                  {service.features.map((feature, idx) => (
                    <li key={idx} className={styles.serviceFeature}>
                      <FiCheck size={16} className={styles.checkIcon} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className={styles.serviceLink}>
                  <a href="#" className={styles.learnMore}>
                    Learn More <FiArrowUpRight size={16} />
                  </a>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Methodology Section */}
      <section className={styles.methodology}>
        <div className={styles.container}>
          <div className={styles.methodologyGrid}>
            <motion.div 
              className={styles.methodologyContent}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, threshold: 0.1 }}
              variants={fadeInUp}
            >
              <h2 className={styles.methodologyTitle}>
                How we deliver <br /><span className={styles.accentItalic}>exceptional</span> value.
              </h2>
              <div className={styles.methodologySteps}>
                {methodologySteps.map((step, index) => (
                  <motion.div 
                    key={index}
                    className={styles.methodologyStep}
                    variants={methodologyVariants}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className={styles.stepNumber}>{step.number}</div>
                    <div>
                      <h4 className={styles.stepTitle}>{step.title}</h4>
                      <p className={styles.stepDescription}>{step.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              className={styles.methodologyVisual}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, threshold: 0.1 }}
              variants={fadeInUp}
              transition={{ delay: 0.2 }}
            >
              <div className={styles.methodologyCard}>
                <div className={styles.methodologyCardOverlay}>
                  <FiLayers size={256} className={styles.methodologyIcon} />
                </div>
                <h3 className={styles.methodologyCardTitle}>Technology built with purpose, not just code.</h3>
                <p className={styles.methodologyCardSubtitle}>We ensure every line of code serves your organizational mission.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className={styles.techStack}>
        <div className={styles.container}>
          <motion.div 
            className={styles.techStackContent}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, threshold: 0.1 }}
            variants={fadeInUp}
          >
            <h3 className={styles.techStackTitle}>Our Technology Ecosystem</h3>
            <div className={styles.techStackGrid}>
              {techStack.map((tech, index) => (
                <motion.div 
                  key={index}
                  className={styles.techStackItem}
                  variants={fadeInUp}
                  transition={{ delay: index * 0.05 }}
                >
                  {tech === 'Google Cloud' && <FiCloud size={24} />}
                  {tech === 'AWS' && <FiServer size={24} />}
                  {tech === 'React' && <FiCode size={24} />}
                  {tech === 'Python' && <FiTerminal size={24} />}
                  {tech === 'FastAPI' && <FiZap size={24} />}
                  {tech === 'PostgreSQL' && <FiBox size={24} />}
                  <span className={styles.techStackName}>{tech}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
    <Footer />
    </>
  );
};

export default Services;