import { useState } from 'react';
import { DropdownMenu } from './DropdownMenu';
import { FiFilter } from 'react-icons/fi';
// Re-using button styles from ColumnSelector to maintain structural theme consistency
import styles from './styles/ColumnSelector.module.css'; 
import filterStyles from './styles/FilterBar.module.css'; 

const TableFilters = ({ filterOptions, activeFilters, onFilterChange }) => {
    const [isOpen, setIsOpen] = useState(false);

    if (!filterOptions || filterOptions.length === 0) return null;

    return (
        <DropdownMenu
            isOpen={isOpen}
            onToggle={setIsOpen}
            trigger={
                <button className={styles.triggerButton} aria-label="Filters">
                    <FiFilter size={16} />
                    <span>Filters</span>
                </button>
            }
        >
            <div className={styles.menuHeader}>Filters</div>
            <div className={styles.columnList} style={{ padding: '0.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: '200px' }}>
                {filterOptions.map(filter => (
                    <div key={filter.id} className={filterStyles.filterGroup}>
                        <label className={filterStyles.filterLabel}>{filter.label}</label>
                        <select
                            value={activeFilters[filter.id] || ""}
                            onChange={(e) => onFilterChange(filter.id, e.target.value)}
                            className={filterStyles.select}
                        >
                            <option value="">All</option>
                            {filter?.options.map(opt => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                ))}
            </div>
        </DropdownMenu>
    );
};

export default TableFilters;
