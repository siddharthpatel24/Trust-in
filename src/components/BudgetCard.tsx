import React, { useState } from 'react';
import { DollarSign, Edit3, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { budgetService } from '../firebase/firestore';

interface BudgetCardProps {
  budget: number | null;
  totalExpenses: number;
  onBudgetUpdate: () => void;
}

const BudgetCard: React.FC<BudgetCardProps> = ({ budget, totalExpenses, onBudgetUpdate }) => {
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
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Monthly Budget</h2>
            <p className="text-sm text-gray-500">Track your room expenses</p>
          </div>
        </div>
        {budget && !isEditing && (
          <button
            onClick={() => {
              setIsEditing(true);
              setNewBudget(budget.toString());
              setBudgetMode('set');
            }}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
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
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                    budgetMode === 'set'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Set New Budget
                </button>
                <button
                  onClick={() => setBudgetMode('add')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                    budgetMode === 'add'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Add to Current
                </button>
              </div>
              
              {/* Current Budget Display for Add Mode */}
              {budgetMode === 'add' && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-700">
                    Current Budget: <span className="font-semibold">₹{budget}</span>
                  </div>
                </div>
              )}
              
              {/* Amount Input */}
              <div className="flex-1">
                <input
                  type="number"
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={budgetMode === 'add' ? 'Enter amount to add' : 'Enter new budget amount'}
                  autoFocus
                />
              </div>
              
              {/* Preview for Add Mode */}
              {budgetMode === 'add' && newBudget && parseFloat(newBudget) > 0 && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-sm text-green-700">
                    New Total: <span className="font-semibold">₹{budget + parseFloat(newBudget)}</span>
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex space-x-2">
              <button
                onClick={handleSetBudget}
                className={`flex-1 py-2 px-4 text-white rounded-lg font-medium transition-colors ${
                  budgetMode === 'add' 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {budgetMode === 'add' ? 'Add Money' : 'Set Budget'}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <div className="text-2xl font-bold text-blue-600">₹{budget}</div>
                <div className="text-sm text-blue-600 mt-1">Total Budget</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-xl">
                <div className="text-2xl font-bold text-red-600">₹{totalExpenses}</div>
                <div className="text-sm text-red-600 mt-1">Total Spent</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <div className={`text-2xl font-bold ${getStatusColor()}`}>
                  ₹{remainingBalance}
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
                <span className="text-sm font-medium text-gray-700">Budget Usage</span>
                <span className="text-sm text-gray-600">
                  {budgetUsedPercentage.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${getProgressColor()}`}
                  style={{ width: `${Math.min(budgetUsedPercentage, 100)}%` }}
                />
              </div>
              {budgetUsedPercentage >= 90 && (
                <p className="text-sm text-red-600 mt-2 font-medium">
                  ⚠️ You're running low on budget!
                </p>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="mb-4">
            <div className="text-gray-400 text-6xl mb-2">💰</div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Set Your Monthly Budget</h3>
            <p className="text-gray-600 mb-6">Start tracking your room expenses by setting a monthly budget</p>
          </div>
          <div className="max-w-xs mx-auto">
            <input
              type="number"
              value={newBudget}
              onChange={(e) => setNewBudget(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
              placeholder="Enter budget amount"
            />
            <button
              onClick={handleSetBudget}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Set Budget
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetCard;q
