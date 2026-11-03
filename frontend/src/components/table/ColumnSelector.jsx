import { useState } from 'react';
import { DropdownMenu } from './DropdownMenu';
import { FiColumns } from 'react-icons/fi';
import styles from './styles/ColumnSelector.module.css';

const ColumnSelector = ({ columns, visibleColumns, onColumnToggle }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <DropdownMenu
            isOpen={isOpen}
            onToggle={setIsOpen}
            trigger={
                <button className={styles.triggerButton} aria-label="Select columns">
                    <FiColumns size={16} />
                    <span>Columns</span>
                </button>
            }
        >
            <div className={styles.menuHeader}>Show Columns</div>
            <div className={styles.columnList}>
                {columns.map(col => (
                    <label key={col.id} className={styles.columnOption}>
                        <input
                            type="checkbox"
                            checked={visibleColumns.includes(col.id)}
                            onChange={() => onColumnToggle(col.id)}
                            className={styles.checkbox}
                        />
                        <span>{col.header}</span>
                    </label>
                ))}
            </div>
        </DropdownMenu>
    );
};

export default ColumnSelector;
