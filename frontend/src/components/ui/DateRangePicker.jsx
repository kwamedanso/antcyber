import React from 'react';
import DatePickerInput from './DatePickerInput';
import styles from './styles/DateRangePicker.module.css';

const DateRangePicker = ({ 
  label, 
  labelPlacement = 'top', 
  id, 
  startDate, 
  endDate, 
  onStartChange, 
  onEndChange, 
  error,
  info
}) => {

  // Layout handling to coordinate with the global design pattern
  const containerClass = `${styles.rangeContainer} ${
    labelPlacement === 'left' ? styles.layoutLeft : styles.layoutTop
  }`;

  return (
    <div className={containerClass}>
      {/* Module Block Level Label */}
      {label && labelPlacement !== 'none' && (
        <label className={styles.mainLabel}>{label}</label>
      )}

      <div className={styles.pickersWrapper}>
        {/* Start Date Picker Field */}
        <DatePickerInput
          labelPlacement="none" // Controlled internally by wrapper layout instead
          id={`${id}-start`}
          value={startDate}
          placeholder="Start Date"
          onChange={(e) => {
            if (onStartChange) onStartChange(e.target.value);
          }}
        />

        <span className={styles.delimiter}>to</span>

        {/* End Date Picker Field */}
        <DatePickerInput
          labelPlacement="none"
          id={`${id}-end`}
          value={endDate}
          placeholder="End Date"
          min={startDate} // Clean ERP Guardrail: Restricts picker from choosing dates prior to the start point
          onChange={(e) => {
            if (onEndChange) onEndChange(e.target.value);
          }}
        />
      </div>
      
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
};

export default DateRangePicker;