// components/dashboard-layout/NavItem.jsx
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronRight } from 'react-icons/fi';
import Tooltip from './Tooltip';
import NavItemPortal from './NavItemPortal';
import ChildItem from './ChildItem';
import { useItemAllowed, filterItems } from '../../hooks/useItemAllowed';
import { resolveIcon } from './iconMap';
import usePermissions from '../../hooks/usePermissions';
import styles from './styles/NavItem.module.css';

const NavItem = ({
  to,
  icon,
  label,
  shortcut,
  isCollapsed,
  children,
  public: isPublic,
  resource,
  action,
  any,
  all
}) => {
  const Icon = resolveIcon(icon);
  const location = useLocation();
  const perms = usePermissions();

  const allowed = useItemAllowed({ public: isPublic, resource, action, any, all, children, to });

  const visibleChildren = useMemo(
    () => (Array.isArray(children) ? filterItems(children, perms) : []),
    [children, perms]
  );

  const hasChildren = visibleChildren.length > 0;

  const isChildActive =
    hasChildren &&
    visibleChildren.some((child) => {
      if (child.to) {
        if (location.pathname === child.to || location.pathname.startsWith(child.to + '/')) return true;
      }
      if (Array.isArray(child.children)) {
        return child.children.some((gc) => gc.to && (
          location.pathname === gc.to || location.pathname.startsWith(gc.to + '/')
        ));
      }
      return false;
    });

  const [isOpen, setIsOpen] = useState(isChildActive && !isCollapsed);
  const [isHovered, setIsHovered] = useState(false);
  const itemRef = useRef(null);

  useEffect(() => {
    if (isCollapsed) setIsOpen(false);
    else if (isChildActive) setIsOpen(true);
  }, [isCollapsed, isChildActive]);

  // Hide the item completely when:
  //   - user lacks its own permission, OR
  //   - it's a container whose children all got pruned
  if (!allowed) return null;
  if (Array.isArray(children) && children.length > 0 && !hasChildren) return null;

  const renderContent = (isActive) => {
    const isParentActive = (isActive && !hasChildren) || isChildActive;

    return (
      <div
        ref={itemRef}
        className={`${styles.navItemContent} ${
          isParentActive ? styles.active
          : isHovered || isOpen ? styles.hoveredOrOpen
          : styles.default
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={(e) => {
          if (hasChildren && !isCollapsed) {
            e.preventDefault();
            setIsOpen((v) => !v);
          }
        }}
      >
        {Icon && (
          <div className={styles.iconWrapper}>
            <Icon size={18} />
          </div>
        )}
        {!isCollapsed && (
          <div className={styles.labelWrapper}>
            <span className={styles.label}>{label}</span>
            {shortcut && <span className={styles.shortcut}>{shortcut}</span>}
            {hasChildren && (
              <motion.div
                animate={{ rotate: isOpen ? 90 : 0 }}
                transition={{ duration: 0.15 }}
                className={styles.chevronWrapper}
              >
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
          <AnimatePresence initial={false}>
            {isOpen && !isCollapsed && hasChildren && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className={styles.childrenContainer}
              >
                {visibleChildren.map((child, idx) => (
                  <ChildItem
                    key={child.to || child.label || idx}
                    item={child}
                    depth={1}
                    variant="inline"
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {isCollapsed && hasChildren && (
        <NavItemPortal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          anchorRef={itemRef}
          label={label}
          children={visibleChildren}
        />
      )}
    </div>
  );
};

export default NavItem;