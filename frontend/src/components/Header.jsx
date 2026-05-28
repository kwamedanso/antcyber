import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown } from 'react-icons/fa';
import { NavLink, Link, useLocation } from 'react-router-dom';
import styles from '../components/styles/Header.module.css';
import logo from "../assets/logo.png";

const Header = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [hasScrolled, setHasScrolled] = useState(false);
    const headerRef = useRef(null);
    const location = useLocation();

    // Close dropdown when route changes
    useEffect(() => {
        setActiveDropdown(null);
        setIsMobileMenuOpen(false);
    }, [location]);

    // Scroll effect
    useEffect(() => {
        const handleScroll = () => {
            const scrolled = window.scrollY > 50;
            setHasScrolled(scrolled);
        };

        const throttledScroll = throttle(handleScroll, 100);
        window.addEventListener('scroll', throttledScroll);
        return () => window.removeEventListener('scroll', throttledScroll);
    }, []);

    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (headerRef.current && !headerRef.current.contains(event.target)) {
                setIsMobileMenuOpen(false);
                setActiveDropdown(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setIsMobileMenuOpen(false);
                setActiveDropdown(null);
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    // Scroll lock for mobile menu
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.classList.add(styles.scrollLock);
        } else {
            document.body.classList.remove(styles.scrollLock);
        }

        return () => document.body.classList.remove(styles.scrollLock);
    }, [isMobileMenuOpen]);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const toggleDropdown = (dropdownName) => {
        setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName);
    };

    const closeAllMenus = () => {
        setIsMobileMenuOpen(false);
        setActiveDropdown(null);
    };

    // Throttle utility function
    const throttle = (func, limit) => {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => (inThrottle = false), limit);
            }
        };
    };

    // Helper function to check if a service route is active
    const isServiceActive = (path) => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    const servicesDropdown = {
        hidden: {
            opacity: 0,
            y: -10,
            scale: 0.95,
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.2,
                ease: "easeOut",
            },
        },
        exit: {
            opacity: 0,
            y: -10,
            scale: 0.95,
            transition: {
                duration: 0.15,
                ease: "easeIn",
            },
        },
    };

    const mobileMenuVariants = {
        hidden: {
            opacity: 0,
        },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.3,
                ease: "easeOut",
            },
        },
        exit: {
            opacity: 0,
            transition: {
                duration: 0.2,
                ease: "easeIn",
            },
        },
    };

    const mobileNavVariants = {
        hidden: {
            x: "100%",
        },
        visible: {
            x: 0,
            transition: {
                duration: 0.3,
                ease: "easeOut",
            },
        },
        exit: {
            x: "100%",
            transition: {
                duration: 0.2,
                ease: "easeIn",
            },
        },
    };

    const hamburgerVariants = {
        open: {
            rotate: 45,
            y: 8,
        },
        closed: {
            rotate: 0,
            y: 0,
        },
    };

    const hamburgerMiddleVariants = {
        open: {
            opacity: 0,
        },
        closed: {
            opacity: 1,
        },
    };

    const hamburgerBottomVariants = {
        open: {
            rotate: -45,
            y: -8,
        },
        closed: {
            rotate: 0,
            y: 0,
        },
    };

    return (
        <>
            <header
                ref={headerRef}
                className={`${styles.header} ${hasScrolled ? styles.scrolled : ''}`}
                id="header"
            >
                <div className={styles.header__container}>
                    <Link to="/" className={styles.header__logo} aria-label="Ant Cyber Engineering Home">
                        <img src={logo} alt="Ant Cyber Engineering logo" />
                    </Link>

                    <nav className={styles.header__nav} aria-label="Main Navigation">
                        <ul className={styles.header__navList}>
                            <li className={`${styles.header__navItem} ${styles.header__navItemDropdown}`}>
                                <button
                                    className={`${styles.header__navLink} ${styles.header__dropdownToggle} ${isServiceActive('/services') ? styles.activeLink : ''
                                        }`}
                                    aria-expanded={activeDropdown === 'services'}
                                    aria-haspopup="true"
                                    onClick={() => toggleDropdown('services')}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            toggleDropdown('services');
                                        } else if (e.key === 'Escape' && activeDropdown === 'services') {
                                            setActiveDropdown(null);
                                        }
                                    }}
                                >
                                    Services
                                    <motion.span
                                        animate={{ rotate: activeDropdown === 'services' ? 180 : 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <FaChevronDown className={styles.header__dropdownIcon} />
                                    </motion.span>
                                </button>

                                <AnimatePresence>
                                    {activeDropdown === 'services' && (
                                        <motion.ul
                                            className={styles.header__dropdown}
                                            variants={servicesDropdown}
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                        >
                                            <li>
                                                <NavLink
                                                    to="/services"
                                                    className={({ isActive }) =>
                                                        `${styles.header__dropdownLink} ${isActive ? styles.activeDropdownLink : ''}`
                                                    }
                                                    onClick={closeAllMenus}
                                                >
                                                    All Services
                                                </NavLink>
                                            </li>
                                            <li>
                                                <NavLink
                                                    to="/services/web-engineering"
                                                    className={({ isActive }) =>
                                                        `${styles.header__dropdownLink} ${isActive ? styles.activeDropdownLink : ''}`
                                                    }
                                                    onClick={closeAllMenus}
                                                >
                                                    Web Development
                                                </NavLink>
                                            </li>
                                            {/* <li>
                                                <NavLink
                                                    to="/services"
                                                    className={({ isActive }) =>
                                                        `${styles.header__dropdownLink} ${isActive ? styles.activeDropdownLink : ''}`
                                                    }
                                                    onClick={closeAllMenus}
                                                >
                                                    IT & Automation Helpdesk
                                                </NavLink>
                                            </li> */}
                                            {/* <li>
                                                <NavLink
                                                    to="/services"
                                                    className={({ isActive }) =>
                                                        `${styles.header__dropdownLink} ${isActive ? styles.activeDropdownLink : ''}`
                                                    }
                                                    onClick={closeAllMenus}
                                                >
                                                    Automation & Efficiency
                                                </NavLink>
                                            </li> */}
                                            <li>
                                                <NavLink
                                                    to="/services/cloud-cybersecurity"
                                                    className={({ isActive }) =>
                                                        `${styles.header__dropdownLink} ${isActive ? styles.activeDropdownLink : ''}`
                                                    }
                                                    onClick={closeAllMenus}
                                                >
                                                    Cloud & Cybersecurity
                                                </NavLink>
                                            </li>

                                        </motion.ul>
                                    )}
                                </AnimatePresence>
                            </li>

                            <li className={styles.header__navItem}>
                                <NavLink
                                    to="/projects"
                                    className={({ isActive }) =>
                                        `${styles.header__navLink} ${isActive ? styles.activeLink : ''}`
                                    }
                                >
                                    Projects
                                </NavLink>
                            </li>
                            <li className={styles.header__navItem}>
                                <NavLink
                                    to="/about"
                                    className={({ isActive }) =>
                                        `${styles.header__navLink} ${isActive ? styles.activeLink : ''}`
                                    }
                                >
                                    About
                                </NavLink>
                            </li>
                            <li className={styles.header__navItem}>
                                <NavLink
                                    to="/contact"
                                    className={({ isActive }) =>
                                        `${styles.header__navLink} ${isActive ? styles.activeLink : ''}`
                                    }
                                >
                                    Contact
                                </NavLink>
                            </li>
                        </ul>
                    </nav>

                    <div className={styles.header_buttons}>
                        <NavLink
                            to="/login"
                            className={({ isActive }) =>
                                `${styles.btn} ${styles.signIn} ${isActive ? styles.activeButton : ''}`
                            }
                        >
                            Sign In
                        </NavLink>

                        <NavLink
                            to="/contact"
                            className={({ isActive }) =>
                                `${styles.btn} ${styles.contact} ${isActive ? styles.activeButton : ''}`
                            }
                        >
                            Contact Us
                        </NavLink>
                    </div>

                    <motion.button
                        className={styles.header__hamburger}
                        aria-label="Toggle menu"
                        aria-expanded={isMobileMenuOpen}
                        aria-controls="mobileMenu"
                        onClick={toggleMobileMenu}
                        whileTap={{ scale: 0.95 }}
                    >
                        <motion.span
                            className={styles.header__hamburgerLine}
                            variants={hamburgerVariants}
                            animate={isMobileMenuOpen ? "open" : "closed"}
                        />
                        <motion.span
                            className={styles.header__hamburgerLine}
                            variants={hamburgerMiddleVariants}
                            animate={isMobileMenuOpen ? "open" : "closed"}
                        />
                        <motion.span
                            className={styles.header__hamburgerLine}
                            variants={hamburgerBottomVariants}
                            animate={isMobileMenuOpen ? "open" : "closed"}
                        />
                    </motion.button>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        className={styles.mobileMenu}
                        id="mobileMenu"
                        aria-hidden="false"
                        variants={mobileMenuVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={closeAllMenus}
                    >
                        <motion.nav
                            className={styles.mobileMenu__nav}
                            aria-label="Mobile Navigation"
                            variants={mobileNavVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            <ul className={styles.mobileMenu__list}>
                                <li className={styles.mobileMenu__item}>
                                    <NavLink
                                        to="/services"
                                        className={({ isActive }) =>
                                            `${styles.mobileMenu__link} ${isActive ? styles.activeMobileLink : ''}`
                                        }
                                        onClick={closeAllMenus}
                                    >
                                        All Services
                                    </NavLink>
                                </li>
                                <li className={styles.mobileMenu__item}>
                                    <NavLink
                                        to="/services/web-engineering"
                                        className={({ isActive }) =>
                                            `${styles.mobileMenu__link} ${isActive ? styles.activeMobileLink : ''}`
                                        }
                                        onClick={closeAllMenus}
                                    >
                                        Web Development
                                    </NavLink>
                                </li>
                                {/* <li className={styles.mobileMenu__item}>
                                    <NavLink
                                        to="/services"
                                        className={({ isActive }) =>
                                            `${styles.mobileMenu__link} ${isActive ? styles.activeMobileLink : ''}`
                                        }
                                        onClick={closeAllMenus}
                                    >
                                        IT & Automation Helpdesk
                                    </NavLink>
                                </li> */}
                                {/* <li className={styles.mobileMenu__item}>
                                    <NavLink
                                        to="/services"
                                        className={({ isActive }) =>
                                            `${styles.mobileMenu__link} ${isActive ? styles.activeMobileLink : ''}`
                                        }
                                        onClick={closeAllMenus}
                                    >
                                        Automation & Efficiency
                                    </NavLink>
                                </li> */}
                                <li className={styles.mobileMenu__item}>
                                    <NavLink
                                        to="/services/cloud-cybersecurity"
                                        className={({ isActive }) =>
                                            `${styles.mobileMenu__link} ${isActive ? styles.activeMobileLink : ''}`
                                        }
                                        onClick={closeAllMenus}
                                    >
                                        Cloud & Cybersecurity
                                    </NavLink>
                                </li>

                                <li className={styles.mobileMenu__item}>
                                    <NavLink
                                        to="/projects"
                                        className={({ isActive }) =>
                                            `${styles.mobileMenu__link} ${isActive ? styles.activeMobileLink : ''}`
                                        }
                                        onClick={closeAllMenus}
                                    >
                                        Projects
                                    </NavLink>
                                </li>
                                <li className={styles.mobileMenu__item}>
                                    <NavLink
                                        to="/about"
                                        className={({ isActive }) =>
                                            `${styles.mobileMenu__link} ${isActive ? styles.activeMobileLink : ''}`
                                        }
                                        onClick={closeAllMenus}
                                    >
                                        About
                                    </NavLink>
                                </li>
                                <li className={styles.mobileMenu__item}>
                                    <NavLink
                                        to="/contact"
                                        className={({ isActive }) =>
                                            `${styles.mobileMenu__link} ${isActive ? styles.activeMobileLink : ''}`
                                        }
                                        onClick={closeAllMenus}
                                    >
                                        Contact
                                    </NavLink>
                                </li>
                                <li className={styles.mobileMenu__item}>
                                    <NavLink
                                        to="/login"
                                        className={({ isActive }) =>
                                            `${styles.mobileMenu__cta} ${styles.btn} ${styles.btnSecondary} ${isActive ? styles.activeMobileButton : ''}`
                                        }
                                        onClick={closeAllMenus}
                                    >
                                        Sign In
                                    </NavLink>
                                </li>
                                <li className={styles.mobileMenu__item}>
                                    <NavLink
                                        to="/contact"
                                        className={`${styles.btn} ${styles.btnPrimary} ${styles.mobileMenu__cta}`}
                                        onClick={closeAllMenus}
                                    >
                                        Contact Us
                                    </NavLink>
                                </li>
                            </ul>
                        </motion.nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Header;