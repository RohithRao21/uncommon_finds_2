import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { db, doc, setDoc, deleteDoc, onSnapshot, collection } from '../lib/firebase';
import { useAuth } from './AuthContext';

export interface WishlistItem {
  productId: string;
  addedAt: string;
}

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  wishlistCount: number;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string) => Promise<boolean>;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isLoadingWishlist: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const GUEST_WISHLIST_KEY = 'voxelform_guest_wishlist';

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoadingWishlist, setIsLoadingWishlist] = useState<boolean>(true);

  // Read guest wishlist helper
  const getGuestWishlist = useCallback((): WishlistItem[] => {
    try {
      const saved = localStorage.getItem(GUEST_WISHLIST_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }, []);

  // Save guest wishlist helper
  const saveGuestWishlist = useCallback((items: WishlistItem[]) => {
    try {
      localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(items));
      setWishlistItems(items);
    } catch (e) {
      console.warn('Could not save guest wishlist to localStorage:', e);
    }
  }, []);

  // Sync wishlist with Firestore for logged-in user, or localStorage for guest
  useEffect(() => {
    setIsLoadingWishlist(true);

    if (currentUser?.uid) {
      const wishlistRef = collection(db, 'users', currentUser.uid, 'wishlist');
      const unsubscribe = onSnapshot(
        wishlistRef,
        (snapshot) => {
          const items: WishlistItem[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            items.push({
              productId: docSnap.id || data.productId,
              addedAt: data.addedAt || new Date().toISOString(),
            });
          });
          setWishlistItems(items);
          setIsLoadingWishlist(false);
        },
        (error) => {
          console.error('Error listening to wishlist:', error);
          setIsLoadingWishlist(false);
        }
      );

      return () => unsubscribe();
    } else {
      // Guest user mode
      const guestItems = getGuestWishlist();
      setWishlistItems(guestItems);
      setIsLoadingWishlist(false);
    }
  }, [currentUser?.uid, getGuestWishlist]);

  const isInWishlist = useCallback(
    (productId: string): boolean => {
      if (!productId) return false;
      return wishlistItems.some((item) => item.productId === productId);
    },
    [wishlistItems]
  );

  const addToWishlist = useCallback(
    async (productId: string): Promise<void> => {
      if (!productId) return;

      // Prevent duplicates
      if (wishlistItems.some((item) => item.productId === productId)) {
        return;
      }

      const newItem: WishlistItem = {
        productId,
        addedAt: new Date().toISOString(),
      };

      if (currentUser?.uid) {
        try {
          const itemRef = doc(db, 'users', currentUser.uid, 'wishlist', productId);
          await setDoc(itemRef, newItem);
        } catch (err) {
          console.error('Failed to add wishlist item in Firestore:', err);
        }
      } else {
        const guestItems = getGuestWishlist();
        if (!guestItems.some((item) => item.productId === productId)) {
          const updated = [newItem, ...guestItems];
          saveGuestWishlist(updated);
        }
      }
    },
    [currentUser?.uid, wishlistItems, getGuestWishlist, saveGuestWishlist]
  );

  const removeFromWishlist = useCallback(
    async (productId: string): Promise<void> => {
      if (!productId) return;

      if (currentUser?.uid) {
        try {
          const itemRef = doc(db, 'users', currentUser.uid, 'wishlist', productId);
          await deleteDoc(itemRef);
        } catch (err) {
          console.error('Failed to remove wishlist item in Firestore:', err);
        }
      } else {
        const guestItems = getGuestWishlist();
        const updated = guestItems.filter((item) => item.productId !== productId);
        saveGuestWishlist(updated);
      }
    },
    [currentUser?.uid, getGuestWishlist, saveGuestWishlist]
  );

  const toggleWishlist = useCallback(
    async (productId: string): Promise<boolean> => {
      if (isInWishlist(productId)) {
        await removeFromWishlist(productId);
        return false;
      } else {
        await addToWishlist(productId);
        return true;
      }
    },
    [isInWishlist, removeFromWishlist, addToWishlist]
  );

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistCount: wishlistItems.length,
        isInWishlist,
        toggleWishlist,
        addToWishlist,
        removeFromWishlist,
        isLoadingWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
