import styles from "./styles/StatusBadge.module.css"


const StatusBadge = ({ status }) => {
    const statusStyles = {
        active: styles.statusActive,
        pending: styles.statusPending,
        inactive: styles.statusInactive,
        completed: styles.statusCompleted,
    };

    const statusClass = statusStyles[status?.toLowerCase()] || styles.statusInactive;

    return (
        <span className={`${styles.statusBadge} ${statusClass}`}>
            {status}
        </span>
    );
};

export default StatusBadge;