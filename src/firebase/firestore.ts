// Firestore database operations
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  onSnapshot,
  query,
  orderBy,
  setDoc
} from 'firebase/firestore';
import { db } from './config';

// Collection names
const COLLECTIONS = {
  BUDGET: 'budget',
  EXPENSES: 'expenses',
  ROOMMATES: 'roommates',
  CLEANING_TASKS: 'cleaningTasks'
};

// Budget operations
export const budgetService = {
  // Get current budget data
  async getBudget() {
    const budgetDoc = await getDoc(doc(db, COLLECTIONS.BUDGET, 'current'));
    if (budgetDoc.exists()) {
      return budgetDoc.data();
    }
    return null;
  },

  // Set/update monthly budget
  async setBudget(amount: number) {
    await setDoc(doc(db, COLLECTIONS.BUDGET, 'current'), {
      amount,
      setAt: new Date().toISOString(),
      month: new Date().getMonth(),
      year: new Date().getFullYear()
    });
  },

  // Listen to budget changes in real-time
  onBudgetChange(callback: (budget: any) => void) {
    return onSnapshot(doc(db, COLLECTIONS.BUDGET, 'current'), (doc) => {
      if (doc.exists()) {
        callback(doc.data());
      } else {
        callback(null);
      }
    });
  }
};

// Expense operations
export const expenseService = {
  // Add new expense
  async addExpense(title: string, amount: number, date: string) {
    await addDoc(collection(db, COLLECTIONS.EXPENSES), {
      title,
      amount,
      date,
      createdAt: new Date().toISOString()
    });
  },

  // Get all expenses
  async getExpenses() {
    const q = query(collection(db, COLLECTIONS.EXPENSES), orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  // Update expense
  async updateExpense(id: string, data: { title: string; amount: number; date: string }) {
    await updateDoc(doc(db, COLLECTIONS.EXPENSES, id), {
      ...data,
      updatedAt: new Date().toISOString()
    });
  },

  // Delete expense
  async deleteExpense(id: string) {
    await deleteDoc(doc(db, COLLECTIONS.EXPENSES, id));
  },

  // Listen to expenses changes in real-time
  onExpensesChange(callback: (expenses: any[]) => void) {
    const q = query(collection(db, COLLECTIONS.EXPENSES), orderBy('date', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const expenses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(expenses);
    });
  }
};

// Roommate operations
export const roommateService = {
  // Add new roommate
  async addRoommate(name: string, profilePic?: string) {
    await addDoc(collection(db, COLLECTIONS.ROOMMATES), {
      name,
      profilePic: profilePic || '',
      balance: 0,
      createdAt: new Date().toISOString()
    });
  },

  // Get all roommates
  async getRoommates() {
    const snapshot = await getDocs(collection(db, COLLECTIONS.ROOMMATES));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  // Update roommate balance
  async updateRoommateBalance(id: string, balance: number) {
    await updateDoc(doc(db, COLLECTIONS.ROOMMATES, id), {
      balance,
      updatedAt: new Date().toISOString()
    });
  },

  // Update roommate profile
  async updateRoommateProfile(id: string, name: string, profilePic: string) {
    await updateDoc(doc(db, COLLECTIONS.ROOMMATES, id), {
      name,
      profilePic,
      updatedAt: new Date().toISOString()
    });
  },

  // Delete roommate
  async deleteRoommate(id: string) {
    await deleteDoc(doc(db, COLLECTIONS.ROOMMATES, id));
  },

  // Listen to roommates changes in real-time
  onRoommatesChange(callback: (roommates: any[]) => void) {
    return onSnapshot(collection(db, COLLECTIONS.ROOMMATES), (snapshot) => {
      const roommates = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(roommates);
    });
  }
};

// Cleaning tasks operations
export const cleaningService = {
  // Add new cleaning task
  async addCleaningTask(title: string, assignedTo: string, frequency: 'daily' | 'weekly', dueDate: string) {
    await addDoc(collection(db, COLLECTIONS.CLEANING_TASKS), {
      title,
      assignedTo,
      frequency,
      dueDate,
      completed: false,
      createdAt: new Date().toISOString()
    });
  },

  // Get all cleaning tasks
  async getCleaningTasks() {
    const q = query(collection(db, COLLECTIONS.CLEANING_TASKS), orderBy('dueDate', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  // Update task completion status
  async updateTaskStatus(id: string, completed: boolean) {
    await updateDoc(doc(db, COLLECTIONS.CLEANING_TASKS, id), {
      completed,
      completedAt: completed ? new Date().toISOString() : null,
      updatedAt: new Date().toISOString()
    });
  },

  // Delete cleaning task
  async deleteCleaningTask(id: string) {
    await deleteDoc(doc(db, COLLECTIONS.CLEANING_TASKS, id));
  },

  // Listen to cleaning tasks changes in real-time
  onCleaningTasksChange(callback: (tasks: any[]) => void) {
    const q = query(collection(db, COLLECTIONS.CLEANING_TASKS), orderBy('dueDate', 'asc'));
    return onSnapshot(q, (snapshot) => {
      const tasks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(tasks);
    });
  }
};

// Monthly reset operations
export const monthlyResetService = {
  // Clear all expenses for new month
  async clearAllExpenses() {
    const snapshot = await getDocs(collection(db, COLLECTIONS.EXPENSES));
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  },

  // Reset all roommate balances
  async resetRoommateBalances() {
    const snapshot = await getDocs(collection(db, COLLECTIONS.ROOMMATES));
    const updatePromises = snapshot.docs.map(doc => 
      updateDoc(doc.ref, {
        totalOwed: 0,
        updatedAt: new Date().toISOString()
      })
    );
    await Promise.all(updatePromises);
  }
};