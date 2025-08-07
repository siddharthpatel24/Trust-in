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
  EXPENSES: 'expenses'
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