"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type PageSizeSelectorProps = {
  currentPageSize: number;
  totalCount: number;
};

export function PageSizeSelector({ currentPageSize, totalCount }: PageSizeSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageSizeChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value === "all") {
      params.set("pageSize", "all");
    } else {
      params.set("pageSize", value);
    }
    
    // Reset to page 1 when changing page size
    params.set("page", "1");
    
    router.push(`/shop?${params.toString()}`);
  };

  const displayValue = currentPageSize >= totalCount ? "all" : currentPageSize.toString();

  // Available page size options in order
  const allPageSizes = [8, 16, 24, 48, 96];
  
  // Filter to only show options less than total count
  const availablePageSizes = allPageSizes.filter(size => size < totalCount);

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-[#64748b] font-medium">Show:</span>
      <Select value={displayValue} onValueChange={handlePageSizeChange}>
        <SelectTrigger className="w-[130px] rounded-lg border-2 border-[#bfdbfe] bg-white text-[#0c4a6e] font-medium hover:border-[#1DA1F9] focus:border-[#1DA1F9] focus:ring-[#1DA1F9] transition-colors shadow-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-white border-2 border-[#bfdbfe] rounded-lg shadow-lg">
          {availablePageSizes.map((size) => (
            <SelectItem 
              key={size}
              value={size.toString()}
              className="text-[#0c4a6e] hover:bg-[#e0f2fe] focus:bg-[#e0f2fe] cursor-pointer"
            >
              {size} items
            </SelectItem>
          ))}
          <SelectItem 
            value="all"
            className="text-[#0c4a6e] hover:bg-[#e0f2fe] focus:bg-[#e0f2fe] cursor-pointer font-semibold"
          >
            All items ({totalCount})
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

