// import React, { useState, useRef, useEffect } from 'react';
// import InputWrapper from './InputWrapper';
// import styles from './styles/SearchableSelect.module.css';

// const SearchableSelect = ({ 
//   label, 
//   labelPlacement, 
//   id, 
//   error, 
//   options = [], 
//   value, 
//   onChange, 
//   onSearchChange, // <-- New callback prop to trigger API queries
//   isLoading = false, // <-- State flag to show loading status
//   placeholder = 'Search or select...',
//   ...props 
// }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [inputValue, setInputValue] = useState('');
//   const containerRef = useRef(null);
//   const isTypingRef = useRef(false); // Track if user is typing

//   // Sync input value text when the selected value option updates externally
//   useEffect(() => {
//     // Don't update input value if user is actively typing
//     if (isTypingRef.current) return;
    
//     const selectedOption = options.find(opt => opt.value === value);
//     if (selectedOption) {
//       setInputValue(selectedOption.label);
//     } else if (!value) {
//       setInputValue('');
//     }
//   }, [value, options]);

//   // Handle clicking outside to close the dropdown context overlay
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (containerRef.current && !containerRef.current.contains(event.target)) {
//         setIsOpen(false);
//         // Don't clear input value when clicking outside
//         // Keep the current input value
//         isTypingRef.current = false;
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   const handleInputChange = (e) => {
//     const text = e.target.value;
//     setInputValue(text);
//     isTypingRef.current = true; // User is typing
    
//     if (!isOpen) setIsOpen(true);

//     // Pass the typed string up to the parent component to trigger an API request
//     if (onSearchChange) {
//       onSearchChange(text);
//     }
//   };

//   const handleOptionSelect = (option) => {
//     setInputValue(option.label);
//     setIsOpen(false);
//     isTypingRef.current = false; // User stopped typing
//     if (onChange) {
//       onChange({ target: { id, value: option.value } });
//     }
//   };

//   const clearSelection = (e) => {
//     e.stopPropagation();
//     setInputValue('');
//     isTypingRef.current = false;
//     if (onChange) {
//       onChange({ target: { id, value: '' } });
//     }
//     if (onSearchChange) {
//       onSearchChange('');
//     }
//   };

//   // Reset typing flag when options update (API returns results)
//   useEffect(() => {
//     // If we have options and user was typing, keep the input value
//     if (options.length > 0 && isTypingRef.current) {
//       // Keep the current input value
//     }
//   }, [options]);

//   return (
//     <InputWrapper label={label} labelPlacement={labelPlacement} htmlFor={id} error={error}>
//       <div className={styles.container} ref={containerRef}>
//         <div className={styles.inputWrapper} onClick={() => setIsOpen(true)}>
//           <input
//             type="text"
//             id={id}
//             value={inputValue}
//             onChange={handleInputChange}
//             placeholder={placeholder}
//             className={`${styles.input} ${error ? styles.inputError : ''}`}
//             autoComplete="off"
//             {...props}
//           />
          
//           <div className={styles.actions}>
//             {isLoading && <span className={styles.spinner}></span>}
//             {value && !isLoading && (
//               <button type="button" className={styles.clearButton} onClick={clearSelection}>
//                 &times;
//               </button>
//             )}
//             <span className={`${styles.arrow} ${isOpen ? styles.arrowOpen : ''}`}></span>
//           </div>
//         </div>

//         {isOpen && (
//           <ul className={styles.dropdown}>
//             {isLoading && options.length === 0 ? (
//               <li className={styles.statusMessage}>Fetching matches from server...</li>
//             ) : options.length > 0 ? (
//               options.map((option) => {
//                 const isSelected = option.value === value;
//                 return (
//                   <li
//                     key={option.value}
//                     onClick={() => handleOptionSelect(option)}
//                     className={`${styles.optionRow} ${isSelected ? styles.selectedRow : ''}`}
//                   >
//                     {option.label}
//                   </li>
//                 );
//               })
//             ) : (
//               <li className={styles.statusMessage}>No matches found</li>
//             )}
//           </ul>
//         )}
//       </div>
//     </InputWrapper>
//   );
// };

// export default SearchableSelect;





// import React, { useState, useRef, useEffect } from 'react';
// import InputWrapper from './InputWrapper';
// import styles from './styles/SearchableSelect.module.css';

// const SearchableSelect = ({ 
//   label, 
//   labelPlacement, 
//   id, 
//   error, 
//   options = [], 
//   value, 
//   onChange, 
//   onSearchChange, 
//   isLoading = false, 
//   placeholder = 'Search or select...',
//   onActionClick,
//   info,
//   ...props 
// }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [inputValue, setInputValue] = useState('');
//   const containerRef = useRef(null);
//   const isTypingRef = useRef(false);

//   // Sync input value text when the selected value option updates externally
//   useEffect(() => {
//     if (isTypingRef.current) return;
    
//     const selectedOption = options.find(opt => opt.value === value);
//     if (selectedOption) {
//       setInputValue(selectedOption.label);
//     } else if (!value) {
//       setInputValue('');
//     }
//   }, [value, options]);

//   // Handle clicking outside to close the dropdown context overlay
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (containerRef.current && !containerRef.current.contains(event.target)) {
//         setIsOpen(false);
//         isTypingRef.current = false;
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   const handleInputChange = (e) => {
//     const text = e.target.value;
//     setInputValue(text);
//     isTypingRef.current = true;
    
//     if (!isOpen) setIsOpen(true);

//     if (onSearchChange) {
//       onSearchChange(text);
//     }
//   };

//   const handleOptionSelect = (option) => {
//     setInputValue(option.label);
//     setIsOpen(false);
//     isTypingRef.current = false;
//     if (onChange) {
//       onChange({ target: { id, value: option.value } });
//     }
//   };

//   const clearSelection = (e) => {
//     e.stopPropagation();
//     setInputValue('');
//     isTypingRef.current = false;
//     if (onChange) {
//       onChange({ target: { id, value: '' } });
//     }
//     if (onSearchChange) {
//       onSearchChange('');
//     }
//   };

//   const handleCustomAction = (e) => {
//     e.stopPropagation(); // Keep the dropdown window state from firing toggles
//     setIsOpen(false);    // Close dropdown cleanly while modal overlay loads
//     if (onActionClick) {
//       onActionClick();
//     }
//   };

//   return (
//     <InputWrapper label={label} labelPlacement={labelPlacement} htmlFor={id} error={error} info={info}>
//       <div className={styles.container} ref={containerRef}>
//         <div className={styles.inputWrapper} onClick={() => setIsOpen(true)}>
//           <input
//             type="text"
//             id={id}
//             value={inputValue}
//             onChange={handleInputChange}
//             placeholder={placeholder}
//             className={`${styles.input} ${error ? styles.inputError : ''} ${onActionClick ? styles.inputWithAction : ''}`}
//             autoComplete="off"
//             {...props}
//           />
          
//           <div className={styles.actions}>
//             {isLoading && <span className={styles.spinner}></span>}
            
//             {value && !isLoading && (
//               <button type="button" className={styles.clearButton} onClick={clearSelection}>
//                 &times;
//               </button>
//             )}

//             {/* Render conditional inline action trigger button */}
//             {onActionClick && (
//               <button 
//                 type="button" 
//                 className={styles.actionAddButton} 
//                 onClick={handleCustomAction}
//                 title="Add New Entry"
//               >
//                 +
//               </button>
//             )}

//             <span className={`${styles.arrow} ${isOpen ? styles.arrowOpen : ''}`}></span>
//           </div>
//         </div>

//         {isOpen && (
//           <ul className={styles.dropdown}>
//             {isLoading && options.length === 0 ? (
//               <li className={styles.statusMessage}>Fetching matches from server...</li>
//             ) : options.length > 0 ? (
//               options.map((option) => {
//                 const isSelected = option.value === value;
//                 return (
//                   <li
//                     key={option.value}
//                     onClick={() => handleOptionSelect(option)}
//                     className={`${styles.optionRow} ${isSelected ? styles.selectedRow : ''}`}
//                   >
//                     {option.label}
//                   </li>
//                 );
//               })
//             ) : (
//               <li className={styles.statusMessage}>No matches found</li>
//             )}
//           </ul>
//         )}
//       </div>
//     </InputWrapper>
//   );
// };

// export default SearchableSelect;










































// import React, { useState, useRef, useEffect } from 'react';
// import InputWrapper from './InputWrapper';
// import styles from './styles/SearchableSelect.module.css';

// const SearchableSelect = ({ 
//   label, 
//   labelPlacement, 
//   id, 
//   error, 
//   options = [], 
//   value, 
//   onChange, 
//   onSearchChange, 
//   isLoading = false, 
//   placeholder = 'Search or select...',
//   onActionClick,
//   info,
//   ...props 
// }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [inputValue, setInputValue] = useState('');
//   const [highlightedIndex, setHighlightedIndex] = useState(-1); // -1 = none
//   const containerRef = useRef(null);
//   const ulRef = useRef(null);
//   const isTypingRef = useRef(false);

//   // Sync input value with selected option (external changes)
//   useEffect(() => {
//     if (isTypingRef.current) return;
//     const selectedOption = options.find(opt => opt.value === value);
//     if (selectedOption) {
//       setInputValue(selectedOption.label);
//     } else if (!value) {
//       setInputValue('');
//     }
//   }, [value, options]);

//   // Reset highlight when options change (search results update)
//   useEffect(() => {
//     if (isOpen) {
//       setHighlightedIndex(-1);
//     }
//   }, [options]);

//   // Scroll highlighted item into view
//   useEffect(() => {
//     if (highlightedIndex >= 0 && ulRef.current) {
//       const items = ulRef.current.children;
//       if (items[highlightedIndex]) {
//         items[highlightedIndex].scrollIntoView({ block: 'nearest' });
//       }
//     }
//   }, [highlightedIndex]);

//   // Click outside to close dropdown
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (containerRef.current && !containerRef.current.contains(event.target)) {
//         setIsOpen(false);
//         setHighlightedIndex(-1);
//         isTypingRef.current = false;
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   // --- Handlers ---
//   const handleInputChange = (e) => {
//     const text = e.target.value;
//     setInputValue(text);
//     isTypingRef.current = true;
//     if (!isOpen) setIsOpen(true);
//     if (onSearchChange) {
//       onSearchChange(text);
//     }
//   };

//   const handleOptionSelect = (option) => {
//     setInputValue(option.label);
//     setIsOpen(false);
//     setHighlightedIndex(-1);
//     isTypingRef.current = false;
//     if (onChange) {
//       onChange({ target: { id, value: option.value } });
//     }
//   };

//   const clearSelection = (e) => {
//     e.stopPropagation();
//     setInputValue('');
//     setIsOpen(false);
//     setHighlightedIndex(-1);
//     isTypingRef.current = false;
//     if (onChange) {
//       onChange({ target: { id, value: '' } });
//     }
//     if (onSearchChange) {
//       onSearchChange('');
//     }
//   };

//   const handleCustomAction = (e) => {
//     e.stopPropagation();
//     setIsOpen(false);
//     setHighlightedIndex(-1);
//     if (onActionClick) {
//       onActionClick();
//     }
//   };

//   // --- Keyboard navigation ---
//   const handleKeyDown = (e) => {
//     if (!isOpen) {
//       // Optionally open on ArrowDown if closed (optional)
//       if (e.key === 'ArrowDown') {
//         e.preventDefault();
//         setIsOpen(true);
//         setHighlightedIndex(options.length > 0 ? 0 : -1);
//       }
//       return;
//     }

//     switch (e.key) {
//       case 'ArrowDown': {
//         e.preventDefault();
//         if (options.length === 0) return;
//         setHighlightedIndex(prev =>
//           prev < options.length - 1 ? prev + 1 : prev
//         );
//         break;
//       }
//       case 'ArrowUp': {
//         e.preventDefault();
//         if (options.length === 0) return;
//         setHighlightedIndex(prev => (prev > -1 ? prev - 1 : -1));
//         break;
//       }
//       case 'Enter': {
//         e.preventDefault();
//         if (highlightedIndex >= 0 && options[highlightedIndex]) {
//           handleOptionSelect(options[highlightedIndex]);
//         }
//         break;
//       }
//       case 'Escape': {
//         e.preventDefault();
//         setIsOpen(false);
//         setHighlightedIndex(-1);
//         // Optionally blur the input
//         e.target.blur();
//         break;
//       }
//       default:
//         break;
//     }
//   };

//   return (
//     <InputWrapper label={label} labelPlacement={labelPlacement} htmlFor={id} error={error} info={info}>
//       <div className={styles.container} ref={containerRef}>
//         <div className={styles.inputWrapper} onClick={() => setIsOpen(true)}>
//           <input
//             type="text"
//             id={id}
//             value={inputValue}
//             onChange={handleInputChange}
//             onKeyDown={handleKeyDown}
//             placeholder={placeholder}
//             className={`${styles.input} ${error ? styles.inputError : ''} ${onActionClick ? styles.inputWithAction : ''}`}
//             autoComplete="off"
//             {...props}
//           />
          
//           <div className={styles.actions}>
//             {isLoading && <span className={styles.spinner}></span>}
            
//             {value && !isLoading && (
//               <button type="button" className={styles.clearButton} onClick={clearSelection}>
//                 &times;
//               </button>
//             )}

//             {onActionClick && (
//               <button 
//                 type="button" 
//                 className={styles.actionAddButton} 
//                 onClick={handleCustomAction}
//                 title="Add New Entry"
//               >
//                 +
//               </button>
//             )}

//             <span className={`${styles.arrow} ${isOpen ? styles.arrowOpen : ''}`}></span>
//           </div>
//         </div>

//         {isOpen && (
//           <ul className={styles.dropdown} ref={ulRef}>
//             {isLoading && options.length === 0 ? (
//               <li className={styles.statusMessage}>Fetching matches from server...</li>
//             ) : options.length > 0 ? (
//               options.map((option, index) => {
//                 const isSelected = option.value === value;
//                 const isHighlighted = index === highlightedIndex;
//                 return (
//                   <li
//                     key={option.value}
//                     onClick={() => handleOptionSelect(option)}
//                     className={`${styles.optionRow} ${isSelected ? styles.selectedRow : ''} ${isHighlighted ? styles.highlightedRow : ''}`}
//                   >
//                     {option.label}
//                   </li>
//                 );
//               })
//             ) : (
//               <li className={styles.statusMessage}>No matches found</li>
//             )}
//           </ul>
//         )}
//       </div>
//     </InputWrapper>
//   );
// };

// export default SearchableSelect;























// import React, { useState, useRef, useEffect } from 'react';
// import InputWrapper from './InputWrapper';
// import styles from './styles/SearchableSelect.module.css';

// const SearchableSelect = ({ 
//   label, 
//   labelPlacement, 
//   id, 
//   error, 
//   options = [], 
//   value, 
//   onChange, 
//   onSearchChange, 
//   isLoading = false, 
//   placeholder = 'Search or select...',
//   onActionClick,
//   info,
//   ...props 
// }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [inputValue, setInputValue] = useState('');
//   const [highlightedIndex, setHighlightedIndex] = useState(-1);
//   const containerRef = useRef(null);
//   const ulRef = useRef(null);
//   const isTypingRef = useRef(false);

//   // Sync input with external value change
//   useEffect(() => {
//     if (isTypingRef.current) return;
//     const selectedOption = options.find(opt => opt.value === value);
//     if (selectedOption) {
//       setInputValue(selectedOption.label);
//     } else if (!value) {
//       setInputValue('');
//     }
//   }, [value, options]);

//   // Reset highlight when options change (search results update)
//   useEffect(() => {
//     if (isOpen) {
//       setHighlightedIndex(-1);
//     }
//   }, [options, isOpen]);

//   // Scroll highlighted item into view
//   useEffect(() => {
//     if (highlightedIndex >= 0 && ulRef.current) {
//       const items = ulRef.current.children;
//       if (items[highlightedIndex]) {
//         items[highlightedIndex].scrollIntoView({ block: 'nearest' });
//       }
//     }
//   }, [highlightedIndex]);

//   // Click outside to close
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (containerRef.current && !containerRef.current.contains(event.target)) {
//         setIsOpen(false);
//         setHighlightedIndex(-1);
//         isTypingRef.current = false;
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   // --- Handlers ---
//   const handleInputChange = (e) => {
//     const text = e.target.value;
//     setInputValue(text);
//     isTypingRef.current = true;
//     if (!isOpen) setIsOpen(true);
//     if (onSearchChange) {
//       onSearchChange(text);
//     }
//   };

//   const handleOptionSelect = (option) => {
//     setInputValue(option.label);
//     setIsOpen(false);
//     setHighlightedIndex(-1);
//     isTypingRef.current = false;
//     if (onChange) {
//       onChange({ target: { id, value: option.value } });
//     }
//   };

//   const clearSelection = (e) => {
//     e.stopPropagation();
//     setInputValue('');
//     setIsOpen(false);
//     setHighlightedIndex(-1);
//     isTypingRef.current = false;
//     if (onChange) {
//       onChange({ target: { id, value: '' } });
//     }
//     if (onSearchChange) {
//       onSearchChange('');
//     }
//   };

//   const handleCustomAction = (e) => {
//     e.stopPropagation();
//     setIsOpen(false);
//     setHighlightedIndex(-1);
//     if (onActionClick) {
//       onActionClick();
//     }
//   };

//   // --- Keyboard navigation ---
//   const handleKeyDown = (e) => {
//     if (!isOpen) {
//       // Open on ArrowDown or ArrowUp when closed
//       if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
//         e.preventDefault();
//         if (options.length > 0) {
//           setIsOpen(true);
//           // Start with first or last item? We'll start with -1 (no highlight)
//           setHighlightedIndex(-1);
//         }
//       }
//       return;
//     }

//     // When open
//     switch (e.key) {
//       case 'ArrowDown': {
//         e.preventDefault();
//         if (options.length === 0) return;
//         setHighlightedIndex(prev => Math.min(prev + 1, options.length - 1));
//         break;
//       }
//       case 'ArrowUp': {
//         e.preventDefault();
//         if (options.length === 0) return;
//         setHighlightedIndex(prev => Math.max(prev - 1, -1));
//         break;
//       }
//       case 'Enter': {
//         e.preventDefault();
//         if (highlightedIndex >= 0 && options[highlightedIndex]) {
//           handleOptionSelect(options[highlightedIndex]);
//         }
//         break;
//       }
//       case 'Escape': {
//         e.preventDefault();
//         setIsOpen(false);
//         setHighlightedIndex(-1);
//         e.target.blur();
//         break;
//       }
//       default:
//         break;
//     }
//   };

//   return (
//     <InputWrapper label={label} labelPlacement={labelPlacement} htmlFor={id} error={error} info={info}>
//       <div className={styles.container} ref={containerRef}>
//         <div className={styles.inputWrapper} onClick={() => setIsOpen(true)}>
//           <input
//             type="text"
//             id={id}
//             value={inputValue}
//             onChange={handleInputChange}
//             onKeyDown={handleKeyDown}
//             placeholder={placeholder}
//             className={`${styles.input} ${error ? styles.inputError : ''} ${onActionClick ? styles.inputWithAction : ''}`}
//             autoComplete="off"
//             {...props}
//           />
          
//           <div className={styles.actions}>
//             {isLoading && <span className={styles.spinner}></span>}
            
//             {value && !isLoading && (
//               <button type="button" className={styles.clearButton} onClick={clearSelection}>
//                 &times;
//               </button>
//             )}

//             {onActionClick && (
//               <button 
//                 type="button" 
//                 className={styles.actionAddButton} 
//                 onClick={handleCustomAction}
//                 title="Add New Entry"
//               >
//                 +
//               </button>
//             )}

//             <span className={`${styles.arrow} ${isOpen ? styles.arrowOpen : ''}`}></span>
//           </div>
//         </div>

//         {isOpen && (
//           <ul className={styles.dropdown} ref={ulRef}>
//             {isLoading && options.length === 0 ? (
//               <li className={styles.statusMessage}>Fetching matches from server...</li>
//             ) : options.length > 0 ? (
//               options.map((option, index) => {
//                 const isSelected = option.value === value;
//                 const isHighlighted = index === highlightedIndex;
//                 return (
//                   <li
//                     key={option.value}
//                     onClick={() => handleOptionSelect(option)}
//                     className={`${styles.optionRow} ${isSelected ? styles.selectedRow : ''} ${isHighlighted ? styles.highlightedRow : ''}`}
//                   >
//                     {option.label}
//                   </li>
//                 );
//               })
//             ) : (
//               <li className={styles.statusMessage}>No matches found</li>
//             )}
//           </ul>
//         )}
//       </div>
//     </InputWrapper>
//   );
// };

// export default SearchableSelect;






















import React, { useState, useRef, useEffect } from 'react';
import InputWrapper from './InputWrapper';
import styles from './styles/SearchableSelect.module.css';

const SearchableSelect = ({ 
  label, 
  labelPlacement, 
  id, 
  error, 
  options = [], 
  value, 
  onChange, 
  onSearchChange, 
  isLoading = false, 
  placeholder = 'Search or select...',
  onActionClick,
  info,
  ...props 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const ulRef = useRef(null);
  const isTypingRef = useRef(false);

  // Sync input with external value change
  useEffect(() => {
    if (isTypingRef.current) return;
    const selectedOption = options.find(opt => opt.value === value);
    if (selectedOption) {
      setInputValue(selectedOption.label);
    } else if (!value) {
      setInputValue('');
    }
  }, [value, options]);

  // Reset/highlight on options change or open state change
  useEffect(() => {
    if (isOpen) {
      // Auto‑highlight if there's exactly one option
      setHighlightedIndex(options.length === 1 ? 0 : -1);
    }
  }, [options, isOpen]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && ulRef.current) {
      const items = ulRef.current.children;
      if (items[highlightedIndex]) {
        items[highlightedIndex].scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
        isTypingRef.current = false;
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- Handlers ---
  const handleInputChange = (e) => {
    const text = e.target.value;
    setInputValue(text);
    isTypingRef.current = true;
    if (!isOpen) setIsOpen(true);
    if (onSearchChange) {
      onSearchChange(text);
    }
  };

  const handleOptionSelect = (option) => {
    setInputValue(option.label);
    setIsOpen(false);
    setHighlightedIndex(-1);
    isTypingRef.current = false;
    if (onChange) {
      onChange({ target: { id, value: option.value } });
    }
  };

  const clearSelection = (e) => {
    e.stopPropagation();
    setInputValue('');
    setIsOpen(false);
    setHighlightedIndex(-1);
    isTypingRef.current = false;
    if (onChange) {
      onChange({ target: { id, value: '' } });
    }
    if (onSearchChange) {
      onSearchChange('');
    }
  };

  const handleCustomAction = (e) => {
    e.stopPropagation();
    setIsOpen(false);
    setHighlightedIndex(-1);
    if (onActionClick) {
      onActionClick();
    }
  };

  // --- Keyboard navigation ---
  const handleKeyDown = (e) => {
    if (!isOpen) {
      // Open on ArrowDown or ArrowUp when closed
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (options.length > 0) {
          setIsOpen(true);
          // Highlight will be set by the effect (single option gets 0)
        }
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        if (options.length === 0) return;
        setHighlightedIndex(prev => Math.min(prev + 1, options.length - 1));
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        if (options.length === 0) return;
        setHighlightedIndex(prev => Math.max(prev - 1, -1));
        break;
      }
      case 'Enter': {
        e.preventDefault();
        if (highlightedIndex >= 0 && options[highlightedIndex]) {
          handleOptionSelect(options[highlightedIndex]);
        }
        break;
      }
      case 'Escape': {
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
        e.target.blur();
        break;
      }
      default:
        break;
    }
  };

  return (
    <InputWrapper label={label} labelPlacement={labelPlacement} htmlFor={id} error={error} info={info}>
      <div className={styles.container} ref={containerRef}>
        <div className={styles.inputWrapper} onClick={() => setIsOpen(true)}>
          <input
            type="text"
            id={id}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`${styles.input} ${error ? styles.inputError : ''} ${onActionClick ? styles.inputWithAction : ''}`}
            autoComplete="off"
            {...props}
          />
          
          <div className={styles.actions}>
            {isLoading && <span className={styles.spinner}></span>}
            
            {value && !isLoading && (
              <button type="button" className={styles.clearButton} onClick={clearSelection}>
                &times;
              </button>
            )}

            {onActionClick && (
              <button 
                type="button" 
                className={styles.actionAddButton} 
                onClick={handleCustomAction}
                title="Add New Entry"
              >
                +
              </button>
            )}

            <span className={`${styles.arrow} ${isOpen ? styles.arrowOpen : ''}`}></span>
          </div>
        </div>

        {isOpen && (
          <ul className={styles.dropdown} ref={ulRef}>
            {isLoading && options.length === 0 ? (
              <li className={styles.statusMessage}>Fetching matches from server...</li>
            ) : options.length > 0 ? (
              options.map((option, index) => {
                const isSelected = option.value === value;
                const isHighlighted = index === highlightedIndex;
                return (
                  <li
                    key={option.value}
                    onClick={() => handleOptionSelect(option)}
                    className={`${styles.optionRow} ${isSelected ? styles.selectedRow : ''} ${isHighlighted ? styles.highlightedRow : ''}`}
                  >
                    {option.label}
                  </li>
                );
              })
            ) : (
              <li className={styles.statusMessage}>No matches found</li>
            )}
          </ul>
        )}
      </div>
    </InputWrapper>
  );
};

export default SearchableSelect;