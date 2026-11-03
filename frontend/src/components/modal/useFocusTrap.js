// components/Modal/useFocusTrap.js
import { useEffect, useRef } from 'react';

const FOCUSABLE =
  'a[href], area[href], input:not([disabled]):not([type="hidden"]), ' +
  'select:not([disabled]), textarea:not([disabled]), button:not([disabled]), ' +
  'iframe, object, embed, [contenteditable], [tabindex]:not([tabindex="-1"])';

export function useFocusTrap(active, containerRef) {
  const previouslyFocused = useRef(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;

    previouslyFocused.current = document.activeElement;
    const container = containerRef.current;

    // Focus the first focusable element, or the container itself
    const focusables = container.querySelectorAll(FOCUSABLE);
    if (focusables.length > 0) {
      focusables[0].focus();
    } else {
      container.setAttribute('tabindex', '-1');
      container.focus();
    }

    const onKeyDown = (e) => {
      if (e.key !== 'Tab') return;

      const items = Array.from(container.querySelectorAll(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null
      );
      if (items.length === 0) {
        e.preventDefault();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      if (
        previouslyFocused.current &&
        typeof previouslyFocused.current.focus === 'function'
      ) {
        previouslyFocused.current.focus();
      }
    };
  }, [active, containerRef]);
}