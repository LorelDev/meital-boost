'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from './firebase';
import { UserProfile } from './firestore';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function getDocWithRetry(ref: ReturnType<typeof doc>, retries = 3): Promise<ReturnType<typeof getDoc>> {
  for (let i = 0; i < retries; i++) {
    try {
      return await getDoc(ref);
    } catch (e: any) {
      if (i < retries - 1 && (e?.message?.includes('offline') || e?.code === 'unavailable')) {
        await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
        continue;
      }
      throw e;
    }
  }
  return getDoc(ref);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const snap = await getDocWithRetry(doc(db, 'users', u.uid));
          if (snap.exists()) {
            setProfile({ id: snap.id, ...snap.data() } as UserProfile);
          }
        } catch {
          // Firestore unavailable — user still logged in, profile just empty
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = async (email: string, password: string) => {
    if (!isFirebaseConfigured) {
      throw new Error('חסרה הגדרת Firebase. מלא את הקובץ .env.local לפי .env.local.example');
    }

    const cred = await signInWithEmailAndPassword(auth, email, password);
    const snap = await getDocWithRetry(doc(db, 'users', cred.user.uid));
    if (!snap.exists() || snap.data()?.role !== 'admin') {
      await signOut(auth);
      throw new Error('אין לך הרשאות גישה לפאנל הניהול');
    }
  };

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAdminAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAdminAuth must be inside AuthProvider');
  return ctx;
};
