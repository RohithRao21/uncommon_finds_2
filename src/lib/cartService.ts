import { 
  db, 
  auth,
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  collection, 
  onSnapshot,
  Unsubscribe
} from './firebase';
import { CartItem } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
  * Subscribe to real-time changes in a user's Firestore cart subcollection: users/{uid}/cart
  */
export function subscribeToUserCart(
  userId: string, 
  onData: (items: CartItem[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const cartRef = collection(db, 'users', userId, 'cart');

  return onSnapshot(
    cartRef,
    (snapshot) => {
      const items: CartItem[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        const price = Number(data.price || data.unitPrice || 0);
        const selectedColor = data.selectedColor || data.selectedMaterial || 'Default';
        
        return {
          id: docSnap.id,
          productId: data.productId || docSnap.id.split('_')[0],
          productName: data.productName || '3D Print Item',
          selectedColor: selectedColor,
          selectedMaterial: data.selectedMaterial || selectedColor,
          quantity: Number(data.quantity || 1),
          price: price,
          unitPrice: price,
          image: data.image || '',
          selectedLayerHeight: data.selectedLayerHeight || '0.12 mm',
          customEngraving: data.customEngraving || '',
          maxStock: typeof data.maxStock === 'number' ? data.maxStock : undefined,
          product: data.product || undefined,
        };
      });
      onData(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${userId}/cart`);
      if (onError) onError(error);
    }
  );
}

/**
  * Save/Update a single cart item in users/{uid}/cart/{itemId}
  */
export async function saveUserCartItem(userId: string, item: CartItem): Promise<void> {
  const path = `users/${userId}/cart/${item.id}`;
  try {
    const itemRef = doc(db, 'users', userId, 'cart', item.id);
    const docData = {
      productId: item.productId,
      productName: item.productName,
      selectedColor: item.selectedColor,
      quantity: item.quantity,
      price: item.price,
      image: item.image,
      // Metadata
      selectedMaterial: item.selectedMaterial || item.selectedColor,
      unitPrice: item.price,
      selectedLayerHeight: item.selectedLayerHeight || '0.12 mm',
      customEngraving: item.customEngraving || '',
      maxStock: typeof item.maxStock === 'number' ? item.maxStock : 99,
      updatedAt: new Date().toISOString(),
    };

    await setDoc(itemRef, docData, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
  * Delete a cart item from users/{uid}/cart/{itemId}
  */
export async function deleteUserCartItem(userId: string, itemId: string): Promise<void> {
  const path = `users/${userId}/cart/${itemId}`;
  try {
    const itemRef = doc(db, 'users', userId, 'cart', itemId);
    await deleteDoc(itemRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
  * Clear all items in a user's cart subcollection
  */
export async function clearUserCartInFirestore(userId: string): Promise<void> {
  const path = `users/${userId}/cart`;
  try {
    const cartRef = collection(db, 'users', userId, 'cart');
    const snapshot = await getDocs(cartRef);
    const deletePromises = snapshot.docs.map((docSnap) => deleteDoc(docSnap.ref));
    await Promise.all(deletePromises);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
  * Merge guest cart items into user's Firestore cart when logging in
  */
export async function syncGuestCartToFirestore(userId: string, guestItems: CartItem[]): Promise<void> {
  if (!guestItems || guestItems.length === 0) return;

  const path = `users/${userId}/cart`;
  try {
    for (const item of guestItems) {
      await saveUserCartItem(userId, item);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
