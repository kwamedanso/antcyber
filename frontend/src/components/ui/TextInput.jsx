import React from 'react';
import InputWrapper from './InputWrapper';
import styles from './styles/TextInput.module.css';

const TextInput = ({ label, labelPlacement, id, error, info, ...props }) => {
  return (
    <InputWrapper label={label} labelPlacement={labelPlacement} htmlFor={id} error={error} info={info}>
      <input
        type="text"
        id={id}
        className={`${styles.input} ${error ? styles.inputError : ''}`}
        {...props}
      />
    </InputWrapper>
  );
};

export default TextInput;