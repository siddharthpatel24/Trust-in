import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { Home, Users, TrendingUp } from 'lucide-react';
import BudgetCard from './components/BudgetCard';
import AddExpenseForm from './components/AddExpenseForm';
import ExpenseList from './components/ExpenseList';
import LoadingSpinner from './components/LoadingSpinner';
import { budgetService, expenseService } from './firebase/firestore';

interface Expense {
  id: string;
  title: string;
  amount: number;
  date: string;
  createdAt: string;
}

function App() {
  const [budget, setBudget] = useState<number | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Calculate total expenses
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  useEffect(() => {
    let budgetUnsubscribe: (() => void) | undefined;
    let expensesUnsubscribe: (() => void) | undefined;

    const setupRealtimeListeners = async () => {
      try {
        setIsLoading(true);

        // Set up real-time listener for budget
        budgetUnsubscribe = budgetService.onBudgetChange((budgetData) => {
          setBudget(budgetData ? budgetData.amount : null);
        });

        // Set up real-time listener for expenses
        expensesUnsubscribe = expenseService.onExpensesChange((expenseData) => {
          setExpenses(expenseData);
        });

        setIsLoading(false);
      } catch (error) {
        console.error('Error setting up real-time listeners:', error);
        setIsLoading(false);
      }
    };

    setupRealtimeListeners();

    // Cleanup listeners on unmount
    return () => {
      if (budgetUnsubscribe) budgetUnsubscribe();
      if (expensesUnsubscribe) expensesUnsubscribe();
    };
  }, []);

  const handleDataUpdate = () => {
    // This function can be used to trigger manual updates if needed
    // The real-time listeners will automatically update the data
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#374151',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            borderRadius: '12px',
            border: '1px solid #f3f4f6'
          }
        }}
      />
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800"><i>ROOM RECORDS</i></h1>
                
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-green-100 to-blue-100 px-3 py-2 rounded-full">
                <Users className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">Shared Room</span>
              </div>
              <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-pink-100 px-3 py-2 rounded-full">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">Live Sync</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Budget Overview */}
          <BudgetCard
            budget={budget}
            totalExpenses={totalExpenses}
            onBudgetUpdate={handleDataUpdate}
          />

          {/* Add Expense Form */}
          <AddExpenseForm onExpenseAdded={handleDataUpdate} />

          {/* Expenses List */}
          <ExpenseList
            expenses={expenses}
            onExpenseUpdated={handleDataUpdate}
          />
        </div>
      </main>

      {/* Footer */}
      {/* <footer className="bg-white/50 backdrop-blur-md border-t border-white/20 mt-16">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center">
          <p className="text-gray-600">
            Built for B.Tech students • Share with your roommates • Real-time sync
          </p>
          <p className="text-sm text-gray-500 mt-2">
            💡 Tip: Bookmark this page for quick access
          </p>
        </div>
      </footer> */}
    </div>
  );
}

export default App;