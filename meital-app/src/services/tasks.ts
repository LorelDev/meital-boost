import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';

export interface Task {
  id: string;
  title: string;
  description: string;
  reward: number;
  active: boolean;
  category?: string;
  dueDate?: any;
  createdAt: any;
}

export interface UserTask {
  id: string;
  userId: string;
  taskId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'approved';
  completedAt?: any;
  task?: Task;
}

export const getActiveTasks = async (): Promise<Task[]> => {
  const q = query(
    collection(db, 'tasks'),
    where('active', '==', true),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Task));
};

export const getUserTasks = async (userId: string): Promise<UserTask[]> => {
  const q = query(
    collection(db, 'user_tasks'),
    where('userId', '==', userId),
    orderBy('completedAt', 'desc')
  );
  const snap = await getDocs(q);
  const userTasks: UserTask[] = [];

  for (const d of snap.docs) {
    const ut = { id: d.id, ...d.data() } as UserTask;
    const taskSnap = await getDoc(doc(db, 'tasks', ut.taskId));
    if (taskSnap.exists()) {
      ut.task = { id: taskSnap.id, ...taskSnap.data() } as Task;
    }
    userTasks.push(ut);
  }

  return userTasks;
};

export const startTask = async (userId: string, taskId: string) => {
  return addDoc(collection(db, 'user_tasks'), {
    userId,
    taskId,
    status: 'in_progress',
    createdAt: serverTimestamp(),
  });
};

export const completeTask = async (userTaskId: string) => {
  return updateDoc(doc(db, 'user_tasks', userTaskId), {
    status: 'completed',
    completedAt: serverTimestamp(),
  });
};

export const subscribeToUserTasks = (
  userId: string,
  callback: (tasks: UserTask[]) => void
): Unsubscribe => {
  const q = query(
    collection(db, 'user_tasks'),
    where('userId', '==', userId)
  );
  return onSnapshot(q, async (snap) => {
    const userTasks: UserTask[] = [];
    for (const d of snap.docs) {
      const ut = { id: d.id, ...d.data() } as UserTask;
      const taskSnap = await getDoc(doc(db, 'tasks', ut.taskId));
      if (taskSnap.exists()) {
        ut.task = { id: taskSnap.id, ...taskSnap.data() } as Task;
      }
      userTasks.push(ut);
    }
    callback(userTasks);
  });
};
