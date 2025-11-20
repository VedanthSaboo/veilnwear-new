// context/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';

import {
  User as FirebaseUser,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';

import { getFirebaseAuth } from '@/lib/firebaseClient';

export type AppUserRole = 'customer' | 'admin';

export interface AppUser {
  _id: string;
  firebaseUid: string;
  email: string;
  role: AppUserRole;
  // extend with wishlist or other fields if needed
}

export interface AuthContextValue {
  firebaseUser: FirebaseUser | null;
  appUser: AppUser | null;
  loading: boolean;
  signup: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const auth = getFirebaseAuth();

  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper: sync Mongo AppUser via /api/users/me
  const fetchAppUser = async (user: FirebaseUser | null): Promise<AppUser | null> => {
    if (!user) return null;

    try {
      const token = await user.getIdToken();

      const res = await fetch('/api/users/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.error('/api/users/me responded with', res.status);
        return null;
      }

      const data = await res.json();
      return data.user as AppUser;
    } catch (error) {
      console.error('Failed to fetch /api/users/me:', error);
      return null;
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);

      if (user) {
        const appUser = await fetchAppUser(user);
        setAppUser(appUser);
      } else {
        setAppUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signup = async (email: string, password: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const user = cred.user;
    setFirebaseUser(user);

    const appUser = await fetchAppUser(user);
    setAppUser(appUser);
  };

  const login = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const user = cred.user;
    setFirebaseUser(user);

    const appUser = await fetchAppUser(user);
    setAppUser(appUser);
  };

  const logout = async () => {
    await signOut(auth);
    setFirebaseUser(null);
    setAppUser(null);
  };

  const value: AuthContextValue = {
    firebaseUser,
    appUser,
    loading,
    signup,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
