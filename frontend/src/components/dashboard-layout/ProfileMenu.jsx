import React from 'react';
import { motion } from 'framer-motion';
import { FiFolder, FiClock, FiStar, FiLogOut } from 'react-icons/fi';
import styles from './styles/ProfileMenu.module.css';

const ProfileMenu = ({ isOpen, direction = "up" }) => {
  if (!isOpen) return null;
  return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: direction === 'up' ? 10 : -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: direction === 'up' ? 10 : -10 }}
        className={`${styles.profileMenu} ${direction === 'up' ? styles.directionUp : styles.directionDown}`}
      >
        <div className={styles.userInfo}>
          <img src="https://i.pravatar.cc/150?u=sandra" className={styles.avatar} alt="Avatar" />
          <div>
            <p className={styles.userName}>Sandra Marx</p>
            <p className={styles.userEmail}>sandra@gmail.com</p>
          </div>
        </div>
        
        <div className={styles.menuSection}>
          <button className={styles.menuButton}>
            <FiFolder size={16} /> Integrations
          </button>
          <button className={styles.menuButton}>
            <FiClock size={16} /> History
          </button>
          <button className={`${styles.menuButton} ${styles.upgradeButton}`}>
            <FiStar size={16} /> Upgrade to Pro
          </button>
        </div>
        
        <div className={`${styles.menuSection} ${styles.borderTop}`}>
          <button className={`${styles.menuButton} ${styles.updateButton}`}>
            <div className={styles.pulseDot} />
            Update App
          </button>
          <button className={`${styles.menuButton} ${styles.logoutButton}`}>
            <FiLogOut size={16} /> Logout
          </button>
        </div>
        
        <div className={styles.footer}>
          <span>v1.5.69</span>
          <span>Terms & Conditions</span>
        </div>
      </motion.div>
  );
};

export default ProfileMenu;