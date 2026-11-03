import React from 'react';
import DatePickerInput from './DatePickerInput';
import TimePickerInput from './TimePickerInput';
import styles from './styles/DateTimePickerInput.module.css';

const DateTimePickerInput = ({
  label,
  labelPlacement = 'top',
  id,
  dateValue,
  timeValue,
  onDateChange,
  onTimeChange,
  error,
  info
}) => {
  
  const containerClass = `${styles.wrapperContainer} ${
    labelPlacement === 'left' ? styles.layoutLeft : styles.layoutTop
  }`;

  return (
    <div className={containerClass}>
      {/* Label block coordination */}
      {label && labelPlacement !== 'none' && (
        <label className={styles.mainLabel} htmlFor={`${id}-date`}>
          {label}
        </label>
      )}

      <div className={styles.inputsGroup}>
        {/* Date Component Segment */}
        <div className={styles.dateSegment}>
          <DatePickerInput
            labelPlacement="none"
            id={`${id}-date`}
            value={dateValue}
            onChange={(e) => {
              if (onDateChange) onDateChange(e.target.value);
            }}
          />
        </div>

        {/* Time Component Segment */}
        <div className={styles.timeSegment}>
          <TimePickerInput
            labelPlacement="none"
            id={`${id}-time`}
            value={timeValue}
            onChange={(e) => {
              if (onTimeChange) onTimeChange(e.target.value);
            }}
          />
        </div>
      </div>

      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
};

export default DateTimePickerInput;