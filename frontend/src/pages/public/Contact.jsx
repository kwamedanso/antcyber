import React, { useState, useEffect } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import {
  LuMail,
  LuPhone,
  LuMapPin,
  LuSend,
  LuCheck,
  LuGlobe
} from 'react-icons/lu';
import styles from '../public/styles/Contact.module.css';
import Footer from '../../components/Footer';
import Header from '../../components/Header';

const Contact = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    serviceInterest: 'AI Orchestration',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    document.title = "Contact Us | Ant Cyber Engineering Limited";
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

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    hover: { y: -5, backgroundColor: 'white', boxShadow: '0 15px 30px -10px rgba(0,0,0,0.05)', transition: { duration: 0.3 } }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);

    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        fullName: '',
        email: '',
        serviceInterest: 'AI Orchestration',
        message: ''
      });
    }, 3000);
  };

  const contactMethods = [
    {
      icon: LuMail,
      iconBg: 'accent',
      title: 'Email Us',
      description: 'Our team typically responds within 24 hours.',
      contact: 'info@antcybereengineering.com',
      link: 'mailto:nfo@antcybereengineering.com'
    },
    {
      icon: LuPhone,
      iconBg: 'dark',
      title: 'Call Us',
      description: 'Mon-Fri from 9am to 6pm.',
      contact: '+233 241 859  942',
      link: 'tel:+233241859942'
    },
    {
      icon: LuMapPin,
      iconBg: 'light',
      title: 'Global Presence',
      description: 'Supporting organizations across Africa and the United Kingdom.',
      contact: null,
      link: null
    }
  ];

  const serviceOptions = [
    'AI Orchestration',
    'EdTech Solutions',
    'HealthTech CPD',
    'Cybersecurity Audit',
    'Other / General Inquiry'
  ];

  const locations = ['Accra, GH', 'London, UK', 'Washington, US'];

  return (
    <>
      <Header />
      <div className={styles.contact}>
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
              <span className={styles.heroTag}>Get in Touch</span>
              <h1 className={styles.heroTitle}>
                Let's build the <br /><span className={styles.italicText}>future together.</span>
              </h1>
              <p className={styles.heroSubtitle}>
                Have a project in mind or want to learn more about our AI solutions? Our team is ready to discuss how we can support your organization's digital journey.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Main Contact Section */}
        <section className={styles.contactSection}>
          <div className={styles.container}>
            <div className={styles.contactGrid}>
              {/* Contact Information */}
              <motion.div
                className={styles.contactInfo}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, threshold: 0.1 }}
                variants={staggerContainer}
              >
                <div className={styles.contactMethods}>
                  {contactMethods.map((method, index) => (
                    <motion.div
                      key={index}
                      className={`${styles.contactMethodCard} ${styles[`methodCard${index}`]}`}
                      variants={cardVariants}
                      whileHover="hover"
                    >
                      <div className={`${styles.methodIcon} ${styles[`iconBg${method.iconBg}`]}`}>
                        <method.icon size={24} />
                      </div>
                      <h3 className={styles.methodTitle}>{method.title}</h3>
                      <p className={styles.methodDescription}>{method.description}</p>
                      {method.contact && (
                        <a href={method.link} className={styles.methodLink}>
                          {method.contact}
                        </a>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Contact Form */}
              <motion.div
                className={styles.contactFormWrapper}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, threshold: 0.1 }}
                variants={fadeInUp}
                transition={{ delay: 0.2 }}
              >
                <div className={styles.formContainer}>
                  <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Full Name</label>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          placeholder="John Doe"
                          className={styles.formInput}
                          required
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Email Address</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="john@company.com"
                          className={styles.formInput}
                          required
                        />
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Service of Interest</label>
                      <select
                        name="serviceInterest"
                        value={formData.serviceInterest}
                        onChange={handleInputChange}
                        className={styles.formSelect}
                      >
                        {serviceOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Message</label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Tell us about your project or inquiry..."
                        rows="5"
                        className={styles.formTextarea}
                        required
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      className={`${styles.submitButton} ${isSubmitted ? styles.submitted : ''}`}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        'Sending...'
                      ) : isSubmitted ? (
                        <>
                          Message Sent! <LuCheck size={16} />
                        </>
                      ) : (
                        <>
                          Send Message <LuSend size={16} />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Map/Region Section */}
        <section className={styles.regionSection}>
          <div className={styles.container}>
            <div className={styles.regionGrid}>
              <motion.div
                className={styles.regionContent}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, threshold: 0.1 }}
                variants={fadeInUp}
              >
                <h2 className={styles.regionTitle}>
                  Serving the <br /><span className={styles.accentText}>Africa-UK</span> corridor.
                </h2>
                <p className={styles.regionDescription}>
                  Our dual-market expertise allows us to bridge the gap between global technology standards and local operational realities. We maintain active support teams ready to assist our partners across time zones.
                </p>
                <div className={styles.locationTags}>
                  {locations.map((location, index) => (
                    <span key={index} className={styles.locationTag}>
                      {location}
                    </span>
                  ))}
                </div>
              </motion.div>

              <motion.div
                className={styles.regionVisual}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, threshold: 0.1 }}
                variants={fadeInUp}
                transition={{ delay: 0.2 }}
              >
                <div className={styles.globeContainer}>
                  <LuGlobe size={192} className={styles.globeIcon} />
                  <div className={styles.globeEmoji}>
                    <span>🌍</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default Contact;