import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { db, doc, setDoc, deleteDoc, updateDoc, onSnapshot, collection, writeBatch } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { Address } from '../types';

interface AddressContextType {
  addresses: Address[];
  defaultAddress: Address | null;
  isLoadingAddresses: boolean;
  addAddress: (addressData: Omit<Address, 'id'>) => Promise<{ success: boolean; id?: string; error?: string }>;
  updateAddress: (id: string, addressData: Partial<Address>) => Promise<{ success: boolean; error?: string }>;
  deleteAddress: (id: string) => Promise<{ success: boolean; error?: string }>;
  setDefaultAddress: (id: string) => Promise<{ success: boolean; error?: string }>;
  validatePincode: (pincode: string) => { isValid: boolean; message?: string };
}

const AddressContext = createContext<AddressContextType | undefined>(undefined);

const GUEST_ADDRESSES_KEY = 'voxelform_guest_addresses';

export const validateIndianPincode = (pincode: string): { isValid: boolean; message?: string } => {
  const cleaned = pincode.trim();
  if (!cleaned) {
    return { isValid: false, message: 'Pincode is required' };
  }
  // Indian Pincodes are 6-digit numbers starting with 1-9
  const pincodeRegex = /^[1-9][0-9]{5}$/;
  if (!pincodeRegex.test(cleaned)) {
    return {
      isValid: false,
      message: 'Enter a valid 6-digit Indian Pincode (e.g. 560001, 110001)',
    };
  }
  return { isValid: true };
};

export const AddressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState<boolean>(true);

  // Guest helper
  const getGuestAddresses = useCallback((): Address[] => {
    try {
      const saved = localStorage.getItem(GUEST_ADDRESSES_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }, []);

  const saveGuestAddresses = useCallback((items: Address[]) => {
    try {
      localStorage.setItem(GUEST_ADDRESSES_KEY, JSON.stringify(items));
      setAddresses(items);
    } catch (e) {
      console.warn('Could not save guest addresses to localStorage:', e);
    }
  }, []);

  // Listen to Firestore addresses or localStorage
  useEffect(() => {
    setIsLoadingAddresses(true);

    if (currentUser?.uid) {
      const addrRef = collection(db, 'users', currentUser.uid, 'addresses');
      const unsubscribe = onSnapshot(
        addrRef,
        (snapshot) => {
          const items: Address[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            items.push({
              id: docSnap.id,
              fullName: data.fullName || '',
              phone: data.phone || '',
              addressLine1: data.addressLine1 || '',
              addressLine2: data.addressLine2 || '',
              city: data.city || '',
              state: data.state || '',
              country: data.country || 'India',
              pincode: data.pincode || '',
              isDefault: !!data.isDefault,
              createdAt: data.createdAt || new Date().toISOString(),
            });
          });
          // Sort default first, then newer
          items.sort((a, b) => {
            if (a.isDefault && !b.isDefault) return -1;
            if (!a.isDefault && b.isDefault) return 1;
            return (b.createdAt || '').localeCompare(a.createdAt || '');
          });
          setAddresses(items);
          setIsLoadingAddresses(false);
        },
        (error) => {
          console.error('Error fetching addresses from Firestore:', error);
          setIsLoadingAddresses(false);
        }
      );

      return () => unsubscribe();
    } else {
      const guestItems = getGuestAddresses();
      setAddresses(guestItems);
      setIsLoadingAddresses(false);
    }
  }, [currentUser?.uid, getGuestAddresses]);

  const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0] || null;

  const addAddress = useCallback(
    async (addressData: Omit<Address, 'id'>): Promise<{ success: boolean; id?: string; error?: string }> => {
      // Validate Indian pincode
      const pincodeCheck = validateIndianPincode(addressData.pincode);
      if (!pincodeCheck.isValid) {
        return { success: false, error: pincodeCheck.message };
      }

      if (!addressData.fullName.trim() || !addressData.phone.trim() || !addressData.addressLine1.trim() || !addressData.city.trim() || !addressData.state.trim()) {
        return { success: false, error: 'Please fill in all required address fields.' };
      }

      const id = 'addr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
      const isFirst = addresses.length === 0;
      const shouldBeDefault = addressData.isDefault || isFirst;

      if (currentUser?.uid) {
        try {
          const batch = writeBatch(db);

          // If this new address is set as default, unset other defaults
          if (shouldBeDefault) {
            addresses.forEach((addr) => {
              if (addr.isDefault) {
                const ref = doc(db, 'users', currentUser.uid, 'addresses', addr.id);
                batch.update(ref, { isDefault: false });
              }
            });
          }

          const newDocRef = doc(db, 'users', currentUser.uid, 'addresses', id);
          batch.set(newDocRef, {
            ...addressData,
            country: addressData.country || 'India',
            isDefault: shouldBeDefault,
            createdAt: new Date().toISOString(),
          });

          await batch.commit();
          return { success: true, id };
        } catch (err: any) {
          console.error('Error adding address:', err);
          return { success: false, error: err.message || 'Failed to save address.' };
        }
      } else {
        // Guest mode
        const currentGuest = getGuestAddresses();
        const updatedList = currentGuest.map((addr) => ({
          ...addr,
          isDefault: shouldBeDefault ? false : addr.isDefault,
        }));

        const newAddr: Address = {
          ...addressData,
          id,
          country: addressData.country || 'India',
          isDefault: shouldBeDefault,
          createdAt: new Date().toISOString(),
        };

        saveGuestAddresses([newAddr, ...updatedList]);
        return { success: true, id };
      }
    },
    [addresses, currentUser?.uid, getGuestAddresses, saveGuestAddresses]
  );

  const updateAddress = useCallback(
    async (id: string, addressData: Partial<Address>): Promise<{ success: boolean; error?: string }> => {
      if (addressData.pincode) {
        const pincodeCheck = validateIndianPincode(addressData.pincode);
        if (!pincodeCheck.isValid) {
          return { success: false, error: pincodeCheck.message };
        }
      }

      if (currentUser?.uid) {
        try {
          const batch = writeBatch(db);

          if (addressData.isDefault) {
            addresses.forEach((addr) => {
              if (addr.id !== id && addr.isDefault) {
                const ref = doc(db, 'users', currentUser.uid, 'addresses', addr.id);
                batch.update(ref, { isDefault: false });
              }
            });
          }

          const targetRef = doc(db, 'users', currentUser.uid, 'addresses', id);
          batch.update(targetRef, addressData);

          await batch.commit();
          return { success: true };
        } catch (err: any) {
          console.error('Error updating address:', err);
          return { success: false, error: err.message || 'Failed to update address.' };
        }
      } else {
        const currentGuest = getGuestAddresses();
        const updatedList = currentGuest.map((addr) => {
          if (addr.id === id) {
            return { ...addr, ...addressData };
          }
          if (addressData.isDefault) {
            return { ...addr, isDefault: false };
          }
          return addr;
        });
        saveGuestAddresses(updatedList);
        return { success: true };
      }
    },
    [addresses, currentUser?.uid, getGuestAddresses, saveGuestAddresses]
  );

  const deleteAddress = useCallback(
    async (id: string): Promise<{ success: boolean; error?: string }> => {
      if (currentUser?.uid) {
        try {
          const docRef = doc(db, 'users', currentUser.uid, 'addresses', id);
          await deleteDoc(docRef);

          // If deleted address was default, make another default if available
          const deletedAddr = addresses.find((a) => a.id === id);
          if (deletedAddr?.isDefault) {
            const remaining = addresses.filter((a) => a.id !== id);
            if (remaining.length > 0) {
              const nextDefaultRef = doc(db, 'users', currentUser.uid, 'addresses', remaining[0].id);
              await updateDoc(nextDefaultRef, { isDefault: true });
            }
          }
          return { success: true };
        } catch (err: any) {
          console.error('Error deleting address:', err);
          return { success: false, error: err.message || 'Failed to delete address.' };
        }
      } else {
        const currentGuest = getGuestAddresses();
        const remaining = currentGuest.filter((a) => a.id !== id);
        if (remaining.length > 0 && !remaining.some((a) => a.isDefault)) {
          remaining[0].isDefault = true;
        }
        saveGuestAddresses(remaining);
        return { success: true };
      }
    },
    [addresses, currentUser?.uid, getGuestAddresses, saveGuestAddresses]
  );

  const setDefaultAddress = useCallback(
    async (id: string): Promise<{ success: boolean; error?: string }> => {
      return updateAddress(id, { isDefault: true });
    },
    [updateAddress]
  );

  return (
    <AddressContext.Provider
      value={{
        addresses,
        defaultAddress,
        isLoadingAddresses,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        validatePincode: validateIndianPincode,
      }}
    >
      {children}
    </AddressContext.Provider>
  );
};

export const useAddress = () => {
  const context = useContext(AddressContext);
  if (!context) {
    throw new Error('useAddress must be used within an AddressProvider');
  }
  return context;
};
