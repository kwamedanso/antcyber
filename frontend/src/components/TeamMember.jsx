import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  LuLinkedin, 
  LuTwitter, 
  LuGithub, 
  LuGraduationCap, 
  LuUser,
  LuMail,
  LuMapPin,
} from 'react-icons/lu';
import { IoMdCloseCircleOutline } from "react-icons/io";

import styles from './styles/TeamMember.module.css';

const TeamMember = ({ 
  name,
  title,
  image,
  education,
  bio,
  bio2,
  bio3,
  competencies,
  socialLinks,
  email = null,
  location = null,
  setInfoCard
}) => {
  const [imageError, setImageError] = useState(false);

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.5, 
        ease: [0.16, 1, 0.3, 1] 
      } 
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.6, 
        ease: [0.16, 1, 0.3, 1] 
      } 
    },
    hover: { 
      y: -6,
      borderColor: 'var(--primary-accent)',
      boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.05)',
      transition: { duration: 0.3 }
    }
  };

  const imageVariants = {
    hidden: { scale: 1 },
    hover: { 
      scale: 1.05,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    }
  };

  const socialIconVariants = {
    hidden: { scale: 0 },
    visible: { scale: 1, transition: { duration: 0.3 } },
    hover: { 
      scale: 1.1,
      backgroundColor: 'var(--primary-accent)',
      color: 'black',
      borderColor: 'transparent',
      transition: { duration: 0.2 }
    }
  };

  const tagVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    hover: { 
      backgroundColor: 'white',
      borderColor: 'var(--primary-accent)',
      transition: { duration: 0.2 }
    }
  };

  return (
    <div className={styles.container}>
        <IoMdCloseCircleOutline size={30} className={styles.closeBtn} onClick={() => setInfoCard(false)}/>
    <motion.div 
      className={styles.profileCard}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
    >
      {/* Left Column: Visual & Social Links */}
      <div className={styles.leftColumn}>
        <div className={styles.imageSection}>
          {/* Image Wrapper */}
          <div className={styles.imageWrapper}>
            {!imageError ? (
              <motion.img 
                src={image} 
                alt={name}
                className={styles.profileImage}
                variants={imageVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className={styles.imageFallback}>
                <LuUser size={48} className={styles.fallbackIcon} />
                <span className={styles.fallbackText}>Photo</span>
              </div>
            )}
          </div>
          
          {/* Basic Meta */}
          <div className={styles.metaInfo}>
            <h3 className={styles.name}>{name}</h3>
            <p className={styles.title}>{title}</p>
          </div>
        </div>

        {/* Social Links */}
        <motion.div 
          className={styles.socialLinks}
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {socialLinks?.linkedin && (
            <motion.a 
              href={socialLinks?.linkedin} 
              target="_blank" rel="noopener noreferrer"
              className={styles.socialIcon}
              variants={socialIconVariants}
              whileHover="hover"
              aria-label="LinkedIn"
            >
              <LuLinkedin size={16} />
            </motion.a>
          )}
          {socialLinks?.twitter && (
            <motion.a 
              href={socialLinks?.twitter} 
              target="_blank" rel="noopener noreferrer"
              className={styles.socialIcon}
              variants={socialIconVariants}
              whileHover="hover"
              aria-label="Twitter"
            >
              <LuTwitter size={16} />
            </motion.a>
          )}
          {socialLinks?.github && (
            <motion.a 
              href={socialLinks?.github} 
              target="_blank" rel="noopener noreferrer"
              className={styles.socialIcon}
              variants={socialIconVariants}
              whileHover="hover"
              aria-label="GitHub"
            >
              <LuGithub size={16} />
            </motion.a>
          )}
        </motion.div>
      </div>

      {/* Divider Line (Only visible on desktop) */}
      <div className={styles.divider}></div>

      {/* Right Column: Biography & Technical Profile */}
      <div className={styles.rightColumn}>
        <div>
          {/* Education Metadata */}
          <motion.div 
            className={styles.educationSection}
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {education?.map((edu, index) => (
              <motion.div 
                key={index}
                className={styles.educationTag}
                variants={fadeInUp}
              >
                <LuGraduationCap size={14} className={styles.educationIcon} />
                {`Education: ${edu.institution}`}
              </motion.div>
            ))}
            {email && (
              <motion.div className={styles.educationTag} variants={fadeInUp}>
                <LuMail size={14} className={styles.educationIcon} />
                {email}
              </motion.div>
            )}
            {location && (
              <motion.div className={styles.educationTag} variants={fadeInUp}>
                <LuMapPin size={14} className={styles.educationIcon} />
                {location}
              </motion.div>
            )}
          </motion.div>

          {/* Bio Text */}
          <div className={styles.bioContainer}>
          <motion.p 
            className={styles.bio}
            variants={fadeInUp}
          >
            {bio}
          </motion.p>
          {/* <h4>Core Skills</h4> */}

           {bio2 && <motion.p 
            className={styles.bio}
            variants={fadeInUp}
          >
            {bio2}
          </motion.p>}

          {bio3 && <motion.p 
            className={styles.bio}
            variants={fadeInUp}
          >
            {bio3}
          </motion.p>}
        </div>
</div>
        {/* Focus Areas / Skill Tags */}
        <div>
          <span className={styles.competenciesLabel}>Core Competencies</span>
          <motion.div 
            className={styles.tagsContainer}
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {competencies?.map((competency, index) => (
              <motion.span
                key={index}
                className={styles.tag}
                variants={tagVariants}
                whileHover="hover"
              >
                {competency}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.div>
    </div>
  );
};

export default TeamMember;