// components/layout/Header.jsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiChevronDown } from 'react-icons/fi';
import { BsLayoutSidebarInset, BsLayoutSidebarInsetReverse } from "react-icons/bs";
import { MdOutlineSpaceDashboard } from "react-icons/md";
import useOutsideClick from './useOutsideClick';
import ProfileMenu from './ProfileMenu';
import NotificationMenu from './NotificationMenu'; // <-- Import
import styles from './styles/Header.module.css';
import useAuth from '../../hooks/useAuth';
import { useScreenSize } from '../../hooks/useScreenSize';

const getInitials = (first, last) => {
  const f = (first || '').trim();
  const l = (last || '').trim();
  const a = f[0]?.toUpperCase() || '';
  const b = l[0]?.toUpperCase() || '';
  return (a + b) || '?';
};

const Header = ({ isCollapsed, setCollapsed, toggleMobileSidebar }) => {
  const { auth } = useAuth();
  const user = auth?.user;
  const initials = getInitials(user?.first_name, user?.last_name);
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);
  const { isMobile } = useScreenSize();

  const [profileOpen, setProfileOpen] = useState(false);
  const headerProfileRef = useOutsideClick(() => setProfileOpen(false));

  return (
    <header className={styles.header}>
      <div className={styles.leftSection}>
        {/* Toggle Controls */}
        <button 
          onClick={toggleMobileSidebar}
          className={styles.mobileToggle}
        >
          <BsLayoutSidebarInsetReverse size={20} className={styles.icon} />
        </button>
        
        <button 
          onClick={() => setCollapsed(!isCollapsed)}
          className={styles.desktopToggle}
        >
          {isCollapsed ? 
            <BsLayoutSidebarInsetReverse size={20} className={styles.icon} /> : 
            <BsLayoutSidebarInset size={20} className={styles.icon} />
          }
        </button>

        {/* Breadcrumbs */}
        {!isMobile && <nav className={styles.breadcrumbNav}>
          <Link to="/admin/dashboard" className={styles.breadcrumbHomeLink}>
            <MdOutlineSpaceDashboard size={18} />
          </Link>
          {pathnames.map((value, index) => {
            const last = index === pathnames.length - 1;
            const to = `/${pathnames.slice(0, index + 1).join('/')}`;

            return (
              <React.Fragment key={to}>
                <span className={styles.breadcrumbSeparator}>/</span>
                {last ? (
                  <span className={styles.breadcrumbCurrent}>
                    {value.replace('-', ' ')}
                  </span>
                ) : (
                  value === "admin" ? (
                    <span className={styles.breadcrumbInactive}>
                      {value.replace('-', ' ')}
                    </span>
                  ) : (
                    <Link to={to} className={styles.breadcrumbLink}>
                      {value.replace('-', ' ')}
                    </Link>
                  )
                )}
              </React.Fragment>
            );
          })}
          {pathnames.length === 0 && (
             <span className={styles.breadcrumbDefaultTitle}>
               Web Page
             </span>
          )}
        </nav>}
      </div>

      {/* Header Right Section */}
      <div className={styles.rightSection}>
        
        {/* Replaced static button with the new Notification Menu */}
        <NotificationMenu />
        
        <div className={styles.divider} />

        <div className={styles.profileContainer} ref={headerProfileRef}>
          <button 
            onClick={() => setProfileOpen(!profileOpen)}
            className={styles.profileButton}
          >
            <div className={styles.profileAvatar} aria-hidden="true">
                {initials}
              </div>          
            <span className={styles.userName}>{user?.first_name}</span>
            <FiChevronDown size={14} className={styles.chevronIcon} />
          </button>
          
          <ProfileMenu isOpen={profileOpen} direction="down" />
        </div>
      </div>
    </header>
  );
};

export default Header;