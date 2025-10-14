import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ totalPages, currentPage, handlePageChange }) => {
  if (totalPages <= 1) return null;

  const pageNumbers = [];

  // Determine visible pages (max 5 + ellipsis logic)
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
  } else {
    if (currentPage <= 3) {
      pageNumbers.push(1, 2, 3, "...", totalPages - 1, totalPages);
    } else if (currentPage >= totalPages - 2) {
      pageNumbers.push(1, 2, "...", totalPages - 2, totalPages - 1, totalPages);
    } else {
      pageNumbers.push(
        1,
        "...",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "...",
        totalPages
      );
    }
  }

  return (
    <div className="flex justify-center mt-8 mb-10 flex-wrap gap-2 items-center">
      {/* Left Arrow */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-3 py-2 rounded-md border transition ${
          currentPage === 1
            ? "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed"
            : "bg-white text-slate-700 border-slate-400 hover:bg-slate-100"
        }`}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Page Numbers */}
      {pageNumbers.map((page, index) =>
        page === "..." ? (
          <span
            key={index}
            className="px-3 py-2 text-slate-500 select-none font-semibold"
          >
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`px-4 py-2 rounded-md border transition ${
              currentPage === page
                ? "bg-red-600 text-white border-red-600"
                : "bg-white text-slate-700 border-slate-400 hover:bg-slate-100"
            }`}
          >
            {page}
          </button>
        )
      )}

      {/* Right Arrow */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-3 py-2 rounded-md border transition ${
          currentPage === totalPages
            ? "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed"
            : "bg-white text-slate-700 border-slate-400 hover:bg-slate-100"
        }`}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Pagination;
