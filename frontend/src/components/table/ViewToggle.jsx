import { FiList, FiGrid } from 'react-icons/fi';
import styles from './styles/ViewToggle.module.css';

const ViewToggle = ({ viewMode, onViewChange }) => {
    return (
        <div className={styles.toggleGroup} role="group" aria-label="View Toggle">
            <button
                className={viewMode === 'list' ? styles.toggleBtnActive : styles.toggleBtn}
                onClick={() => onViewChange('list')}
                disabled={viewMode === 'list'}
                aria-label="List View"
                title="List View"
            >
                <FiList size={16} />
            </button>
            <button
                className={viewMode === 'grid' ? styles.toggleBtnActive : styles.toggleBtn}
                onClick={() => onViewChange('grid')}
                disabled={viewMode === 'grid'}
                aria-label="Grid View"
                title="Grid View"
            >
                <FiGrid size={16} />
            </button>
        </div>
    );
};

export default ViewToggle;
