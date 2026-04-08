import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronRight } from 'react-icons/fi';
import Tooltip from './Tooltip';
import NavItemPortal from './NavItemPortal';
import styles from './styles/NavItem.module.css';

const NavItem = ({ to, icon: Icon, label, shortcut, isCollapsed, children }) => {
  const location = useLocation();
  const hasChildren = children && children.length > 0;

  const isChildActive = hasChildren && children.some(child => 
    location.pathname === child.to || location.pathname.startsWith(child.to + '/')
  );

  const [isOpen, setIsOpen] = useState(isChildActive && !isCollapsed);
  const [isHovered, setIsHovered] = useState(false);
  const itemRef = useRef(null);

  useEffect(() => {
    if (isCollapsed) {
      setIsOpen(false);
    } else if (isChildActive) {
      setIsOpen(true);
    }
  }, [isCollapsed, isChildActive]);

  const renderContent = (isActive) => {
    const isParentActive = (isActive && !hasChildren) || isChildActive;

    return (
      <div 
        ref={itemRef}
        className={`${styles.navItemContent} ${
          isParentActive ? styles.active : 
          isHovered || isOpen ? styles.hoveredOrOpen : styles.default
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={(e) => {
          if (hasChildren) {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
      >
        <div className={styles.iconWrapper}>
          <Icon size={18} />
        </div>
        
        {!isCollapsed && (
          <div className={styles.labelWrapper}>
            <span className={styles.label}>{label}</span>
            {shortcut && <span className={styles.shortcut}>{shortcut}</span>}
            {hasChildren && (
              <motion.div animate={{ rotate: isOpen ? 90 : 0 }} className={styles.chevronWrapper}>
                <FiChevronRight size={14} />
              </motion.div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.navItemContainer}>
      {isCollapsed ? (
        <Tooltip text={label} show={isHovered}>
          <NavLink to={hasChildren ? '#' : to} className={styles.navLink}>
            {({ isActive }) => renderContent(isActive)}
          </NavLink>
        </Tooltip>
      ) : (
        <>
          <NavLink to={hasChildren ? '#' : to} className={styles.navLink}>
            {({ isActive }) => renderContent(isActive)}
          </NavLink>
          <AnimatePresence>
            {isOpen && !isCollapsed && hasChildren && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className={styles.childrenContainer}
              >
                {children.map((child, idx) => (
                  <NavLink 
                    key={idx} 
                    to={child.to} 
                    className={({ isActive }) => 
                      `${styles.childNavLink} ${isActive ? styles.childNavLinkActive : styles.childNavLinkInactive}`
                    }
                  >
                    {child.label}
                  </NavLink>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
      
      {/* Collapsed portal menu */}
      {isCollapsed && hasChildren && (
        <NavItemPortal 
          isOpen={isOpen} 
          onClose={() => setIsOpen(false)} 
          anchorRef={itemRef} 
          label={label}
          children={children}
        />
      )}
    </div>
  );
};

export default NavItem;