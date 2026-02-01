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
  CLEANING_TASKS: 'cleaningTasks',
  WATER_DUTY: 'waterDuty'
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
  async addExpense(title: string, amount: number, date: string, addedBy: string, userId: string) {
    await addDoc(collection(db, COLLECTIONS.EXPENSES), {
      title,
      amount,
      date,
      addedBy,
      userId,
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
    const docRef = await addDoc(collection(db, COLLECTIONS.ROOMMATES), {
      name,
      profilePic: profilePic || '',
      balance: 0,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
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

// Water duty operations
export const waterDutyService = {
  // Get current water duty
  async getCurrentWaterDuty() {
    const snapshot = await getDocs(collection(db, COLLECTIONS.WATER_DUTY));
    const duties = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return duties.length > 0 ? duties[0] : null;
  },

  // Set initial water duty rotation
  async initializeWaterDuty(roommates: any[]) {
    if (roommates.length === 0) return;
    
    // Clear existing duties
    const snapshot = await getDocs(collection(db, COLLECTIONS.WATER_DUTY));
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    // Create new duty cycle
    await addDoc(collection(db, COLLECTIONS.WATER_DUTY), {
      currentPersonIndex: 0,
      roommates: roommates.map(r => ({ id: r.id, name: r.name })),
      currentPerson: roommates[0].name,
      startDate: new Date().toISOString(),
      completedCount: 0,
      lastCompletedBy: null,
      lastCompletedAt: null,
      createdAt: new Date().toISOString()
    });
  },

  // Complete current duty and move to next person
  async completeWaterDuty() {
    const currentDuty = await this.getCurrentWaterDuty();
    if (!currentDuty) return;

    const nextIndex = (currentDuty.currentPersonIndex + 1) % currentDuty.roommates.length;
    const nextPerson = currentDuty.roommates[nextIndex];

    await updateDoc(doc(db, COLLECTIONS.WATER_DUTY, currentDuty.id), {
      currentPersonIndex: nextIndex,
      currentPerson: nextPerson.name,
      completedCount: currentDuty.completedCount + 1,
      lastCompletedBy: currentDuty.currentPerson,
      lastCompletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  },

  // Listen to water duty changes in real-time
  onWaterDutyChange(callback: (duty: any) => void) {
    return onSnapshot(collection(db, COLLECTIONS.WATER_DUTY), (snapshot) => {
      const duties = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(duties.length > 0 ? duties[0] : null);
    });
  },

  // Update roommates in water duty when roommate list changes
  async updateWaterDutyRoommates(roommates: any[]) {
    const currentDuty = await this.getCurrentWaterDuty();
    if (!currentDuty || roommates.length === 0) {
      if (roommates.length > 0) {
        await this.initializeWaterDuty(roommates);
      }
      return;
    }

    // Update roommates list while preserving current rotation
    const updatedRoommates = roommates.map(r => ({ id: r.id, name: r.name }));
    const currentPersonExists = updatedRoommates.find(r => r.name === currentDuty.currentPerson);
    
    let newCurrentIndex = 0;
    let newCurrentPerson = updatedRoommates[0].name;
    
    if (currentPersonExists) {
      newCurrentIndex = updatedRoommates.findIndex(r => r.name === currentDuty.currentPerson);
      newCurrentPerson = currentDuty.currentPerson;
    }

    await updateDoc(doc(db, COLLECTIONS.WATER_DUTY, currentDuty.id), {
      roommates: updatedRoommates,
      currentPersonIndex: newCurrentIndex,
      currentPerson: newCurrentPerson,
      updatedAt: new Date().toISOString()
    });
  }
};