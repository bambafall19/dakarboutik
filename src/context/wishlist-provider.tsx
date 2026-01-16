"use client";

import type { Product } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import React, { createContext, useReducer, useEffect, useCallback, useMemo } from "react";

// State is an array of product IDs
type WishlistState = {
  productIds: string[];
};

type WishlistAction =
  | { type: "TOGGLE_ITEM"; payload: { product: Product } }
  | { type: "SET_STATE"; payload: WishlistState };

const initialState: WishlistState = {
  productIds: [],
};

const wishlistReducer = (state: WishlistState, action: WishlistAction): WishlistState => {
  switch (action.type) {
    case "TOGGLE_ITEM": {
      const { product } = action.payload;
      const existingIndex = state.productIds.findIndex(id => id === product.id);

      if (existingIndex > -1) {
        // Remove item
        const updatedIds = state.productIds.filter(id => id !== product.id);
        return { ...state, productIds: updatedIds };
      } else {
        // Add item
        const updatedIds = [...state.productIds, product.id];
        return { ...state, productIds: updatedIds };
      }
    }
    case "SET_STATE": {
      return action.payload;
    }
    default:
      return state;
  }
};

type WishlistContextType = {
  productIds: string[];
  toggleWishlist: (product: Product) => void;
  isProductInWishlist: (productId: string) => boolean;
  totalItems: number;
};

export const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(wishlistReducer, initialState);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedWishlist = localStorage.getItem("dakarboutik_wishlist");
      if (storedWishlist) {
        dispatch({ type: "SET_STATE", payload: JSON.parse(storedWishlist) });
      }
    } catch (error) {
      console.error("Failed to load wishlist from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("dakarboutik_wishlist", JSON.stringify(state));
    } catch (error) {
      console.error("Failed to save wishlist to localStorage", error);
    }
  }, [state]);

  const toggleWishlist = useCallback((product: Product) => {
    const isAdding = !state.productIds.includes(product.id);
    dispatch({ type: "TOGGLE_ITEM", payload: { product } });
    toast({
      title: isAdding ? "Ajouté aux favoris" : "Retiré des favoris",
      description: product.title,
    });
  }, [state.productIds, toast]);

  const isProductInWishlist = useCallback((productId: string) => {
    return state.productIds.includes(productId);
  }, [state.productIds]);
  
  const totalItems = useMemo(() => state.productIds.length, [state.productIds]);

  return (
    <WishlistContext.Provider
      value={{
        productIds: state.productIds,
        toggleWishlist,
        isProductInWishlist,
        totalItems,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
