"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import { getPageItems } from "@/lib/pagination";
import { cn } from "@/lib/utils";

/**
 * Client-side pagination with ellipsis and icon-only prev/next — stays compact
 * and wraps gracefully on narrow screens.
 */
export function SmartPagination({
  page,
  totalPages,
  onPageChange,
  className,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}) {
  if (totalPages <= 1) return null;
  const items = getPageItems(page, totalPages);

  return (
    <Pagination className={className}>
      <PaginationContent className="flex-wrap">
        <PaginationItem>
          <PaginationLink
            href="#"
            size="icon"
            aria-label="Página anterior"
            aria-disabled={page === 1}
            className={cn(page === 1 && "pointer-events-none opacity-50")}
            onClick={(e) => {
              e.preventDefault();
              onPageChange(Math.max(1, page - 1));
            }}
          >
            <ChevronLeft className="size-4" />
          </PaginationLink>
        </PaginationItem>

        {items.map((item, index) =>
          item === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <PaginationLink
                href="#"
                isActive={item === page}
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(item);
                }}
              >
                {item}
              </PaginationLink>
            </PaginationItem>
          )
        )}

        <PaginationItem>
          <PaginationLink
            href="#"
            size="icon"
            aria-label="Próxima página"
            aria-disabled={page === totalPages}
            className={cn(
              page === totalPages && "pointer-events-none opacity-50"
            )}
            onClick={(e) => {
              e.preventDefault();
              onPageChange(Math.min(totalPages, page + 1));
            }}
          >
            <ChevronRight className="size-4" />
          </PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
