import React from 'react';
import InputWrapper from './InputWrapper';
import styles from './styles/TextAreaInput.module.css';

const TextAreaInput = ({ label, labelPlacement, id, error, rows = 4, info, ...props }) => {
  return (
    <InputWrapper label={label} labelPlacement={labelPlacement} htmlFor={id} error={error} info={info}>
      <textarea
        id={id}
        rows={rows}
        className={styles.textarea}
        {...props}
      />
    </InputWrapper>
  );
};

export default TextAreaInput;