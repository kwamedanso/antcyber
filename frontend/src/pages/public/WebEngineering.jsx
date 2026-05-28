import React, { useEffect } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { 
  LuLayoutGrid,
  LuMonitor,
  LuSmartphone,
  LuDatabase,
  LuChevronRight,
//   LuGlobe,
} from 'react-icons/lu';
import styles from '../public/styles/webEngineering.module.css';
import Footer from '../../components/Footer';
import Header from '../../components/Header';

const WebEngineering = () => {
  useEffect(() => {
    document.title = "Web & Digital Engineering | Ant Cyber Services";
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

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    hover: { y: -5, transition: { duration: 0.3 } }
  };

  const projectCardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
    hover: { 
      y: -10,
      boxShadow: '0 30px 60px -15px rgba(0,0,0,0.1)',
      transition: { duration: 0.3 }
    }
  };

  const roadmapStepVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
  };

  const techTags = [
    'React / Next.js',
    'Python & Django',
    'Cloud Infrastructure',
    'Headless CMS',
    'AI Integration',
    'WASM Performance'
  ];

  const coreServices = [
    {
      icon: LuMonitor,
      title: 'Enterprise Web Apps',
      description: 'Scalable, secure, and lightning-fast applications designed to handle high-traffic institutional loads and complex data structures.'
    },
    {
      icon: LuSmartphone,
      title: 'Progressive Web Apps',
      description: 'Native-like experiences delivered via the web. Offline capabilities, push notifications, and seamless installation across all devices.'
    },
    {
      icon: LuDatabase,
      title: 'API & Systems Design',
      description: 'Developing the backbone of your digital presence with robust, documented, and secure APIs that connect your entire stack.'
    }
  ];

  const roadmapSteps = [
    {
      title: 'Discovery',
      description: 'Technical audits, stakeholder interviews, and requirement gathering to align on your organization\'s unique digital objectives.',
      position: 'left'
    },
    {
      title: 'Architecture',
      description: 'Building the technical blueprint. We select the stack, design the database schema, and map out the user journey before writing a single line of production code.',
      position: 'right'
    },
    {
      title: 'Sprint Cycles',
      description: 'Agile development with bi-weekly updates. You see the progress in real-time on our staging environment, allowing for rapid feedback and iteration.',
      position: 'left'
    },
    {
      title: 'Launch & Scaling',
      description: 'Deployment across global CDN networks with automated scaling. We handle the technical heavy lifting of domain DNS, SSL certificates, and server optimization.',
      position: 'right'
    },
    {
      title: 'Managed Growth',
      description: 'Post-launch isn\'t the end. We provide ongoing maintenance, security patches, and iterative features based on actual user data.',
      position: 'left'
    }
  ];

  const projects = [
    {
      image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1200',
      category: 'Education',
      title: 'LMS Platform for HealthCore',
      description: 'A high-scale learning management system supporting over 50,000 active medical professionals with real-time progress tracking.',
      delay: 0
    },
    {
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200',
      category: 'Consulting',
      title: 'Digital Transformation Portal',
      description: 'Migrating legacy institutional infrastructure to a modern, cloud-native web experience without service interruption.',
      delay: 200
    }
  ];

  return (
    <>
    <Header />
    <div className={styles.webEngineering}>
      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.navContainer}>
          <a href="#" className={styles.navServices}>
            <LuLayoutGrid size={16} />
            <span className={styles.navServicesText}>Services</span>
          </a>
          <a href="#" className={styles.navHire}>
            Hire Us
          </a>
        </div>
      </nav>

      {/* Service Hero */}
      <header className={styles.hero}>
        <div className={styles.heroContainer}>
          <div className={styles.heroContent}>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className={styles.heroText}
            >
              <span className={styles.heroTag}>Capabilities</span>
              <h1 className={styles.heroTitle}>
                Web & Digital <br /><span className={styles.heroTitleLight}>Engineering.</span>
              </h1>
              <p className={styles.heroSubtitle}>
                We don't just build websites; we engineer high-performance digital ecosystems. From complex web applications to institutional platforms, we bridge the gap between technical complexity and intuitive user experience.
              </p>
              
              <div className={styles.techTags}>
                {techTags.map((tag, index) => (
                  <motion.span
                    key={index}
                    className={styles.techTag}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {tag}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
        <div className={styles.heroDecoration}></div>
      </header>

      {/* Core Services Grid */}
      <section className={styles.servicesSection}>
        <div className={styles.container}>
          <motion.div 
            className={styles.servicesGrid}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, threshold: 0.1 }}
            variants={staggerContainer}
          >
            {coreServices.map((service, index) => (
              <motion.div
                key={index}
                className={styles.serviceCard}
                variants={cardVariants}
                whileHover="hover"
              >
                <div className={styles.serviceIcon}>
                  <service.icon size={24} />
                </div>
                <h3 className={styles.serviceTitle}>{service.title}</h3>
                <p className={styles.serviceDescription}>{service.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Path to Launch (Roadmap) */}
      <section className={styles.roadmapSection}>
        <div className={styles.roadmapContainer}>
          <motion.div 
            className={styles.roadmapHeader}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, threshold: 0.1 }}
            variants={fadeInUp}
          >
            <h3 className={styles.roadmapTag}>The Process</h3>
            <h2 className={styles.roadmapTitle}>Path to Launch</h2>
          </motion.div>

          <div className={styles.roadmapTimeline}>
            <div className={styles.roadmapLine}></div>
            
            {roadmapSteps.map((step, index) => (
              <motion.div
                key={index}
                className={`${styles.roadmapStep} ${styles[step.position]}`}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, threshold: 0.1 }}
                variants={roadmapStepVariants}
                transition={{ delay: index * 0.1 }}
              >
                <div className={styles.roadmapDot}></div>
                <div className={styles.roadmapContent}>
                  <h4 className={styles.roadmapStepTitle}>{`0${index + 1}. ${step.title}`}</h4>
                  <p className={styles.roadmapStepDescription}>{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Relevant Projects */}
      <section className={styles.projectsSection}>
        <div className={styles.container}>
          <div className={styles.projectsHeader}>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, threshold: 0.1 }}
              variants={fadeInUp}
            >
              <h3 className={styles.projectsTag}>Case Studies</h3>
              <h2 className={styles.projectsTitle}>Digital in Action</h2>
            </motion.div>
            <motion.a
              href="#"
              className={styles.projectsLink}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, threshold: 0.1 }}
              variants={fadeInUp}
            >
              See All Projects <LuChevronRight size={16} />
            </motion.a>
          </div>

          <motion.div 
            className={styles.projectsGrid}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, threshold: 0.1 }}
            variants={staggerContainer}
          >
            {projects.map((project, index) => (
              <motion.div
                key={index}
                className={styles.projectCard}
                variants={projectCardVariants}
                whileHover="hover"
              >
                <img src={project.image} alt={project.title} className={styles.projectImage} />
                <div className={styles.projectContent}>
                  <span className={styles.projectCategory}>{project.category}</span>
                  <h4 className={styles.projectTitle}>{project.title}</h4>
                  <p className={styles.projectDescription}>{project.description}</p>
                  <a href="#" className={styles.projectLink}>View Case Study</a>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing / Consultation CTA */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContainer}>
          <motion.div 
            className={styles.ctaContent}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, threshold: 0.1 }}
            variants={fadeInUp}
          >
            <h2 className={styles.ctaTitle}>Ready to build?</h2>
            <p className={styles.ctaSubtitle}>
              Whether you need a specialized web app or a full-scale digital ecosystem, our engineering team is ready to deliver.
            </p>
            <div className={styles.ctaButtons}>
              <button className={styles.ctaPrimary}>Book a Technical Discovery</button>
              <button className={styles.ctaSecondary}>Download Pricing Sheet</button>
            </div>
          </motion.div>
          <div className={styles.ctaDecoration}></div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p className={styles.footerText}>&copy; 2024 Ant Cyber Engineering Limited. All rights reserved.</p>
      </footer>
    </div>
    <Footer />
    </>
  );
};

export default WebEngineering;