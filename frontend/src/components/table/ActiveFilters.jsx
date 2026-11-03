import { FiX } from 'react-icons/fi';
import styles from './styles/ActiveFilters.module.css';

const ActiveFilters = ({ activeFilters, filterOptions, onFilterChange }) => {
    if (!activeFilters || !filterOptions) return null;

    const activeKeys = Object.keys(activeFilters).filter(key => activeFilters[key]);
    
    if (activeKeys.length === 0) return null;

    return (
        <div className={styles.container}>
            {activeKeys.map(key => {
                const optionDef = filterOptions.find(opt => opt.id === key);
                if (!optionDef) return null;

                const valueDef = optionDef.options.find(val => val.value === activeFilters[key]);
                const displayLabel = valueDef ? valueDef.label : activeFilters[key];

                return (
                    <div key={key} className={styles.chip}>
                        <span className={styles.chipLabel}>
                            <b>{optionDef.label}:</b> {displayLabel}
                        </span>
                        <button 
                            className={styles.removeBtn} 
                            onClick={() => onFilterChange(key, "")}
                            aria-label={`Remove filter`}
                        >
                            <FiX size={14} />
                        </button>
                    </div>
                );
            })}
            
            {activeKeys.length > 1 && (
                <button 
                    className={styles.clearAllBtn}
                    onClick={() => {
                        activeKeys.forEach(k => onFilterChange(k, ""));
                    }}
                >
                    Clear All
                </button>
            )}
        </div>
    );
};

export default ActiveFilters;
