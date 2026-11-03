// components/dashboard-layout/ChildItem.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronRight } from 'react-icons/fi';
import { useItemAllowed, filterItems } from '../../hooks/useItemAllowed';
import { resolveIcon } from './iconMap';
import usePermissions from '../../hooks/usePermissions';
import styles from './styles/ChildItem.module.css';

const ChildItem = ({ item, depth = 1, variant = 'inline', onNavigate }) => {
  const location = useLocation();
  const perms = usePermissions();
  const { to, icon, label, children } = item;
  const Icon = resolveIcon(icon);

  // Filter nested children up front.
  const visibleChildren = useMemo(
    () => (Array.isArray(children) ? filterItems(children, perms) : []),
    [children, perms]
  );

  const hasChildren = visibleChildren.length > 0;
  const allowed = useItemAllowed(item);

  const isSelfActive =
    !!to && (location.pathname === to || location.pathname.startsWith(to + '/'));

  const isDescendantActive =
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

  const [isOpen, setIsOpen] = useState(isDescendantActive);

  useEffect(() => {
    if (isDescendantActive) setIsOpen(true);
  }, [isDescendantActive]);

  if (!allowed) return null;

  // Container became empty after filtering → hide.
  if (Array.isArray(children) && children.length > 0 && !hasChildren) return null;

  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen((v) => !v);
  };

  const cappedDepth = Math.min(depth, 3);
  const indentRem = variant === 'portal' ? cappedDepth * 0.75 : cappedDepth * 0.85;
  const paddingStyle = { paddingLeft: `${indentRem + 0.5}rem` };

  // Leaf
  if (!hasChildren) {
    return (
      <NavLink
        to={to}
        onClick={onNavigate}
        end
        className={({ isActive }) =>
          `${styles.link} ${isActive ? styles.linkActive : styles.linkInactive}`
        }
        style={paddingStyle}
      >
        {Icon && <span className={styles.icon}><Icon size={14} /></span>}
        <span className={styles.label}>{label}</span>
      </NavLink>
    );
  }

  // Branch
  return (
    <div className={styles.branch}>
      <div
        role="button"
        tabIndex={0}
        onClick={handleToggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') handleToggle(e);
        }}
        className={`${styles.link} ${styles.branchToggle} ${
          isDescendantActive ? styles.linkActive : styles.linkInactive
        }`}
        style={paddingStyle}
      >
        {Icon && <span className={styles.icon}><Icon size={14} /></span>}
        <span className={styles.label}>{label}</span>
        <motion.span
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className={styles.chevron}
        >
          <FiChevronRight size={12} />
        </motion.span>
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            style={{ overflow: 'hidden' }}
          >
            {visibleChildren.map((child, idx) => (
              <ChildItem
                key={child.to || child.label || idx}
                item={child}
                depth={depth + 1}
                variant={variant}
                onNavigate={onNavigate}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChildItem;