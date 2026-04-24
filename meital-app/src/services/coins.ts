import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';

export interface CoinTransaction {
  id: string;
  userId: string;
  taskId?: string;
  userTaskId?: string;
  amount: number;
  reason: string;
  type?: 'task_completion' | 'manual';
  createdAt: any;
}

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
