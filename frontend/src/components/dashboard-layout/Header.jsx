// import React, { useState } from 'react';
// import { Link, useLocation } from 'react-router-dom';
// import { FiBell, FiChevronDown } from 'react-icons/fi';
// import { BsLayoutSidebarInset, BsLayoutSidebarInsetReverse } from "react-icons/bs";
// import { MdOutlineSpaceDashboard } from "react-icons/md";
// import useOutsideClick from './useOutsideClick';
// import ProfileMenu from './ProfileMenu';

// const Header = ({ isCollapsed, setCollapsed, toggleMobileSidebar }) => {
//   const location = useLocation();
//   const pathnames = location.pathname.split('/').filter((x) => x);

//   const [profileOpen, setProfileOpen] = useState(false);
  
//   const headerProfileRef = useOutsideClick(() => setProfileOpen(false));

//   return (
//     <header className="h-16 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-4 lg:px-8">
//       <div className="flex items-center gap-4">
//         {/* Toggle Controls */}
//         <button 
//           onClick={toggleMobileSidebar}
//           className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
//         >
//           <BsLayoutSidebarInsetReverse  size={20} className="text-gray-600" />
//         </button>
        
//         <button 
//           onClick={() => setCollapsed(!isCollapsed)}
//           className="p-2 hover:bg-gray-100 rounded-lg hidden lg:block"
//         >
//           {isCollapsed ? <BsLayoutSidebarInsetReverse size={20} className="text-gray-600" /> : <BsLayoutSidebarInset size={20} className="text-gray-600" />}
//         </button>

//         {/* Breadcrumbs */}
//         <nav className="flex items-center text-sm font-medium">
//           <Link to="/admin/dashboard" className="text-gray-400 hover:text-gray-600 transition-colors">
//             <MdOutlineSpaceDashboard size={18} />
//           </Link>
//           {pathnames.map((value, index) => {
//             const last = index === pathnames.length - 1;
//             const to = `/${pathnames.slice(0, index + 1).join('/')}`;

//             return (
//               <React.Fragment key={to}>
//                 <span className="mx-2 text-gray-300">/</span>
//                 {last ? (
//                   <span className="text-gray-900 capitalize">{value.replace('-', ' ')}</span>
//                 ) : (
//                   value === "admin" ? (
//                     <span className="text-gray-500 hover:text-gray-900 capitalize">
//                       {value.replace('-', ' ')}
//                     </span>
//                   ) : (
//                     <Link to={to} className="text-gray-500 hover:text-gray-900 capitalize">
//                       {value.replace('-', ' ')}
//                     </Link>
//                   )
//                 )}
//               </React.Fragment>
//             );
//           })}
//           {pathnames.length === 0 && (
//              <span className="ml-2 text-gray-900 font-bold text-lg">Web Page</span>
//           )}
//         </nav>
//       </div>

//       {/* Header Right Section */}
//       <div className="flex items-center gap-3">
//         <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-full transition-all relative">
//           <FiBell size={20} />
//           <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 border-2 border-white rounded-full" />
//         </button>
        
//         <div className="h-8 w-[1px] bg-gray-100 mx-2" />

//         <div className="relative" ref={headerProfileRef}>
//           <button 
//             onClick={() => setProfileOpen(!profileOpen)}
//             className="flex items-center gap-2 hover:bg-gray-50 p-1 pr-3 rounded-full transition-all"
//           >
//             <img src="https://i.pravatar.cc/150?u=sandra" className="w-8 h-8 rounded-full border border-gray-100" alt="Avatar" />
//             <span className="text-sm font-semibold text-gray-700 hidden sm:block">Sandra</span>
//             <FiChevronDown size={14} className="text-gray-400" />
//           </button>
          
//           <ProfileMenu isOpen={profileOpen} direction="down" />
//         </div>
//       </div>
//     </header>
//   );
// };

// export default Header;

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiBell, FiChevronDown } from 'react-icons/fi';
import { BsLayoutSidebarInset, BsLayoutSidebarInsetReverse } from "react-icons/bs";
import { MdOutlineSpaceDashboard } from "react-icons/md";
import useOutsideClick from './useOutsideClick';
import ProfileMenu from './ProfileMenu';
import styles from './styles/Header.module.css';

const Header = ({ isCollapsed, setCollapsed, toggleMobileSidebar }) => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const [profileOpen, setProfileOpen] = useState(false);
  
  const headerProfileRef = useOutsideClick(() => setProfileOpen(false));

  return (
    <header className={styles.header}>
      <div className={styles.leftSection}>
        {/* Toggle Controls */}
        <button 
          onClick={toggleMobileSidebar}
          className={styles.mobileToggle}
        >
          <BsLayoutSidebarInsetReverse size={20} className={styles.icon} />
        </button>
        
        <button 
          onClick={() => setCollapsed(!isCollapsed)}
          className={styles.desktopToggle}
        >
          {isCollapsed ? 
            <BsLayoutSidebarInsetReverse size={20} className={styles.icon} /> : 
            <BsLayoutSidebarInset size={20} className={styles.icon} />
          }
        </button>

        {/* Breadcrumbs */}
        <nav className={styles.breadcrumbNav}>
          <Link to="/admin/dashboard" className={styles.breadcrumbHomeLink}>
            <MdOutlineSpaceDashboard size={18} />
          </Link>
          {pathnames.map((value, index) => {
            const last = index === pathnames.length - 1;
            const to = `/${pathnames.slice(0, index + 1).join('/')}`;

            return (
              <React.Fragment key={to}>
                <span className={styles.breadcrumbSeparator}>/</span>
                {last ? (
                  <span className={styles.breadcrumbCurrent}>
                    {value.replace('-', ' ')}
                  </span>
                ) : (
                  value === "admin" ? (
                    <span className={styles.breadcrumbInactive}>
                      {value.replace('-', ' ')}
                    </span>
                  ) : (
                    <Link to={to} className={styles.breadcrumbLink}>
                      {value.replace('-', ' ')}
                    </Link>
                  )
                )}
              </React.Fragment>
            );
          })}
          {pathnames.length === 0 && (
             <span className={styles.breadcrumbDefaultTitle}>
               Web Page
             </span>
          )}
        </nav>
      </div>

      {/* Header Right Section */}
      <div className={styles.rightSection}>
        <button className={styles.notificationButton}>
          <FiBell size={20} />
          <span className={styles.notificationBadge} />
        </button>
        
        <div className={styles.divider} />

        <div className={styles.profileContainer} ref={headerProfileRef}>
          <button 
            onClick={() => setProfileOpen(!profileOpen)}
            className={styles.profileButton}
          >
            <img 
              src="https://i.pravatar.cc/150?u=sandra" 
              className={styles.avatar} 
              alt="Avatar" 
            />
            <span className={styles.userName}>Sandra</span>
            <FiChevronDown size={14} className={styles.chevronIcon} />
          </button>
          
          <ProfileMenu isOpen={profileOpen} direction="down" />
        </div>
      </div>
    </header>
  );
};

export default Header;