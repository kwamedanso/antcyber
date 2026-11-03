// components/dashboard-layout/Sidebar.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown } from 'react-icons/fi';
import useOutsideClick from './useOutsideClick';
import ProfileMenu from './ProfileMenu';
import NavItem from './NavItem';
import useAuth from '../../hooks/useAuth';
import usePermissions from '../../hooks/usePermissions';
import { filterItems } from '../../hooks/useItemAllowed';
import { sidebarConfig } from './sidebar.config';
import styles from './styles/Sidebar.module.css';

// ============================================================================
// HELPERS
// ============================================================================

const getInitials = (first, last) => {
  const f = (first || '').trim();
  const l = (last || '').trim();
  const a = f ? f[0].toUpperCase() : '';
  const b = l ? l[0].toUpperCase() : '';
  return (a + b) || '?';
};

// ============================================================================
// SIDEBAR
// ============================================================================

const Sidebar = ({ isCollapsed, setCollapsed, isMobileOpen, setMobileOpen }) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const { auth } = useAuth();
  const user = auth?.user;
  const perms = usePermissions();
  const profileRef = useOutsideClick(() => setProfileOpen(false));

  const initials = getInitials(user?.first_name, user?.last_name);

  // Filter each section's items. Drop sections that end up empty.
  const visibleSections = useMemo(() => {
    return sidebarConfig
      .map((group) => ({
        section: group.section,
        items: filterItems(group.items, perms)
      }))
      .filter((group) => group.items.length > 0);
  }, [perms]);

  useEffect(() => {
    if (!isMobileOpen) setProfileOpen(false);
  }, [isMobileOpen]);

  const sidebarVariants = {
    expanded: { width: 260 },
    collapsed: { width: 80 }
  };

  return (
    <>
      {/* Mobile overlay */}
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
        animate={
          isMobileOpen
            ? { x: 0, width: 260 }
            : window.innerWidth < 1024
              ? { x: -300 }
              : isCollapsed ? 'collapsed' : 'expanded'
        }
        variants={sidebarVariants}
        className={styles.sidebar}
      >
        {/* Header */}
        <div className={styles.sidebarHeader}>
          <div className={styles.workspaceContainer}>
            <div className={styles.workspaceTrigger}>
              <div className={styles.workspaceIcon}>AC</div>
              {!isCollapsed && (
                <div className={styles.workspaceInfo}>
                  <h1 className={styles.workspaceName}>ANTCYBER ENG.</h1>
                  <p className={styles.workspacePlan}></p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Nav */}
        <div className={styles.navArea}>
          {visibleSections.map((group, groupIdx) => (
            <div
              key={group.section || `section-${groupIdx}`}
              className={styles.navSection}
            >
              {group.section && !isCollapsed && (
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionTitle}>{group.section}</span>
                </div>
              )}

              {group.items.map((item, idx) => (
                <NavItem
                  key={item.to || item.label || idx}
                  isCollapsed={isCollapsed}
                  to={item.to}
                  icon={item.icon}
                  label={item.label}
                  shortcut={item.shortcut}
                  children={item.children}
                  public={item.public}
                  resource={item.resource}
                  action={item.action}
                  any={item.any}
                  all={item.all}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className={styles.sidebarFooter}>
          <div className={styles.profileContainer} ref={profileRef}>
            <div
              className={`${styles.profileTrigger} ${isCollapsed ? styles.profileTriggerCollapsed : ''}`}
              onClick={() => setProfileOpen(!profileOpen)}
            >
              <div className={styles.profileAvatar} aria-hidden="true">
                {initials}
              </div>
              {!isCollapsed && (
                <div className={styles.profileInfo}>
                  <p className={styles.profileName}>{user?.full_name}</p>
                  <p className={styles.profileEmail}>{user?.email}</p>
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