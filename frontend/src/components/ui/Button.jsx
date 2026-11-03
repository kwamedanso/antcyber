import React from 'react';
import styles from './styles/Button.module.css';

const Button = ({ 
  children, 
  type = 'button', 
  variant = 'primary', // 'primary' | 'secondary' | 'outline'
  isLoading = false, 
  disabled = false, 
  onClick, 
  ...props 
}) => {
  
  // Combine modular class variants cleanly
  const buttonClass = `${styles.btn} ${styles[variant]} ${isLoading ? styles.loadingState : ''}`;

  return (
    <button
      type={type}
      className={buttonClass}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...props}
    >
      {isLoading ? (
        <span className={styles.spinnerContainer}>
          <span className={styles.spinner}></span>
          <span className={styles.loadingText}>Processing...</span>
        </span>
      ) : (
        <span className={styles.contentWrapper}>{children}</span>
      )}
    </button>
  );
};

export default Button;