
import React, { useState } from 'react';
import { Plus, Calendar, DollarSign, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';
import GlassCard from './GlassCard';
import GradientButton from './GradientButton';
import { expenseService } from '../firebase/firestore';
import { format } from 'date-fns';
import { getCurrentUser } from '../utils/userManager';

interface AddExpenseFormProps {
  onExpenseAdded: () => void;
}

const AddExpenseForm: React.FC<AddExpenseFormProps> = ({ onExpenseAdded }) => {
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
      toast.error('User not found. Please refresh the page.');
      return;
    }
    
    if (!title.trim() || !amount || !date) {
      toast.error('Please fill in all fields');
      return;
    }

    const expenseAmount = parseFloat(amount);
    if (expenseAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsLoading(true);

    try {
      await expenseService.addExpense(title.trim(), expenseAmount, date, currentUser.name, currentUser.id);
      toast.success('Expense added successfully!');
      
      // Reset form
      setTitle('');
      setAmount('');
      setDate(format(new Date(), 'yyyy-MM-dd'));
      setIsOpen(false);
      onExpenseAdded();
    } catch (error) {
      toast.error('Failed to add expense');
      console.error('Add expense error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const quickExpenses = ['🥬🥬', '🥚🥚', '🐓🐔', '🛒🛒', '🍼🍼', '💦💦'];

  return (
    <GlassCard>
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className={`w-full p-6 text-left transition-all duration-300 rounded-3xl hover:scale-[1.02] ${
            isDark ? 'hover:bg-white/5' : 'hover:bg-white/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-green-500 via-emerald-500 to-blue-500 rounded-2xl shadow-lg animate-gradient">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className={`text-lg font-semibold bg-gradient-to-r ${
                  isDark ? 'from-white to-gray-300' : 'from-gray-800 to-gray-600'
                } bg-clip-text text-transparent`}>
                  Add New Expense
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Track your daily expenses
                </p>
              </div>
            </div>
            <div className={`p-2 rounded-xl transition-all duration-300 ${
              isDark ? 'text-gray-400 hover:text-green-400' : 'text-gray-400 hover:text-green-600'
            }`}>
              <Plus className="w-5 h-5 transition-transform duration-300 hover:rotate-90" />
            </div>
          </div>
        </button>
      ) : (
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-green-500 via-emerald-500 to-blue-500 rounded-2xl shadow-lg animate-gradient">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <h3 className={`text-lg font-semibold bg-gradient-to-r ${
                isDark ? 'from-white to-gray-300' : 'from-gray-800 to-gray-600'
              } bg-clip-text text-transparent`}>
                Add New Expense
              </h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className={`p-2 rounded-xl transition-all duration-300 hover:scale-110 ${
                isDark ? 'text-gray-400 hover:text-red-400 hover:bg-red-500/20' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
              }`}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Quick expense buttons */}
            <div>
              <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Quick Add
              </label>
              <div className="flex flex-wrap gap-2">
                {quickExpenses.map((expense) => (
                  <button
                    key={expense}
                    type="button"
                    onClick={() => setTitle(expense)}
                    className={`px-4 py-2 text-sm rounded-2xl border transition-all duration-300 hover:scale-105 ${
                      title === expense
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white border-transparent shadow-lg'
                        : `${isDark 
                            ? 'bg-white/10 text-gray-300 border-white/20 hover:bg-blue-500/20 hover:border-blue-400/30' 
                            : 'bg-gray-50/80 text-gray-700 border-gray-200/50 hover:bg-blue-50/80 hover:border-blue-300/50'
                          }`
                    }`}
                  >
                    {expense}
                  </button>
                ))}
              </div>
            </div>

            {/* Expense title */}
            <div>
              <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <FileText className="w-4 h-4 inline mr-1" />
                Expense Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full px-4 py-3 rounded-2xl backdrop-blur-md border transition-all duration-300 focus:outline-none focus:ring-2 focus:scale-105 ${
                  isDark 
                    ? 'bg-white/10 border-white/20 text-white placeholder-gray-400 focus:ring-purple-400 focus:border-purple-400/50' 
                    : 'bg-white/80 border-gray-300/50 text-gray-800 placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500/50'
                }`}
                placeholder="e.g., Milk, Electricity Bill"
                required
              />
            </div>

            {/* Amount */}
            <div>
              <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <DollarSign className="w-4 h-4 inline mr-1" />
                Amount
              </label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`w-full px-4 py-3 rounded-2xl backdrop-blur-md border transition-all duration-300 focus:outline-none focus:ring-2 focus:scale-105 ${
                  isDark 
                    ? 'bg-white/10 border-white/20 text-white placeholder-gray-400 focus:ring-purple-400 focus:border-purple-400/50' 
                    : 'bg-white/80 border-gray-300/50 text-gray-800 placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500/50'
                }`}
                placeholder="Enter amount"
                required
              />
            </div>

            {/* Date */}
            <div>
              <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <Calendar className="w-4 h-4 inline mr-1" />
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`w-full px-4 py-3 rounded-2xl backdrop-blur-md border transition-all duration-300 focus:outline-none focus:ring-2 focus:scale-105 ${
                  isDark 
                    ? 'bg-white/10 border-white/20 text-white focus:ring-purple-400 focus:border-purple-400/50' 
                    : 'bg-white/80 border-gray-300/50 text-gray-800 focus:ring-purple-500 focus:border-purple-500/50'
                }`}
                required
              />
            </div>

            {/* Submit button */}
            <div className="flex space-x-3">
              <GradientButton
                type="submit"
                disabled={isLoading}
                variant="success"
                className="flex-1"
              >
                {isLoading ? 'Adding...' : 'Add Expense'}
              </GradientButton>
              <GradientButton
                onClick={() => setIsOpen(false)}
                variant="secondary"
                className="px-6"
              >
                Cancel
              </GradientButton>
            </div>
          </form>
        </div>
      )}
    </GlassCard>
  );
};

export default AddExpenseForm;