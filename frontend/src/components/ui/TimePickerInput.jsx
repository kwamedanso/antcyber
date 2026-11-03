import React, { useState, useRef, useEffect } from 'react';
import InputWrapper from './InputWrapper';
import styles from './styles/TimePickerInput.module.css';

const TimePickerInput = ({ label, labelPlacement, id, error, value, onChange, info, ...props }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Parse existing standard "HH:MM AM/PM" or fallback to defaults
  const parsedTime = value ? value.split(/[: ]/) : ['12', '00', 'AM'];
  const currentHour = parsedTime[0];
  const currentMinute = parsedTime[1];
  const currentPeriod = parsedTime[2] || 'AM';

  // Handle clicking outside to close the dropdown window
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const updateTime = (hour, minute, period) => {
    const formattedTime = `${hour}:${minute} ${period}`;
    if (onChange) {
      onChange({ target: { id, value: formattedTime } });
    }
  };

  // Generate selection lists
  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const minutes = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0')); // 5-minute increments for cleaner ERP speed-selection

  return (
    <InputWrapper label={label} labelPlacement={labelPlacement} htmlFor={id} error={error} info={info}>
      <div className={styles.timePickerContainer} ref={containerRef}>
        <div className={styles.inputWrapper} onClick={() => setIsOpen(!isOpen)}>
          <input
            type="text"
            id={id}
            readOnly
            placeholder="12:00 AM"
            value={value || ''}
            className={`${styles.input} ${error ? styles.inputError : ''}`}
            {...props}
          />
          <span className={styles.clockIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </span>
        </div>

        {isOpen && (
          <div className={styles.timeDropdown}>
            <div className={styles.columnWrapper}>
              
              {/* Hours Column */}
              <div className={styles.column}>
                <div className={styles.columnHeader}>HH</div>
                <div className={styles.list}>
                  {hours.map(h => (
                    <button
                      key={h}
                      type="button"
                      className={`${styles.timeButton} ${currentHour === h ? styles.activeItem : ''}`}
                      onClick={() => updateTime(h, currentMinute, currentPeriod)}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>

              {/* Minutes Column */}
              <div className={styles.column}>
                <div className={styles.columnHeader}>MM</div>
                <div className={styles.list}>
                  {minutes.map(m => (
                    <button
                      key={m}
                      type="button"
                      className={`${styles.timeButton} ${currentMinute === m ? styles.activeItem : ''}`}
                      onClick={() => updateTime(currentHour, m, currentPeriod)}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Period Column (AM/PM) */}
              <div className={styles.columnShort}>
                <div className={styles.columnHeader}>Ref</div>
                <div className={styles.list}>
                  {['AM', 'PM'].map(p => (
                    <button
                      key={p}
                      type="button"
                      className={`${styles.timeButton} ${currentPeriod === p ? styles.activeItem : ''}`}
                      onClick={() => updateTime(currentHour, currentMinute, p)}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </InputWrapper>
  );
};

export default TimePickerInput;