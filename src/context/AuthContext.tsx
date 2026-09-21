import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  auth, 
  db, 
  googleProvider,
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  sendEmailVerification,
  firebaseSignOut, 
  onAuthStateChanged, 
  updateProfile,
  doc,
  setDoc,
  getDoc,
  User 
} from '../lib/firebase';

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  phone: string;
  createdAt: string;
  emailVerified: boolean;
  role: 'customer' | 'admin';
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signup: (email: string, password: string, fullName: string) => Promise<User>;
  login: (email: string, password: string) => Promise<User>;
  resetPassword: (email: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<User>;
  loginAsDemoUser: (email: string, fullName: string) => Promise<User>;
  refreshUserProfile: () => Promise<void>;
  updateUserProfileData: (updatedFields: { fullName?: string; phone?: string }) => Promise<void>;
  updateUserRole: (newRole: 'customer' | 'admin') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch Firestore User Profile document
  const fetchUserProfile = async (user: User) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        setUserProfile({
          ...data,
          emailVerified: user.emailVerified,
        });
      } else {
        // Fallback profile creation if document was missing
        const newProfile: UserProfile = {
          uid: user.uid,
          fullName: user.displayName || 'Maker',
          email: user.email || '',
          phone: '',
          createdAt: new Date().toISOString(),
          emailVerified: user.emailVerified,
          role: 'customer',
        };
        await setDoc(userRef, newProfile);
        setUserProfile(newProfile);
      }
    } catch (err) {
      console.error('Failed to load user profile document:', err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        await fetchUserProfile(user);
      } else {
        // Check for saved demo session fallback
        const storedDemoUser = localStorage.getItem('voxelform_demo_user');
        if (storedDemoUser) {
          try {
            const parsed = JSON.parse(storedDemoUser);
            setCurrentUser(parsed.user as User);
            setUserProfile(parsed.profile as UserProfile);
          } catch (e) {
            localStorage.removeItem('voxelform_demo_user');
            setCurrentUser(null);
            setUserProfile(null);
          }
        } else {
          setCurrentUser(null);
          setUserProfile(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signup = async (email: string, password: string, fullName: string): Promise<User> => {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;

    // 1. Update Firebase Auth display name
    await updateProfile(user, { displayName: fullName });

    // 2. Send Email Verification
    try {
      await sendEmailVerification(user);
    } catch (err) {
      console.warn('Could not send email verification immediately:', err);
    }

    // 3. Create Firestore User Document users/{uid}
    const userDocData: UserProfile = {
      uid: user.uid,
      fullName: fullName,
      email: user.email || email,
      phone: '',
      createdAt: new Date().toISOString(),
      emailVerified: user.emailVerified || false,
      role: 'customer',
    };

    await setDoc(doc(db, 'users', user.uid), userDocData);
    setUserProfile(userDocData);
    localStorage.removeItem('voxelform_demo_user');

    return user;
  };

  const login = async (email: string, password: string): Promise<User> => {
    const res = await signInWithEmailAndPassword(auth, email, password);
    if (res.user) {
      await fetchUserProfile(res.user);
      localStorage.removeItem('voxelform_demo_user');
    }
    return res.user;
  };

  const resetPassword = async (email: string): Promise<void> => {
    await sendPasswordResetEmail(auth, email);
  };

  const resendVerificationEmail = async (): Promise<void> => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    } else {
      throw new Error('No active user logged in.');
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.warn('Firebase signout warning:', err);
    }
    localStorage.removeItem('voxelform_demo_user');
    setCurrentUser(null);
    setUserProfile(null);
  };

  const signInWithGoogle = async (): Promise<User> => {
    const res = await signInWithPopup(auth, googleProvider);
    const user = res.user;

    // Create or sync user profile doc
    const userRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) {
      const userDocData: UserProfile = {
        uid: user.uid,
        fullName: user.displayName || 'Maker',
        email: user.email || '',
        phone: user.phoneNumber || '',
        createdAt: new Date().toISOString(),
        emailVerified: user.emailVerified || false,
        role: 'customer',
      };
      await setDoc(userRef, userDocData);
      setUserProfile(userDocData);
    } else {
      await fetchUserProfile(user);
    }

    localStorage.removeItem('voxelform_demo_user');
    return user;
  };

  const loginAsDemoUser = async (email: string, fullName: string): Promise<User> => {
    const cleanEmail = email || 'maker@voxelform.tech';
    const cleanName = fullName || 'Voxelform Maker';
    const demoUid = `demo-${cleanEmail.replace(/[^a-zA-Z0-9]/g, '')}`;

    const mockUser: Partial<User> = {
      uid: demoUid,
      email: cleanEmail,
      displayName: cleanName,
      emailVerified: true,
    };

    const userProfileData: UserProfile = {
      uid: demoUid,
      fullName: cleanName,
      email: cleanEmail,
      phone: '',
      createdAt: new Date().toISOString(),
      emailVerified: true,
      role: 'customer',
    };

    // Save profile to Firestore users/{uid}
    try {
      await setDoc(doc(db, 'users', demoUid), userProfileData);
    } catch (err) {
      console.warn('Could not save demo user to Firestore:', err);
    }

    const fullUser = mockUser as User;
    setCurrentUser(fullUser);
    setUserProfile(userProfileData);

    localStorage.setItem('voxelform_demo_user', JSON.stringify({
      user: fullUser,
      profile: userProfileData,
    }));

    return fullUser;
  };

  const refreshUserProfile = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      setCurrentUser(auth.currentUser);
      await fetchUserProfile(auth.currentUser);
    }
  };

  const updateUserProfileData = async (updatedFields: { fullName?: string; phone?: string }) => {
    if (!currentUser) return;

    if (auth.currentUser && updatedFields.fullName) {
      try {
        await updateProfile(auth.currentUser, { displayName: updatedFields.fullName });
      } catch (e) {
        console.warn('Could not update Auth display name:', e);
      }
    }

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, updatedFields, { merge: true });
    } catch (e) {
      console.warn('Could not update Firestore user profile:', e);
    }

    setUserProfile((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updatedFields };

      const storedDemo = localStorage.getItem('voxelform_demo_user');
      if (storedDemo) {
        try {
          const parsed = JSON.parse(storedDemo);
          parsed.profile = updated;
          if (updatedFields.fullName && parsed.user) {
            parsed.user.displayName = updatedFields.fullName;
          }
          localStorage.setItem('voxelform_demo_user', JSON.stringify(parsed));
        } catch (err) {}
      }

      return updated;
    });
  };

  const updateUserRole = async (newRole: 'customer' | 'admin') => {
    if (!currentUser) return;
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, { role: newRole }, { merge: true });
    } catch (e) {
      console.warn('Could not update role in Firestore:', e);
    }

    setUserProfile((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, role: newRole };
      const storedDemo = localStorage.getItem('voxelform_demo_user');
      if (storedDemo) {
        try {
          const parsed = JSON.parse(storedDemo);
          parsed.profile = updated;
          localStorage.setItem('voxelform_demo_user', JSON.stringify(parsed));
        } catch (err) {}
      }
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        signup,
        login,
        resetPassword,
        resendVerificationEmail,
        logout,
        signInWithGoogle,
        loginAsDemoUser,
        refreshUserProfile,
        updateUserProfileData,
        updateUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
