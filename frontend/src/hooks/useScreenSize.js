// hooks/useScreenSize.js
import { useEffect, useState } from 'react';

/**
 * Named breakpoints (mobile-first, min-width based).
 * Tweak these to match your design tokens.
 */
export const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

/** Ordered list of size names, smallest → largest. */
export const SIZE_ORDER = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];

/** Given a viewport width, return the matching size name. */
export function getSizeForWidth(width) {
  let current = 'xs';
  for (const name of SIZE_ORDER) {
    if (width >= BREAKPOINTS[name]) current = name;
  }
  return current;
}

/** Returns true if `size` is within [from, to] (inclusive). */
export function isSizeInRange(size, from, to) {
  const i = SIZE_ORDER.indexOf(size);
  const lo = from ? SIZE_ORDER.indexOf(from) : 0;
  const hi = to ? SIZE_ORDER.indexOf(to) : SIZE_ORDER.length - 1;
  return i >= lo && i <= hi;
}

/**
 * useScreenSize
 * @returns {{ width:number, height:number, size:string, isMobile:boolean, isTablet:boolean, isDesktop:boolean }}
 */
export function useScreenSize() {
  // SSR-safe default. Assume desktop-ish during SSR; the effect corrects on mount.
  const [state, setState] = useState(() => {
    if (typeof window === 'undefined') {
      return { width: 1280, height: 800, size: 'xl' };
    }
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      size: getSizeForWidth(window.innerWidth),
    };
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let raf = null;

    const handleResize = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        setState((prev) => {
          const nextSize = getSizeForWidth(width);
          // Avoid re-render churn if nothing changed.
          if (
            prev.width === width &&
            prev.height === height &&
            prev.size === nextSize
          ) {
            return prev;
          }
          return { width, height, size: nextSize };
        });
      });
    };

    handleResize(); // sync once on mount
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return {
    ...state,
    isMobile: isSizeInRange(state.size, 'xs', 'sm'),
    isTablet: isSizeInRange(state.size, 'md', 'lg'),
    isDesktop: isSizeInRange(state.size, 'xl', '2xl'),
  };
}