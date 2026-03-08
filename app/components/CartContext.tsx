"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from "react";

/* ---------------------------------------------------------
   TYPES
--------------------------------------------------------- */
export type CartItem = {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  image: string;
};

type CartContextType = {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity"> & { quantity: number }) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
};

/* ---------------------------------------------------------
   CONTEXT
--------------------------------------------------------- */
const CartContext = createContext<CartContextType | undefined>(undefined);

/* ---------------------------------------------------------
   PROVIDER
--------------------------------------------------------- */
import { STORAGE_KEYS } from "@/lib/constants";
import { safeLocalStorageGet, safeLocalStorageSet, safeLocalStorageRemove } from "@/lib/storage-utils";

const CART_STORAGE_KEY = STORAGE_KEYS.CART;

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = safeLocalStorageGet<CartItem[]>(CART_STORAGE_KEY);
    if (savedCart) {
      setCartItems(savedCart);
    }
    setIsHydrated(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!isHydrated) return; // Don't save on initial mount
    safeLocalStorageSet(CART_STORAGE_KEY, cartItems);
  }, [cartItems, isHydrated]);

  const addToCart = (item: Omit<CartItem, "quantity"> & { quantity: number }) => {
    setCartItems((prev) => {
      const existingItem = prev.find((i) => i.productId === item.productId);

      if (existingItem) {
        // Update quantity if item already exists
        return prev.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      } else {
        // Add new item
        return [
          ...prev,
          {
            productId: item.productId,
            productName: item.productName,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          },
        ];
      }
    });
  };

  const removeFromCart = (productId: number) => {
    setCartItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = useCallback(() => {
    setCartItems([]);
    safeLocalStorageRemove(CART_STORAGE_KEY);
  }, []);

  // Memoize expensive calculations to avoid recalculating on every render
  const totalItems = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );
  
  const totalPrice = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems]
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/* ---------------------------------------------------------
   HOOK
--------------------------------------------------------- */
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

