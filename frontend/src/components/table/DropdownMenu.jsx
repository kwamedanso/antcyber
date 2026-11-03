import { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./styles/Dropdown.module.css";

const DropdownMenu = ({ trigger, children, isOpen, onToggle }) => {
    const triggerRef = useRef(null);
    const menuRef = useRef(null);
    const [coords, setCoords] = useState(null);

    useEffect(() => {
        if (isOpen && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const openUpwards = window.innerHeight - rect.bottom < 150;
            
            const MIN_MENU_WIDTH = 220; // typical dropdown min-width plus safety margin
            let finalLeft;
            let finalRight;

            // Determine if the trigger is on the left or right half of the screen
            if (rect.left < window.innerWidth / 2) {
                // Prefer left-to-left anchor
                if (rect.left + MIN_MENU_WIDTH > window.innerWidth) {
                    // It bleeds off the right edge of viewport -> pin right edge
                    finalRight = 10;
                } else {
                    finalLeft = rect.left;
                }
            } else {
                // Prefer right-to-right anchor
                if (rect.right < MIN_MENU_WIDTH) {
                    // It bleeds off the left edge of viewport -> pin left edge
                    finalLeft = 10;
                } else {
                    finalRight = window.innerWidth - rect.right;
                }
            }

            setCoords({
                top: openUpwards ? rect.top - 4 : rect.bottom + 4,
                left: finalLeft,
                right: finalRight,
                openUpwards
            });
        }
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                (triggerRef.current && triggerRef.current.contains(event.target)) ||
                (menuRef.current &&  menuRef.current.contains(event.target))
            ) {
                return;
            }
            onToggle(false);
        };

        const handleScroll = (e) => {
            // Close on scroll to keep fixed positioning clean,
            // UNLESS the scroll originated from inside the menu itself
            if (isOpen) {
                if (menuRef.current && menuRef.current.contains(e.target)) {
                    return;
                }
                onToggle(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            window.addEventListener('scroll', handleScroll, true); 
            window.addEventListener('resize', handleScroll);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', handleScroll, true);
            window.removeEventListener('resize', handleScroll);
        };
    }, [isOpen, onToggle]);

    return (
        <div className={styles.dropdownContainer} ref={triggerRef}>
            <div onClick={() => onToggle(!isOpen)}>
                {trigger}
            </div>
            {isOpen && coords && createPortal(
                <div 
                    className={`${styles.dropdownMenuPortal} ${coords.openUpwards ? styles.dropdownMenuPortalUp : ""}`} 
                    ref={menuRef}
                    style={{
                        top: coords.top,
                        right: coords.right,
                        left: coords.left,
                    }}
                >
                    {children}
                </div>,
                document.body
            )}
        </div>
    );
};

const MenuItem = ({ children, onClick, variant = 'default' }) => {
    const className = variant === 'danger'
        ? styles.dropdownItemDanger
        : styles.dropdownItem;
    return (
        <div className={className} onClick={onClick}>
            {children}
        </div>
    );
};

const Divider = () => <div className={styles.dropdownDivider} />;


export { DropdownMenu, MenuItem, Divider };