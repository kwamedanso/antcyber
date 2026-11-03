import { useMemo, useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./styles/Table.module.css"
import Pagination from "./Pagination";
import TableRowActions from "./TableRowActions"
import TableSkeletonLoader from "./TableSkeletonLoader";
import { FiChevronUp, FiChevronDown } from "react-icons/fi";
import { HiChevronUpDown } from "react-icons/hi2";


const Table = ({
    data,
    columns,
    getRowId,
    selectedRows = [],
    onSelectionChange,
    sortConfig,
    onSortChange,
    rowActions,
    currentPage = 1,
    pageSize = 10,
    totalRows,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions,
    showVerticalLines = false,
    showHorizontalLines = true,
    isLoading = false,
    emptyMessage = 'No data found',
    stickyHeader = false,
}) => {


    // Build final column configuration
    const allColumns = useMemo(() => {
        const cols = [];

        // Add checkbox column if selection is enabled
        if (onSelectionChange) {
            cols.push({
                id: '__checkbox__',
                header: 'select',
                accessor: null,
                sticky: 'left',
            });
        }

        // Add data columns
        if (Array.isArray(columns) && columns.length > 0) {
            cols.push(...columns);
        }

        // Add actions column if actions are provided
        if (rowActions && rowActions.length > 0) {
            cols.push({
                id: '__actions__',
                header: '',
                accessor: null,
                align: 'right',
                sticky: 'right',
            });
        }

        return cols;
    }, [columns, onSelectionChange, rowActions]);

    // Handle select all
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allIds = data.map(row => getRowId(row));
            onSelectionChange(allIds);
        } else {
            onSelectionChange([]);
        }
    };

    // Handle individual row selection
    const handleRowSelect = (rowId) => {
        if (selectedRows.includes(rowId)) {
            onSelectionChange(selectedRows.filter(id => id !== rowId));
        } else {
            onSelectionChange([...selectedRows, rowId]);
        }
    };

    // Handle sort
    const handleSort = (columnId) => {
        if (!sortConfig || sortConfig.columnId !== columnId) {
            onSortChange(columnId, 'asc');
        } else if (sortConfig.direction === 'asc') {
            onSortChange(columnId, 'desc');
        } else {
            onSortChange(null, null);
        }
    };

    // Get cell value
    const getCellValue = (row, column) => {
        if (typeof column.accessor === 'function') {
            return column.accessor(row);
        }
        return row[column.accessor];
    };

    // Render sort icon
    const renderSortIcon = (column) => {
        if (!column.sortable) return null;

        const isActive = sortConfig?.columnId === column.id;
        const iconClass = isActive ? styles.sortIconActive : styles.sortIcon;

        if (!isActive) {
            return <HiChevronUpDown className={iconClass} size={14} />;
        }

        return sortConfig.direction === 'asc'
            ? <FiChevronUp className={iconClass} size={14} />
            : <FiChevronDown className={iconClass} size={14} />;
    };

    const isAllSelected = data?.length > 0 && selectedRows.length === data?.length;
    const isSomeSelected = selectedRows.length > 0 && selectedRows.length < data.length;

    let tableClasses = styles.table;
    if (showVerticalLines) tableClasses += ` ${styles.showVerticalLines}`;
    if (!showHorizontalLines) tableClasses += ` ${styles.hideHorizontalLines}`;

    const tableRef = useRef(null);
    const [leftOffsets, setLeftOffsets] = useState({});

    useEffect(() => {
        const tableEl = tableRef.current;
        if (!tableEl) return;

        const calculateOffsets = () => {
            let currentLeft = 0;
            const newOffsets = {};
            const thElements = Array.from(tableEl.querySelectorAll('th[data-sticky-left="true"]'));

            thElements.forEach((th) => {
                const id = th.getAttribute('data-column-id');
                if (id) {
                    newOffsets[id] = currentLeft;
                    currentLeft += th.getBoundingClientRect().width;
                }
            });

            setLeftOffsets(prev => JSON.stringify(prev) !== JSON.stringify(newOffsets) ? newOffsets : prev);
        };

        calculateOffsets();

        const observer = new ResizeObserver(() => {
            calculateOffsets();
        });

        const thElements = tableEl.querySelectorAll('th[data-sticky-left="true"]');
        thElements.forEach(th => observer.observe(th));

        return () => observer.disconnect();
    }, [allColumns, data]);

    return (
        <div className={styles.tableWrapper}>
            <div
                className={styles.tableContainer}
                style={stickyHeader ? { maxHeight: 'calc(100vh - 180px)', overflowY: 'auto' } : {}}
            >
                <table className={tableClasses} role="table" ref={tableRef}>
                    <thead className={styles.thead}>
                        <tr>
                            {allColumns?.map(column => {
                                const isStickyLeft = column.sticky === 'left';
                                const isStickyRight = column.sticky === 'right';

                                const thStyle = {};
                                if (stickyHeader) {
                                    thStyle.position = 'sticky';
                                    thStyle.top = 0;
                                    thStyle.zIndex = 10;
                                }
                                if (isStickyLeft) {
                                    thStyle.position = 'sticky';
                                    thStyle.left = leftOffsets[column.id] !== undefined ? `${leftOffsets[column.id]}px` : 0;
                                    thStyle.zIndex = stickyHeader ? 15 : 5;
                                    thStyle.backgroundColor = '#f9fafb';
                                    thStyle.boxShadow = '2px 0 5px -2px rgba(0,0,0,0.05)';
                                } else if (isStickyRight) {
                                    thStyle.position = 'sticky';
                                    thStyle.right = 0;
                                    thStyle.zIndex = stickyHeader ? 15 : 5;
                                    thStyle.backgroundColor = '#f9fafb';
                                    thStyle.boxShadow = '-2px 0 5px -2px rgba(0,0,0,0.05)';
                                } else if (stickyHeader) {
                                    thStyle.backgroundColor = '#f9fafb';
                                }

                                if (column.id === '__checkbox__') {
                                    return (
                                        <th
                                            key={column.id}
                                            className={styles.thCheckbox}
                                            scope="col"
                                            data-sticky-left={isStickyLeft}
                                            data-column-id={column.id}
                                            style={thStyle}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isAllSelected}
                                                ref={input => {
                                                    if (input) input.indeterminate = isSomeSelected;
                                                }}
                                                onChange={handleSelectAll}
                                                className={styles.checkbox}
                                                aria-label="Select all rows"
                                            />
                                        </th>
                                    );
                                }

                                if (column.id === '__actions__') {
                                    return (
                                        <th key={column.id} className={styles.thActions} scope="col" style={thStyle}>
                                            {column.header}
                                        </th>
                                    );
                                }

                                const thClass = column.sortable ? styles.thSortable : styles.th;

                                return (
                                    <th
                                        key={column.id}
                                        className={thClass}
                                        onClick={column.sortable ? () => handleSort(column.id) : undefined}
                                        scope="col"
                                        aria-sort={
                                            sortConfig?.columnId === column.id
                                                ? sortConfig.direction === 'asc' ? 'ascending' : 'descending'
                                                : 'none'
                                        }
                                        data-sticky-left={isStickyLeft}
                                        data-column-id={column.id}
                                        style={thStyle}
                                    >
                                        <div className={styles.thContent}>
                                            {column.header}
                                            {renderSortIcon(column)}
                                        </div>
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>

                    <tbody className={styles.tbody}>
                        {isLoading ? (
                            <TableSkeletonLoader columns={allColumns} rowsCount={Math.min(pageSize, 8)} />
                        ) : data?.length === 0 ? (
                            <tr>
                                <td colSpan={allColumns?.length} className={styles.emptyState}>
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            data?.map(row => {
                                const rowId = getRowId(row);
                                const isSelected = selectedRows.includes(rowId);

                                return (
                                    <tr
                                        key={rowId}
                                        className={isSelected ? styles.trSelected : styles.tr}
                                    >
                                        {allColumns?.map(column => {
                                            const isStickyLeft = column.sticky === 'left';
                                            const isStickyRight = column.sticky === 'right';

                                            const tdStyle = { textAlign: column.align || 'left' };
                                            if (isStickyLeft) {
                                                tdStyle.position = 'sticky';
                                                tdStyle.left = leftOffsets[column.id] !== undefined ? `${leftOffsets[column.id]}px` : 0;
                                                tdStyle.zIndex = 4;
                                                tdStyle.backgroundColor = 'inherit';
                                                tdStyle.boxShadow = '2px 0 5px -2px rgba(0,0,0,0.05)';
                                            } else if (isStickyRight) {
                                                tdStyle.position = 'sticky';
                                                tdStyle.right = 0;
                                                tdStyle.zIndex = 4;
                                                tdStyle.backgroundColor = 'inherit';
                                                tdStyle.boxShadow = '-2px 0 5px -2px rgba(0,0,0,0.05)';
                                            }

                                            if (column.id === '__checkbox__') {
                                                return (
                                                    <td key={column.id} className={styles.tdCheckbox} style={tdStyle}>
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => handleRowSelect(rowId)}
                                                            className={styles.checkbox}
                                                            aria-label={`Select row ${rowId}`}
                                                        />
                                                    </td>
                                                );
                                            }

                                            if (column.id === '__actions__') {
                                                return (
                                                    <td
                                                        key={column.id}
                                                        className={isSelected ? styles.tdActionsSelected : styles.tdActions}
                                                        style={tdStyle}
                                                    >
                                                        <TableRowActions row={row} actions={rowActions} />
                                                    </td>
                                                );
                                            }

                                            const value = getCellValue(row, column);
                                            let content = column.renderCell
                                                ? column.renderCell(value, row)
                                                : value;

                                            if (column.link) {
                                                content = <Link to={column.link(row)} className={styles.cellLink}>{content}</Link>;
                                            }

                                            return (
                                                <td
                                                    key={column.id}
                                                    className={styles.td}
                                                    style={tdStyle}
                                                >
                                                    {content}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {totalRows > 0 && (
                <Pagination
                    currentPage={currentPage}
                    pageSize={pageSize}
                    totalRows={totalRows}
                    onPageChange={onPageChange}
                    onPageSizeChange={onPageSizeChange}
                    pageSizeOptions={pageSizeOptions}
                />
            )}
        </div>
    );
};


export default Table;