import React, { useState, useRef, useEffect } from 'react';
import InputWrapper from './InputWrapper';
import styles from './styles/MultiSelectInput.module.css';

const MultiSelectInput = ({ label, labelPlacement, id, error, options = [], value = [], onChange, placeholder = 'Select options...', info }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue) => {
    const updatedValue = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue];
    
    if (onChange) {
      onChange({ target: { id, value: updatedValue } });
    }
  };

  const removeTag = (e, optionValue) => {
    e.stopPropagation();
    if (onChange) {
      onChange({ target: { id, value: value.filter(v => v !== optionValue) } });
    }
  };

  return (
    <InputWrapper label={label} labelPlacement={labelPlacement} htmlFor={id} error={error} info={info}>
      <div className={styles.container} ref={containerRef}>
        <div className={styles.inputField} onClick={() => setIsOpen(!isOpen)}>
          <div className={styles.tagsContainer}>
            {value.length === 0 && <span className={styles.placeholder}>{placeholder}</span>}
            {value.map(val => {
              const matched = options.find(o => o.value === val);
              return (
                <span key={val} className={styles.tagPill}>
                  {matched ? matched.label : val}
                  <button type="button" className={styles.removeBtn} onClick={(e) => removeTag(e, val)}>&times;</button>
                </span>
              );
            })}
          </div>
          <span className={`${styles.arrow} ${isOpen ? styles.arrowOpen : ''}`}></span>
        </div>

        {isOpen && (
          <ul className={styles.dropdown}>
            {options.map(opt => {
              const isChecked = value.includes(opt.value);
              return (
                <li key={opt.value} className={`${styles.row} ${isChecked ? styles.rowChecked : ''}`} onClick={() => handleSelect(opt.value)}>
                  <span className={`${styles.checkbox} ${isChecked ? styles.checkboxChecked : ''}`}></span>
                  {opt.label}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </InputWrapper>
  );
};

export default MultiSelectInput;