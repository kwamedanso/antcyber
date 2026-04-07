import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { FiSearch, FiInbox, FiActivity, FiCalendar, FiZap, FiFileText, FiSettings, FiHelpCircle, FiPlus, FiChevronDown, FiChevronRight, FiBell, FiLogOut, FiClock, FiFolder, FiStar, FiCheck, FiUsers } from 'react-icons/fi';
import { BsLayoutSidebarInset, BsLayoutSidebarInsetReverse } from "react-icons/bs";

import { motion, AnimatePresence } from 'framer-motion';
import CreateUser from '../private/CreateUser';

// --- Types & Constants ---
const PROJECTS = [
  { id: 'personal', name: 'Personal', color: 'bg-teal-200' },
  { id: 'business', name: 'Business', color: 'bg-blue-200' },
  { id: 'travel', name: 'Travel', color: 'bg-purple-200' },
];

const WORKSPACES = [
  { id: 'mercedes', name: 'Mercedes', type: 'Team Plan', members: '4.5k', icon: 'M' },
  { id: 'sandra', name: 'Sandra', type: 'Personal Plan', members: '1', icon: 'S' },
  { id: 'widelab', name: 'Widelab', type: 'Team Plan', members: '40', icon: 'W', active: true },
  { id: 'figma', name: 'Figma', type: 'Team Plan', members: '556', icon: 'F' },
];

// --- Components ---

const useOutsideClick = (callback) => {
  const ref = useRef();
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        callback();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [callback]);
  return ref;
};

const Tooltip = ({ children, text, show }) => {
  const [rect, setRect] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    if (show && ref.current) {
      setRect(ref.current.getBoundingClientRect());
    }
  }, [show]);

  return (
    <div ref={ref} className="relative flex items-center group w-full">
      {children}
      {show && rect && createPortal(
        <div 
          className="fixed px-2 py-1 bg-gray-900 text-white text-xs rounded shadow-lg whitespace-nowrap z-[100] pointer-events-none"
          style={{ top: rect.top + rect.height / 2, left: rect.right + 8, transform: 'translateY(-50%)' }}
        >
          {text}
          <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
        </div>,
        document.body
      )}
    </div>
  );
};

const ProfileMenu = ({ isOpen, direction = "up" }) => {
  if (!isOpen) return null;
  return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: direction === 'up' ? 10 : -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: direction === 'up' ? 10 : -10 }}
        className={`absolute ${direction === 'up' ? 'bottom-full mb-2 left-0' : 'top-full mt-2 right-0'} w-64 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[100]`}
      >
        <div className="p-4 border-b border-gray-50 flex items-center gap-3">
          <img src="https://i.pravatar.cc/150?u=sandra" className="w-10 h-10 rounded-lg object-cover" alt="Avatar" />
          <div>
            <p className="text-sm font-semibold text-gray-900">Sandra Marx</p>
            <p className="text-xs text-gray-500">sandra@gmail.com</p>
          </div>
        </div>
        <div className="p-2">
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            <FiFolder size={16} /> Integrations
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            <FiClock size={16} /> History
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-orange-500 hover:bg-orange-50 rounded-lg transition-colors">
            <FiStar size={16} /> Upgrade to Pro
          </button>
        </div>
        <div className="p-2 border-t border-gray-50">
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Update App
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors mt-1">
            <FiLogOut size={16} /> Logout
          </button>
        </div>
        <div className="p-3 bg-gray-50 flex justify-between items-center text-[10px] text-gray-400">
          <span>v1.5.69</span>
          <span>Terms & Conditions</span>
        </div>
      </motion.div>
  );
};

const WorkspaceSwitcher = ({ isOpen }) => {
  if (!isOpen) return null;
  return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-0 left-full ml-4 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 p-2 z-[100]"
      >
      {WORKSPACES.map((ws) => (
        <button key={ws.id} className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-all group relative">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white bg-indigo-600`}>
            {ws.icon}
          </div>
          <div className="text-left flex-1">
            <p className="text-sm font-semibold text-gray-900">{ws.name}</p>
            <p className="text-xs text-gray-500">{ws.type} • {ws.members} members</p>
          </div>
          {ws.active && <FiCheck className="text-indigo-600" />}
        </button>
      ))}
      </motion.div>
  );
};

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

const NavItem = ({ to, icon: Icon, label, shortcut, isCollapsed, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const hasChildren = children && children.length > 0;
  const itemRef = useRef(null);

  const content = (
    <div 
      ref={itemRef}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all cursor-pointer ${isHovered || isOpen ? 'bg-gray-100' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        if (hasChildren) {
          e.preventDefault();
          setIsOpen(!isOpen);
        }
      }}
    >
      <div className="min-w-[20px] text-gray-500">
        <Icon size={18} />
      </div>
      
      {!isCollapsed && (
        <div className="flex-1 flex items-center justify-between overflow-hidden whitespace-nowrap">
          <span className="text-sm font-medium text-gray-700">{label}</span>
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

  return (
    <div className="relative mb-1">
      {isCollapsed ? (
        <Tooltip text={label} show={isHovered}>
          <NavLink to={hasChildren ? '#' : to} className="w-full">
            {content}
          </NavLink>
        </Tooltip>
      ) : (
        <>
          <NavLink to={hasChildren ? '#' : to}>
            {content}
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

const Sidebar = ({ isCollapsed, setCollapsed, isMobileOpen, setMobileOpen }) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  
  const profileRef = useOutsideClick(() => setProfileOpen(false));
  const workspaceRef = useOutsideClick(() => setWorkspaceOpen(false));

  useEffect(() => {
    if (!isMobileOpen) {
      setProfileOpen(false);
      setWorkspaceOpen(false);
    }
  }, [isMobileOpen]);

  const sidebarVariants = {
    expanded: { width: 260 },
    collapsed: { width: 80 }
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={isMobileOpen ? { x: 0, width: 260 } : (window.innerWidth < 1024 ? { x: -300 } : isCollapsed ? "collapsed" : "expanded")}
        variants={sidebarVariants}
        className={`fixed lg:sticky top-0 left-0 h-screen bg-white border-r border-gray-100 flex flex-col z-[70] transition-all duration-100 linear shadow-sm`}
      >
        {/* Sidebar Header */}
        <div className="p-4 relative">
          <div className="flex items-center justify-between mb-6" ref={workspaceRef}>
            <div 
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => setWorkspaceOpen(!workspaceOpen)}
            >
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-lg shadow-indigo-100">
                W
              </div>
              {!isCollapsed && (
                <div className="overflow-hidden">
                  <h1 className="text-base font-bold text-gray-900 truncate">widelab</h1>
                  <p className="text-xs text-gray-400 truncate">Team Plan</p>
                </div>
              )}
            </div>
            {!isCollapsed && <FiChevronDown className="text-gray-400 cursor-pointer" />}
            
            <WorkspaceSwitcher isOpen={workspaceOpen} />
          </div>

          {/* Search */}
          <div className={`relative flex items-center ${isCollapsed ? 'justify-center' : 'bg-gray-50 px-3 py-2 rounded-lg border border-gray-100'}`}>
            <FiSearch className="text-gray-400" size={18} />
            {!isCollapsed && (
              <>
                <input 
                  type="text" 
                  placeholder="Search" 
                  className="bg-transparent border-none outline-none text-sm ml-2 w-full text-gray-600 placeholder:text-gray-400"
                />
                <span className="text-[10px] text-gray-400 font-mono flex items-center gap-0.5">
                  <span className="text-xs">⌘</span>1
                </span>
              </>
            )}
          </div>
        </div>

        {/* Scrollable Nav Area */}
        <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
          <div className="mt-4">
            <NavItem isCollapsed={isCollapsed} to="/inbox" icon={FiInbox} label="Inbox" shortcut="⌘2" />
            <NavItem isCollapsed={isCollapsed} to="/activity" icon={FiActivity} label="Activity" shortcut="⌘3" />
            <NavItem isCollapsed={isCollapsed} to="/schedule" icon={FiCalendar} label="Schedule" shortcut="⌘4" />
            <NavItem isCollapsed={isCollapsed} to="/settings" icon={FiSettings} label="Settings" shortcut="⌘5" />
            <NavItem isCollapsed={isCollapsed} to="/help" icon={FiHelpCircle} label="Help" shortcut="⌘6" />
          </div>

          <div className="mt-8">
             <div className="flex items-center justify-between mb-2 px-3">
               {!isCollapsed && <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Shared</span>}
               {!isCollapsed && <FiPlus size={14} className="text-gray-400 hover:text-gray-600 cursor-pointer" />}
             </div>
             <NavItem isCollapsed={isCollapsed} to="/boosts" icon={FiZap} label="Boosts" />
             <NavItem isCollapsed={isCollapsed} to="/documents" icon={FiFileText} label="Documents" 
                children={[
                    { label: 'Project Brief', to: '/docs/brief' },
                    { label: 'System Design', to: '/docs/design' },
                    { label: 'Q4 Strategy', to: '/docs/q4' },
                    { label: 'Q4 Strategy', to: '/docs/q4' },
                    {label: "Q4 Strategy", to: "/docs/q4"},
                ]}
             />
             <NavItem isCollapsed={isCollapsed} to="/people" icon={FiUsers} label="People" 
                children={[
                    { label: 'Project Brief', to: '/people/brief' },
                    { label: 'System Design', to: '/people/design' },
                    { label: 'Q4 Strategy', to: '/people/q4' },
                    { label: 'Q4 Strategy', to: '/people/q4' },
                    {label: "Q4 Strategy", to: "/people/q4"},
                ]}
             />
          </div>

          <div className="mt-8">
             <div className="mb-2 px-3">
               {!isCollapsed && <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Projects</span>}
             </div>
             {PROJECTS.map(proj => (
               <div key={proj.id} className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-all group`}>
                 <div className={`w-3 h-3 rounded-md ${proj.color} shrink-0`} />
                 {!isCollapsed && <span className="text-sm text-gray-600 flex-1">{proj.name}</span>}
               </div>
             ))}
             <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-all mt-1 opacity-60 hover:opacity-100">
               <FiPlus size={16} className="text-gray-400" />
               {!isCollapsed && <span className="text-sm text-gray-500">Add New Project</span>}
             </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-50 bg-white">
          <div className="mb-4">
            <NavItem isCollapsed={isCollapsed} to="/settings" icon={FiSettings} label="Settings" />
            <NavItem isCollapsed={isCollapsed} to="/help" icon={FiHelpCircle} label="Help" />
          </div>

          <div className="relative" ref={profileRef}>
            <div 
              className={`flex items-center gap-3 p-2 rounded-xl transition-all cursor-pointer hover:bg-gray-100 ${isCollapsed ? 'justify-center' : ''}`}
              onClick={() => setProfileOpen(!profileOpen)}
            >
              <img 
                src="https://i.pravatar.cc/150?u=sandra" 
                className="w-8 h-8 rounded-lg object-cover shadow-sm" 
                alt="Profile" 
              />
              {!isCollapsed && (
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs font-bold text-gray-900 truncate">Sandra Marx</p>
                  <p className="text-[10px] text-gray-400 truncate">sandra@gmail.com</p>
                </div>
              )}
              {!isCollapsed && <FiChevronDown size={14} className="text-gray-400" />}
            </div>
            <ProfileMenu isOpen={profileOpen} />
          </div>
        </div>
      </motion.aside>
    </>
  );
};

const Header = ({ isCollapsed, setCollapsed, toggleMobileSidebar }) => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);
  const [profileOpen, setProfileOpen] = useState(false);
  
  const headerProfileRef = useOutsideClick(() => setProfileOpen(false));

  return (
    <header className="h-16 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-4 lg:px-8">
      <div className="flex items-center gap-4">
        {/* Toggle Controls */}
        <button 
          onClick={toggleMobileSidebar}
          className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
        >
          <BsLayoutSidebarInsetReverse  size={20} className="text-gray-600" />
        </button>
        
        <button 
          onClick={() => setCollapsed(!isCollapsed)}
          className="p-2 hover:bg-gray-100 rounded-lg hidden lg:block"
        >
          {isCollapsed ? <BsLayoutSidebarInsetReverse size={20} className="text-gray-600" /> : <BsLayoutSidebarInset size={20} className="text-gray-600" />}
        </button>

        {/* Breadcrumbs */}
        <nav className="flex items-center text-sm font-medium">
          <Link to="/" className="text-gray-400 hover:text-gray-600 transition-colors">
            <FiActivity size={18} />
          </Link>
          {pathnames.map((value, index) => {
            const last = index === pathnames.length - 1;
            const to = `/${pathnames.slice(0, index + 1).join('/')}`;

            return (
              <React.Fragment key={to}>
                <span className="mx-2 text-gray-300">/</span>
                {last ? (
                  <span className="text-gray-900 capitalize">{value.replace('-', ' ')}</span>
                ) : (
                  <Link to={to} className="text-gray-500 hover:text-gray-900 capitalize">
                    {value.replace('-', ' ')}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
          {pathnames.length === 0 && (
             <span className="ml-2 text-gray-900 font-bold text-lg">Web Page</span>
          )}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-full transition-all relative">
          <FiBell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 border-2 border-white rounded-full" />
        </button>
        
        <div className="h-8 w-[1px] bg-gray-100 mx-2" />

        <div className="relative" ref={headerProfileRef}>
          <button 
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 hover:bg-gray-50 p-1 pr-3 rounded-full transition-all"
          >
            <img src="https://i.pravatar.cc/150?u=sandra" className="w-8 h-8 rounded-full border border-gray-100" alt="Avatar" />
            <span className="text-sm font-semibold text-gray-700 hidden sm:block">Sandra</span>
            <FiChevronDown size={14} className="text-gray-400" />
          </button>
          
          <ProfileMenu isOpen={profileOpen} direction="down" />
        </div>
      </div>
    </header>
  );
};


const MainLayoutExp = () => {
  const [isCollapsed, setCollapsed] = useState(false);
  const [isMobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-white font-sans text-gray-900">
      <Sidebar 
        isCollapsed={isCollapsed} 
        setCollapsed={setCollapsed} 
        isMobileOpen={isMobileOpen} 
        setMobileOpen={setMobileOpen} 
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          isCollapsed={isCollapsed} 
          setCollapsed={setCollapsed} 
          toggleMobileSidebar={() => setMobileOpen(!isMobileOpen)}
        />
        
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {/* Main Content Area */}
          <div>
            <CreateUser />
          </div>
        </main>
      </div>
    </div>
  );
};

// Custom styles for scrollbar
const style = document.createElement('style');
style.textContent = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #f1f1f1;
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #e2e2e2;
  }
`;
document.head.appendChild(style);

export default MainLayoutExp;