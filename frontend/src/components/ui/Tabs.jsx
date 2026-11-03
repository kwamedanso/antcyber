import React, { useState, useRef } from 'react';
import styles from './styles/Tabs.module.css';

const Tabs = ({ 
  tabs = [], // Array of objects: { id, label, icon: <Icon />, component: <Component /> }
  defaultActiveId, 
  isSticky = false, 
  onTabChange 
}) => {
  const [activeTabId, setActiveTabId] = useState(defaultActiveId || tabs[0]?.id);
  const headerListRef = useRef(null);

  const handleTabClick = (tabId) => {
    setActiveTabId(tabId);
    if (onTabChange) {
      onTabChange(tabId);
    }
  };

  const activeTabObj = tabs.find(tab => tab.id === activeTabId);

  return (
    <div className={styles.tabsContainer}>
      {/* Navigation Header Line Row */}
      <div className={`${styles.headerRow} ${isSticky ? styles.stickyHeader : ''}`}>
        <ul className={styles.tabList} ref={headerListRef}>
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            return (
              <li key={tab.id} className={styles.tabItem}>
                <button
                  type="button"
                  className={`${styles.tabButton} ${isActive ? styles.activeButton : ''}`}
                  onClick={() => handleTabClick(tab.id)}
                  aria-selected={isActive}
                  role="tab"
                >
                  {tab.icon && <span className={styles.iconWrapper}>{tab.icon}</span>}
                  <span className={styles.labelWrapper}>{tab.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Content Mount Panels Container Area */}
      <div className={styles.panelContent} role="tabpanel">
        {activeTabObj ? activeTabObj.component : null}
      </div>
    </div>
  );
};

export default Tabs;