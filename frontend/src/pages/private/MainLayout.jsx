import React, { useState } from 'react';
import Sidebar from '../../components/dashboard-layout/Sidebar';
import Header from '../../components/dashboard-layout/Header';
import CreateUser from './CreateUser';
import { Outlet } from 'react-router-dom';

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

const MainLayout = () => {
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
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;