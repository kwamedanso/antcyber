import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const Tooltip = ({ children, text, show }) => {
  const [rect, setRect] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    if (show && ref.current) {
      setRect(ref.current.getBoundingClientRect());
    }
  }, [show]);

  return (
    <div ref={ref} className="relative flex items-center group w-full">
      {children}
      {show && rect && createPortal(
        <div 
          className="fixed px-2 py-1 bg-gray-900 text-white text-xs rounded shadow-lg whitespace-nowrap z-[100] pointer-events-none"
          style={{ top: rect.top + rect.height / 2, left: rect.right + 8, transform: 'translateY(-50%)' }}
        >
          {text}
          <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
        </div>,
        document.body
      )}
    </div>
  );
};

export default Tooltip;