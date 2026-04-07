import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { NavLink } from 'react-router-dom';

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
      className="fixed ml-2 w-48 bg-white shadow-xl border border-gray-100 rounded-lg py-2 z-[100]"
      style={{ top: rect.top, left: rect.right }}
    >
      <p className="px-4 py-1 text-[10px] uppercase font-bold text-gray-400 border-b border-gray-50 mb-1">{label}</p>
      {children.map((child, idx) => (
        <NavLink onClick={onClose} key={idx} to={child.to} className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
          {child.label}
        </NavLink>
      ))}
    </div>,
    document.body
  );
};

export default NavItemPortal;