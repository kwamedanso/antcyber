// components/dashboard-layout/Collapsible.jsx
import { useState } from 'react';

/**
 * Generic collapsible section for the sidebar.
 *
 * Auto-opens when the current route is inside the section. Pass `isActive`
 * from the parent (derived from useLocation) to control this.
 */
const Collapsible = ({
    title,
    icon,
    isActive = false,
    defaultOpen = false,
    children
}) => {
    const [open, setOpen] = useState(defaultOpen || isActive);

    return (
        <div className={`sidebar-section${isActive ? ' active' : ''}`}>
            <button
                type="button"
                className="sidebar-section-header"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
            >
                {icon && <span className="sidebar-icon">{icon}</span>}
                <span className="sidebar-label">{title}</span>
                <span className={`sidebar-chevron${open ? ' open' : ''}`}>
                    ▾
                </span>
            </button>

            {open && <div className="sidebar-section-body">{children}</div>}
        </div>
    );
};

export default Collapsible;