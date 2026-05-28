import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { LuTarget, LuEye, LuShieldCheck, LuLayers, LuSprout, LuActivity, LuCpu, LuBriefcase, LuLinkedin, LuTwitter, LuArrowRight } from "react-icons/lu";
import { FaRegCheckCircle } from "react-icons/fa";
import { Link } from 'react-router-dom';
import ceoProfile from "../../assets/antwi.jpg"
import legalProfile from "../../assets/legal.jpeg"
import developerProfile from "../../assets/developer.jpeg"
import rolandProfile from "../../assets/roland.jpg"
// import strategyProfile from "../../assets/strategy.jpg"
// import operationsProfile from "../../assets/operations.jpg"

import styles from './styles/About.module.css';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { LiaInfoSolid } from "react-icons/lia";
import TeamMember from '../../components/TeamMember';


const About = () => {
  const [infoCard, setInfoCard] = useState(false)
  const [teamMember, setTeamMember] = useState({})
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, threshold: 0.1 });

  console.log(teamMember)

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [controls, isInView]);

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const statCardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
  };

  const serviceCardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    hover: { y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', transition: { duration: 0.3 } }
  };

  const projectVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
    hover: { backgroundColor: 'rgba(0, 0, 0, 0.02)', transition: { duration: 0.2 } }
  };

  const teamCardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
    hover: { scale: 1.02, transition: { duration: 0.3 } }
  };

  const services = [
    { icon: LuCpu, title: 'AI Orchestration', description: 'Proprietary platforms for real-time insights, predictive analytics, and workflow automation.' },
    { icon: LuShieldCheck, title: 'Cybersecurity', description: 'Full-spectrum security: penetration testing, audits, and compliance aligned with NIST & OWASP.' },
    { icon: LuLayers, title: 'ERP & Automation', description: 'Tailored systems for HR, payroll, and logistics integrated seamlessly with your ecosystem.' },
    { icon: LuSprout, title: 'AgriTech', description: 'Mobile-first platforms for farmer engagement, market access, and AI crop monitoring.' },
    { icon: LuActivity, title: 'Health & EdTech', description: 'AI-driven diagnostics, e-learning platforms, and adaptive content delivery for scaling impact.' },
    { icon: LuBriefcase, title: 'Capacity Building', description: 'Executive leadership programs, technology governance, and community-based user training.' }
  ];

  const projects = [
    { client: 'Ministry of Education, Ghana', title: 'E-Payment Platform for Teachers', description: 'Automated digital wallet system integrating banks and mobile money for allowance payments.' },
    { client: 'Lands Commission, Ghana', title: 'ERP HR Management System', description: 'Fully integrated workforce and payroll solution for national land administration.' },
    { client: 'Ministry of Health, Ghana', title: 'Kortext E-Learning Deployment', description: 'Nationwide digital library and learning platform for healthcare institutions.' },
    { client: 'Alle-AI Ltd, UK', title: 'AI Comparison Platform', description: 'Generative AI output comparison tool for research and enterprise innovation.' }
  ];

  const partners = ['Ministry of Education', 'Lands Commission', 'Ministry of Health', 'Alle-AI Ltd', 'Kortext'];
  const team = [
    { id: 1, 
      name: 'Antwi Boasiako Boateng', 
      title: 'Chief Executive Officer', 
      socialLinks: {linkedin: "https://gh.linkedin.com/in/antwi-boasiako-boateng-26091a2ab",twitter: "#",info: "#"}, 
      image: ceoProfile,
      education:[
        { degree: "M. Eng.", institution: "Swiss Business School, Zurich, Switzerland", year: "2014" },
        { degree: "B. Sc.", institution: "Kwame Nkrumah University of Science & Technology, Kumasi", year: "2013" }
      ],
      bio : `With over 13 years of extensive experience in cybersecurity, software engineering, and digital transformation, I have established myself as a seasoned Technology Executive within Ghana’s public and private sectors. My career is marked by significant contributions to national-scale projects, including the deployment of e-commerce tax platforms and electronic registries, which have notably enhanced public revenue collection and regulatory efficiency.
        Currently, I serve as the Co-Founder, Managing Director, and Chief Operations Officer (COO) of Ant Cyber Engineering Ltd. In this role, I leverage my deep technical expertise and strategic leadership to deliver secure, scalable, and innovative IT solutions. I am recognized for my ability to lead high-impact projects, drive operational excellence, and mentor cross-functional teams, all while aligning technology initiatives with national objectives.
        `,
        bio2: `Cybersecurity & Risk Management: Expertise in protecting digital assets and effectively managing risks.
        Digital Transformation & Innovation: Leading modernization initiatives to enhance technological capabilities.
        Software Engineering & Deployment: Proven track record in developing and deploying robust software solutions.
        Regulatory Compliance & Tax Technology: Ensuring compliance with legal standards and improving tax systems.
        IT Operations & Service Delivery: Efficient management of IT operations for reliable service delivery.
        E-Government & Fintech Solutions: Developing solutions that facilitate government operations and financial technologies.
        Network Infrastructure & Support: Comprehensive knowledge of building and maintaining network systems.
        Data Analytics & Statistical Reporting: Utilizing data for strategic decision-making and performance improvement.
        Strategic Leadership & Team Management: Leading teams focused on innovation and continuous development.`,
        bio3: `MSc in Artificial Intelligence for Business
        Swiss Business School, Zurich, Switzerland (2025)
        BSc in Computer Science
        Kwame Nkrumah University of Science & Technology, Kumasi (2008)
        Certifications
        PRINCE2 Practitioner – Sterling Group, United Kingdom
        Cisco Certified Network Associate (CCNA)
        Awards & Recognition
        Employee Recognition Award (SGS GCNET – Two Star Category, Aug 2013)
        Seniority Award (SGS GCNET – For 5 years of dedicated service, Jan 2019)`,
      competencies : [
        "Fullstack Development",
        "AI Integration",
        "FinTech",
        "EdTech",
        "Product Ideation"
      ],
      email: null,
      location: null,
      setInfoCard: false,
    },
    { id: 2, 
      name: 'Christie-Pearl Sabaa', 
      title: 'Corporate Legal Sevices', 
      socialLinks: {linkedin: "#",twitter: "#",info: "#"}, 
      image: legalProfile,
      education: [
        { degree: "LL.M", institution: "Kwame Nkrumah University of Science and Technology", year: "2019" },
      ],
      bio: `A highly accomplished and dedicated Legal Counsel with extensive experience in managing corporate legal affairs, ensuring compliance with the Companies Act 2019 (Act 992) and other relevant local and international legislations. This professional holds a Professional Law Certificate from the Ghana School of Law and an LLB from Kwame Nkrumah University of Science and Technology (KNUST). Additionally, they have completed multiple certifications in Project Management, Business Management, Monitoring and Evaluation, Proposal Development, and Financial Management.`,
      competencies: [
        "Corporate Law & Governance",
        "Regulatory Compliance",
        "Contract Negotiation",
        "Risk Management",
        "Legal Strategy"
      ],
      email: null,
      location: null,
      setInfoCard: false,
    },
    { id: 3, 
      name: 'Pascal Osei-Wusu', 
      title: 'Senior Software Engineer', 
      socialLinks: {linkedin: "#",twitter: "#",info: "#"}, 
      image: developerProfile,
      education: [
        { degree: "B. Sc.", institution: "Kwame Nkrumah University of Science and Technology", year: "2017" }
      ],
      bio: `Pascal Osei-Wusu is a dynamic and innovative professional with a Bachelor of Science degree in Petroleum Engineering from Kwame Nkrumah University of Science and Technology, Ghana. He possesses a strong foundation in both engineering and technology, demonstrating a commitment to developing technology-driven solutions for the energy sector and beyond.
Projects
E-commerce Website (January 2024 - February 2024): Developed a fully functional e-commerce site featuring user authentication, product search, and payment integration.
Open Source Contribution (March 2022 - Present): Actively contributed to open-source projects by fixing bugs and adding new features, enhancing software quality.
Chatbot Development (June 2023 - Present): Designed an NLP-based chatbot to assist users with common queries, improving user experience.
Key Achievements
Data Security Enhancement: Successfully identified and resolved a critical authentication bug, ensuring data security for over 2,000 users.
Project Deployment Success: Led the deployment of a CRM web application, resulting in a 20% increase in user engagement and a 30% reduction in customer support tickets.`,
      competencies: [
        "AI Technology",
        "Web Development",
        "Cloud Computing",
        "Petroleum Engineering"
      ],
      email: null,
      location: null,
      setInfoCard: false,
    },
    { 
      id: 4,
      name : "Roland Krieger",
      title : "Chief Technical Officer",
      image : rolandProfile,
      education : [
        { degree: "M. Eng.", institution: "Cornell University", year: "2014" },
        { degree: "B. Sc.", institution: "Cornell University", year: "2013" }
      ],
      bio : `Roland Krieger is a Software Engineer with several years of experience building apps in various 
      industries including fintech, edtech and transportation. He graduated with an M. Eng. (2014) and B. Sc. (2013) 
      in Electrical & Computer Engineering from Cornell University. He is well versed in backend and frontend development 
      and has developed several products from ideation to deployment. He is also an expert in integrating AI into everyday 
      applications. He is passionate about using his technical expertise to solve problems that are impactful to society.`,
      competencies : [
        "Fullstack Development",
        "AI Integration",
        "FinTech",
        "EdTech",
        "Product Ideation"
      ],
      socialLinks : {
        linkedin: "#",
        twitter: "#",
        github: "#"
      },
      email : null,
      location : null,
      setInfoCard: false,
    }
  ];

  return (
    <>
    {infoCard && <div id={styles.container}>
      <TeamMember {...teamMember} setInfoCard={setInfoCard}/>
    </div>}
      <Header />
      <div className={styles.about}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroContainer}>
            <motion.div
              className={styles.heroContent}
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
            >
              <h1 className={styles.heroTitle}>
                Where intelligence meets <br /><span className={styles.accentText}>infrastructure.</span>
              </h1>
              <p className={styles.heroSubtitle}>
                Established in 2021, Ant Cyber Engineering Limited is an innovative IT powerhouse delivering transformative digital solutions across Africa and beyond.
              </p>
            </motion.div>

            <motion.div
              className={styles.heroGrid}
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.div className={`${styles.heroMain} ${styles.placeholderImage}`} variants={fadeInUp}>
                <div className={styles.imageOverlay}></div>
                <div className={styles.imageContent}>
                  <p className={styles.imageLabel}>Since 2021</p>
                  <h2 className={styles.imageTitle}>Pioneering Digital Transformation in Ghana & UK</h2>
                </div>
                <div className={styles.placeholderText}>
                  <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1200" alt="" />
                </div>
              </motion.div>

              <motion.div className={styles.heroStats} variants={fadeInUp}>
                <div className={styles.statNumber}>100%</div>
                <div>
                  <h3 className={styles.statTitle}>Independent & Innovative</h3>
                  <p className={styles.statDescription}>Specializing in AI, Cybersecurity, and Agritech to foster inclusive growth.</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className={styles.missionVision}>
          <div className={styles.container}>
            <div className={styles.mvGrid}>
              <motion.div
                className={styles.mvContent}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, threshold: 0.1 }}
                variants={fadeInUp}
              >
                <h2 className={styles.mvTitle}>Empowering organizations with AI-driven digital solutions.</h2>
                <div className={styles.mvItems}>
                  <div>
                    <h3 className={styles.mvItemTitle}>
                      <LuTarget className={styles.accentIcon} size={20} /> Our Mission
                    </h3>
                    <p className={styles.mvItemText}>
                      To deliver transformative AI-driven and digital solutions that empower organizations across sectors to achieve sustainable growth, improve operational effectiveness, and foster inclusive innovation.
                    </p>
                  </div>
                  <div>
                    <h3 className={styles.mvItemTitle}>
                      <LuEye className={styles.accentIcon} size={20} /> Our Vision
                    </h3>
                    <p className={styles.mvItemText}>
                      To be a global leader in sector-specific digital transformation, providing cutting-edge technology solutions in AI, cybersecurity, and consulting to create meaningful and lasting impact.
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className={styles.statsGrid}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, threshold: 0.1 }}
                variants={staggerContainer}
              >
                {[
                  { value: '2021', label: 'Founded' },
                  { value: 'UK', label: 'Global Entity' },
                  { value: 'AI', label: 'Focused' },
                  { value: '15+', label: 'Major Projects' }
                ].map((stat, index) => (
                  <motion.div key={index} className={styles.statCard} variants={statCardVariants}>
                    <div className={styles.statCardValue}>{stat.value}</div>
                    <p className={styles.statCardLabel}>{stat.label}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Core Services */}
        <section className={styles.services}>
          <div className={styles.container}>
            <motion.div
              className={styles.servicesHeader}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, threshold: 0.1 }}
              variants={fadeInUp}
            >
              <h2 className={styles.sectionTitle}>Core Expertise</h2>
              <p className={styles.sectionSubtitle}>We bridge the gap between complex technology and real-world operational efficiency.</p>
            </motion.div>

            <motion.div
              className={styles.servicesGrid}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, threshold: 0.1 }}
              variants={staggerContainer}
            >
              {services.map((service, index) => (
                <motion.div
                  key={index}
                  className={styles.serviceCard}
                  variants={serviceCardVariants}
                  whileHover="hover"
                >
                  <div className={styles.serviceIcon}>
                    <service.icon size={24} />
                  </div>
                  <h3 className={styles.serviceTitle}>{service.title}</h3>
                  <p className={styles.serviceDescription}>{service.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Partners */}
        <section className={styles.partners}>
          <div className={styles.container}>
            <motion.p
              className={styles.partnersLabel}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, threshold: 0.1 }}
              variants={fadeInUp}
            >
              Trusted by Global Organizations & Governments
            </motion.p>
            <motion.div
              className={styles.partnersGrid}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, threshold: 0.1 }}
              variants={staggerContainer}
            >
              {partners.map((partner, index) => (
                <motion.div key={index} className={styles.partnerLogo} variants={fadeInUp}>
                  {partner}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Key Projects */}
        <section className={styles.projects}>
          <div className={styles.container}>
            <motion.div
              className={styles.projectsHeader}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, threshold: 0.1 }}
              variants={fadeInUp}
            >
              <div className={styles.projectsHeaderContent}>
                <h2 className={styles.sectionTitle}>Proven Impact</h2>
                <p className={styles.sectionSubtitle}>A track record of delivering high-impact technology solutions across Africa.</p>
              </div>
            </motion.div>

            <motion.div
              className={styles.projectsList}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, threshold: 0.1 }}
              variants={staggerContainer}
            >
              {projects.map((project, index) => (
                <motion.div
                  key={index}
                  className={styles.projectItem}
                  variants={projectVariants}
                  whileHover="hover"
                >
                  <div>
                    <span className={styles.projectClient}>{project.client}</span>
                    <h3 className={styles.projectTitle}>{project.title}</h3>
                  </div>
                  <p className={styles.projectDescription}>{project.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Team Section */}
        <section className={styles.team}>
          <div className={styles.container}>
            <motion.div
              className={styles.teamHeader}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, threshold: 0.1 }}
              variants={fadeInUp}
            >
              <h2 className={styles.sectionTitle}>Meet the team</h2>
              <p className={styles.sectionSubtitle}>Behind every great solution is a team of passionate innovators, problem-solvers, and visionaries.</p>
            </motion.div>

            <motion.div
              className={styles.teamGrid}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, threshold: 0.1 }}
              variants={staggerContainer}
            >
              {team.map((member, index) => (
                <motion.div
                  key={index}
                  className={styles.teamCard}
                  variants={teamCardVariants}
                  whileHover="hover"
                >
                  <div className={styles.teamImage}>
                    <div className={styles.teamImagePlaceholder}>
                      <img src={member.image} alt="" />
                    </div>
                    <div className={styles.teamSocial}>
                      {member?.socialLinks?.linkedin && (
                        <a href={member?.socialLinks?.linkedin} target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>
                          <LuLinkedin size={16} />
                        </a>
                      )}
                      {member?.socialLinks?.twitter && (
                        <a href={member?.socialLinks?.twitter} target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>
                          <LuTwitter size={16} />
                        </a>
                      )}
                    </div>
                  </div>
                  <div style={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
                    <div>
                  <h3 className={styles.teamName}>{member.name}</h3>
                  <p className={styles.teamRole}>{member.title}</p>
                    </div>

                    <button className={styles.infoBtn} onClick={() => {setTeamMember({...member}), setInfoCard(true) }}>
                      <LiaInfoSolid size={30} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Why Us Section */}
        <section className={styles.whyUs}>
          <div className={styles.whyUsOverlay}></div>
          <div className={`${styles.container} ${styles.whyUsContainer}`}>
            <div className={styles.whyUsGrid}>
              <motion.div
                className={styles.whyUsContent}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, threshold: 0.1 }}
                variants={fadeInUp}
              >
                <h2 className={styles.whyUsTitle}>Why Ant Cyber Engineering?</h2>
                <div className={styles.whyUsItems}>
                  <div className={styles.whyUsItem}>
                    <FaRegCheckCircle className={styles.accentIcon} size={20} />
                    <div>
                      <h4 className={styles.whyUsItemTitle}>Human-Centered Design</h4>
                      <p className={styles.whyUsItemText}>We design for youth, women, and people with disabilities, ensuring technology is inclusive.</p>
                    </div>
                  </div>
                  <div className={styles.whyUsItem}>
                    <FaRegCheckCircle className={styles.accentIcon} size={20} />
                    <div>
                      <h4 className={styles.whyUsItemTitle}>Cross-Country Scalability</h4>
                      <p className={styles.whyUsItemText}>Our platforms are built to scale across geographies, languages, and various mobile access conditions.</p>
                    </div>
                  </div>
                  <div className={styles.whyUsItem}>
                    <FaRegCheckCircle className={styles.accentIcon} size={20} />
                    <div>
                      <h4 className={styles.whyUsItemTitle}>AgriTech Readiness</h4>
                      <p className={styles.whyUsItemText}>Deep expertise in building AI-driven, multilingual platforms for rural and agricultural inclusion.</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className={styles.whyUsQuote}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, threshold: 0.1 }}
                variants={fadeInUp}
                transition={{ delay: 0.3 }}
              >
                <div className={styles.quoteCard}>
                  <p className={styles.quoteText}>
                    "Our mission is to bridge the complexity of emerging technologies with the simplicity of user-centered digital tools that create lasting social impact."
                  </p>
                  <div className={styles.quoteAuthor}>
                    <div className={styles.quoteAvatar}></div>
                    <div>
                      <p className={styles.quoteName}>Executive Leadership</p>
                      <p className={styles.quoteTitle}>Ant Cyber Engineering Limited</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={styles.cta}>
          <div className={styles.container}>
            <motion.div
              className={styles.ctaCard}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, threshold: 0.1 }}
              variants={fadeInUp}
            >
              <h2 className={styles.ctaTitle}>Ready to transform your digital landscape?</h2>
              <p className={styles.ctaSubtitle}>Connect with our team in Ghana or the UK to explore innovative solutions for your organization.</p>
              <div className={styles.ctaButtons}>
                <Link to="/contact" className={styles.ctaPrimary}>
                  Get in touch <LuArrowRight size={18} />
                </Link>
                <Link to="/services" className={styles.ctaSecondary}>Our Services</Link>
              </div>
            </motion.div>
          </div>
        </section>
      </div>

      {/* {!infoCard && <TeamMember />} */}
      <Footer />
      {infoCard && <div className={styles.overlay}  onClick={() => setInfoCard(false)}>
      </div>}
      
    </>
  );
};

export default About;