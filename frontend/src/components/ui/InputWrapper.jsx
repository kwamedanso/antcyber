// import React, {Fragment} from 'react';
// import styles from './styles/InputWrapper.module.css';

// import { IoInformationCircleOutline } from "react-icons/io5";

// const InputWrapper = ({ label, labelPlacement = 'top', htmlFor, children, error }) => {
//   if (labelPlacement === 'none' || !label) {
//     return (
//       <div className={styles.wrapper}>
//         {children}
//         {error && <span className={styles.errorMessage}>{error}</span>}
//       </div>
//     );
//   }

//   const containerClass = `${styles.wrapper} ${
//     labelPlacement === 'left' ? styles.layoutLeft : styles.layoutTop
//   }`;

//   return (
//     <div className={containerClass}>
//       <label htmlFor={htmlFor} className={styles.label}>
//         {label}
//       </label>
//       <div className={styles.inputContainer}>
//         {children}
//         {error && <span className={styles.errorMessage}>{error}</span>}
//       </div>
//     </div>
//   );
// };

// export default InputWrapper;



import React, { useState } from 'react';
import styles from './styles/InputWrapper.module.css';
import { IoInformationCircleOutline } from 'react-icons/io5';

const InputWrapper = ({
  label,
  labelPlacement = 'top',
  htmlFor,
  children,
  error,
  info, // new prop: info text for the tooltip
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  // If no label or placement is 'none', render only children + error
  if (labelPlacement === 'none' || !label) {
    return (
      <div className={styles.wrapper}>
        {children}
        {error && <span className={styles.errorMessage}>{error}</span>}
      </div>
    );
  }

  // Determine container class based on placement
  const containerClass = `${styles.wrapper} ${styles[`placement${capitalize(labelPlacement)}`]}`;

  // Build label content: label text + optional info icon
  const labelContent = (
    <>
      {label}
      {info && (
        <span
          className={styles.infoIcon}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          // Optional: also handle click for mobile
          onClick={() => setShowTooltip(!showTooltip)}
          role="button"
          tabIndex={0}
          aria-label="More information"
        >
          <IoInformationCircleOutline size={18} />
          {showTooltip && (
            <span className={styles.tooltip}>
              {info}
            </span>
          )}
        </span>
      )}
    </>
  );

  return (
    <div className={containerClass}>
      <label htmlFor={htmlFor} className={styles.label}>
        {labelContent}
      </label>
      <div className={styles.inputContainer}>
        {children}
        {error && <span className={styles.errorMessage}>{error}</span>}
      </div>
    </div>
  );
};

// Helper to capitalize first letter (for CSS class names)
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default InputWrapper;