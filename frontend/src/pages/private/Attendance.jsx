// pages/attendance/Attendance.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { toast, Toaster } from 'sonner';
import { format, differenceInMinutes, isSameDay } from 'date-fns';
import {
  FiClock,
  FiMapPin,
  FiLogIn,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiRefreshCw,
  FiAlertCircle,
} from 'react-icons/fi';
import { SlLogin } from "react-icons/sl";

import useAuth from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import { usePrivateQuery } from '../../hooks/usePrivateQuery';
import { usePrivateMutation } from '../../hooks/usePrivateMutation';
import styles from './styles/Attendance.module.css';

// Helper to extract a friendly location name from the JSONB address
const getFriendlyLocation = (addressJson) => {
  if (!addressJson) return 'Location not recorded';
  if (addressJson.full_address) {
    const parts = addressJson.full_address.split(',');
    return parts.slice(0, 3).join(',').trim();
  }
  return addressJson.area || addressJson.city || 'Address unavailable';
};

const Attendance = () => {
  const { auth } = useAuth();
  const staffId = auth?.user?.staff_id;

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    document.title = 'Attendance | Ant Cyber Portal';
  }, []);

  // --------------------------------------------------------------------------
  // Fetch Attendance History
  // --------------------------------------------------------------------------
  const { 
    data: response, 
    isLoading, 
    isFetching, 
    refetch 
  } = usePrivateQuery(
    ['attendance', staffId, { page, limit }],
    '/api/attendance/history',
    { staff_id: staffId, page, limit },
    { enabled: Boolean(staffId) }
  );

  const records = response?.data?.results || [];
  const pagination = response?.data?.pagination || { page: 1, total_pages: 1, total: 0 };

  // Find if there is an active session that started TODAY
  const activeSession = useMemo(() => {
    const session = records.find(r => !r.clock_out_at);
    if (!session) return null;
    
    // Ensure the clock-in date is today. 
    // The backend will auto-close yesterday's sessions, but this is a safety net.
    const clockInDate = new Date(session.clock_in_at);
    if (!isSameDay(clockInDate, new Date())) {
      return null; 
    }
    return session;
  }, [records]);

  // Check if there's a recently auto-closed session to warn the user
  const autoClosedSession = useMemo(() => {
    return records.find(r => r.clock_out_address?.auto_closed === true);
  }, [records]);

  // --------------------------------------------------------------------------
  // Geolocation Helper
  // --------------------------------------------------------------------------
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => reject(error),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    });
  };

  // --------------------------------------------------------------------------
  // Mutations
  // --------------------------------------------------------------------------
  const { mutate: clockIn, isPending: isClockingIn } = usePrivateMutation({
    targetQueryKey: ['attendance'],
    onSuccess: () => toast.success('Clocked in successfully.', { duration: 3000 }),
    onError: (error) => toast.error(error?.response?.data?.message || 'Clock in failed.', { duration: 4000 }),
  });

  const { mutate: clockOut, isPending: isClockingOut } = usePrivateMutation({
    targetQueryKey: ['attendance'],
    onSuccess: () => toast.success('Clocked out successfully.', { duration: 3000 }),
    onError: (error) => toast.error(error?.response?.data?.message || 'Clock out failed.', { duration: 4000 }),
  });

  // --------------------------------------------------------------------------
  // Handlers
  // --------------------------------------------------------------------------
  const handleClockIn = async () => {
    try {
      setIsLocating(true);
      const location = await getCurrentLocation();
      
      clockIn({
        url: '/api/attendance/clock-in',
        method: 'POST',
        data: {
          staff_id: staffId,
          ...location,
          device: navigator.userAgent,
        },
      });
    } catch (err) {
      toast.error(err.message || 'Could not get your location. Please enable GPS.', { duration: 4000 });
    } finally {
      setIsLocating(false);
    }
  };

  const handleClockOut = async () => {
    if (!activeSession) return;
    try {
      setIsLocating(true);
      const location = await getCurrentLocation();

      clockOut({
        url: `/api/attendance/clock-out/${activeSession.attendance_id}`,
        method: 'PATCH',
        data: {
          ...location,
          device: navigator.userAgent,
        },
      });
    } catch (err) {
      toast.error(err.message || 'Could not get your location. Please enable GPS.', { duration: 4000 });
    } finally {
      setIsLocating(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <Toaster position="top-right" richColors />

      <div className={styles.pageContainer}>
        {/* Header */}
        <header className={styles.pageHeader}>
          <div>
            <h1 className={styles.title}>Attendance</h1>
            <p className={styles.subtitle}>Clock in and out to track your daily hours.</p>
          </div>
        </header>

        {/* Warning Banner for Auto-Closed Sessions */}
        {autoClosedSession && !activeSession && (
          <div className={styles.warningBanner}>
            <FiAlertCircle size={20} />
            <div>
              <strong>Forgot to clock out?</strong>
              <p>Your session from {format(new Date(autoClosedSession.clock_in_at), 'MMM d')} was automatically closed at 11:59 PM.</p>
            </div>
          </div>
        )}

        {/* Clock In/Out Widget */}
        <motion.div 
          className={styles.clockWidget}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className={styles.clockStatus}>
            <div className={`${styles.statusIndicator} ${activeSession ? styles.active : ''}`} />
            <div>
              <h2 className={styles.clockTitle}>
                {activeSession ? 'You are currently Clocked In' : 'You are Clocked Out'}
              </h2>
              <p className={styles.clockSubtitle}>
                {activeSession 
                  ? `Started at ${format(new Date(activeSession.clock_in_at), 'h:mm a')}`
                  : 'Start your shift by clocking in.'}
              </p>
            </div>
          </div>

          <div>
            {activeSession ? (
              <Button 
                onClick={handleClockOut}
                disabled={isClockingOut || isLocating}
                isLoading={isLocating}
              >
                <SlLogin size={16} style={{ marginRight: '6px', transform: 'rotate(180deg)' }} />
                {isLocating ? 'Locating...' : 'Clock Out'}
              </Button>
            ) : (
              <Button 
                onClick={handleClockIn}
                isLoading={isLocating}
                disabled={isClockingIn || isLocating}
              >
                <SlLogin size={16} style={{ marginRight: '6px' }} />
                {isLocating ? 'Locating...' : 'Clock In'}
              </Button>
            )}
          </div>
        </motion.div>

        {/* History Table Card */}
        <motion.div 
          className={styles.card}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className={styles.toolbar}>
            <h2 className={styles.cardTitle}>Attendance History</h2>
            <button className={styles.iconBtn} onClick={() => refetch()} disabled={isFetching}>
              <FiRefreshCw size={16} className={isFetching ? styles.spin : ''} /> Refresh
            </button>
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
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan="5" className={styles.emptyState}>Loading history...</td></tr>
                ) : records.length === 0 ? (
                  <tr><td colSpan="5" className={styles.emptyState}>No attendance records found.</td></tr>
                ) : (
                  records.map((record) => {
                    const clockInTime = new Date(record.clock_in_at);
                    const clockOutTime = record.clock_out_at ? new Date(record.clock_out_at) : null;
                    const isAutoClosed = record.clock_out_address?.auto_closed;
                    
                    let duration = '—';
                    if (clockOutTime) {
                      const mins = differenceInMinutes(clockOutTime, clockInTime);
                      const hrs = Math.floor(mins / 60);
                      const remainingMins = mins % 60;
                      duration = `${hrs}h ${remainingMins}m`;
                    }

                    return (
                      <tr key={record.attendance_id} className={styles.tableRow}>
                        <td>
                          <div className={styles.dateCell}>
                            <span className={styles.primaryText}>{format(clockInTime, 'MMM d, yyyy')}</span>
                          </div>
                        </td>
                        <td>
                          <span className={styles.timeText}>{format(clockInTime, 'h:mm a')}</span>
                        </td>
                        <td>
                          {clockOutTime ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <span className={styles.timeText}>{format(clockOutTime, 'h:mm a')}</span>
                              {isAutoClosed && (
                                <span className={styles.autoClosedText}>Auto-closed</span>
                              )}
                            </div>
                          ) : (
                            <span className={styles.activeBadge}>Active</span>
                          )}
                        </td>
                        <td>
                          <span className={styles.durationText}>{duration}</span>
                        </td>
                        <td>
                          <div className={styles.locationCell} title={record?.clock_in_address?.full_address || 'No address'}>
                            <FiMapPin size={14} className={styles.locationIcon} />
                            <span className={styles.locationText}>
                              {getFriendlyLocation(record?.clock_in_address)}
                            </span>
                          </div>
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
              Showing {(pagination.page - 1) * pagination.limit + 1}–
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} records
            </div>
            
            <div className={styles.pageControls}>
              <div className={styles.rowsPerPage}>
                <span>Rows per page:</span>
                <select 
                  value={limit} 
                  onChange={(e) => setLimit(Number(e.target.value))}
                  className={styles.pageSelect}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div className={styles.pageNav}>
                <button 
                  className={styles.pageBtn} 
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  <FiChevronLeft size={16} />
                </button>
                <span className={styles.pageNumActive}>{page}</span>
                <button 
                  className={styles.pageBtn} 
                  disabled={page >= pagination.total_pages}
                  onClick={() => setPage(p => Math.min(pagination.total_pages, p + 1))}
                >
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

export default Attendance;