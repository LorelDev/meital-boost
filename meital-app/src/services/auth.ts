import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from './firebase';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  coins: number;
  role: 'trainee' | 'admin';
  createdAt: any;
  avatarUrl?: string;
}

export const loginWithEmail = async (email: string, password: string) => {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
};

export const registerWithEmail = async (
  email: string,
  password: string,
  name: string,
  phone: string
) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const user = cred.user;

  await setDoc(doc(db, 'users', user.uid), {
    id: user.uid,
    name,
    email,
    phone,
    coins: 0,
    role: 'trainee',
    createdAt: serverTimestamp(),
  });

  return user;
};

export const logout = () => signOut(auth);

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const snap = await getDoc(doc(db, 'users', uid));
  if (snap.exists()) return snap.data() as UserProfile;
  return null;
};

export const onAuthChange = (callback: (user: User | null) => void) =>
  onAuthStateChanged(auth, callback);
