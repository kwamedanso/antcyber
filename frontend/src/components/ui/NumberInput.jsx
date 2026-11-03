import React from 'react';
import InputWrapper from './InputWrapper';
import styles from './styles/NumberInput.module.css';

const NumberInput = ({ label, labelPlacement, id, error, info, ...props }) => {
  return (
    <InputWrapper label={label} labelPlacement={labelPlacement} htmlFor={id} error={error} info={info}>
      <input
        type="number"
        id={id}
        className={styles.input}
        {...props}
      />
    </InputWrapper>
  );
};

export default NumberInput;