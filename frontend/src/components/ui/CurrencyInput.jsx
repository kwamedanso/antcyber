import React from 'react';
import InputWrapper from './InputWrapper';
import styles from './styles/CurrencyInput.module.css';

const CurrencyInput = ({ label, labelPlacement, id, error, currencySymbol, info, ...props }) => {
  return (
    <InputWrapper label={label} labelPlacement={labelPlacement} htmlFor={id} error={error} info={info}>
      <div className={styles.inputContainer}>
        <span className={styles.prefix}>{currencySymbol}</span>
        <input
          type="number"
          step="0.01"
          id={id}
          className={`${styles.input} ${error ? styles.inputError : ''}`}
          placeholder="0.00"
          {...props}
        />
      </div>
    </InputWrapper>
  );
};

export default CurrencyInput;