// components/dashboard-layout/NavItemPortal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import ChildItem from './ChildItem';
import styles from './styles/NavItemPortal.module.css';

/**
 * Fixed-position dropdown that appears next to a collapsed sidebar item.
 * Renders the children (recursively) using ChildItem in portal variant.
 *
 * Portal closes on:
 *   - outside click
 *   - navigating to any child (via onNavigate)
 */
const NavItemPortal = ({ isOpen, onClose, anchorRef, label, children }) => {
  const [rect, setRect] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      if (anchorRef.current) {
        setRect(anchorRef.current.getBoundingClientRect());
      }
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, anchorRef]);

  // Close on route change so the portal doesn't linger after navigation.
  useEffect(() => {
    if (isOpen) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  if (!isOpen || !rect) return null;

  return createPortal(
    <div
      ref={menuRef}
      className={styles.portalMenu}
      style={{ top: rect.top, left: rect.right }}
    >
      <p className={styles.portalLabel}>{label}</p>
      <div className={styles.portalContent}>
        {children.map((child, idx) => (
          <ChildItem
            key={child.to || child.label || idx}
            item={child}
            depth={1}
            variant="portal"
            onNavigate={onClose}
          />
        ))}
      </div>
    </div>,
    document.body
  );
};

export default NavItemPortal;