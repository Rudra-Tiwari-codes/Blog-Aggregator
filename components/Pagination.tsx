interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    if (totalPages <= 1) return null;

    const handlePrevious = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    return (
        <div className="pagination">
            <div className="pagination-controls">
                <button
                    className="btn btn-ghost btn-sm pagination-btn"
                    onClick={handlePrevious}
                    disabled={currentPage === 1}
                >
                    previous
                </button>
                <span className="pagination-info">
                    {currentPage} / {totalPages}
                </span>
                <button
                    className="btn btn-ghost btn-sm pagination-btn"
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                >
                    next
                </button>
            </div>
        </div>
    );
}
