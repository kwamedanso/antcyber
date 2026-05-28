import React, { useEffect, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { LuArrowRight } from 'react-icons/lu';
import styles from '../public/styles/Projects.module.css';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import { Link } from 'react-router-dom';

const Projects = () => {
  useEffect(() => {
    document.title = "Our Projects | Ant Cyber Engineering Limited";
  }, []);

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } }
  };

  const projects = [
    {
      id: '01',
      tag: 'AI & Analytics',
      title: 'Multi-Model AI Comparison',
      description: 'Our proprietary AI solution allowing real-time comparison of outputs from multiple models to empower smarter decision-making. We built this to solve the "black box" problem in institutional AI adoption.',
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1200',
      ctaText: 'Discover Solution',
      reverse: false,
      buttonBg: 'accent'
    },
    {
      id: '02',
      tag: 'Education',
      title: 'Institutional Digital Shift',
      description: 'Bridging the digital divide by implementing scalable LMS platforms and AI-powered learning analytics that provide educators with unprecedented insight into student engagement and success metrics.',
      image: 'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?auto=format&fit=crop&q=80&w=1200',
      ctaText: 'View Case Study',
      reverse: true,
      buttonBg: 'dark'
    },
    {
      id: '03',
      tag: 'HealthTech',
      title: 'Clinical Training Ecosystem',
      description: 'A comprehensive CPD ecosystem designed for medical practitioners. We utilize virtual simulations and automated certification tracking to ensure professional standards are met with zero friction.',
      image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1200',
      ctaText: 'Learn More',
      reverse: false,
      buttonBg: 'accent'
    },
    {
      id: '04',
      tag: 'Strategic Integration',
      title: 'Kortext Digital Services',
      description: 'Collaborating on specialized digital services that distribute interactive academic resources globally. Our focus remains on the seamless integration of AI within the digital reading experience.',
      image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=1200',
      ctaText: 'Case Details',
      reverse: true,
      buttonBg: 'dark'
    },
    {
      id: '05',
      tag: 'Training',
      title: 'AI Governance Training',
      description: 'Empowering C-suite executives with the technical and ethical governance frameworks required to manage predictive analytics and Generative AI at scale.',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1200',
      ctaText: 'Program Info',
      reverse: false,
      buttonBg: 'accent'
    },
    {
      id: '06',
      tag: 'Consulting',
      title: 'Infrastructure Audit',
      description: 'A rigorous approach to infrastructure health. We conduct deep-dive audits into existing digital ecosystems to ensure they are ready for future AI deployments and high-traffic loads.',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200',
      ctaText: 'Request Audit',
      reverse: true,
      buttonBg: 'dark'
    }
  ];

  const ProjectSection = ({ project, index }) => {
    const controls = useAnimation();
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, threshold: 0.1 });

    useEffect(() => {
      if (isInView) {
        controls.start('visible');
      }
    }, [controls, isInView]);

    const imageVariants = {
      hidden: { scale: 1 },
      visible: { scale: 1.05, transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } }
    };

    return (
      <section className={`${styles.projectSection} ${project.reverse ? styles.reverse : ''}`}>
        <div className={styles.stickyVisual}>
          <motion.div
            className={styles.visualContainer}
            variants={imageVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.3 }}
          >
            <img src={project.image} alt={project.title} />
          </motion.div>
        </div>
        <motion.div
          ref={ref}
          className={styles.projectContent}
          initial="hidden"
          animate={controls}
          variants={fadeInUp}
        >
          <span className={styles.projectNumber}>{project.id}</span>
          <span className={styles.tagPill}>{project.tag}</span>
          <h2 className={styles.projectTitle}>{project.title}</h2>
          <p className={styles.projectDescription}>{project.description}</p>
          <Link to={`/projects/${project.id}`} className={styles.projectLink}>
            <div className={`${styles.linkIcon} ${styles[`linkIconBg${project.buttonBg}`]}`}>
              <LuArrowRight size={24} />
            </div>
            <span className={styles.linkText}>{project.ctaText}</span>
          </Link>
        </motion.div>
      </section>
    );
  };

  return (
    <>
      <Header />
      <div className={styles.projects}>
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
              <span className={styles.heroTag}>Portfolio</span>
              <h1 className={styles.heroTitle}>
                Impactful tech <br /><span className={styles.italicText}>built for change.</span>
              </h1>
              <p className={styles.heroSubtitle}>
                Explore our track record of implementing cutting-edge technology in the Health and Education sectors. Our projects range from proprietary AI platforms to specialized professional development tools.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Sticky Project Showcase */}
        <div className={styles.projectsContainer}>
          {projects.map((project, index) => (
            <ProjectSection key={project.id} project={project} index={index} />
          ))}
        </div>

        {/* Call to Action Section */}
        <section className={styles.cta}>
          <div className={styles.ctaContainer}>
            <motion.div
              className={styles.ctaContent}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, threshold: 0.1 }}
              variants={fadeInUp}
            >
              <h2 className={styles.ctaTitle}>Have a project in mind?</h2>
              <p className={styles.ctaSubtitle}>
                Let's collaborate to implement cutting-edge AI and digital solutions for your organization.
              </p>
              <div className={styles.ctaButtons}>
                <Link to="/contact" className={styles.ctaPrimary}>Start a Conversation</Link>
                <Link to="/about" className={styles.ctaSecondary}>About Us</Link>
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

export default Projects;