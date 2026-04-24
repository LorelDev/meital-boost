import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  increment,
  onSnapshot,
  Unsubscribe,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  coins: number;
  role: 'trainee' | 'admin';
  createdAt: Timestamp;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  reward: number;
  active: boolean;
  category?: string;
  createdAt: Timestamp;
}

export interface UserTask {
  id: string;
  userId: string;
  taskId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'approved';
  completedAt?: Timestamp;
  createdAt: Timestamp;
}

export interface CoinTransaction {
  id: string;
  userId: string;
  amount: number;
  reason: string;
  createdAt: Timestamp;
}

// Users
export const getAllUsers = async (): Promise<UserProfile[]> => {
  const snap = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as UserProfile));
};

export const getUserById = async (id: string): Promise<UserProfile | null> => {
  const snap = await getDoc(doc(db, 'users', id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as UserProfile) : null;
};

// Tasks
export const getAllTasks = async (): Promise<Task[]> => {
  const snap = await getDocs(query(collection(db, 'tasks'), orderBy('createdAt', 'desc')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Task));
};

export const createTask = async (data: Omit<Task, 'id' | 'createdAt'>) => {
  return addDoc(collection(db, 'tasks'), { ...data, createdAt: serverTimestamp() });
};

export const updateTask = async (id: string, data: Partial<Task>) => {
  return updateDoc(doc(db, 'tasks', id), data);
};

export const deleteTask = async (id: string) => {
  return deleteDoc(doc(db, 'tasks', id));
};

// User Tasks
export const getAllUserTasks = async (): Promise<UserTask[]> => {
  const snap = await getDocs(collection(db, 'user_tasks'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as UserTask));
};

export const approveUserTask = async (userTaskId: string, userId: string, taskReward: number, taskTitle: string) => {
  await updateDoc(doc(db, 'user_tasks', userTaskId), {
    status: 'approved',
    approvedAt: serverTimestamp(),
  });
  await addDoc(collection(db, 'coins_history'), {
    userId,
    amount: taskReward,
    reason: `השלמת משימה: ${taskTitle}`,
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, 'users', userId), {
    coins: increment(taskReward),
  });
};

// Coins
export const awardCoinsManually = async (userId: string, amount: number, reason: string) => {
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

export const getCoinHistory = async (userId?: string): Promise<CoinTransaction[]> => {
  const q = userId
    ? query(collection(db, 'coins_history'), where('userId', '==', userId), orderBy('createdAt', 'desc'))
    : query(collection(db, 'coins_history'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as CoinTransaction));
};

// Stats
export const getDashboardStats = async () => {
  const [users, tasks, userTasks, coins] = await Promise.all([
    getDocs(collection(db, 'users')),
    getDocs(query(collection(db, 'tasks'), where('active', '==', true))),
    getDocs(collection(db, 'user_tasks')),
    getDocs(collection(db, 'coins_history')),
  ]);

  const completedTasks = userTasks.docs.filter(
    (d) => d.data().status === 'completed' || d.data().status === 'approved'
  ).length;

  const totalCoins = coins.docs.reduce((sum, d) => sum + (d.data().amount > 0 ? d.data().amount : 0), 0);

  return {
    totalUsers: users.docs.filter((d) => d.data().role !== 'admin').length,
    activeTasks: tasks.size,
    completedTasks,
    totalCoinsAwarded: totalCoins,
  };
};
