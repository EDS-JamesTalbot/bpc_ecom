"use client";

import { useEffect } from "react";
import { useCart } from "./CartContext";

/**
 * Clears the cart when the order is paid (e.g. after BPC redirect back to order-confirmation).
 * Renders nothing.
 */
export function ClearCartOnPaid() {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return null;
}
