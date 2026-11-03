import React from 'react';
import InputWrapper from './InputWrapper';
import styles from './styles/PhoneInput.module.css';

const PhoneInput = ({ label, labelPlacement, id, error, countryCode, onCodeChange, phoneValue, onPhoneChange, countryOptions = [], info, ...props }) => {
  return (
    <InputWrapper label={label} labelPlacement={labelPlacement} htmlFor={`${id}-number`} error={error} info={info}>
      <div className={styles.compoundWrapper}>
        <select 
          id={`${id}-code`}
          className={styles.codeSelect}
          value={countryCode}
          onChange={(e) => onCodeChange && onCodeChange(e.target.value)}
        >
          {countryOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <input
          type="tel"
          id={`${id}-number`}
          className={styles.phoneField}
          value={phoneValue}
          onChange={(e) => onPhoneChange && onPhoneChange(e.target.value)}
          placeholder="Enter phone number"
          {...props}
        />
      </div>
    </InputWrapper>
  );
};

export default PhoneInput;