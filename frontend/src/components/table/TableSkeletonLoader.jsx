import React from 'react';
import styles from './styles/TableSkeletonLoader.module.css';
import tableStyles from './styles/Table.module.css';

/**
 * TableSkeletonLoader
 * Renders high-fidelity pulsing/shimmering table rows to represent loading states.
 * Reuses the layout styles of Table.module.css to align perfectly with headers.
 * 
 * @param {Array} columns - The final array of active columns (including checkboxes and actions).
 * @param {number} rowsCount - The number of placeholder rows to render (typically matches pageSize).
 */
const TableSkeletonLoader = ({ columns, rowsCount = 10 }) => {
  const rows = Array.from({ length: rowsCount }, (_, i) => i);

  return (
    <>
      {rows.map((rowIndex) => (
        <tr key={`skeleton-row-${rowIndex}`} className={tableStyles.tr}>
          {columns.map((column, colIndex) => {
            // Checkbox column skeleton
            if (column.id === '__checkbox__') {
              return (
                <td key={column.id} className={tableStyles.tdCheckbox}>
                  <div className={styles.skeletonCheckbox} aria-hidden="true" />
                </td>
              );
            }

            // Row actions column skeleton
            if (column.id === '__actions__') {
              return (
                <td key={column.id} className={tableStyles.tdActions}>
                  <div className={styles.skeletonActions} aria-hidden="true" />
                </td>
              );
            }

            // Generate deterministic but organic-looking widths to simulate actual varying cell content length.
            // Using a simple modulo hash guarantees stable widths across renders without hydration mismatch.
            const baseWidth = column.align === 'right' ? 50 : column.align === 'center' ? 40 : 60;
            const variance = (rowIndex * 13 + colIndex * 7) % 30; // Pseudo-random offset [0, 29]
            const width = `${baseWidth + variance}%`;

            const alignmentStyle = {
              textAlign: column.align || 'left',
            };

            const boxStyle = {
              width,
              marginLeft: column.align === 'right' ? 'auto' : column.align === 'center' ? 'auto' : undefined,
              marginRight: column.align === 'center' ? 'auto' : undefined,
            };

            return (
              <td
                key={column.id || colIndex}
                className={tableStyles.td}
                style={alignmentStyle}
              >
                <div 
                  className={styles.skeletonBox} 
                  style={boxStyle} 
                  aria-hidden="true"
                />
              </td>
            );
          })}
        </tr>
      ))}
    </>
  );
};

export default TableSkeletonLoader;
