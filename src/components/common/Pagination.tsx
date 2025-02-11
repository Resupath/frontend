import { useMemo } from "react";
import type { PaginationMeta } from "@/src/types/pagination";

interface PaginationProps {
    meta: PaginationMeta;
    onPageChange: (page: number) => void;
    className?: string;
}

export function Pagination({ meta, onPageChange, className = "" }: PaginationProps) {
    const pages = useMemo(() => {
        const items: (number | "...")[] = [];
        const totalPages = meta.totalPage;
        const currentPage = meta.page;

        items.push(1);

        if (currentPage > 3) {
            items.push("...");
        }

        for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
            items.push(i);
        }

        if (currentPage < totalPages - 2) {
            items.push("...");
        }

        if (totalPages > 1) {
            items.push(totalPages);
        }

        return items;
    }, [meta.page, meta.totalPage]);

    // if (meta.totalPage <= 1) return null;

    return (
        <nav className={`flex justify-center items-center gap-2 ${className}`} aria-label="Pagination">
            <button
                onClick={() => onPageChange(meta.page - 1)}
                disabled={meta.page === 1}
                className="relative inline-flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors
                    disabled:opacity-50 disabled:cursor-not-allowed
                    text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Previous page"
            >
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path
                        fillRule="evenodd"
                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                        clipRule="evenodd"
                    />
                </svg>
            </button>

            <div className="flex items-center gap-1">
                {pages.map((page, index) =>
                    page === "..." ? (
                        <span key={`ellipsis-${index}`} className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
                            ...
                        </span>
                    ) : (
                        <button
                            key={page}
                            onClick={() => onPageChange(page)}
                            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors
                                ${
                                    meta.page === page
                                        ? "bg-blue-500 text-white"
                                        : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                }`}
                        >
                            {page}
                        </button>
                    )
                )}
            </div>

            <button
                onClick={() => onPageChange(meta.page + 1)}
                disabled={meta.page === meta.totalPage}
                className="relative inline-flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors
                    disabled:opacity-50 disabled:cursor-not-allowed
                    text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Next page"
            >
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                    />
                </svg>
            </button>
        </nav>
    );
}
