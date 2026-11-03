// components/Modal/Portal.jsx
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export function Portal({ children, containerId = 'modal-root' }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Ensure a container exists in the DOM
    let container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = containerId;
      document.body.appendChild(container);
    }
    return () => setMounted(false);
  }, [containerId]);

  if (!mounted) return null;

  const container = document.getElementById(containerId);
  return container ? createPortal(children, container) : null;
}