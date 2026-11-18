// pages/attendance/AttendanceDetails.jsx
import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format, differenceInMinutes } from 'date-fns';
import { FiArrowLeft, FiMapPin, FiExternalLink, FiClock, FiUser, FiMonitor } from 'react-icons/fi';
import { usePrivateQuery } from '../../hooks/usePrivateQuery';
import styles from './styles/Attendance.module.css';

const AttendanceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: response, isLoading } = usePrivateQuery(
    ['attendance', 'record', id],
    `/api/attendance/${id}`,
    {},
    { enabled: Boolean(id) }
  );

  const record = response?.data;

  if (isLoading || !record) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.pageContainer}>
          <p>Loading details...</p>
        </div>
      </div>
    );
  }

  const inTime = new Date(record.clock_in_at);
  const outTime = record.clock_out_at ? new Date(record.clock_out_at) : null;
  const inAddress = record.clock_in_address;
  const outAddress = record.clock_out_address;

  let duration = '—';
  if (outTime) {
    const mins = differenceInMinutes(outTime, inTime);
    duration = `${Math.floor(mins / 60)}h ${mins % 60}m`;
  }

  const openMap = (lat, lon) => {
    if (!lat || !lon) return;
    window.open(`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=18/${lat}/${lon}`, '_blank');
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.pageContainer}>
        <button className={styles.iconBtn} style={{ width: 'fit-content' }} onClick={() => navigate(-1)}>
          <FiArrowLeft size={16} /> Back
        </button>

        <motion.div className={styles.card} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className={styles.toolbar}>
            <div>
              <h2 className={styles.cardTitle}>Attendance Details</h2>
              <p className={styles.subtitle} style={{ marginTop: '0.25rem' }}>Record ID: #{record.attendance_id}</p>
            </div>
            <span className={outTime ? styles.primaryText : styles.activeBadge}>
              {outTime ? 'Completed' : 'Active Session'}
            </span>
          </div>

          <div style={{ padding: '1.5rem', display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            
            {/* Clock In Block */}
            <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#2563eb' }}>
                <FiClock /> <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>Clock In</h3>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
                <div><strong>Time:</strong> {format(inTime, 'PPPP p')}</div>
                <div><strong>Device:</strong> {record.clock_in_device || 'N/A'}</div>
                <div style={{ marginTop: '0.5rem' }}>
                  <strong>Location:</strong>
                  <p style={{ color: '#6b7280', marginTop: '0.25rem' }}>
                    {inAddress?.full_address || 'Address not recorded.'}
                  </p>
                </div>
                {inAddress?.latitude && inAddress?.longitude && (
                  <button 
                    className={styles.iconBtn} 
                    onClick={() => openMap(inAddress.latitude, inAddress.longitude)}
                    style={{ marginTop: '0.5rem', width: 'fit-content', color: '#2563eb' }}
                  >
                    <FiMapPin size={14} /> View on Map <FiExternalLink size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* Clock Out Block */}
            <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#e11d48' }}>
                <FiClock /> <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>Clock Out</h3>
              </div>
              
              {outTime ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
                  <div><strong>Time:</strong> {format(outTime, 'PPPP p')}</div>
                  <div><strong>Duration:</strong> {duration}</div>
                  <div><strong>Device:</strong> {record.clock_out_device || 'N/A'}</div>
                  <div style={{ marginTop: '0.5rem' }}>
                    <strong>Location:</strong>
                    <p style={{ color: '#6b7280', marginTop: '0.25rem' }}>
                      {outAddress?.auto_closed ? 'Auto-closed by system (Forgot to clock out)' : (outAddress?.full_address || 'Address not recorded.')}
                    </p>
                  </div>
                  {outAddress?.latitude && outAddress?.longitude && (
                    <button 
                      className={styles.iconBtn} 
                      onClick={() => openMap(outAddress.latitude, outAddress.longitude)}
                      style={{ marginTop: '0.5rem', width: 'fit-content', color: '#e11d48' }}
                    >
                      <FiMapPin size={14} /> View on Map <FiExternalLink size={12} />
                    </button>
                  )}
                </div>
              ) : (
                <p style={{ fontSize: '0.875rem', color: '#6b7280', fontStyle: 'italic' }}>User has not clocked out yet.</p>
              )}
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AttendanceDetails;