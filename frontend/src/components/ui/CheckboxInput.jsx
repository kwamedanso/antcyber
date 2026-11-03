import React from 'react';
import InputWrapper from './InputWrapper';
import styles from './styles/CheckboxInput.module.css';

const CheckboxInput = ({ label, labelPlacement, id, error, checkboxLabel, info, ...props }) => {
  return (
    <InputWrapper label={label} labelPlacement={labelPlacement} htmlFor={id} error={error} info={info}>
      <label className={styles.checkboxContainer}>
        <input
          type="checkbox"
          id={id}
          className={styles.checkbox}
          {...props}
        />
        <span className={styles.customCheckmark}></span>
        {checkboxLabel && <span className={styles.innerLabel}>{checkboxLabel}</span>}
      </label>
    </InputWrapper>
  );
};

export default CheckboxInput;