import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { NavLink } from 'react-router-dom';
import styles from './styles/NavItemPortal.module.css';

const NavItemPortal = ({ isOpen, onClose, anchorRef, label, children }) => {
  const [rect, setRect] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target) && anchorRef.current && !anchorRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      if (anchorRef.current) setRect(anchorRef.current.getBoundingClientRect());
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, anchorRef]);

  if (!isOpen || !rect) return null;

  return createPortal(
    <div 
      ref={menuRef}
      className={styles.portalMenu}
      style={{ top: rect.top, left: rect.right }}
    >
      <p className={styles.portalLabel}>{label}</p>
      {children.map((child, idx) => (
        <NavLink 
          onClick={onClose} 
          key={idx} 
          to={child.to} 
          className={styles.portalNavLink}
        >
          {child.label}
        </NavLink>
      ))}
    </div>,
    document.body
  );
};

export default NavItemPortal;