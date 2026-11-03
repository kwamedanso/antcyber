import React from 'react';
import InputWrapper from './InputWrapper';
import styles from './styles/QuantityUoMInput.module.css';

const QuantityUoMInput = ({ label, labelPlacement, id, error, qtyValue, onQtyChange, uomValue, onUomChange, uomOptions = [], info, ...props }) => {
  return (
    <InputWrapper label={label} labelPlacement={labelPlacement} htmlFor={`${id}-qty`} error={error} info={info}>
      <div className={styles.compoundWrapper}>
        <input
          type="number"
          id={`${id}-qty`}
          className={styles.qtyInput}
          value={qtyValue}
          onChange={(e) => onQtyChange && onQtyChange(e.target.value)}
          placeholder="0"
          {...props}
        />
        <select
          id={`${id}-uom`}
          className={styles.uomSelect}
          value={uomValue}
          onChange={(e) => onUomChange && onUomChange(e.target.value)}
        >
          {uomOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    </InputWrapper>
  );
};

export default QuantityUoMInput;