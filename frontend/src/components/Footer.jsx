import React from 'react';
import { Link } from 'react-router-dom';
import { FaLinkedin, FaTwitter, FaFacebook, FaInstagram } from 'react-icons/fa';
import styles from '../components/styles/Footer.module.css';
import logo from "../assets/logo.png";

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className={styles.footerMain}>
                <div className={styles.container}>
                    <div className={styles.footerGrid}>
                        {/* Company Info */}
                        <div className={`${styles.footerColumn} ${styles.footerColumnBrand}`}>
                            <Link to="/" className={styles.footerLogo} aria-label="Catchnode Home">
                                <img src={logo} alt="Catchnode logo" />
                            </Link>
                            <p className={styles.footerTagline}>Automate. Secure. Simplify.</p>
                            <p className={styles.footerDescription}>
                                Operational IT, intelligent automation, and resilient cloud
                                security for modern teams.
                            </p>
                            <div className={styles.footerSocial}>
                                <a
                                    href="https://linkedin.com/company/antcyberengineering"
                                    className={styles.footerSocialLink}
                                    aria-label="LinkedIn"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <FaLinkedin size={20} />
                                </a>
                                <a
                                    href="https://twitter.com/antcyberengineering"
                                    className={styles.footerSocialLink}
                                    aria-label="Twitter"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <FaTwitter size={20} />
                                </a>
                                <a
                                    href="https://facebook.com/antcyberengineering"
                                    className={styles.footerSocialLink}
                                    aria-label="Facebook"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <FaFacebook size={20} />
                                </a>
                                <a
                                    href="https://instagram.com/antcyberengineering"
                                    className={styles.footerSocialLink}
                                    aria-label="Instagram"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <FaInstagram size={20} />
                                </a>
                            </div>
                        </div>

                        {/* Services Links */}
                        <div className={styles.footerColumn}>
                            <h4 className={styles.footerHeading}>Services</h4>
                            <ul className={styles.footerLinks}>
                                <li>
                                    <Link to="/services" className={styles.footerLink}>
                                        All Services
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/services/helpdesk" className={styles.footerLink}>
                                        IT & Automation Helpdesk
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/services/automation" className={styles.footerLink}>
                                        Automation & Efficiency
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/services/cloud" className={styles.footerLink}>
                                        Cloud & Cybersecurity
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/services/webdev" className={styles.footerLink}>
                                        Web Development
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Company Links */}
                        <div className={styles.footerColumn}>
                            <h4 className={styles.footerHeading}>Company</h4>
                            <ul className={styles.footerLinks}>
                                <li>
                                    <Link to="/about" className={styles.footerLink}>
                                        About Us
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/projects" className={styles.footerLink}>
                                        Projects
                                    </Link>
                                </li>
                                {/* <li>
                                    <Link to="/pricing" className={styles.footerLink}>
                                        Pricing
                                    </Link>
                                </li> */}
                                {/* <li>
                                    <Link to="/blog" className={styles.footerLink}>
                                        Blog
                                    </Link>
                                </li> */}
                                <li>
                                    <Link to="/contact" className={styles.footerLink}>
                                        Contact
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Legal Links */}
                        <div className={styles.footerColumn}>
                            <h4 className={styles.footerHeading}>Legal</h4>
                            <ul className={styles.footerLinks}>
                                <li>
                                    <Link to="/legal/privacy" className={styles.footerLink}>
                                        Privacy Policy
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/legal/terms" className={styles.footerLink}>
                                        Terms of Service
                                    </Link>
                                </li>
                            </ul>

                            <h4 className={`${styles.footerHeading} ${styles.footerHeadingMt}`}>
                                Contact
                            </h4>
                            <ul className={styles.footerContact}>
                                <li>
                                    <a href="mailto:info@antcybereengineering.com" className={styles.footerLink}>
                                        info@antcyberengineering.com
                                    </a>
                                </li>
                                <li>
                                    <a href="tel:+233241859942" className={styles.footerLink}>
                                        GH: +233 241 859 942
                                    </a>
                                </li>
                                <li>
                                    <a href="tel:+447793169550" className={styles.footerLink}>
                                        UK: +44 7793 169 550
                                    </a>
                                </li>
                                <li>
                                    <a href="tel:+0012672412075" className={styles.footerLink}>
                                        US: +001 267 241 2075
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.footerBottom}>
                <div className={styles.container}>
                    <p className={styles.footerCopyright}>
                        &copy; 2025 Ant Cyber Engineering Ltd. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;