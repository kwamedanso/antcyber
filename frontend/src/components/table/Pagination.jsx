import styles from "./styles/Pagination.module.css"
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const Pagination = ({
    currentPage,
    pageSize,
    totalRows,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = [10, 25, 50, 100]
}) => {
    const totalPages = Math.ceil(totalRows / pageSize);
    const startRow = totalRows === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endRow = Math.min(currentPage * pageSize, totalRows);

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                pages.push(currentPage - 1);
                pages.push(currentPage);
                pages.push(currentPage + 1);
                pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    return (
        <div className={styles.pagination}>
            <div className={styles.paginationInfo}>
                Showing {startRow}–{endRow} of {totalRows} results
            </div>

            <div className={styles.paginationControls}>
                <div className={styles.pageSizeSelector}>
                    <span>Rows per page:</span>
                    <select
                        value={pageSize}
                        onChange={(e) => onPageSizeChange(Number(e.target.value))}
                        className={styles.select}
                    >
                        {pageSizeOptions.map(size => (
                            <option key={size} value={size}>{size}</option>
                        ))}
                    </select>
                </div>

                <div className={styles.paginationButtons}>
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={styles.pageButton}
                        aria-label="Previous page"
                    >
                        <FaChevronLeft />
                    </button>

                    {getPageNumbers().map((page, idx) =>
                        page === '...' ? (
                            <span key={`ellipsis-${idx}`} className={styles.ellipsis}>...</span>
                        ) : (
                            <button
                                key={page}
                                onClick={() => onPageChange(page)}
                                className={page === currentPage ? styles.pageButtonActive : styles.pageButton}
                            >
                                {page}
                            </button>
                        )
                    )}

                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={styles.pageButton}
                        aria-label="Next page"
                    >
                        <FaChevronRight />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Pagination;