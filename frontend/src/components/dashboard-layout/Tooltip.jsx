import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import styles from './styles/Tooltip.module.css';

const Tooltip = ({ children, text, show }) => {
  const [rect, setRect] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    if (show && ref.current) {
      setRect(ref.current.getBoundingClientRect());
    }
  }, [show]);

  return (
    <div ref={ref} className={styles.tooltipContainer}>
      {children}
      {show && rect && createPortal(
        <div 
          className={styles.tooltipContent}
          style={{ top: rect.top + rect.height / 2, left: rect.right + 8, transform: 'translateY(-50%)' }}
        >
          {text}
          <div className={styles.tooltipArrow} />
        </div>,
        document.body
      )}
    </div>
  );
};

export default Tooltip;