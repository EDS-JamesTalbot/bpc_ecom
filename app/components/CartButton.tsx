"use client";

import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "./CartContext";

export function CartButton() {
  const { totalItems, setIsCartOpen } = useCart();

  return (
    <Button
      variant="outline"
      size="icon"
      className="relative h-14 w-14 rounded-full border-2 border-[#1DA1F9] bg-[#1DA1F9] text-white hover:bg-[#0c4a6e] hover:border-[#0c4a6e] hover:scale-105 transition-all shadow-md"
      onClick={() => setIsCartOpen(true)}
    >
      <ShoppingCart className="h-7 w-7" />
      {totalItems > 0 && (
        <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#64748b] text-sm font-bold text-white shadow-md">
          {totalItems}
        </span>
      )}
    </Button>
  );
}

