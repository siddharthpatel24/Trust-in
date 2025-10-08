import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { Home, Users, TrendingUp, Calendar, RefreshCw, BarChart3, Zap, Sparkles } from 'lucide-react';
import { useTheme } from './contexts/ThemeContext';
import GlassCard from './components/GlassCard';
import GradientButton from './components/GradientButton';
import ThemeToggle from './components/ThemeToggle';
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
  const { isDark } = useTheme();
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
    <div className={`min-h-screen transition-all duration-500 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900' 
        : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
    }`}>
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse-slow ${
          isDark ? 'bg-purple-500' : 'bg-blue-400'
        }`} />
        <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse-slow animation-delay-2000 ${
          isDark ? 'bg-pink-500' : 'bg-purple-400'
        }`} />
        <div className={`absolute top-1/2 left-1/2 w-96 h-96 rounded-full blur-3xl opacity-10 animate-spin-slow ${
          isDark ? 'bg-blue-500' : 'bg-pink-400'
        }`} />
      </div>

      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
            color: isDark ? '#f3f4f6' : '#374151',
            backdropFilter: 'blur(16px)',
            boxShadow: isDark ? '0 25px 50px rgba(0, 0, 0, 0.5)' : '0 25px 50px rgba(0, 0, 0, 0.1)',
            borderRadius: '16px',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.2)'
          }
        }}
      />
      
      {/* Version Banner */}
      <div className={`sticky top-0 z-50 backdrop-blur-md border-b transition-all duration-300 ${
        isDark 
          ? 'bg-black/20 border-white/10' 
          : 'bg-white/20 border-white/20'
      }`}>
        <div className="max-w-4xl mx-auto px-4 py-2">
          <div className="flex items-center justify-center space-x-2 text-sm font-medium">
            <Sparkles className={`w-4 h-4 ${isDark ? 'text-purple-400' : 'text-purple-600'} animate-pulse`} />
            <span className={`bg-gradient-to-r ${
              isDark 
                ? 'from-purple-400 to-pink-400' 
                : 'from-purple-600 to-pink-600'
            } bg-clip-text text-transparent`}>
              ✨ Version 2.0 - New Look! Same Simplicity.
            </span>
            <Sparkles className={`w-4 h-4 ${isDark ? 'text-pink-400' : 'text-pink-600'} animate-pulse`} />
          </div>
        </div>
      </div>

      {/* Header */}
      <header className={`backdrop-blur-xl border-b sticky top-12 z-40 transition-all duration-300 ${
        isDark 
          ? 'bg-black/40 border-white/10' 
          : 'bg-white/40 border-white/20'
      }`}>
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl shadow-lg animate-gradient">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-xl font-bold bg-gradient-to-r ${
                  isDark 
                    ? 'from-white to-gray-300' 
                    : 'from-gray-800 to-gray-600'
                } bg-clip-text text-transparent`}>
                  Room Expense Tracker
                </h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Manage your shared expenses
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className={`hidden sm:flex items-center space-x-2 px-4 py-2 rounded-2xl backdrop-blur-md border transition-all duration-300 ${
                isDark 
                  ? 'bg-green-500/20 border-green-400/30 text-green-300' 
                  : 'bg-green-100/80 border-green-200/50 text-green-700'
              }`}>
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">Shared Room</span>
              </div>
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-2xl backdrop-blur-md border transition-all duration-300 ${
                isDark 
                  ? 'bg-purple-500/20 border-purple-400/30 text-purple-300' 
                  : 'bg-purple-100/80 border-purple-200/50 text-purple-700'
              }`}>
                <TrendingUp className="w-4 h-4 animate-pulse" />
                <span className="text-sm font-medium">Live Sync</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <GlassCard className="p-2">
            <div className="flex space-x-2 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl font-medium transition-all duration-300 whitespace-nowrap relative overflow-hidden group ${
                    activeTab === tab.id
                      ? `bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25 ${
                          isDark ? 'shadow-purple-400/20' : 'shadow-purple-500/25'
                        }`
                      : `${isDark ? 'text-gray-300 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'}`
                  }`}
                >
                  {activeTab !== tab.id && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                  )}
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline relative z-10">{tab.label}</span>
                </button>
              );
            })}
            </div>
          </GlassCard>
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

      {/* Footer */}
      <footer className={`backdrop-blur-xl border-t mt-16 transition-all duration-300 ${
        isDark 
          ? 'bg-black/20 border-white/10' 
          : 'bg-white/30 border-white/20'
      }`}>
        <div className="max-w-4xl mx-auto px-4 py-6 text-center">
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Built for B.Tech students • Complete room management • Real-time sync
          </p>
          <p className={`text-sm mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            💡 Tip: Use tabs to manage expenses, roommates, cleaning & monthly resets
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;