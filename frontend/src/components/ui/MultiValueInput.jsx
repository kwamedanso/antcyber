import React, {useState} from "react";
import {FiPlus, FiX} from "react-icons/fi";
import styles from "./styles/MultiValueInput.module.css"
import TextInput from "./TextInput";

const MultiValueInput = ({ label, values, onChange, placeholder, icon }) => {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    if (inputValue.trim() && !values.includes(inputValue.trim())) {
      onChange([...values, inputValue.trim()]);
      setInputValue('');
    }
  };

  const handleRemove = (index) => {
    const newValues = values.filter((_, i) => i !== index);
    onChange(newValues);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className={styles.multiValueInput}>
        <div className={styles.multiValueInputWrapper}>
            <div className={styles.inputGroup}>
                <TextInput 
                    label={label}
                    id={label}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                />
                <button type="button" onClick={handleAdd} className={styles.addValueBtn}>
                    <FiPlus size={16} />
                </button>
            </div>
        </div>
        {values.length > 0 && (
            <div className={styles.valueTags}>
                {values.map((val, idx) => (
                    <span key={idx} className={styles.valueTag}>
                        {val}
                        <button type="button" onClick={() => handleRemove(idx)} className={styles.removeValueBtn}>
                            <FiX size={14} />
                        </button>
                    </span>
                ))}
            </div>
        )}
    </div>
  );
};

export default MultiValueInput;