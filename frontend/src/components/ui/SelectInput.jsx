import React from 'react';
import InputWrapper from './InputWrapper';
import styles from './styles/SelectInput.module.css';

const SelectInput = ({ label, labelPlacement, id, options = [], error, info, ...props }) => {
  return (
    <InputWrapper label={label} labelPlacement={labelPlacement} htmlFor={id} error={error} info={info}>
      <div className={styles.selectContainer}>
        <select
          id={id}
          className={`${styles.select} ${error ? styles.selectError : ''}`}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </InputWrapper>
  );
};

export default SelectInput;