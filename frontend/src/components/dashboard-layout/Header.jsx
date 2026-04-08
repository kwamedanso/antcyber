import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiBell, FiChevronDown } from 'react-icons/fi';
import { BsLayoutSidebarInset, BsLayoutSidebarInsetReverse } from "react-icons/bs";
import { MdOutlineSpaceDashboard } from "react-icons/md";
import useOutsideClick from './useOutsideClick';
import ProfileMenu from './ProfileMenu';
import styles from './styles/Header.module.css';

const Header = ({ isCollapsed, setCollapsed, toggleMobileSidebar }) => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

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
        <nav className={styles.breadcrumbNav}>
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
        </nav>
      </div>

      {/* Header Right Section */}
      <div className={styles.rightSection}>
        <button className={styles.notificationButton}>
          <FiBell size={20} />
          <span className={styles.notificationBadge} />
        </button>
        
        <div className={styles.divider} />

        <div className={styles.profileContainer} ref={headerProfileRef}>
          <button 
            onClick={() => setProfileOpen(!profileOpen)}
            className={styles.profileButton}
          >
            <img 
              src="https://i.pravatar.cc/150?u=sandra" 
              className={styles.avatar} 
              alt="Avatar" 
            />
            <span className={styles.userName}>Sandra</span>
            <FiChevronDown size={14} className={styles.chevronIcon} />
          </button>
          
          <ProfileMenu isOpen={profileOpen} direction="down" />
        </div>
      </div>
    </header>
  );
};

export default Header;