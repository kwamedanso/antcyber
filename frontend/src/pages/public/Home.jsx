import React, { useEffect } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import {
  LuZap,
  LuShieldCheck,
  LuGlobe,
  LuAward,
  LuLaptop,
  LuLayers,
  LuPlay,
  LuStar,
  LuArrowRight,
} from 'react-icons/lu';
import { IoBarChartOutline } from "react-icons/io5";
import { FaRegCheckCircle, FaUsers } from "react-icons/fa";
import styles from '../public/styles/Home.module.css';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import { FaAws } from "react-icons/fa";
import { FcGlobe } from "react-icons/fc";



const Home = () => {
  useEffect(() => {
    document.title = "Ant Cyber | Institutional AI & Digital Engineering";
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

  const bentoItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    hover: {
      borderColor: 'var(--primary-accent)',
      boxShadow: '0 20px 40px rgba(0,0,0,0.03)',
      transition: { duration: 0.3 }
    }
  };

  const serviceCardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    hover: {
      backgroundColor: 'var(--primary-accent)',
      scale: 1.02,
      transition: { duration: 0.3 }
    }
  };

  const blogCardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    hover: { scale: 1.02, transition: { duration: 0.3 } }
  };

  const marqueeItems = ['Google Cloud', 'AWS', 'Auraicons', 'Nexmark', 'Logolaze', 'Primeark'];

  const services = [
    { icon: LuLaptop, title: 'Web Development', description: 'Responsive, user-centric websites built with modern frameworks to deliver performance and brand impact.' },
    { icon: IoBarChartOutline, title: 'Data Analytics', description: 'Transform raw data into actionable insights that drive smarter decisions and business innovation.' },
    { icon: LuLayers, title: 'Cloud Architecture', description: 'Strategic guidance to align your technology stack with long-term business objectives and security.' }
  ];

  const advantages = [
    'Tailored Solutions',
    'Scalable & Future-Ready',
    'Client-Centric Approach'
  ];

  const features = [
    { title: 'Seamless Integration', description: 'Committing to the highest standards in our products to ensure your stack works in perfect harmony.' },
    { title: 'Insightful Analytics', description: 'Continuously evolving to meet challenges and opportunities with data-backed strategies.' },
    { title: 'Effortless Collaboration', description: 'Focusing on long-term impact and positive change through open communication channels.' },
    { title: 'Security & Compliance', description: 'Institutional-grade security protocols baked into every line of code we write.' }
  ];

  const projects = [
    { category: 'Fintech', title: 'Banking Transformation', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800' },
    { category: 'HealthTech', title: 'HealthCore Portal', image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800' },
    { category: 'AI / ML', title: 'Neural Insight Engine', image: 'https://images.unsplash.com/photo-1551288049-bbbda536339a?auto=format&fit=crop&q=80&w=800' }
  ];

  const testimonials = [
    { name: 'Emily Carter', role: 'CTO, NexTech Solutions', text: 'Their team exceeded our expectations in every way. From cloud migration to custom software, they delivered fast and stayed ahead of every challenge.' },
    { name: 'Rajesh Mehra', role: 'Founder & CEO, Finlytics', text: 'They didn\'t just build us a website—they helped us rethink how our tech supports our customer journey. Truly professional and reliable.' },
    { name: 'Sophia Nguyen', role: 'Manager, BrightEdge', text: 'The ongoing support has made a real impact on our daily operations. Our infrastructure is now more secure and scalable than ever.' }
  ];

  const blogPosts = [
    { date: 'Feb 12, 2024', title: 'Boost Productivity with Automation', description: 'Discover how workflow automation and DevOps tools can streamline operations and save your team valuable time.', image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800' },
    { date: 'Feb 08, 2024', title: 'Securing Data in the Cloud', description: 'Learn the best practices for protecting sensitive data in cloud environments, including encryption and compliance.', image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800' },
    { date: 'Jan 29, 2024', title: 'Choosing the Right Tech Stack', description: 'Explore a strategic approach to selecting software, frameworks, and tools that align with your business goals.', image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800' }
  ];

  return (
    <>
      <Header />
      <div className={styles.home}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroContainer}>
            <div className={styles.heroGrid}>
              <motion.div
                className={styles.heroContent}
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
              >
                <h1 className={styles.heroTitle}>
                  Technology <br /><span className={styles.heroTitleLight}>meets</span> <br />Opportunity.
                </h1>
                <p className={styles.heroSubtitle}>
                  We bridge the gap between complexity and efficiency, ensuring every organization can thrive in a digital-first world.
                </p>
                <div className={styles.heroButtons}>
                  <button className={styles.heroPrimary}>View Our Expertise</button>
                  <button className={styles.heroSecondary}>
                    <LuPlay size={16} /> See it in action
                  </button>
                </div>
              </motion.div>

              <motion.div
                className={styles.bentoGrid}
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
              >
                <motion.div className={`${styles.bentoItem} ${styles.bentoLarge}`} variants={bentoItemVariants} whileHover="hover">
                  <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800" className={styles.bentoImage} alt="Success Metrics" />
                  <div className={styles.bentoOverlay}></div>
                  <div className={styles.bentoContent}>
                    <span className={styles.bentoTag}>Success Metrics</span>
                    <h3 className={styles.bentoTitle}>90% faster deployments</h3>
                  </div>
                </motion.div>

                <motion.div className={`${styles.bentoItem} ${styles.bentoSmall} ${styles.accentBg}`} variants={bentoItemVariants} whileHover="hover">
                  <LuZap size={40} />
                  <span className={styles.bentoNumber}><FcGlobe /></span>
                  <p className={styles.bentoLabel}>Projects delivered successfully</p>
                </motion.div>

                <motion.div className={`${styles.bentoItem} ${styles.bentoSmall} ${styles.grayBg}`} variants={bentoItemVariants} whileHover="hover">
                  <span className={styles.securityLabel}>Security</span>
                  <LuShieldCheck size={40} className={styles.grayIcon} />
                </motion.div>

                <motion.div className={`${styles.bentoItem} ${styles.bentoWide} ${styles.darkBg}`} variants={bentoItemVariants} whileHover="hover">
                  <div className={styles.globeIcon}>
                    <LuGlobe size={24} />
                  </div>
                  <div>
                    <h4 className={styles.globeTitle}>Global Infrastructure</h4>
                    <p className={styles.globeText}>Supporting institutions in 24 countries.</p>
                  </div>
                </motion.div>
              </motion.div>
            </div>

            {/* Trusted By Marquee */}
            <div className={styles.marqueeSection}>
              <p className={styles.marqueeLabel}>Backed by the best</p>
              <div className={styles.marquee}>
                <div className={styles.marqueeContent}>
                  {marqueeItems.map((item, index) => (
                    <span key={index} className={styles.marqueeItem}>{item}</span>
                  ))}
                </div>
                <div className={styles.marqueeContent} aria-hidden="true">
                  {marqueeItems.map((item, index) => (
                    <span key={index} className={styles.marqueeItem}>{item}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About Us Section */}
        <section className={styles.aboutSection}>
          <div className={styles.container}>
            <div className={styles.aboutGrid}>
              <motion.div
                className={styles.aboutContent}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, threshold: 0.1 }}
                variants={fadeInUp}
              >
                <span className={styles.sectionTag}>About Ant Cyber</span>
                <h2 className={styles.aboutTitle}>Engineering the <br />next digital frontier.</h2>
                <p className={styles.aboutText}>
                  Ant Cyber was founded on a singular principle: that high-tier digital engineering should be accessible to organizations regardless of scale. We combine technical rigor with creative strategy to build systems that don't just solve today's problems but anticipate tomorrow's challenges.
                </p>
                <div className={styles.missionGrid}>
                  <div className={styles.missionCard}>
                    <h4 className={styles.missionTitle}>Our Mission</h4>
                    <p className={styles.missionText}>To empower institutional growth through resilient, AI-driven digital ecosystems.</p>
                  </div>
                  <div className={styles.missionCard}>
                    <h4 className={styles.missionTitle}>Our Vision</h4>
                    <p className={styles.missionText}>To be the global benchmark for secure and ethical digital infrastructure.</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className={styles.aboutRight}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, threshold: 0.1 }}
                variants={fadeInUp}
                transition={{ delay: 0.2 }}
              >
                <div className={styles.excellenceSection}>
                  <h3 className={styles.excellenceTitle}>A Legacy of Excellence</h3>
                  <p className={styles.excellenceText}>
                    Our multidisciplinary team brings decades of combined experience across cybersecurity, neural networks, and scalable architecture. We operate at the intersection of innovation and stability.
                  </p>
                </div>
                <div className={styles.featureItem}>
                  <div className={styles.featureIcon}>
                    <FaUsers size={32} />
                  </div>
                  <div>
                    <h4 className={styles.featureTitle}>Human-Centric Tech</h4>
                    <p className={styles.featureText}>We believe technology is a tool for human progress, which is why our UX teams work alongside our data scientists.</p>
                  </div>
                </div>
                <div className={styles.featureItem}>
                  <div className={`${styles.featureIcon} ${styles.darkIcon}`}>
                    <LuAward size={32} />
                  </div>
                  <div>
                    <h4 className={styles.featureTitle}>Standard Bearers</h4>
                    <p className={styles.featureText}>Setting the pace in industry compliance and ethical AI implementations across the globe.</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Who We Are Section */}
        <section className={styles.whoWeAre}>
          <div className={styles.container}>
            <div className={styles.whoWeAreGrid}>
              <motion.div
                className={styles.whoWeAreImage}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, threshold: 0.1 }}
                variants={fadeInUp}
              >
                <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1200" alt="Team" />
                <div className={styles.experienceBadge}>
                  <span className={styles.experienceNumber}>10y</span>
                  <p className={styles.experienceText}>Industry Experience</p>
                </div>
              </motion.div>

              <motion.div
                className={styles.whoWeAreContent}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, threshold: 0.1 }}
                variants={fadeInUp}
                transition={{ delay: 0.2 }}
              >
                <span className={styles.sectionTag}>Who we are</span>
                <h2 className={styles.whoWeAreTitle}>Making software <br />better for everyone.</h2>
                <p className={styles.whoWeAreText}>
                  What began as a vision to simplify business operations has grown into a platform trusted by teams worldwide. From our humble beginnings to becoming a leader in SaaS innovation, our journey has been fueled by passion, collaboration, and a relentless drive to make a difference.
                </p>
                <p className={styles.whoWeAreText}>
                  Our goal is to simplify complex processes, enabling businesses to focus on what matters most—their goals and customers.
                </p>
                <div className={styles.statsGrid}>
                  <div>
                    <span className={styles.statNumber}>95%</span>
                    <p className={styles.statLabel}>Client Satisfaction</p>
                  </div>
                  <div>
                    <span className={styles.statNumber}>5k+</span>
                    <p className={styles.statLabel}>Total Deployments</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className={styles.servicesSection}>
          <div className={styles.container}>
            <motion.div
              className={styles.servicesHeader}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, threshold: 0.1 }}
              variants={fadeInUp}
            >
              <span className={styles.sectionTag}>Expertise</span>
              <h2 className={styles.servicesTitle}>Solutions built to <br />accelerate your growth.</h2>
            </motion.div>

            <motion.div
              className={styles.servicesGrid}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, threshold: 0.1 }}
              variants={staggerContainer}
            >
              {services.map((service, index) => (
                <motion.div
                  key={index}
                  className={styles.serviceCard}
                  variants={serviceCardVariants}
                  whileHover="hover"
                >
                  <service.icon size={48} className={styles.serviceIcon} />
                  <h3 className={styles.serviceTitle}>{service.title}</h3>
                  <p className={styles.serviceDescription}>{service.description}</p>
                  <a href="#" className={styles.serviceLink}>
                    Learn More <LuArrowRight size={16} />
                  </a>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className={styles.whyChooseUs}>
          <div className={styles.container}>
            <div className={styles.whyChooseUsGrid}>
              <motion.div
                className={styles.whyChooseUsLeft}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, threshold: 0.1 }}
                variants={fadeInUp}
              >
                <span className={styles.sectionTag}>Advantages</span>
                <h2 className={styles.whyChooseUsTitle}>Built on trust, <br />driven by results.</h2>
                <div className={styles.advantageList}>
                  {advantages.map((advantage, index) => (
                    <div key={index} className={styles.advantageItem}>
                      <FaRegCheckCircle size={24} className={styles.checkIcon} />
                      <span className={styles.advantageText}>{advantage}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                className={styles.whyChooseUsRight}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, threshold: 0.1 }}
                variants={staggerContainer}
                transition={{ delay: 0.2 }}
              >
                {features.map((feature, index) => (
                  <motion.div key={index} className={styles.featureCard} variants={fadeInUp}>
                    <h4 className={styles.featureCardTitle}>{feature.title}</h4>
                    <p className={styles.featureCardText}>{feature.description}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Recent Work */}
        <section className={styles.workSection}>
          <div className={styles.container}>
            <div className={styles.workHeader}>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, threshold: 0.1 }}
                variants={fadeInUp}
              >
                <span className={styles.sectionTag}>Work Showcase</span>
                <h2 className={styles.workTitle}>Selected Projects.</h2>
              </motion.div>
              <button className={styles.workButton}>View All Work</button>
            </div>

            <motion.div
              className={styles.workGrid}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, threshold: 0.1 }}
              variants={staggerContainer}
            >
              {projects.map((project, index) => (
                <motion.div key={index} className={styles.workCard} variants={fadeInUp}>
                  <div className={styles.workImage}>
                    <img src={project.image} alt={project.title} />
                  </div>
                  <span className={styles.workCategory}>{project.category}</span>
                  <h4 className={styles.workCardTitle}>{project.title}</h4>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Testimonials */}
        <section className={styles.testimonialsSection}>
          <div className={styles.container}>
            <motion.div
              className={styles.testimonialsHeader}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, threshold: 0.1 }}
              variants={fadeInUp}
            >
              <span className={styles.sectionTag}>Testimonials</span>
              <h2 className={styles.testimonialsTitle}>Trusted by industry leaders.</h2>
            </motion.div>

            <motion.div
              className={styles.testimonialsGrid}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, threshold: 0.1 }}
              variants={staggerContainer}
            >
              {testimonials.map((testimonial, index) => (
                <motion.div key={index} className={styles.testimonialCard} variants={fadeInUp}>
                  <div className={styles.stars}>
                    {[...Array(5)].map((_, i) => (
                      <LuStar key={i} size={16} className={styles.starIcon} />
                    ))}
                  </div>
                  <p className={styles.testimonialText}>"{testimonial.text}"</p>
                  <div className={styles.testimonialAuthor}>
                    <div className={styles.authorAvatar}></div>
                    <div>
                      <h5 className={styles.authorName}>{testimonial.name}</h5>
                      <p className={styles.authorRole}>{testimonial.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Latest Blog */}
        <section className={styles.blogSection}>
          <div className={styles.container}>
            <div className={styles.blogHeader}>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, threshold: 0.1 }}
                variants={fadeInUp}
              >
                <span className={styles.sectionTag}>Journal</span>
                <h2 className={styles.blogTitle}>Insights & Updates.</h2>
              </motion.div>
              <a href="#" className={styles.blogLink}>Read the Blog</a>
            </div>

            <motion.div
              className={styles.blogGrid}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, threshold: 0.1 }}
              variants={staggerContainer}
            >
              {blogPosts.map((post, index) => (
                <motion.div key={index} className={styles.blogCard} variants={blogCardVariants} whileHover="hover">
                  <div className={styles.blogImage}>
                    <img src={post.image} alt={post.title} />
                  </div>
                  <span className={styles.blogDate}>{post.date}</span>
                  <h4 className={styles.blogPostTitle}>{post.title}</h4>
                  <p className={styles.blogDescription}>{post.description}</p>
                  <a href="#" className={styles.blogReadMore}>Read More</a>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Final CTA */}
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
                <h2 className={styles.ctaTitle}>Ready to Take Your <br />Business to the Next Level?</h2>
                <p className={styles.ctaSubtitle}>
                  With years of hands-on experience in SaaS development, cloud architecture, and enterprise IT services, we empower businesses to thrive.
                </p>
                <div className={styles.ctaButtons}>
                  <button className={styles.ctaPrimary}>Get a Free Consultation</button>
                  <button className={styles.ctaSecondary}>Our Services</button>
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

export default Home;