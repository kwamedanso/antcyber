// components/ui/KPICard/KPICard.jsx
import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles/KPICard.module.css';

/**
 * Reusable KPI Card Component
 * 
 * @param {Object} props
 * @param {string} props.label - KPI label text (uppercase automatically applied)
 * @param {string|number} props.value - Main numeric or text value
 * @param {string} props.unit - Unit suffix (e.g., 'mins', '%', 'days')
 * @param {React.ElementType} props.icon - Icon component from react-icons
 * @param {string|number} props.trend - Trend value (e.g., '+12%', '-5%')
 * @param {string} props.trendLabel - Description of the trend
 * @param {string} props.variant - Card variant: 'default' | 'compact' | 'large'
 * @param {string} props.color - Accent color: 'default' | 'success' | 'warning' | 'danger' | 'info'
 * @param {React.ReactNode} props.children - Additional content to render below the value
 * @param {string} props.className - Additional CSS classes
 * @param {function} props.onClick - Click handler for interactive cards
 * @param {string} props.tooltip - Tooltip text for additional context
 */


// {
//       id: 'avg-consultation',
//       label: 'Avg Consultation Time',
//       value: '64',
//       unit: ' mins',
//       icon: FiClock,
//       trend: '+8%',
//       trendLabel: 'vs last month',
//       color: 'info', 'success', 'warning', 'default'
//     },
const KPICard = ({
  label,
  value,
  unit = '',
  icon: Icon,
  trend,
  trendLabel = 'vs last month',
  variant = 'default',
  color = 'default',
  children,
  className = '',
  onClick,
  tooltip,
  ...props
}) => {
  // Determine trend styling
  const getTrendColor = () => {
    if (!trend) return styles.trendNeutral;
    const trendStr = String(trend);
    if (trendStr.startsWith('+')) return styles.trendPositive;
    if (trendStr.startsWith('-')) return styles.trendNegative;
    return styles.trendNeutral;
  };

  // Format trend display
  const formatTrend = () => {
    if (!trend) return null;
    return (
      <span className={`${styles.trendValue} ${getTrendColor()}`}>
        {trend}
      </span>
    );
  };

  // Determine if card is interactive
  const isInteractive = !!onClick;

  // Get color variant class
  const getColorClass = () => {
    const colorMap = {
      default: styles.colorDefault,
      success: styles.colorSuccess,
      warning: styles.colorWarning,
      danger: styles.colorDanger,
      info: styles.colorInfo,
    };
    return colorMap[color] || styles.colorDefault;
  };

  // Get variant class
  const getVariantClass = () => {
    const variantMap = {
      default: styles.variantDefault,
      compact: styles.variantCompact,
      large: styles.variantLarge,
    };
    return variantMap[variant] || styles.variantDefault;
  };

  // Format value with unit
  const formattedValue = unit ? `${value}${unit}` : value;

  return (
    <div
      className={`
        ${styles.kpiCard}
        ${getVariantClass()}
        ${getColorClass()}
        ${isInteractive ? styles.interactive : ''}
        ${className}
      `}
      onClick={onClick}
      role={isInteractive ? 'button' : 'article'}
      tabIndex={isInteractive ? 0 : undefined}
      title={tooltip}
      {...props}
    >
      {/* Card Header */}
      <div className={styles.kpiCardHeader}>
        <span className={styles.kpiLabel}>{label}</span>
        {Icon && (
          <span className={styles.kpiIconBg}>
            <Icon size={variant === 'compact' ? 14 : 16} />
          </span>
        )}
      </div>

      {/* Main Value */}
      <div className={styles.kpiValueWrapper}>
        <span className={styles.kpiValue}>{formattedValue}</span>
      </div>

      {/* Footer with Trend and Caption */}
      <div className={styles.kpiFooter}>
        {trend && (
          <div className={styles.kpiTrend}>
            {formatTrend()}
            <span className={styles.trendLabel}>{trendLabel}</span>
          </div>
        )}
        {children && (
          <div className={styles.kpiExtraContent}>
            {children}
          </div>
        )}
      </div>

      {/* Color accent line for colored variants */}
      {color !== 'default' && (
        <div className={styles.accentLine} />
      )}
    </div>
  );
};

KPICard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  unit: PropTypes.string,
  icon: PropTypes.elementType,
  trend: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  trendLabel: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'compact', 'large']),
  color: PropTypes.oneOf(['default', 'success', 'warning', 'danger', 'info']),
  children: PropTypes.node,
  className: PropTypes.string,
  onClick: PropTypes.func,
  tooltip: PropTypes.string,
};

export default KPICard;