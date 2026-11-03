// components/Modal/Modal.jsx
import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Portal } from './Portal';
import { useLockBodyScroll } from './useLockBodyScroll';
import { useFocusTrap } from './useFocusTrap';
import styles from './Modal.module.css';

/**
 * Flexible Modal
 *
 * Props:
 *  - open: boolean (required)
 *  - onClose: () => void (required)
 *  - position: 'center' | 'right' | 'left' | 'top' | 'bottom' (default 'center')
 *  - width: number|string — panel width (number = px). Default 560 (center),
 *           420 (side), 640 (top/bottom).
 *  - height: number|string — optional explicit height.
 *  - fullWidth: boolean — span 100% of the viewport width.
 *  - fullHeight: boolean — span 100% of the viewport height.
 *  - title, subtitle: ReactNode
 *  - showCloseButton: boolean (default true)
 *  - closeOnBackdrop: boolean (default true)
 *  - closeOnEsc: boolean (default true)
 *  - showBackdrop: boolean (default true)
 *  - footer: ReactNode
 *  - headerExtra: ReactNode — extra content right of the title
 *  - className, panelClassName: extra class names
 *  - zIndex: number
 *  - ariaLabel: string
 *  - children: ReactNode
 */
export default function Modal({
  open,
  onClose,
  position = 'center',
  width,
  height,
  fullWidth = false,
  fullHeight = false,
  title,
  subtitle,
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEsc = true,
  showBackdrop = true,
  footer,
  headerExtra,
  className = '',
  panelClassName = '',
  zIndex = 1000,
  ariaLabel,
  children,
}) {
  const panelRef = useRef(null);

  // Lock body scroll while open
  useLockBodyScroll(open);

  // Trap focus while open
  useFocusTrap(open, panelRef);

  // ESC to close
  useEffect(() => {
    if (!open || !closeOnEsc) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, closeOnEsc, onClose]);

//   const handleBackdropClick = (e) => {
//     if (!closeOnBackdrop) return;
//     if (e.target === e.currentTarget) onClose?.();
//   };

  const handleBackdropClick = (e) => {
  if (!closeOnBackdrop) return;
  // Only react to a primary-button press
  if (e.button !== 0) return;
  onClose?.();
};

  // Default widths per position
  const defaultWidth =
    position === 'right' || position === 'left'
      ? 420
      : position === 'top' || position === 'bottom'
      ? 640
      : 560;

  const resolvedWidth = width ?? defaultWidth;

  const panelStyle = {
    '--modal-width':
      typeof resolvedWidth === 'number' ? `${resolvedWidth}px` : resolvedWidth,
  };
  if (height != null) {
    panelStyle.height = typeof height === 'number' ? `${height}px` : height;
    panelStyle.maxHeight = 'calc(100vh - 2rem)';
  }

  const rootClassNames = [
    styles.root,
    styles[position] || styles.center,
    fullWidth ? styles.fullWidth : '',
    fullHeight ? styles.fullHeight : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // ---- Animation variants per position --------------------------------
  const variants = {
    center: {
      initial: { opacity: 0, y: -24, scale: 0.98 },
      animate: { opacity: 1, y: 0,   scale: 1 },
      exit:    { opacity: 0, y: -16, scale: 0.98 },
    },
    top: {
      initial: { opacity: 0, y: '-100%' },
      animate: { opacity: 1, y: 0 },
      exit:    { opacity: 0, y: '-100%' },
    },
    bottom: {
      initial: { opacity: 0, y: '100%' },
      animate: { opacity: 1, y: 0 },
      exit:    { opacity: 0, y: '100%' },
    },
    right: {
      initial: { opacity: 0, x: '100%' },
      animate: { opacity: 1, x: 0 },
      exit:    { opacity: 0, x: '100%' },
    },
    left: {
      initial: { opacity: 0, x: '-100%' },
      animate: { opacity: 1, x: 0 },
      exit:    { opacity: 0, x: '-100%' },
    },
  };

  const v = variants[position] || variants.center;

  return (
    <Portal>
      <AnimatePresence>
        {open && (
          <div
            className={rootClassNames}
            style={{ zIndex }}
            role="presentation"
          >
            {showBackdrop && (
              <motion.div
                className={styles.backdrop}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}            
                onMouseDown={handleBackdropClick}
              />
            )}

            <motion.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label={ariaLabel || (typeof title === 'string' ? title : undefined)}
              className={`${styles.panel} ${panelClassName}`}
              style={panelStyle}
              initial={v.initial}
              animate={v.animate}
              exit={v.exit}
              transition={{
                type: 'spring',
                stiffness: 320,
                damping: 32,
                mass: 0.9,
                opacity: { duration: 0.18 },
              }}
            >
              {(title || showCloseButton || headerExtra) && (
                <div className={styles.header}>
                  <div style={{ minWidth: 0 }}>
                    {title && <h2 className={styles.title}>{title}</h2>}
                    {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {headerExtra}
                    {showCloseButton && (
                      <button
                        type="button"
                        className={styles.closeBtn}
                        onClick={onClose}
                        aria-label="Close modal"
                      >
                        <CloseIcon />
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className={styles.body}>{children}</div>

              {footer && <div className={styles.footer}>{footer}</div>}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Portal>
  );
}

/* ---------- Inline SVG close icon (avoids an icon dependency) ---------- */
function CloseIcon({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}