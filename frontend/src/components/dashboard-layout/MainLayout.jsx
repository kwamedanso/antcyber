import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';
import styles from './styles/MainLayout.module.css';

const MainLayout = () => {
  const [isCollapsed, setCollapsed] = useState(false);
  const [isMobileOpen, setMobileOpen] = useState(false);

  return (
    <div className={styles.mainLayout}>
      <Sidebar 
        isCollapsed={isCollapsed} 
        setCollapsed={setCollapsed} 
        isMobileOpen={isMobileOpen} 
        setMobileOpen={setMobileOpen} 
      />
      
      <div className={styles.contentWrapper}>
        <Header 
          isCollapsed={isCollapsed} 
          setCollapsed={setCollapsed} 
          toggleMobileSidebar={() => setMobileOpen(!isMobileOpen)}
        />
        
        <main className={styles.mainContent}>
          <div>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;