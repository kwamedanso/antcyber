// pages/attendance/MyAttendance.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast, Toaster } from 'sonner';
import { format, differenceInMinutes, isSameDay } from 'date-fns';
import {
  FiMapPin, FiChevronLeft, FiChevronRight, FiRefreshCw, FiAlertCircle, FiEye
} from 'react-icons/fi';
import { SlLogin } from "react-icons/sl";

import useAuth from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import { usePrivateQuery } from '../../hooks/usePrivateQuery';
import { usePrivateMutation } from '../../hooks/usePrivateMutation';
import styles from './styles/Attendance.module.css';

const MyAttendance = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const staffId = auth?.user?.staff_id;

  console.log(staffId)

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isLocating, setIsLocating] = useState(false);

  const { data: response, isLoading, isFetching, refetch } = usePrivateQuery(
    ['attendance', staffId, { page, limit }],
    '/api/attendance/history',
    { staff_id: staffId, page, limit },
    // { enabled: Boolean(staffId) }
  );

  const records = response?.data?.results || [];
  const pagination = response?.data?.pagination || { page: 1, total_pages: 1, total: 0 };

  // Active session (must be from today)
  const activeSession = useMemo(() => {
    const session = records.find(r => !r.clock_out_at);
    if (!session) return null;
    if (!isSameDay(new Date(session.clock_in_at), new Date())) return null;
    return session;
  }, [records]);

  const autoClosedSession = useMemo(() => {
    return records.find(r => r.clock_out_address?.auto_closed === true);
  }, [records]);

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) return reject(new Error('Geolocation is not supported'));
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude, accuracy: pos.coords.accuracy }),
        (err) => reject(err),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    });
  };

  const { mutate: clockIn, isPending: isClockingIn } = usePrivateMutation({
    targetQueryKey: ['attendance'],
    onSuccess: () => toast.success('Clocked in successfully.'),
    onError: (err) => toast.error(err?.response?.data?.message || 'Clock in failed.'),
  });

  const { mutate: clockOut, isPending: isClockingOut } = usePrivateMutation({
    targetQueryKey: ['attendance'],
    onSuccess: () => toast.success('Clocked out successfully.'),
    onError: (err) => toast.error(err?.response?.data?.message || 'Clock out failed.'),
  });

  const handleClockIn = async () => {
    try {
      setIsLocating(true);
      const loc = await getCurrentLocation();
      clockIn({ url: '/api/attendance/clock-in', method: 'POST', data: { staff_id: staffId, ...loc, device: navigator.userAgent } });
    } catch (err) {
      toast.error(err.message || 'Could not get location.');
    } finally { setIsLocating(false); }
  };

  const handleClockOut = async () => {
    if (!activeSession) return;
    try {
      setIsLocating(true);
      const loc = await getCurrentLocation();
      clockOut({ url: `/api/attendance/clock-out/${activeSession.attendance_id}`, method: 'PATCH', data: { ...loc, device: navigator.userAgent } });
    } catch (err) {
      toast.error(err.message || 'Could not get location.');
    } finally { setIsLocating(false); }
  };

  return (
    <div className={styles.pageWrapper}>
      <Toaster position="top-right" richColors />
      <div className={styles.pageContainer}>
        <header className={styles.pageHeader}>
          <div>
            <h1 className={styles.title}>My Attendance</h1>
            <p className={styles.subtitle}>Clock in and out to track your daily hours.</p>
          </div>
        </header>

        {autoClosedSession && !activeSession && (
          <div className={styles.warningBanner}>
            <FiAlertCircle size={20} />
            <div>
              <strong>Forgot to clock out?</strong>
              <p>Your session from {format(new Date(autoClosedSession.clock_in_at), 'MMM d')} was automatically closed at 11:59 PM.</p>
            </div>
          </div>
        )}

        <motion.div className={styles.clockWidget} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className={styles.clockStatus}>
            <div className={`${styles.statusIndicator} ${activeSession ? styles.active : ''}`} />
            <div>
              <h2 className={styles.clockTitle}>
                {activeSession ? 'You are currently Clocked In' : 'You are Clocked Out'}
              </h2>
              <p className={styles.clockSubtitle}>
                {activeSession ? `Started at ${format(new Date(activeSession.clock_in_at), 'h:mm a')}` : 'Start your shift by clocking in.'}
              </p>
            </div>
          </div>
          <div>
            {activeSession ? (
              <Button onClick={handleClockOut} disabled={isClockingOut || isLocating} isLoading={isLocating}>
                <SlLogin size={16} style={{ marginRight: '6px', transform: 'rotate(180deg)' }} />
                {isLocating ? 'Locating...' : 'Clock Out'}
              </Button>
            ) : (
              <Button onClick={handleClockIn} isLoading={isLocating} disabled={isClockingIn || isLocating}>
                <SlLogin size={16} style={{ marginRight: '6px' }} />
                {isLocating ? 'Locating...' : 'Clock In'}
              </Button>
            )}
          </div>
        </motion.div>

        <motion.div className={styles.card} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className={styles.toolbar}>
            <h2 className={styles.cardTitle}>My History</h2>
            {/* <button className={styles.iconBtn} onClick={() => refetch()} disabled={isFetching}>
              <FiRefreshCw size={16} className={isFetching ? styles.spin : ''} /> Refresh
            </button> */}
          </div>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Clock In</th>
                  <th>Clock Out</th>
                  <th>Duration</th>
                  <th>Location (In)</th>
                  <th style={{ textAlign: 'right' }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan="6" className={styles.emptyState}>Loading...</td></tr>
                ) : records.length === 0 ? (
                  <tr><td colSpan="6" className={styles.emptyState}>No records found.</td></tr>
                ) : (
                  records.map((record) => {
                    const inTime = new Date(record.clock_in_at);
                    const outTime = record.clock_out_at ? new Date(record.clock_out_at) : null;
                    const isAuto = record.clock_out_address?.auto_closed;
                    let duration = '—';
                    if (outTime) {
                      const mins = differenceInMinutes(outTime, inTime);
                      duration = `${Math.floor(mins / 60)}h ${mins % 60}m`;
                    }

                    return (
                      <tr key={record.attendance_id} className={styles.tableRow}>
                        <td><span className={styles.primaryText}>{format(inTime, 'MMM d, yyyy')}</span></td>
                        <td><span className={styles.timeText}>{format(inTime, 'h:mm a')}</span></td>
                        <td>
                          {outTime ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <span className={styles.timeText}>{format(outTime, 'h:mm a')}</span>
                              {isAuto && <span className={styles.autoClosedText}>Auto-closed</span>}
                            </div>
                          ) : (
                            <span className={styles.activeBadge}>Active</span>
                          )}
                        </td>
                        <td><span className={styles.durationText}>{duration}</span></td>
                        <td>
                          <div className={styles.locationCell}>
                            <FiMapPin size={14} className={styles.locationIcon} />
                            <span className={styles.locationText}>{record?.clock_in_address?.area || 'Unknown'}</span>
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button onClick={() => navigate(`/admin/attendance/${record.attendance_id}`)} className={styles.iconBtn} title="View Details">
                            <FiEye size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className={styles.pagination}>
            <div className={styles.pageInfo}>
              Showing {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </div>
            <div className={styles.pageControls}>
              <div className={styles.pageNav}>
                <button className={styles.pageBtn} disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
                  <FiChevronLeft size={16} />
                </button>
                <span className={styles.pageNumActive}>{page}</span>
                <button className={styles.pageBtn} disabled={page >= pagination.total_pages} onClick={() => setPage(p => Math.min(pagination.total_pages, p + 1))}>
                  <FiChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MyAttendance;