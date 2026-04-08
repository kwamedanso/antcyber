import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiInbox, FiSettings, FiHelpCircle, FiPlus, FiChevronDown, FiUsers } from 'react-icons/fi';
import useOutsideClick from './useOutsideClick';
import ProfileMenu from './ProfileMenu';
import NavItem from './NavItem';
import useAuth from '../../hooks/useAuth';
import styles from './styles/Sidebar.module.css';

const Sidebar = ({ isCollapsed, setCollapsed, isMobileOpen, setMobileOpen }) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const { auth} = useAuth();
  const userRole = auth?.user?.role;
  const profileRef = useOutsideClick(() => setProfileOpen(false));

  console.log(userRole)

  useEffect(() => {
    if (!isMobileOpen) {
      setProfileOpen(false);
    }
  }, [isMobileOpen]);

  const sidebarVariants = {
    expanded: { width: 260 },
    collapsed: { width: 80 }
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className={styles.mobileOverlay}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={isMobileOpen ? { x: 0, width: 260 } : (window.innerWidth < 1024 ? { x: -300 } : isCollapsed ? "collapsed" : "expanded")}
        variants={sidebarVariants}
        className={styles.sidebar}
      >
        {/* Sidebar Header */}
        <div className={styles.sidebarHeader}>
          <div className={styles.workspaceContainer}>
            <div 
              className={styles.workspaceTrigger}
            >
              <div className={styles.workspaceIcon}>
                W
              </div>
              {!isCollapsed && (
                <div className={styles.workspaceInfo}>
                  <h1 className={styles.workspaceName}>widelab</h1>
                  <p className={styles.workspacePlan}>Team Plan</p>
                </div>
              )}
            </div>
            {!isCollapsed && <FiChevronDown className={styles.chevronIcon} />}
          </div>
        </div>

        {/* Scrollable Nav Area */}
        <div className={styles.navArea}>
          <div className={styles.navSection}>
            <NavItem isCollapsed={isCollapsed} to="/admin/dashboard" icon={FiInbox} label="Dashboard" shortcut="⌘2" />
          </div>

          <div className={styles.navSection}>
            <div className={styles.sectionHeader}>
              {!isCollapsed && <span className={styles.sectionTitle}>Shared</span>}
              {!isCollapsed && <FiPlus className={styles.addIcon} />}
            </div>
            <NavItem isCollapsed={isCollapsed} to="/admin/users" icon={FiUsers} label="Users" 
              children={[
                { label: 'Users', to: '/admin/users' },
              ]}
            />
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className={styles.sidebarFooter}>
          <div className={styles.footerNav}>
            <NavItem isCollapsed={isCollapsed} to="/admin/settings" icon={FiSettings} label="Settings" />
            <NavItem isCollapsed={isCollapsed} to="/admin/help" icon={FiHelpCircle} label="Help" />
          </div>

          <div className={styles.profileContainer} ref={profileRef}>
            <div 
              className={`${styles.profileTrigger} ${isCollapsed ? styles.profileTriggerCollapsed : ''}`}
              onClick={() => setProfileOpen(!profileOpen)}
            >
              <img 
                src="https://i.pravatar.cc/150?u=sandra" 
                className={styles.profileAvatar}
                alt="Profile" 
              />
              {!isCollapsed && (
                <div className={styles.profileInfo}>
                  <p className={styles.profileName}>Sandra Marx</p>
                  <p className={styles.profileEmail}>sandra@gmail.com</p>
                </div>
              )}
              {!isCollapsed && <FiChevronDown className={styles.profileChevron} />}
            </div>
            <ProfileMenu isOpen={profileOpen} />
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;