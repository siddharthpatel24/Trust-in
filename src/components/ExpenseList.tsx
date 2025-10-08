import React, { useState } from 'react';
import { Calendar, CreditCard as Edit3, Trash2, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';
import GlassCard from './GlassCard';
import AnimatedCounter from './AnimatedCounter';
import { expenseService } from '../firebase/firestore';
import { format, parseISO } from 'date-fns';

interface Expense {
  id: string;
  title: string;
  amount: number;
  date: string;
  createdAt: string;
}

interface ExpenseListProps {
  expenses: Expense[];
  onExpenseUpdated: () => void;
}

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onExpenseUpdated }) => {
  const { isDark } = useTheme();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    amount: '',
    date: ''
  });

  const handleEdit = (expense: Expense) => {
    setEditingId(expense.id);
    setEditForm({
      title: expense.title,
      amount: expense.amount.toString(),
      date: expense.date
    });
  };

  const handleSaveEdit = async (id: string) => {
    if (!editForm.title.trim() || !editForm.amount || !editForm.date) {
      toast.error('Please fill in all fields');
      return;
    }

    const amount = parseFloat(editForm.amount);
    if (amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      await expenseService.updateExpense(id, {
        title: editForm.title.trim(),
        amount,
        date: editForm.date
      });
      toast.success('Expense updated successfully!');
      setEditingId(null);
      onExpenseUpdated();
    } catch (error) {
      toast.error('Failed to update expense');
      console.error('Update expense error:', error);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await expenseService.deleteExpense(id);
        toast.success('Expense deleted successfully!');
        onExpenseUpdated();
      } catch (error) {
        toast.error('Failed to delete expense');
        console.error('Delete expense error:', error);
      }
    }
  };

  const getCategoryColor = (title: string) => {
    const category = title.toLowerCase();
    if (category.includes('food') || category.includes('meal') || category.includes('restaurant')) {
      return 'bg-orange-100 text-orange-800';
    }
    if (category.includes('transport') || category.includes('fuel') || category.includes('uber')) {
      return 'bg-blue-100 text-blue-800';
    }
    if (category.includes('grocery') || category.includes('milk') || category.includes('vegetable')) {
      return 'bg-green-100 text-green-800';
    }
    if (category.includes('utility') || category.includes('electricity') || category.includes('water')) {
      return 'bg-purple-100 text-purple-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  if (expenses.length === 0) {
    return (
      <GlassCard className="p-8 text-center">
        <div className="text-6xl mb-4 animate-bounce-slow">📝</div>
        <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
          No Expenses Yet
        </h3>
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Start tracking your expenses by adding your first expense above.
        </p>
      </GlassCard>
    );
  }

  // Group expenses by date
  const groupedExpenses = expenses.reduce((groups: { [key: string]: Expense[] }, expense) => {
    const date = expense.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(expense);
    return groups;
  }, {});

  return (
    <GlassCard>
      <div className={`p-6 border-b ${isDark ? 'border-white/10' : 'border-gray-100/50'}`}>
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 rounded-2xl shadow-lg animate-gradient">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className={`text-xl font-semibold bg-gradient-to-r ${
              isDark ? 'from-white to-gray-300' : 'from-gray-800 to-gray-600'
            } bg-clip-text text-transparent`}>
              Recent Expenses
            </h2>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <AnimatedCounter value={expenses.length} /> expense(s) this month
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6 max-h-96 overflow-y-auto">
        {Object.entries(groupedExpenses).map(([date, dayExpenses]) => (
          <div key={date}>
            <div className="flex items-center mb-3">
              <div className={`text-sm font-medium px-4 py-2 rounded-2xl backdrop-blur-md border ${
                isDark 
                  ? 'text-gray-300 bg-white/10 border-white/20' 
                  : 'text-gray-600 bg-gray-100/80 border-gray-200/50'
              }`}>
                {format(parseISO(date), 'MMM dd, yyyy')}
              </div>
              <div className={`flex-1 h-px ml-4 ${isDark ? 'bg-white/10' : 'bg-gray-200/50'}`}></div>
            </div>
            
            <div className="space-y-2">
              {dayExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className={`flex items-center justify-between p-4 rounded-2xl backdrop-blur-md border transition-all duration-300 hover:scale-[1.02] ${
                    isDark 
                      ? 'bg-white/5 border-white/10 hover:bg-white/10' 
                      : 'bg-gray-50/80 border-gray-200/50 hover:bg-gray-100/80'
                  }`}
                >
                  {editingId === expense.id ? (
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        className={`px-3 py-2 rounded-2xl backdrop-blur-md border transition-all duration-300 focus:outline-none focus:ring-2 ${
                          isDark 
                            ? 'bg-white/10 border-white/20 text-white placeholder-gray-400 focus:ring-purple-400' 
                            : 'bg-white/80 border-gray-300/50 text-gray-800 placeholder-gray-500 focus:ring-purple-500'
                        }`}
                        placeholder="Expense title"
                      />
                      <input
                        type="number"
                        step="0.01"
                        value={editForm.amount}
                        onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                        className={`px-3 py-2 rounded-2xl backdrop-blur-md border transition-all duration-300 focus:outline-none focus:ring-2 ${
                          isDark 
                            ? 'bg-white/10 border-white/20 text-white placeholder-gray-400 focus:ring-purple-400' 
                            : 'bg-white/80 border-gray-300/50 text-gray-800 placeholder-gray-500 focus:ring-purple-500'
                        }`}
                        placeholder="Amount"
                      />
                      <input
                        type="date"
                        value={editForm.date}
                        onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                        className={`px-3 py-2 rounded-2xl backdrop-blur-md border transition-all duration-300 focus:outline-none focus:ring-2 ${
                          isDark 
                            ? 'bg-white/10 border-white/20 text-white focus:ring-purple-400' 
                            : 'bg-white/80 border-gray-300/50 text-gray-800 focus:ring-purple-500'
                        }`}
                      />
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center space-x-4">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                            {expense.title}
                          </h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(expense.title)}`}>
                            {expense.title.split(' ')[0]}
                          </span>
                        </div>
                        <div className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {format(parseISO(expense.date), 'MMM dd, yyyy')}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-3">
                    {editingId === expense.id ? (
                      <>
                        <button
                          onClick={() => handleSaveEdit(expense.id)}
                          className={`p-2 rounded-2xl transition-all duration-300 hover:scale-110 ${
                            isDark 
                              ? 'text-green-400 hover:bg-green-500/20' 
                              : 'text-green-600 hover:bg-green-100/80'
                          }`}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className={`p-2 rounded-2xl transition-all duration-300 hover:scale-110 ${
                            isDark 
                              ? 'text-red-400 hover:bg-red-500/20' 
                              : 'text-red-600 hover:bg-red-100/80'
                          }`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="text-right">
                          <div className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                            ₹<AnimatedCounter value={expense.amount} />
                          </div>
                        </div>
                        <button
                          onClick={() => handleEdit(expense)}
                          className={`p-2 rounded-2xl transition-all duration-300 hover:scale-110 ${
                            isDark 
                              ? 'text-blue-400 hover:bg-blue-500/20' 
                              : 'text-blue-600 hover:bg-blue-100/80'
                          }`}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(expense.id, expense.title)}
                          className={`p-2 rounded-2xl transition-all duration-300 hover:scale-110 ${
                            isDark 
                              ? 'text-red-400 hover:bg-red-500/20' 
                              : 'text-red-600 hover:bg-red-100/80'
                          }`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};

export default ExpenseList;