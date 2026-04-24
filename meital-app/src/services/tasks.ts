import {
  collection,
  doc,
  getDocs,
  getDoc,
  runTransaction,
  increment,
  query,
  where,
  orderBy,
  Timestamp,
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
  reward?: number;
  status: 'pending' | 'in_progress' | 'completed' | 'approved';
  completedAt?: any;
  rewardAwarded?: boolean;
  rewardedAt?: any;
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
  return runTransaction(db, async (transaction) => {
    const taskSnap = await transaction.get(doc(db, 'tasks', taskId));
    if (!taskSnap.exists()) {
      throw new Error('Task was not found');
    }

    const task = taskSnap.data() as Task;
    if (!task.active) {
      throw new Error('Task is not active');
    }

    const userTaskRef = doc(collection(db, 'user_tasks'));
    transaction.set(userTaskRef, {
      userId,
      taskId,
      reward: task.reward,
      status: 'in_progress',
      rewardAwarded: false,
      createdAt: Timestamp.now(),
    });
    return userTaskRef;
  });
};

export const completeTask = async (userTaskId: string) => {
  return runTransaction(db, async (transaction) => {
    const userTaskRef = doc(db, 'user_tasks', userTaskId);
    const userTaskSnap = await transaction.get(userTaskRef);

    if (!userTaskSnap.exists()) {
      throw new Error('User task was not found');
    }

    const userTask = userTaskSnap.data() as UserTask;
    if (userTask.rewardAwarded || userTask.status === 'completed' || userTask.status === 'approved') {
      return;
    }

    const taskRef = doc(db, 'tasks', userTask.taskId);
    const taskSnap = await transaction.get(taskRef);
    if (!taskSnap.exists()) {
      throw new Error('Task was not found');
    }

    const task = { id: taskSnap.id, ...taskSnap.data() } as Task;
    const now = Timestamp.now();

    transaction.update(userTaskRef, {
      status: 'completed',
      completedAt: now,
      rewardAwarded: true,
      rewardedAt: now,
    });

    transaction.update(doc(db, 'users', userTask.userId), {
      coins: increment(task.reward),
      lastRewardedUserTaskId: userTaskId,
      updatedAt: now,
    });

    transaction.set(doc(db, 'coins_history', userTaskId), {
      userId: userTask.userId,
      taskId: task.id,
      userTaskId,
      amount: task.reward,
      reason: `השלמת משימה: ${task.title}`,
      type: 'task_completion',
      createdAt: now,
    });
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
