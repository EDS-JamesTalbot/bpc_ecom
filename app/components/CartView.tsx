"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCart } from "./CartContext";
import { CheckoutDialog } from "./CheckoutDialog";
import { useTenantSlug } from "@/app/hooks/useTenantSlug";
import { withTenantPrefix } from "@/lib/tenant-utils";

export function CartView() {
  const router = useRouter();
  const pathname = usePathname();
  const tenantSlug = useTenantSlug();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    totalPrice,
    clearCart,
  } = useCart();

  const handleCheckoutSuccess = () => {
    // Clear the cart
    clearCart();
    // Close the cart panel
    setIsCartOpen(false);
  };

  const handleContinueShopping = () => {
    setIsCartOpen(false);
    router.push(withTenantPrefix("/shop", tenantSlug));
  };

  // Open cart when returning from payment-failed (e.g. ?openCart=1)
  // Use router.replace so Next.js stays in sync and we don't end up on wrong page
  useEffect(() => {
    if (typeof window === "undefined" || !pathname) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("openCart") === "1") {
      setIsCartOpen(true);
      params.delete("openCart");
      const search = params.toString();
      const cleanUrl = search ? `${pathname}?${search}` : pathname;
      router.replace(cleanUrl, { scroll: false });
    }
  }, [pathname, router]);

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent className="w-full sm:max-w-lg bg-gradient-to-br from-blue-50 to-sky-50">
        <SheetHeader className="border-b border-primary/20 pb-4">
          <div className="flex flex-col items-center gap-3 pr-8">
            <SheetTitle className="text-2xl font-semibold text-[#0c4a6e]">
              Shopping Cart
            </SheetTitle>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-2 border-[#1DA1F9] bg-[#1DA1F9] text-white hover:bg-[#0c4a6e] hover:border-[#0c4a6e] transition-all"
              onClick={handleContinueShopping}
            >
              Continue Shopping
            </Button>
          </div>
        </SheetHeader>

        <div className="flex flex-col h-[calc(100vh-8rem)]">
          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto py-4">
            {cartItems.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="mb-4 rounded-full bg-[#e0f2fe] p-8">
                  <ShoppingCart className="h-16 w-16 text-primary" />
                </div>
                <p className="text-lg font-semibold text-[#0c4a6e]">
                  Your cart is empty
                </p>
                <p className="mt-2 text-sm text-[#475569]">
                  Add some lovely soaps to get started!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.productId}
                    className="flex gap-4 rounded-xl bg-white p-4 shadow-md ring-1 ring-blue-200/40"
                  >
                    {/* Product Image */}
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg">
                      <Image
                        src={item.image}
                        alt={item.productName}
                        fill
                        className="object-contain p-2"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-[#0c4a6e]">
                          {item.productName}
                        </h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-[#475569] hover:text-red-600"
                          onClick={() => removeFromCart(item.productId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <p className="mt-1 text-sm font-semibold text-primary">
                        ${item.price.toFixed(2)} each
                      </p>

                      {/* Quantity Controls */}
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 rounded-full border-2 border-[#1DA1F9] bg-[#1DA1F9] text-white hover:bg-[#0c4a6e] hover:border-[#0c4a6e]"
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity - 1)
                            }
                          >
                            <Minus className="h-3 w-3" />
                          </Button>

                          <span className="w-8 text-center text-sm font-semibold text-[#0c4a6e]">
                            {item.quantity}
                          </span>

                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 rounded-full border-2 border-[#1DA1F9] bg-[#1DA1F9] text-white hover:bg-[#0c4a6e] hover:border-[#0c4a6e]"
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity + 1)
                            }
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <p className="text-base font-bold text-[#0c4a6e]">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Footer */}
          {cartItems.length > 0 && (
            <div className="border-t border-primary/20 pt-4">
              <div className="mb-4 flex items-center justify-center">
                <span className="text-lg font-semibold text-[#0c4a6e] mr-3">
                  Total:
                </span>
                <span className="text-2xl font-bold text-primary">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <Button
                  className="rounded-full bg-[#1DA1F9] text-white hover:bg-[#0c4a6e] shadow-md px-12"
                  size="lg"
                  onClick={() => setIsCheckoutOpen(true)}
                >
                  Checkout
                </Button>

                <Button
                  className="rounded-full bg-red-600 text-white hover:bg-red-700 shadow-md px-8 font-bold"
                  onClick={clearCart}
                >
                  Clear Cart
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>

      {/* Checkout Dialog */}
      <CheckoutDialog
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={handleCheckoutSuccess}
      />
    </Sheet>
  );
}

function ShoppingCart({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

