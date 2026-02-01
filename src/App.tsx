import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { Home, Users, TrendingUp, Calendar, RefreshCw, BarChart3, Zap, Sparkles, Droplets } from 'lucide-react';
import { useTheme } from './contexts/ThemeContext';
import { getCurrentUser } from './utils/userManager';
import GlassCard from './components/GlassCard';
import GradientButton from './components/GradientButton';
import ThemeToggle from './components/ThemeToggle';
import UserSetup from './components/UserSetup';
import UserProfile from './components/UserProfile';
import DeleteAllExpenses from './components/DeleteAllExpenses';
import BudgetCard from './components/BudgetCard';
import AddExpenseForm from './components/AddExpenseForm';
import ExpenseList from './components/ExpenseList';
import RoommateManager from './components/RoommateManager';
import CleaningSchedule from './components/CleaningSchedule';
import MonthlyReset from './components/MonthlyReset';
import ExpenseAnalytics from './components/ExpenseAnalytics';
import QuickActions from './components/QuickActions';
import LoadingSpinner from './components/LoadingSpinner';
import WaterDutyTracker from './components/WaterDutyTracker';
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
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [budget, setBudget] = useState<number | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [roommates, setRoommates] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'expenses' | 'roommates' | 'cleaning' | 'analytics' | 'actions' | 'reset'>('expenses');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let budgetUnsubscribe: (() => void) | undefined;
    let expensesUnsubscribe: (() => void) | undefined;
    let roommatesUnsubscribe: (() => void) | undefined;

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
        roommatesUnsubscribe = roommateService.onRoommatesChange((roommateData) => {
          setRoommates(roommateData);
        });

        setIsLoading(false);
      } catch (error) {
        console.error('Error setting up real-time listeners:', error);
        setIsLoading(false);
      }
    };

    if (currentUser) {
      setupRealtimeListeners();
    } else {
      setIsLoading(false);
    }

    // Cleanup listeners on unmount
    return () => {
      if (budgetUnsubscribe) budgetUnsubscribe();
      if (expensesUnsubscribe) expensesUnsubscribe();
      if (roommatesUnsubscribe) roommatesUnsubscribe();
    };
  }, [currentUser]);

  // Calculate total expenses
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Show user setup if no user exists
  if (!currentUser) {
    return <UserSetup onUserCreated={(user) => setCurrentUser(user)} />;
  }

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
    { id: 'water-duty', label: 'Water Duty', icon: Droplets },
    { id: 'cleaning', label: 'Cleaning', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'actions', label: 'Actions', icon: Zap },
    { id: 'reset', label: 'Monthly Reset', icon: RefreshCw }
  ];

  return (
    <div className={`min-h-screen transition-all duration-700 ${
      isDark 
        ? 'bg-gradient-to-br from-slate-900 via-emerald-900 to-teal-900' 
        : 'bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50'
    }`}>
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-30 animate-float ${
          isDark ? 'bg-emerald-500' : 'bg-cyan-400'
        }`} />
        <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-25 animate-pulse-slow ${
          isDark ? 'bg-teal-500' : 'bg-blue-400'
        }`} />
        <div className={`absolute top-1/2 left-1/2 w-96 h-96 rounded-full blur-3xl opacity-20 animate-spin-slow ${
          isDark ? 'bg-cyan-500' : 'bg-emerald-400'
        }`} />
      </div>

      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: isDark ? 'rgba(6, 78, 59, 0.9)' : 'rgba(236, 254, 255, 0.95)',
            color: isDark ? '#f3f4f6' : '#374151',
            backdropFilter: 'blur(16px)',
            boxShadow: isDark ? '0 25px 50px rgba(6, 78, 59, 0.5)' : '0 25px 50px rgba(34, 197, 94, 0.1)',
            borderRadius: '16px',
            border: isDark ? '1px solid rgba(52, 211, 153, 0.2)' : '1px solid rgba(34, 197, 94, 0.2)'
          }
        }}
      />
      
      {/* Version Banner */}
      <div className={`sticky top-0 z-50 backdrop-blur-md border-b transition-all duration-300 ${
        isDark 
          ? 'bg-emerald-900/30 border-emerald-400/20' 
          : 'bg-cyan-50/40 border-cyan-200/30'
      }`}>
        <div className="max-w-4xl mx-auto px-4 py-2">
          <div className="flex items-center justify-center space-x-2 text-sm font-medium animate-slide-up">
            <Sparkles className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-cyan-600'} animate-wiggle`} />
            <span className={`bg-gradient-to-r ${
              isDark 
                ? 'from-emerald-400 to-cyan-400' 
                : 'from-cyan-600 to-blue-600'
            } bg-clip-text text-transparent`}>
              🌟 Fresh Update 2024 - Refreshed & Renewed!
            </span>
            <Sparkles className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-blue-600'} animate-wiggle`} />
          </div>
        </div>
      </div>

      {/* Header */}
      <header className={`backdrop-blur-xl border-b sticky top-12 z-40 transition-all duration-300 ${
        isDark 
          ? 'bg-emerald-900/40 border-emerald-400/20' 
          : 'bg-cyan-50/50 border-cyan-200/30'
      }`}>
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 rounded-2xl shadow-lg animate-gradient hover:animate-glow-pulse">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-xl font-bold bg-gradient-to-r ${
                  isDark 
                    ? 'from-emerald-200 to-cyan-200' 
                    : 'from-emerald-800 to-cyan-800'
                } bg-clip-text text-transparent`}>
                  Room Expense Tracker
                </h1>
                <p className={`text-sm ${isDark ? 'text-emerald-300' : 'text-cyan-600'}`}>
                  Manage your shared expenses
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className={`hidden sm:flex items-center space-x-2 px-4 py-2 rounded-2xl backdrop-blur-md border transition-all duration-300 ${
                isDark 
                  ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-300' 
                  : 'bg-emerald-100/80 border-emerald-200/50 text-emerald-700'
              }`}>
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">Shared Room</span>
              </div>
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-2xl backdrop-blur-md border transition-all duration-300 ${
                isDark 
                  ? 'bg-cyan-500/20 border-cyan-400/30 text-cyan-300' 
                  : 'bg-cyan-100/80 border-cyan-200/50 text-cyan-700'
              }`}>
                <TrendingUp className="w-4 h-4 animate-pulse" />
                <span className="text-sm font-medium">Live Sync</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 animate-scale-in">
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
                      ? `bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25 ${
                          isDark ? 'shadow-emerald-400/20' : 'shadow-cyan-500/25'
                        }`
                      : `${isDark ? 'text-emerald-200 hover:text-white hover:bg-emerald-500/10' : 'text-cyan-700 hover:text-emerald-800 hover:bg-cyan-50/50'}`
                  }`}
                >
                  {activeTab !== tab.id && (
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
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
              {/* User Profile */}
              <UserProfile onUserUpdated={() => setCurrentUser(getCurrentUser())} />

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

              {/* Delete All Expenses */}
              {expenses.length > 0 && (
                <DeleteAllExpenses
                  onExpensesDeleted={handleDataUpdate}
                  expenseCount={expenses.length}
                />
              )}
            </>
          )}

          {/* Roommates Tab */}
          {activeTab === 'roommates' && (
            <RoommateManager
              totalExpenses={totalExpenses}
              onDataUpdate={handleDataUpdate}
            />
          )}

          {/* Water Duty Tab */}
          {activeTab === 'water-duty' && (
            <WaterDutyTracker />
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
          ? 'bg-emerald-900/20 border-emerald-400/10' 
          : 'bg-cyan-50/30 border-cyan-200/20'
      }`}>
        <div className="max-w-4xl mx-auto px-4 py-6 text-center">
          <p className={`${isDark ? 'text-emerald-300' : 'text-cyan-600'}`}>
            Built for B.Tech students • Complete room management • Real-time sync
          </p>
          <p className={`text-sm mt-2 ${isDark ? 'text-emerald-400' : 'text-cyan-500'}`}>
            💡 Tip: Use tabs to manage expenses, roommates, cleaning & monthly resets
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;