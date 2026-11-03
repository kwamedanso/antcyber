import React, { useState, useRef, useEffect } from 'react';
import InputWrapper from './InputWrapper';
import styles from './styles/DatePickerInput.module.css';

const DatePickerInput = ({ label, labelPlacement, id, error, value, onChange, info, ...props }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(value ? new Date(value) : new Date());
  const containerRef = useRef(null);

  useEffect(() => {
    if (value) {
      setCurrentDate(new Date(value));
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Infinite Rolling Window: Generates 60 years behind and ahead of the *currently viewed* year.
  // As the user changes the year, the dropdown array dynamically shifts its boundaries infinitely.
  const rollingRange = 120; 
  const yearsArray = Array.from({ length: rollingRange * 2 }, (_, i) => (year - rollingRange) + i);

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const daysArray = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    daysArray.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    daysArray.push(d);
  }

  const handleMonthSelect = (e) => {
    const targetMonth = parseInt(e.target.value, 10);
    setCurrentDate(new Date(year, targetMonth, 1));
  };

  const handleYearSelect = (e) => {
    const targetYear = parseInt(e.target.value, 10);
    setCurrentDate(new Date(targetYear, month, 1));
  };

  const handleMonthStep = (direction) => {
    setCurrentDate(new Date(year, month + direction, 1));
  };

  const handleDateSelect = (day) => {
    if (!day) return;
    const paddedMonth = String(month + 1).padStart(2, '0');
    const paddedDay = String(day).padStart(2, '0');
    const formattedDate = `${year}-${paddedMonth}-${paddedDay}`;
    
    if (onChange) {
      onChange(formattedDate);
    }
    setIsOpen(false);
  };

  return (
    <InputWrapper label={label} labelPlacement={labelPlacement} htmlFor={id} error={error} info={info}>
      <div className={styles.datePickerContainer} ref={containerRef}>
        <div className={styles.inputWrapper} onClick={() => setIsOpen(true)}>
          <input
            type="text"
            id={id}
            readOnly
            placeholder="YYYY-MM-DD"
            value={value || ''}
            className={`${styles.input} ${error ? styles.inputError : ''}`}
            {...props}
          />
          <span className={styles.calendarIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </span>
        </div>

        {isOpen && (
          <div className={styles.calendarWindow}>
            <div className={styles.calendarHeader}>
              <button type="button" onClick={() => handleMonthStep(-1)} className={styles.navButton}>&larr;</button>
              
              <div className={styles.selectorsGroup}>
                <select value={month} onChange={handleMonthSelect} className={styles.headerSelect}>
                  {monthNames.map((name, idx) => (
                    <option key={name} value={idx}>{name}</option>
                  ))}
                </select>

                <select value={year} onChange={handleYearSelect} className={styles.headerSelect}>
                  {yearsArray.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              <button type="button" onClick={() => handleMonthStep(1)} className={styles.navButton}>&rarr;</button>
            </div>

            <div className={styles.weekDaysGrid}>
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                <div key={d} className={styles.weekDay}>{d}</div>
              ))}
            </div>

            <div className={styles.daysGrid}>
              {daysArray.map((day, index) => {
                const isSelected = value && 
                  new Date(value).getDate() === day && 
                  new Date(value).getMonth() === month && 
                  new Date(value).getFullYear() === year;

                return (
                  <button
                    key={index}
                    type="button"
                    disabled={!day}
                    onClick={() => handleDateSelect(day)}
                    className={`${styles.dayCell} ${!day ? styles.emptyCell : ''} ${isSelected ? styles.selectedDay : ''}`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </InputWrapper>
  );
};

export default DatePickerInput;