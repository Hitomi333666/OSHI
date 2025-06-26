// contexts/CartContext.tsx
"use client";
import { createContext, useContext, useState, ReactNode } from "react";
interface CartItem {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
}
interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
}
const CartContext = createContext<CartContextType | undefined>(undefined);
export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  // 🔹 カートにアイテムを追加
  const addToCart = (item: CartItem) => {
    setCartItems((prevCart) => {
      if (prevCart.some((cartItem) => cartItem.id === item.id)) {
        return prevCart; // 重複追加を防ぐ
      }
      return [...prevCart, item];
    });
    setCartOpen(true); // カートを開く
  };
  // 🔹 カートからアイテムを削除
  const removeFromCart = (id: string) => {
    setCartItems((prevCart) => prevCart.filter((item) => item.id !== id));
  };
  // 🔹 カートをクリア
  const clearCart = () => {
    setCartItems([]);
  };
  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        cartOpen,
        setCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
