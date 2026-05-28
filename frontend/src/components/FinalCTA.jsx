import { motion } from 'framer-motion';
import styles from "../components/styles/FinalCTA.module.css";
import { Link } from 'react-router-dom';

export default function FinalCTA() {

    // Animation variants
    const fadeInUp = {
        hidden: { opacity: 0, y: 60 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut"
            }
        }
    };

    const scrollToContact = () => {
        const element = document.getElementById('contact');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <>
            {/* CTA Section */}
            <section className={styles.cta} id="contact">
                <div className={styles.container}>
                    <motion.div
                        className={styles.ctaContent}
                        initial="hidden"
                        whileInView="visible"
                        variants={fadeInUp}
                        viewport={{ once: true }}
                    >
                        <h2>Ready to Take Your Business Digital?</h2>
                        <p>
                            Let's build your next web solution or automation system together
                        </p>
                        <div className={styles.ctaButtons}>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}>
                                <Link
                                    to={"/contact/consultation-request"}
                                    className={`${styles.btn} ${styles.consultation}`}

                                    onClick={scrollToContact}
                                >
                                    Schedule a Consultation
                                </Link>

                            </motion.div>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Link
                                    to={"/contact/quote-request"}
                                    className={`${styles.btn} ${styles.quote}`}
                                    onClick={scrollToContact}
                                >
                                    Request a Quote
                                </Link>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </>
    )
}


