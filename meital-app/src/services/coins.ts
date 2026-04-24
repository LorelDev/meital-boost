import {
  collection,
  doc,
  addDoc,
  updateDoc,
  increment,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';

export interface CoinTransaction {
  id: string;
  userId: string;
  amount: number;
  reason: string;
  createdAt: any;
}

export const awardCoins = async (
  userId: string,
  amount: number,
  reason: string
) => {
  await addDoc(collection(db, 'coins_history'), {
    userId,
    amount,
    reason,
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, 'users', userId), {
    coins: increment(amount),
  });
};

export const getCoinHistory = async (userId: string): Promise<CoinTransaction[]> => {
  const q = query(
    collection(db, 'coins_history'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as CoinTransaction));
};

export const subscribeToCoinHistory = (
  userId: string,
  callback: (txs: CoinTransaction[]) => void
): Unsubscribe => {
  const q = query(
    collection(db, 'coins_history'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as CoinTransaction)));
  });
};
