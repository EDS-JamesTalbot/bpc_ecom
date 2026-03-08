import { getPaginatedProductsAction } from "../actions/product-actions";
import { ShopContent } from "./ShopContent";
import { redirect } from "next/navigation";
import { PAGINATION } from "@/lib/constants";
import { Suspense } from "react";

// Use Incremental Static Regeneration (ISR) with configurable revalidation
// This caches the page and regenerates it periodically (every 60 seconds)
// Much better performance than force-dynamic which queries DB on every request
export const revalidate = 60;

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function ShopPage(props: {
  searchParams: SearchParams;
}) {
  const searchParams = await props.searchParams;
  let page = Number(searchParams.page) || 1;
  
  // Handle pageSize parameter - use constants
  let pageSize: number = PAGINATION.DEFAULT_PAGE_SIZE;
  const pageSizeParam = searchParams.pageSize;
  
  if (pageSizeParam === "all") {
    // Fetch all products using max page size
    pageSize = PAGINATION.MAX_PAGE_SIZE;
  } else if (pageSizeParam) {
    const parsed = parseInt(pageSizeParam as string);
    if (!isNaN(parsed) && PAGINATION.ALLOWED_PAGE_SIZES.includes(parsed as any)) {
      pageSize = parsed;
    }
  }

  const { products, totalCount, totalPages } = await getPaginatedProductsAction(page, pageSize);

  // If the requested page is out of bounds, redirect to the last valid page
  if (page > totalPages && totalPages > 0) {
    const params = new URLSearchParams();
    params.set("page", totalPages.toString());
    if (pageSizeParam) {
      params.set("pageSize", pageSizeParam.toString());
    }
    redirect(`/shop?${params.toString()}`);
  }

  return (
    <ShopContent 
      initialProducts={products} 
      currentPage={page}
      totalPages={totalPages}
      totalCount={totalCount}
      pageSize={pageSize}
    />
  );
}
