import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { CartItem, Product } from '../types';
import { useAuth } from './AuthContext';
import { 
  subscribeToUserCart, 
  saveUserCartItem, 
  deleteUserCartItem, 
  clearUserCartInFirestore,
  syncGuestCartToFirestore
} from '../lib/cartService';

export interface AddToCartPayload {
  productId: string;
  productName: string;
  selectedColor: string;
  price: number;
  image: string;
  quantity?: number;
  maxStock?: number;
  selectedLayerHeight?: string;
  customEngraving?: string;
  product?: Product;
}

export interface ToastAlert {
  id: string;
  productName: string;
  selectedColor: string;
  quantity: number;
  image?: string;
}

export interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  subtotal: number;
  shippingCost: number;
  estimatedTotal: number;
  freeShippingThreshold: number;
  amountNeededForFreeShipping: number;
  freeShippingProgress: number;
  stockError: string | null;
  clearStockError: () => void;
  toastAlert: ToastAlert | null;
  dismissToastAlert: () => void;
  addToCart: (payload: AddToCartPayload) => boolean;
  removeFromCart: (id: string) => void;
  increaseQuantity: (id: string) => void;
  decreaseQuantity: (id: string) => void;
  updateQuantity: (id: string, newQty: number) => void;
  clearCart: () => void;
  isLoadingCart: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'voxelform_cart';
const FREE_SHIPPING_THRESHOLD = 500; // INR 500 or 50 threshold
const FLAT_SHIPPING_COST = 99; // INR 99 flat shipping

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoadingCart, setIsLoadingCart] = useState<boolean>(true);
  const [stockError, setStockError] = useState<string | null>(null);
  const [toastAlert, setToastAlert] = useState<ToastAlert | null>(null);

  // Clear stock error banner
  const clearStockError = useCallback(() => {
    setStockError(null);
  }, []);

  const dismissToastAlert = useCallback(() => {
    setToastAlert(null);
  }, []);

  // Sync / Listen to Cart state
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    if (currentUser?.uid) {
      setIsLoadingCart(true);

      // Check if there are guest cart items in localStorage to merge
      const storedGuest = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedGuest) {
        try {
          const parsedGuest: CartItem[] = JSON.parse(storedGuest);
          if (Array.isArray(parsedGuest) && parsedGuest.length > 0) {
            syncGuestCartToFirestore(currentUser.uid, parsedGuest).finally(() => {
              localStorage.removeItem(LOCAL_STORAGE_KEY);
            });
          } else {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
          }
        } catch (e) {
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
      }

      // Subscribe to real-time Firestore cart
      unsubscribe = subscribeToUserCart(
        currentUser.uid,
        (items) => {
          setCartItems(items);
          setIsLoadingCart(false);
        },
        (error) => {
          console.warn('Firestore cart subscription warning:', error);
          setIsLoadingCart(false);
        }
      );
    } else {
      // Guest User: Read from localStorage
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        try {
          const parsed: CartItem[] = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setCartItems(parsed);
          }
        } catch (e) {
          console.warn('Failed to parse localStorage cart:', e);
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
      } else {
        setCartItems([]);
      }
      setIsLoadingCart(false);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser?.uid]);

  // Persist guest cart to localStorage
  const saveGuestCart = useCallback((items: CartItem[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to save cart to localStorage:', e);
    }
  }, []);

  // Generate deterministic ID for cart item
  const getItemId = (payload: AddToCartPayload): string => {
    const pId = payload.productId || 'item';
    const color = (payload.selectedColor || 'default').toLowerCase().replace(/[^a-z0-9]/g, '-');
    const height = (payload.selectedLayerHeight || '0.12mm').toLowerCase().replace(/[^a-z0-9]/g, '');
    const eng = payload.customEngraving ? `_${payload.customEngraving.toLowerCase().replace(/[^a-z0-9]/g, '')}` : '';
    return `${pId}_${color}_${height}${eng}`;
  };

  // Add item to cart with strict stock validation
  const addToCart = useCallback((payload: AddToCartPayload): boolean => {
    const itemId = getItemId(payload);
    const qtyToAdd = payload.quantity && payload.quantity > 0 ? payload.quantity : 1;
    const maxStock = typeof payload.maxStock === 'number' ? payload.maxStock : 99;

    if (maxStock <= 0) {
      setStockError(`"${payload.productName}" (${payload.selectedColor}) is currently out of stock.`);
      return false;
    }

    let success = true;

    setCartItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === itemId);

      if (existingIndex > -1) {
        const existing = prev[existingIndex];
        const currentQty = existing.quantity;
        const newTotalQty = currentQty + qtyToAdd;

        if (newTotalQty > maxStock) {
          const clampedQty = maxStock;
          if (currentQty >= maxStock) {
            setStockError(`Stock limit reached! Maximum available stock for ${payload.productName} (${payload.selectedColor}) is ${maxStock}.`);
            success = false;
            return prev;
          } else {
            setStockError(`Added ${maxStock - currentQty} unit(s) to cart. Maximum available stock for ${payload.productName} (${payload.selectedColor}) is ${maxStock}.`);
            const updatedItem: CartItem = {
              ...existing,
              quantity: clampedQty,
              maxStock: maxStock,
            };

            const updatedList = [...prev];
            updatedList[existingIndex] = updatedItem;

            if (currentUser?.uid) {
              saveUserCartItem(currentUser.uid, updatedItem);
            } else {
              saveGuestCart(updatedList);
            }
            return updatedList;
          }
        }

        const updatedItem: CartItem = {
          ...existing,
          quantity: newTotalQty,
          maxStock: maxStock,
        };

        const updatedList = [...prev];
        updatedList[existingIndex] = updatedItem;

        if (currentUser?.uid) {
          saveUserCartItem(currentUser.uid, updatedItem);
        } else {
          saveGuestCart(updatedList);
        }
        setStockError(null);
        return updatedList;
      } else {
        const initialQty = Math.min(qtyToAdd, maxStock);

        if (qtyToAdd > maxStock) {
          setStockError(`Added ${initialQty} unit(s) to cart. Maximum available stock for ${payload.productName} (${payload.selectedColor}) is ${maxStock}.`);
        } else {
          setStockError(null);
        }

        const newItem: CartItem = {
          id: itemId,
          productId: payload.productId,
          productName: payload.productName,
          selectedColor: payload.selectedColor,
          selectedMaterial: payload.selectedColor,
          quantity: initialQty,
          price: payload.price,
          unitPrice: payload.price,
          image: payload.image,
          selectedLayerHeight: payload.selectedLayerHeight || '0.12 mm',
          customEngraving: payload.customEngraving || '',
          maxStock: maxStock,
          product: payload.product,
        };

        const updatedList = [newItem, ...prev];

        if (currentUser?.uid) {
          saveUserCartItem(currentUser.uid, newItem);
        } else {
          saveGuestCart(updatedList);
        }
        return updatedList;
      }
    });

    if (success) {
      setToastAlert({
        id: Date.now().toString(),
        productName: payload.productName,
        selectedColor: payload.selectedColor,
        quantity: qtyToAdd,
        image: payload.image,
      });
    }

    return success;
  }, [currentUser?.uid, saveGuestCart]);

  // Update item quantity
  const updateQuantity = useCallback((id: string, newQty: number) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === id);
      if (!existing) return prev;

      if (newQty <= 0) {
        const updatedList = prev.filter((item) => item.id !== id);
        if (currentUser?.uid) {
          deleteUserCartItem(currentUser.uid, id);
        } else {
          saveGuestCart(updatedList);
        }
        setStockError(null);
        return updatedList;
      }

      const itemMaxStock = typeof existing.maxStock === 'number' ? existing.maxStock : 99;

      if (newQty > itemMaxStock) {
        setStockError(`Cannot set quantity above available stock limit of ${itemMaxStock} unit(s).`);
        newQty = itemMaxStock;
      } else {
        setStockError(null);
      }

      const updatedItem: CartItem = {
        ...existing,
        quantity: newQty,
      };

      const updatedList = prev.map((item) => (item.id === id ? updatedItem : item));

      if (currentUser?.uid) {
        saveUserCartItem(currentUser.uid, updatedItem);
      } else {
        saveGuestCart(updatedList);
      }

      return updatedList;
    });
  }, [currentUser?.uid, saveGuestCart]);

  const increaseQuantity = useCallback((id: string) => {
    setCartItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (!item) return prev;
      const currentQty = item.quantity;
      const itemMaxStock = typeof item.maxStock === 'number' ? item.maxStock : 99;

      if (currentQty >= itemMaxStock) {
        setStockError(`Cannot add more. Available stock limit for ${item.productName} (${item.selectedColor}) is ${itemMaxStock}.`);
        return prev;
      }

      setStockError(null);
      const newQty = currentQty + 1;
      const updatedItem: CartItem = { ...item, quantity: newQty };
      const updatedList = prev.map((i) => (i.id === id ? updatedItem : i));

      if (currentUser?.uid) {
        saveUserCartItem(currentUser.uid, updatedItem);
      } else {
        saveGuestCart(updatedList);
      }

      return updatedList;
    });
  }, [currentUser?.uid, saveGuestCart]);

  const decreaseQuantity = useCallback((id: string) => {
    setCartItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (!item) return prev;

      setStockError(null);
      if (item.quantity <= 1) {
        const updatedList = prev.filter((i) => i.id !== id);
        if (currentUser?.uid) {
          deleteUserCartItem(currentUser.uid, id);
        } else {
          saveGuestCart(updatedList);
        }
        return updatedList;
      }

      const updatedItem: CartItem = { ...item, quantity: item.quantity - 1 };
      const updatedList = prev.map((i) => (i.id === id ? updatedItem : i));

      if (currentUser?.uid) {
        saveUserCartItem(currentUser.uid, updatedItem);
      } else {
        saveGuestCart(updatedList);
      }

      return updatedList;
    });
  }, [currentUser?.uid, saveGuestCart]);

  const removeFromCart = useCallback((id: string) => {
    setCartItems((prev) => {
      const updatedList = prev.filter((i) => i.id !== id);
      if (currentUser?.uid) {
        deleteUserCartItem(currentUser.uid, id);
      } else {
        saveGuestCart(updatedList);
      }
      setStockError(null);
      return updatedList;
    });
  }, [currentUser?.uid, saveGuestCart]);

  const clearCart = useCallback(() => {
    setCartItems([]);
    setStockError(null);
    if (currentUser?.uid) {
      clearUserCartInFirestore(currentUser.uid);
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, [currentUser?.uid]);

  // Derived Totals
  const cartCount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [cartItems]);

  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + (item.price || item.unitPrice || 0) * item.quantity, 0);
  }, [cartItems]);

  const amountNeededForFreeShipping = useMemo(() => {
    return Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  }, [subtotal]);

  const freeShippingProgress = useMemo(() => {
    return Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  }, [subtotal]);

  const shippingCost = useMemo(() => {
    if (cartItems.length === 0) return 0;
    return amountNeededForFreeShipping === 0 ? 0 : FLAT_SHIPPING_COST;
  }, [cartItems.length, amountNeededForFreeShipping]);

  const estimatedTotal = useMemo(() => {
    return subtotal + shippingCost;
  }, [subtotal, shippingCost]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        subtotal,
        shippingCost,
        estimatedTotal,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
        amountNeededForFreeShipping,
        freeShippingProgress,
        stockError,
        clearStockError,
        toastAlert,
        dismissToastAlert,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        updateQuantity,
        clearCart,
        isLoadingCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
