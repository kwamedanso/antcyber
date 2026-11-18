// pages/attendance/StaffAttendance.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format, differenceInMinutes } from 'date-fns';
import { FiSearch, FiChevronLeft, FiChevronRight, FiRefreshCw, FiEye, FiUserCheck } from 'react-icons/fi';
import { usePrivateQuery } from '../../hooks/usePrivateQuery';
import styles from './styles/Attendance.module.css';

const StaffAttendance = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('history'); // 'history' | 'active'
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => { document.title = 'Staff Attendance | Admin'; }, []);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch History
  const { data: historyRes, isLoading: historyLoading, isFetching, refetch } = usePrivateQuery(
    ['attendance', 'all', { page, limit, search: debouncedSearch }],
    '/api/attendance/history',
    { page, limit }, // We'll filter by search on frontend for simplicity
    { enabled: activeTab === 'history' }
  );

  // Fetch Currently Active
  const { data: activeRes, isLoading: activeLoading, refetch: refetchActive } = usePrivateQuery(
    ['attendance', 'active'],
    '/api/attendance/active',
    {},
    { enabled: activeTab === 'active' }
  );

  const historyRecords = historyRes?.data?.results || [];
  const pagination = historyRes?.data?.pagination || { page: 1, total_pages: 1, total: 0 };
  
  const activeRecords = activeRes?.data || [];

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.pageContainer}>
        <header className={styles.pageHeader}>
          <div>
            <h1 className={styles.title}>Staff Attendance</h1>
            <p className={styles.subtitle}>Monitor clock-ins and view history for all staff.</p>
          </div>
        </header>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '1.5rem', borderBottom: '1px solid #e5e7eb', marginBottom: '1rem' }}>
          <button 
            style={{ background: 'none', border: 'none', padding: '0.75rem 0', fontWeight: 600, cursor: 'pointer', borderBottom: activeTab === 'history' ? '2px solid #b8cc85' : '2px solid transparent', color: activeTab === 'history' ? '#1a1a1a' : '#6b7280' }}
            onClick={() => setActiveTab('history')}
          >
            All History
          </button>
          <button 
            style={{ background: 'none', border: 'none', padding: '0.75rem 0', fontWeight: 600, cursor: 'pointer', borderBottom: activeTab === 'active' ? '2px solid #b8cc85' : '2px solid transparent', color: activeTab === 'active' ? '#1a1a1a' : '#6b7280' }}
            onClick={() => setActiveTab('active')}
          >
            Currently Clocked In ({activeRecords.length})
          </button>
        </div>

        {/* History Tab */}
        {activeTab === 'history' && (
          <motion.div className={styles.card} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className={styles.toolbar}>
              <div style={{ position: 'relative', flex: 1, maxWidth: '300px' }}>
                <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                <input 
                  type="text" 
                  placeholder="Search staff name..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem 0.75rem 0.5rem 2.25rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.875rem', outline: 'none' }}
                />
              </div>
              <button className={styles.iconBtn} onClick={() => refetch()} disabled={isFetching}>
                <FiRefreshCw size={16} className={isFetching ? styles.spin : ''} /> Refresh
              </button>
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Staff Member</th>
                    <th>Date</th>
                    <th>Clock In</th>
                    <th>Clock Out</th>
                    <th>Duration</th>
                    <th>Location</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {historyLoading ? (
                    <tr><td colSpan="7" className={styles.emptyState}>Loading...</td></tr>
                  ) : historyRecords.length === 0 ? (
                    <tr><td colSpan="7" className={styles.emptyState}>No records found.</td></tr>
                  ) : (
                    historyRecords
                      .filter(r => r.full_name?.toLowerCase().includes(debouncedSearch.toLowerCase()))
                      .map((record) => {
                        const inTime = new Date(record.clock_in_at);
                        const outTime = record.clock_out_at ? new Date(record.clock_out_at) : null;
                        let duration = '—';
                        if (outTime) {
                          const mins = differenceInMinutes(outTime, inTime);
                          duration = `${Math.floor(mins / 60)}h ${mins % 60}m`;
                        }
                        return (
                          <tr key={record.attendance_id} className={styles.tableRow} onClick={() => navigate(`/admin/attendance/${record.attendance_id}`)}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FiUserCheck size={16} color="#6b7280" />
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <span className={styles.primaryText}>{record.full_name}</span>
                                  <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{record.staff_id}</span>
                                </div>
                              </div>
                            </td>
                            <td>{format(inTime, 'MMM d, yyyy')}</td>
                            <td>{format(inTime, 'h:mm a')}</td>
                            <td>{outTime ? format(outTime, 'h:mm a') : <span className={styles.activeBadge}>Active</span>}</td>
                            <td>{duration}</td>
                            <td>{record?.clock_in_address?.city || '—'}</td>
                            <td style={{ textAlign: 'right' }}>
                              <button className={styles.iconBtn}><FiEye size={16} /></button>
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
              <div className={styles.pageInfo}>Showing {historyRecords.length} of {pagination.total} records</div>
              <div className={styles.pageNav}>
                <button className={styles.pageBtn} disabled={page === 1} onClick={() => setPage(p => p - 1)}><FiChevronLeft size={16} /></button>
                <span className={styles.pageNumActive}>{page}</span>
                <button className={styles.pageBtn} disabled={page >= pagination.total_pages} onClick={() => setPage(p => p + 1)}><FiChevronRight size={16} /></button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Active Tab */}
        {activeTab === 'active' && (
          <motion.div className={styles.card} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
             <div className={styles.toolbar}>
              <h2 className={styles.cardTitle}>Currently Clocked In</h2>
              <button className={styles.iconBtn} onClick={() => refetchActive()}><FiRefreshCw size={16} /> Refresh</button>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Staff Member</th>
                    <th>Clocked In At</th>
                    <th>Location</th>
                  </tr>
                </thead>
                <tbody>
                  {activeLoading ? (
                    <tr><td colSpan="3" className={styles.emptyState}>Loading...</td></tr>
                  ) : activeRecords.length === 0 ? (
                    <tr><td colSpan="3" className={styles.emptyState}>No one is currently clocked in.</td></tr>
                  ) : (
                    activeRecords.map((record) => (
                      <tr key={record.attendance_id} className={styles.tableRow} onClick={() => navigate(`/admin/attendance/${record.attendance_id}`)}>
                        <td>
                          <span className={styles.primaryText}>{record.full_name}</span>
                          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{record.staff_id}</div>
                        </td>
                        <td>{format(new Date(record.clock_in_at), 'h:mm a')}</td>
                        <td>{record?.clock_in_address?.area || 'Unknown'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default StaffAttendance;