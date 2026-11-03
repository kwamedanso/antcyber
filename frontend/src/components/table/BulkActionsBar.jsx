import { FiX } from 'react-icons/fi';
import styles from './styles/BulkActionsBar.module.css';

const BulkActionsBar = ({ selectedCount, onClearSelection, children }) => {
    if (selectedCount === 0) return null;

    return (
        <div className={styles.bulkBarContainer}>
            <div className={styles.leftInfo}>
                <span className={styles.countBadge}>{selectedCount}</span>
                <span className={styles.countText}>item{selectedCount !== 1 ? 's' : ''} selected</span>
                {onClearSelection && (
                    <button 
                        onClick={onClearSelection} 
                        className={styles.clearBtn}
                        aria-label="Clear selection"
                    >
                        <FiX size={14} />
                    </button>
                )}
            </div>
            {children && (
                <div className={styles.actionsBox}>
                    <div className={styles.divider} />
                    {children}
                </div>
            )}
        </div>
    );
};

export default BulkActionsBar;
