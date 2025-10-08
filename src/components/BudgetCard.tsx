import React, { useState } from 'react';
import { DollarSign, CreditCard as Edit3, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';
import GlassCard from './GlassCard';
import GradientButton from './GradientButton';
import AnimatedCounter from './AnimatedCounter';
import { budgetService } from '../firebase/firestore';

interface BudgetCardProps {
  budget: number | null;
  totalExpenses: number;
  onBudgetUpdate: () => void;
}

const BudgetCard: React.FC<BudgetCardProps> = ({ budget, totalExpenses, onBudgetUpdate }) => {
  const { isDark } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(budget?.toString() || '');
  const [budgetMode, setBudgetMode] = useState<'set' | 'add'>('set');

  const remainingBalance = budget ? budget - totalExpenses : 0;
  const budgetUsedPercentage = budget ? (totalExpenses / budget) * 100 : 0;

  const handleSetBudget = async () => {
    const amount = parseFloat(newBudget);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid budget amount');
      return;
    }

    try {
      const finalAmount = budgetMode === 'add' && budget ? budget + amount : amount;
      await budgetService.setBudget(finalAmount);
      
      if (budgetMode === 'add') {
        toast.success(`₹${amount} added to budget! New total: ₹${finalAmount}`);
      } else {
        toast.success('Budget updated successfully!');
      }
      
      setIsEditing(false);
      onBudgetUpdate();
    } catch (error) {
      toast.error('Failed to update budget');
      console.error('Budget update error:', error);
    }
  };

  const getStatusColor = () => {
    if (budgetUsedPercentage >= 90) return 'text-red-600';
    if (budgetUsedPercentage >= 70) return 'text-orange-600';
    return 'text-green-600';
  };

  const getProgressColor = () => {
    if (budgetUsedPercentage >= 90) return 'bg-red-500';
    if (budgetUsedPercentage >= 70) return 'bg-orange-500';
    return 'bg-green-500';
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl shadow-lg animate-gradient">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className={`text-xl font-semibold bg-gradient-to-r ${
              isDark ? 'from-white to-gray-300' : 'from-gray-800 to-gray-600'
            } bg-clip-text text-transparent`}>
              Monthly Budget
            </h2>
          </div>
        </div>
        {budget && !isEditing && (
          <button
            onClick={() => {
              setIsEditing(true);
              setBudgetMode('set');
            }}
            className={`p-2 rounded-xl transition-all duration-300 hover:scale-110 ${
              isDark 
                ? 'text-gray-400 hover:text-blue-400 hover:bg-blue-500/20 border border-white/10 hover:border-blue-400/30' 
                : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50/80 border-gray-200/50 hover:border-blue-300/50'
            }`}
          >
            <Edit3 className="w-4 h-4" />
          </button>
        )}
      </div>

      {budget ? (
        <div className="space-y-4">
          {isEditing ? (
            <div className="space-y-3">
              {/* Budget Mode Selection */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setBudgetMode('set')}
                  className={`flex-1 py-3 px-4 rounded-2xl text-sm font-medium transition-all duration-300 ${
                    budgetMode === 'set'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                      : `${isDark ? 'bg-white/10 text-gray-300 hover:bg-white/20' : 'bg-gray-100/80 text-gray-700 hover:bg-gray-200/80'}`
                  }`}
                >
                  Set New Budget
                </button>
                <button
                  onClick={() => setBudgetMode('add')}
                  className={`flex-1 py-3 px-4 rounded-2xl text-sm font-medium transition-all duration-300 ${
                    budgetMode === 'add'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                      : `${isDark ? 'bg-white/10 text-gray-300 hover:bg-white/20' : 'bg-gray-100/80 text-gray-700 hover:bg-gray-200/80'}`
                  }`}
                >
                  Add to Current
                </button>
              </div>
              
              {/* Current Budget Display for Add Mode */}
              {budgetMode === 'add' && (
                <div className={`p-4 rounded-2xl backdrop-blur-md border ${
                  isDark 
                    ? 'bg-blue-500/20 border-blue-400/30 text-blue-300' 
                    : 'bg-blue-50/80 border-blue-200/50 text-blue-700'
                }`}>
                  <div className="text-sm">
                    Current Budget: <span className="font-semibold">₹<AnimatedCounter value={budget} /></span>
                  </div>
                </div>
              )}
              
              {/* Amount Input */}
              <div className="flex-1">
                <input
                  type="number"
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                  className={`w-full px-4 py-3 rounded-2xl backdrop-blur-md border transition-all duration-300 focus:outline-none focus:ring-2 focus:scale-105 ${
                    isDark 
                      ? 'bg-white/10 border-white/20 text-white placeholder-gray-400 focus:ring-purple-400 focus:border-purple-400/50' 
                      : 'bg-white/80 border-gray-300/50 text-gray-800 placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500/50'
                  }`}
                  placeholder={budgetMode === 'add' ? 'Enter amount to add' : 'Enter new budget amount'}
                  autoFocus
                />
              </div>
              
              {/* Preview for Add Mode */}
              {budgetMode === 'add' && newBudget && parseFloat(newBudget) > 0 && (
                <div className={`p-4 rounded-2xl backdrop-blur-md border ${
                  isDark 
                    ? 'bg-green-500/20 border-green-400/30 text-green-300' 
                    : 'bg-green-50/80 border-green-200/50 text-green-700'
                }`}>
                  <div className="text-sm">
                    New Total: <span className="font-semibold">₹<AnimatedCounter value={budget + parseFloat(newBudget)} /></span>
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex space-x-2">
                <GradientButton
                  onClick={handleSetBudget}
                  variant={budgetMode === 'add' ? 'success' : 'primary'}
                  className="flex-1"
                >
                  {budgetMode === 'add' ? 'Add Money' : 'Set Budget'}
                </GradientButton>
                <GradientButton
                  onClick={() => setIsEditing(false)}
                  variant="secondary"
                  className="px-6"
                >
                  Cancel
                </GradientButton>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className={`text-center p-6 rounded-2xl backdrop-blur-md border transition-all duration-300 hover:scale-105 ${
                isDark 
                  ? 'bg-blue-500/20 border-blue-400/30' 
                  : 'bg-blue-50/80 border-blue-200/50'
              }`}>
                <div className={`text-2xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                  ₹<AnimatedCounter value={budget} />
                </div>
                <div className={`text-sm mt-1 ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>Total Budget</div>
              </div>
              <div className={`text-center p-6 rounded-2xl backdrop-blur-md border transition-all duration-300 hover:scale-105 ${
                isDark 
                  ? 'bg-red-500/20 border-red-400/30' 
                  : 'bg-red-50/80 border-red-200/50'
              }`}>
                <div className={`text-2xl font-bold ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                  ₹<AnimatedCounter value={totalExpenses} />
                </div>
                <div className={`text-sm mt-1 ${isDark ? 'text-red-300' : 'text-red-600'}`}>Total Spent</div>
              </div>
              <div className={`text-center p-6 rounded-2xl backdrop-blur-md border transition-all duration-300 hover:scale-105 ${
                isDark 
                  ? 'bg-green-500/20 border-green-400/30' 
                  : 'bg-green-50/80 border-green-200/50'
              }`}>
                <div className={`text-2xl font-bold ${getStatusColor()}`}>
                  ₹<AnimatedCounter value={remainingBalance} />
                </div>
                <div className={`text-sm mt-1 ${getStatusColor()}`}>
                  Remaining
                </div>
              </div>
            </div>
          )}

          {!isEditing && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Budget Usage</span>
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {budgetUsedPercentage.toFixed(1)}%
                </span>
              </div>
              <div className={`w-full rounded-full h-4 backdrop-blur-md ${isDark ? 'bg-white/10' : 'bg-gray-200/80'}`}>
                <div
                  className={`h-4 rounded-full transition-all duration-1000 bg-gradient-to-r ${
                    budgetUsedPercentage >= 90 
                      ? 'from-red-500 to-pink-500' 
                      : budgetUsedPercentage >= 70 
                        ? 'from-orange-500 to-red-500' 
                        : 'from-green-500 to-emerald-500'
                  } shadow-lg`}
                  style={{ width: `${Math.min(budgetUsedPercentage, 100)}%` }}
                />
              </div>
              {budgetUsedPercentage >= 90 && (
                <p className={`text-sm mt-3 font-medium animate-pulse ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                  ⚠️ You're running low on budget!
                </p>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="mb-4">
            <div className="text-6xl mb-4 animate-bounce-slow">💰</div>
            <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
              Set Your Monthly Budget
            </h3>
            <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Start tracking your room expenses by setting a monthly budget
            </p>
          </div>
          <div className="max-w-xs mx-auto">
            <input
              type="number"
              value={newBudget}
              onChange={(e) => setNewBudget(e.target.value)}
              className={`w-full px-4 py-4 rounded-2xl backdrop-blur-md border transition-all duration-300 focus:outline-none focus:ring-2 focus:scale-105 mb-6 ${
                isDark 
                  ? 'bg-white/10 border-white/20 text-white placeholder-gray-400 focus:ring-purple-400 focus:border-purple-400/50' 
                  : 'bg-white/80 border-gray-300/50 text-gray-800 placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500/50'
              }`}
              placeholder="Enter budget amount"
            />
            <GradientButton
              onClick={handleSetBudget}
              variant="primary"
              size="lg"
              className="w-full"
            >
              Set Budget
            </GradientButton>
          </div>
        </div>
      )}
    </GlassCard>
  );
};

export default BudgetCard;