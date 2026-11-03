import Pagination from "./Pagination";
import TableRowActions from "./TableRowActions";
import styles from "./styles/GridView.module.css";

const GridView = ({
    data,
    gridCardComponent: CardComponent,
    getRowId,
    selectedRows = [],
    onSelectionChange,
    rowActions,
    currentPage = 1,
    pageSize = 10,
    totalRows,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions,
    isLoading = false,
    emptyMessage = 'No data found'
}) => {

    const handleRowSelect = (rowId) => {
        if (!onSelectionChange) return;
        if (selectedRows.includes(rowId)) {
            onSelectionChange(selectedRows.filter(id => id !== rowId));
        } else {
            onSelectionChange([...selectedRows, rowId]);
        }
    };

    const handleSelectAll = (e) => {
        if (!onSelectionChange) return;
        if (e.target.checked) {
            const allIds = data.map(row => getRowId(row));
            onSelectionChange(allIds);
        } else {
            onSelectionChange([]);
        }
    };

    const isAllSelected = data?.length > 0 && selectedRows.length === data?.length;
    const isSomeSelected = selectedRows.length > 0 && selectedRows.length < data.length;

    if (isLoading) {
        return <div className={styles.emptyState}>Loading...</div>;
    }

    if (!CardComponent) {
        return <div className={styles.emptyState}>Error: No gridCardComponent provided</div>;
    }

    return (
        <div className={styles.gridWrapper}>
            {onSelectionChange && data?.length > 0 && (
                <div className={styles.gridHeader}>
                    <label className={styles.selectAllLabel}>
                        <input
                            type="checkbox"
                            checked={isAllSelected}
                            ref={input => {
                                if (input) input.indeterminate = isSomeSelected;
                            }}
                            onChange={handleSelectAll}
                            className={styles.checkbox}
                        />
                        <span>Select all on page</span>
                    </label>
                </div>
            )}
            <div className={styles.gridContainer}>
                {data?.length === 0 ? (
                    <div className={styles.emptyState}>{emptyMessage}</div>
                ) : (
                    data?.map(row => {
                        const rowId = getRowId(row);
                        const isSelected = selectedRows.includes(rowId);

                        return (
                            <div key={rowId} className={styles.gridItemWrapper}>
                                {onSelectionChange && (
                                    <div className={styles.gridItemCheckbox}>
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => handleRowSelect(rowId)}
                                            className={styles.checkbox}
                                            aria-label={`Select item ${rowId}`}
                                        />
                                    </div>
                                )}
                                
                                {rowActions && rowActions.length > 0 && (
                                    <div className={styles.gridItemActions}>
                                        <TableRowActions row={row} actions={rowActions} />
                                    </div>
                                )}

                                <CardComponent row={row} isSelected={isSelected} />
                            </div>
                        );
                    })
                )}
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

export default GridView;
