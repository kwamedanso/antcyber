import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiInbox, FiActivity, FiCalendar, FiZap, FiFileText, FiSettings, FiHelpCircle, FiPlus, FiChevronDown, FiUsers } from 'react-icons/fi';
import useOutsideClick from './useOutsideClick';
import ProfileMenu from './ProfileMenu';
import WorkspaceSwitcher from './WorkspaceSwitcher';
import NavItem from './NavItem';
import useAuth from '../../hooks/useAuth';

const Sidebar = ({ isCollapsed, setCollapsed, isMobileOpen, setMobileOpen }) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const { auth} = useAuth();
  const userRole = auth?.user?.role;
  const profileRef = useOutsideClick(() => setProfileOpen(false));
  const workspaceRef = useOutsideClick(() => setWorkspaceOpen(false));

console.log(userRole)

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
        </div>

        {/* Scrollable Nav Area */}
        <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
          <div className="mt-4">
            <NavItem isCollapsed={isCollapsed} to="/admin/dashboard" icon={FiInbox} label="Dashboard" shortcut="⌘2" />
          </div>

          <div className="mt-8">
             <div className="flex items-center justify-between mb-2 px-3">
               {!isCollapsed && <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Shared</span>}
               {!isCollapsed && <FiPlus size={14} className="text-gray-400 hover:text-gray-600 cursor-pointer" />}
             </div>
             <NavItem isCollapsed={isCollapsed} to="/admin/users" icon={FiUsers} label="Users" 
                children={[
                    { label: 'Users', to: '/admin/users' },
                ]}
             />
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-50 bg-white">
          <div className="mb-4">
            <NavItem isCollapsed={isCollapsed} to="/admin/settings" icon={FiSettings} label="Settings" />
            <NavItem isCollapsed={isCollapsed} to="/admin/help" icon={FiHelpCircle} label="Help" />
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

export default Sidebar;