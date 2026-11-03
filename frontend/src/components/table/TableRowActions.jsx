import { useState } from "react";
import styles from "./styles/Dropdown.module.css"
import { DropdownMenu, Divider, MenuItem } from "./DropdownMenu"
import { FiMoreVertical } from "react-icons/fi"

const TableRowActions = ({ row, actions }) => {
    const [isOpen, setIsOpen] = useState(false);

    if (!actions || actions.length === 0) return null;

    const visibleActions = actions.filter(
        action => action.type === 'divider' || !action.show || action.show(row)
    );

    if (visibleActions.length === 0) return null;

    return (
        <DropdownMenu
            trigger={
                <button
                    className={styles.dropdownTrigger}
                    aria-label="Row actions"
                >
                    <FiMoreVertical size={16} />
                </button>
            }
            isOpen={isOpen}
            onToggle={setIsOpen}
        >
            {visibleActions.map((action, idx) =>
                action.type === 'divider' ? (
                    <Divider key={`divider-${idx}`} />
                ) : (
                    <MenuItem
                        key={action.label}
                        onClick={() => {
                            action.onClick(row);
                            setIsOpen(false);
                        }}
                        variant={action.variant}
                    >
                        {action.icon && <span>{action.icon}</span>}
                        {action.label}
                    </MenuItem>
                )
            )}
        </DropdownMenu>
    );
};

export default TableRowActions;