"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  baseUrl?: string;
};

export function Pagination({ currentPage, totalPages, baseUrl = "/shop" }: PaginationProps) {
  const searchParams = useSearchParams();
  
  if (totalPages <= 1) return null;

  // Helper to build URL with current pageSize
  const buildUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    return `${baseUrl}?${params.toString()}`;
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showMax = 5; // Show max 5 page numbers at a time
    
    if (totalPages <= showMax) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      // Calculate range around current page
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      // Add ellipsis after first page if needed
      if (start > 2) {
        pages.push("...");
      }
      
      // Add pages around current page
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (end < totalPages - 1) {
        pages.push("...");
      }
      
      // Always show last page
      pages.push(totalPages);
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {/* Previous Button */}
      {currentPage > 1 ? (
        <Link href={buildUrl(currentPage - 1)}>
          <Button
            className="rounded-lg text-[#64748b] hover:!text-white hover:!bg-[#0c4a6e] transition-colors bg-transparent border border-input"
          >
            ← Previous
          </Button>
        </Link>
      ) : (
        <Button
          disabled
          className="rounded-lg opacity-50 cursor-not-allowed bg-transparent border border-input"
        >
          ← Previous
        </Button>
      )}

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((page, index) => {
          if (page === "...") {
            return (
              <span key={`ellipsis-${index}`} className="px-2 text-[#64748b]">
                ...
              </span>
            );
          }

          const pageNum = page as number;
          const isActive = pageNum === currentPage;

          return (
            <Link key={pageNum} href={buildUrl(pageNum)}>
              <Button
                className={`min-w-[40px] rounded-lg transition-colors ${
                  isActive
                    ? "bg-[#1DA1F9] text-white hover:!bg-[#0c4a6e]"
                    : "text-[#64748b] hover:!text-white hover:!bg-[#0c4a6e] bg-transparent border border-input"
                }`}
              >
                {pageNum}
              </Button>
            </Link>
          );
        })}
      </div>

      {/* Next Button */}
      {currentPage < totalPages ? (
        <Link href={buildUrl(currentPage + 1)}>
          <Button
            className="rounded-lg text-[#64748b] hover:!text-white hover:!bg-[#0c4a6e] transition-colors bg-transparent border border-input"
          >
            Next →
          </Button>
        </Link>
      ) : (
        <Button
          disabled
          className="rounded-lg opacity-50 cursor-not-allowed bg-transparent border border-input"
        >
          Next →
        </Button>
      )}
    </div>
  );
}

