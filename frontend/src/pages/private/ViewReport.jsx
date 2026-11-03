// pages/reports/ViewReport.jsx
import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  FiArrowLeft,
  FiEdit2,
  FiPrinter,
  FiFileText,
  FiUser,
  FiFolder,
  FiCheckCircle,
  FiClock,
  FiDownload,
  FiMessageSquare,
} from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import { usePrivateQuery } from '../../hooks/usePrivateQuery';
import logo from "../../assets/logo.png"
import styles from './styles/ViewReport.module.css';

// Status styling helper
const getStatusStyle = (status) => {
  switch (status) {
    case 'received': return { color: '#16a34a', bg: '#dcfce7' };
    case 'submitted': return { color: '#2563eb', bg: '#dbeafe' };
    case 'awaiting_receipt': return { color: '#ea580c', bg: '#ffedd5' };
    case 'draft': return { color: '#6b7280', bg: '#f3f4f6' };
    default: return { color: '#6b7280', bg: '#f3f4f6' };
  }
};

const ViewReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const userRank = auth?.user?.rank;

  console.log(auth)
  useEffect(() => {
    document.title = 'View Report | Ant Cyber Portal';
  }, []);

  // --- Fetch Report ---
  const { data: response, isLoading, isError } = usePrivateQuery(
    ['reports', id],
    `/api/reports/${id}`,
    {},
    { enabled: Boolean(id) }
  );

  const report = response?.data?.id ? response.data : response;

  // --- Handlers ---
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadFile = async (e, fileUrl, fileName) => {
    e.preventDefault();
    try {
      const res = await fetch(fileUrl);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed', error);
      window.open(fileUrl, '_blank'); // fallback
    }
  };

  // --- Loading / Error States ---
  if (isLoading || !report) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.pageContainer}>
          {isError ? (
            <div className={styles.stateCard}>
              <h2 className={styles.stateTitle}>Error Loading Report</h2>
              <p className={styles.stateText}>There was a problem loading this report.</p>
              <Button onClick={() => navigate('/admin/reports')}>Go to Reports</Button>
            </div>
          ) : (
            <div className={styles.stateCard}>
              <div className={styles.spinner} />
              <p className={styles.stateText}>Loading report details...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const statusStyle = getStatusStyle(report.status);
  const preparedByName = report.prepared_by_details?.full_name || report.prepared_by_details?.email || 'Unknown';
  const submittedToName = report.submitted_to_details?.full_name || report.submitted_to_details?.email || 'Unknown';

  // Determine if the user can edit this report
  const isCreator = report.prepared_by === auth?.user?.id;
  const canEdit = isCreator && (report.status === 'draft' || report.allow_edit === true);

  return (
    <>
      {/* ====================================================================
          SCREEN VIEW (Hidden when printing)
          ==================================================================== */}
      <div className={`${styles.pageWrapper} ${styles.screenOnly}`}>
        <div className={styles.pageContainer}>
          
          <div className={styles.topActions}>
            <button
              type="button"
              className={styles.backButton}
              onClick={() => navigate(-1)}
            >
              <FiArrowLeft size={14} />
              <span>Back</span>
            </button>

            <div className={styles.actionButtons}>
              <button className={styles.secondaryButton} onClick={handlePrint}>
                <FiPrinter size={16} />
                <span>Print / Save PDF</span>
              </button>
              
              {/* Only show Edit if authorized */}
              {canEdit && (
                <Button onClick={() => navigate(`/admin/reports/${report.id}/edit`)}>
                  <FiEdit2 size={14} style={{ marginRight: '6px' }} />
                  Edit Report
                </Button>
              )}
            </div>
          </div>

          <motion.div
            className={styles.card}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <header className={styles.header}>
              <div className={styles.headerMain}>
                <div className={styles.metaRow}>
                  <span className={styles.refNumber}>{report.reference_number}</span>
                  <span className={styles.typeBadge}>{report.report_type.toUpperCase()}</span>
                  <span
                    className={styles.statusBadge}
                    style={{ color: statusStyle.color, backgroundColor: statusStyle.bg }}
                  >
                    {report.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <h1 className={styles.title}>{report.title}</h1>
              </div>
            </header>

            <div className={styles.divider} />

            <div className={styles.detailsGrid}>
              <div className={styles.detailItem}>
                <div className={styles.detailIcon}><FiUser /></div>
                <div>
                  <span className={styles.detailLabel}>Prepared By</span>
                  <span className={styles.detailValue}>{preparedByName}</span>
                </div>
              </div>

              <div className={styles.detailItem}>
                <div className={styles.detailIcon}><FiUser /></div>
                <div>
                  <span className={styles.detailLabel}>Submitted To</span>
                  <span className={styles.detailValue}>{submittedToName}</span>
                </div>
              </div>

              <div className={styles.detailItem}>
                <div className={styles.detailIcon}><FiFolder /></div>
                <div>
                  <span className={styles.detailLabel}>Associated Project</span>
                  <span className={styles.detailValue}>
                    {report.project_details?.name || 'N/A'}
                  </span>
                </div>
              </div>

              <div className={styles.detailItem}>
                <div className={styles.detailIcon}><FiClock /></div>
                <div>
                  <span className={styles.detailLabel}>Date Created</span>
                  <span className={styles.detailValue}>
                    {format(new Date(report.created_at), 'MMMM d, yyyy')}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.divider} />

            <div className={styles.contentSection}>
              <div className={styles.sectionHeader}>
                <FiFileText />
                <h3>Report Summary</h3>
              </div>
              <div className={styles.textBody}>
                {report.summary.split('\n').map((p, i) => <p key={i}>{p}</p>)}
              </div>
            </div>

            {report.recommendations && (
              <div className={styles.contentSection}>
                <div className={styles.sectionHeader}>
                  <FiCheckCircle />
                  <h3>Recommendations</h3>
                </div>
                <div className={styles.textBody}>
                  {report.recommendations.split('\n').map((p, i) => <p key={i}>{p}</p>)}
                </div>
              </div>
            )}

            {/* Reviewer Notes (Only visible if they exist) */}
            {report.reviewer_notes && (
              <div className={styles.contentSection}>
                <div className={`${styles.sectionHeader} ${styles.notesHeader}`}>
                  <FiMessageSquare />
                  <h3>Reviewer Notes</h3>
                </div>
                <div className={`${styles.textBody} ${styles.notesBody}`}>
                  {report.reviewer_notes.split('\n').map((p, i) => <p key={i}>{p}</p>)}
                </div>
              </div>
            )}

            {/* Attachments List with Download button */}
            {report.attachments && report.attachments.length > 0 && (
              <div className={styles.contentSection}>
                <div className={styles.sectionHeader}>
                  <FiFolder />
                  <h3>Attachments</h3>
                </div>
                <ul className={styles.attachmentList}>
                  {report.attachments.map(file => (
                    <li key={file.id}>
                      <div className={styles.attachmentRow}>
                        <span className={styles.fileName}>{file.file_name}</span>
                        <button
                          onClick={(e) => handleDownloadFile(e, file.file_url, file.file_name)}
                          className={styles.downloadBtn}
                          title="Download file"
                        >
                          <FiDownload size={16} />
                          <span>Download</span>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </motion.div>
        </div>
      </div>

      {/* ====================================================================
          PRINT DOCUMENT (Only visible when printing)
          ==================================================================== */}
      <div className={styles.printDocument}>
        <div className={styles.watermark}>
          <img src={logo} alt="Watermark" />
        </div>

        <div className={styles.printContent}>
          <div className={styles.printHeader}>
            <div className={styles.printBrand}>
              <h2>ANT CYBER</h2>
              <p>Institutional Portal</p>
            </div>
            <div className={styles.printHeaderInfo}>
              <p><strong>Ref:</strong> {report.reference_number}</p>
              <p><strong>Date:</strong> {format(new Date(report.created_at), 'MMM d, yyyy')}</p>
            </div>
          </div>

          <div className={styles.printTitleBlock}>
            <h1>{report.title}</h1>
            <p>{report.report_type.toUpperCase()} REPORT</p>
          </div>

          <table className={styles.printMetaTable}>
            <tbody>
              <tr>
                <td><strong>Prepared By:</strong></td>
                <td>{preparedByName}</td>
                <td><strong>Rank</strong></td>
                <td>{userRank}</td>
              </tr>
              <tr>
                <td><strong>Submitted To:</strong></td>
                <td>{submittedToName}</td>
                <td><strong>Project:</strong></td>
                <td>{report.project_details?.name || 'N/A'}</td>
                {/* <td><strong>Status:</strong></td>
                <td>{report.status.replace('_', ' ').toUpperCase()}</td> */}
              </tr>
            </tbody>
          </table>

          <div className={styles.printSection}>
            <h3>1. Report Summary</h3>
            <div className={styles.printText}>
              {report.summary.split('\n').map((p, i) => <p key={i}>{p}</p>)}
            </div>
          </div>

          {report.recommendations && (
            <div className={styles.printSection}>
              <h3>2. Recommendations</h3>
              <div className={styles.printText}>
                {report.recommendations.split('\n').map((p, i) => <p key={i}>{p}</p>)}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ViewReport;