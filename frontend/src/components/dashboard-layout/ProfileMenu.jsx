import React from 'react';
import { motion } from 'framer-motion';
import { FiFolder, FiClock, FiStar, FiLogOut } from 'react-icons/fi';
import styles from './styles/ProfileMenu.module.css';
import useAuth from '../../hooks/useAuth';
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import { useNavigate } from 'react-router-dom';


const getInitials = (first, last) => {
  const f = (first || '').trim();
  const l = (last || '').trim();
  const a = f[0]?.toUpperCase() || '';
  const b = l[0]?.toUpperCase() || '';
  return (a + b) || '?';
};
const ProfileMenu = ({ isOpen, direction = "up" }) => {
  const { auth, setAuth } = useAuth();
  const navigate = useNavigate();
  const user = auth?.user;
  const initials = getInitials(user?.first_name, user?.last_name);

  const axiosPrivate = useAxiosPrivate();


   const logout = async ({ all = false } = {}) => {
  try {
    await axiosPrivate.post(
      '/api/auth/logout',
      { all: true },
      { withCredentials: true }
    );
  } catch (error) {
    // Logout should always succeed from the user's perspective.
    // The backend already clears the cookie; we just log and move on.
    console.error('[Logout] Server call failed:', error?.response?.data || error);
  } finally {
    setAuth({});
    navigate('/login', { replace: true });
  }
};
  if (!isOpen) return null;
  return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: direction === 'up' ? 10 : -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: direction === 'up' ? 10 : -10 }}
        className={`${styles.profileMenu} ${direction === 'up' ? styles.directionUp : styles.directionDown}`}
      >
        <div className={styles.userInfo}>
              <div className={styles.profileAvatar} aria-hidden="true">
                {initials}
              </div>          
              <div>
            <p className={styles.userName}>{auth?.user?.full_name}</p>
            <p className={styles.userEmail}>{auth?.user?.email}</p>
          </div>
        </div>
        
        {/* <div className={styles.menuSection}>
          <button className={styles.menuButton}>
            <FiFolder size={16} /> Integrations
          </button>
          <button className={styles.menuButton}>
            <FiClock size={16} /> History
          </button>
          <button className={`${styles.menuButton} ${styles.upgradeButton}`}>
            <FiStar size={16} /> Upgrade to Pro
          </button>
        </div> */}
        
        <div className={`${styles.menuSection} ${styles.borderTop}`}>
          {/* <button className={`${styles.menuButton} ${styles.updateButton}`}>
            <div className={styles.pulseDot} />
            Update App
          </button> */}
          <button className={`${styles.menuButton} ${styles.logoutButton}`} onClick={logout}>
            <FiLogOut size={16} /> Logout
          </button>
        </div>
        
        <div className={styles.footer}>
          <span>v1.00</span>
          <span>Terms & Conditions</span>
        </div>
      </motion.div>
  );
};

export default ProfileMenu;