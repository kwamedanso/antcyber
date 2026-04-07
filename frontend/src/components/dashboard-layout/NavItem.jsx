import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronRight } from 'react-icons/fi';
import Tooltip from './Tooltip';
import NavItemPortal from './NavItemPortal';

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
        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all cursor-pointer ${
          isParentActive ? 'bg-indigo-50 text-indigo-700' : 
          isHovered || isOpen ? 'bg-gray-100 text-gray-900' : 'text-gray-500'
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
      <div className="min-w-[20px] text-inherit flex items-center justify-center">
        <Icon size={18} />
      </div>
      
      {!isCollapsed && (
        <div className="flex-1 flex items-center justify-between overflow-hidden whitespace-nowrap">
          <span className="text-sm font-medium text-inherit">{label}</span>
          {shortcut && <span className="text-[10px] text-gray-400 font-mono bg-gray-50 px-1 rounded border border-gray-200">{shortcut}</span>}
          {hasChildren && (
            <motion.div animate={{ rotate: isOpen ? 90 : 0 }}>
              <FiChevronRight size={14} className="text-gray-400" />
            </motion.div>
          )}
        </div>
      )}
    </div>
    );
  };

  return (
    <div className="relative mb-1">
      {isCollapsed ? (
        <Tooltip text={label} show={isHovered}>
          <NavLink to={hasChildren ? '#' : to} className="w-full block">
            {({ isActive }) => renderContent(isActive)}
          </NavLink>
        </Tooltip>
      ) : (
        <>
          <NavLink to={hasChildren ? '#' : to} className="w-full block">
            {({ isActive }) => renderContent(isActive)}
          </NavLink>
          <AnimatePresence>
            {isOpen && !isCollapsed && hasChildren && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="ml-8 overflow-hidden border-l border-gray-100"
              >
                {children.map((child, idx) => (
                  <NavLink 
                    key={idx} 
                    to={child.to} 
                    className={({ isActive }) => `block px-4 py-2 text-sm transition-colors ${isActive ? 'text-indigo-600 font-medium' : 'text-gray-500 hover:text-gray-900'}`}
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