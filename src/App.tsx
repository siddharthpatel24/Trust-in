import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { Home, Users, TrendingUp, Calendar, RefreshCw, BarChart3, Zap } from 'lucide-react';
import BudgetCard from './components/BudgetCard';
import AddExpenseForm from './components/AddExpenseForm';
import ExpenseList from './components/ExpenseList';
import RoommateManager from './components/RoommateManager';
import CleaningSchedule from './components/CleaningSchedule';
import MonthlyReset from './components/MonthlyReset';
import ExpenseAnalytics from './components/ExpenseAnalytics';
import QuickActions from './components/QuickActions';
import LoadingSpinner from './components/LoadingSpinner';
import { budgetService, expenseService, roommateService } from './firebase/firestore';
import toast from 'react-hot-toast';

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
  const [roommates, setRoommates] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'expenses' | 'roommates' | 'cleaning' | 'analytics' | 'actions' | 'reset'>('expenses');
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

        // Set up real-time listener for roommates
        const roommatesUnsubscribe = roommateService.onRoommatesChange((roommateData) => {
          setRoommates(roommateData);
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

  const handleCalculateSplit = () => {
    if (roommates.length === 0) {
      toast.error('Add roommates first to calculate split');
      return;
    }
    
    const splitAmount = totalExpenses / roommates.length;
    toast.success(`Each person should pay ₹${splitAmount.toFixed(2)}`);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const tabs = [
    { id: 'expenses', label: 'Expenses', icon: Home },
    { id: 'roommates', label: 'Roommates', icon: Users },
    { id: 'cleaning', label: 'Cleaning', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'actions', label: 'Actions', icon: Zap },
    { id: 'reset', label: 'Monthly Reset', icon: RefreshCw }
  ];

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
                <h1 className="text-xl font-bold text-gray-800">Room Records</h1>
                <p className="text-sm text-gray-600">BY:siddharth patel</p>
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
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-white p-1 rounded-2xl shadow-lg border border-gray-100 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-medium transition-all duration-200 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-8">
          {/* Expenses Tab */}
          {activeTab === 'expenses' && (
            <>
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
            </>
          )}

          {/* Roommates Tab */}
          {activeTab === 'roommates' && (
            <RoommateManager
              totalExpenses={totalExpenses}
              onDataUpdate={handleDataUpdate}
            />
          )}

          {/* Cleaning Tab */}
          {activeTab === 'cleaning' && (
            <CleaningSchedule />
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <ExpenseAnalytics />
          )}

          {/* Quick Actions Tab */}
          {activeTab === 'actions' && (
            <QuickActions
              totalExpenses={totalExpenses}
              roommateCount={roommates.length}
              onCalculateSplit={handleCalculateSplit}
            />
          )}

          {/* Monthly Reset Tab */}
          {activeTab === 'reset' && (
            <MonthlyReset onDataUpdate={handleDataUpdate} />
          )}
        </div>
      </main>

      Footer
      {/* <footer className="bg-white/50 backdrop-blur-md border-t border-white/20 mt-16">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center">
          <p className="text-gray-600">
            Built for B.Tech students • Complete room management • Real-time sync
          </p>
          <p className="text-sm text-gray-500 mt-2">
            💡 Tip: Use tabs to manage expenses, roommates, cleaning & monthly resets
          </p>
        </div>
      </footer> */}
    </div>
  );
}

export default App;