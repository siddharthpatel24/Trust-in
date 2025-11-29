import React, { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import GlassCard from './GlassCard';
import GradientButton from './GradientButton';
import { expenseService } from '../firebase/firestore';
import toast from 'react-hot-toast';

interface DeleteAllExpensesProps {
  onExpensesDeleted: () => void;
  expenseCount: number;
}

const DeleteAllExpenses: React.FC<DeleteAllExpensesProps> = ({ onExpensesDeleted, expenseCount }) => {
  const { isDark } = useTheme();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAll = async () => {
    setIsDeleting(true);
    
    try {
      // Get all expenses and delete them
      const expenses = await expenseService.getExpenses();
      const deletePromises = expenses.map(expense => expenseService.deleteExpense(expense.id));
      await Promise.all(deletePromises);
      
      toast.success('All expenses deleted successfully!');
      setShowConfirmation(false);
      onExpensesDeleted();
    } catch (error) {
      toast.error('Failed to delete expenses');
      console.error('Delete all expenses error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (expenseCount === 0) {
    return null;
  }

  return (
    <GlassCard className="p-6">
      {!showConfirmation ? (
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-red-500 via-pink-500 to-rose-500 rounded-2xl shadow-lg animate-gradient">
              <Trash2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className={`text-lg font-semibold bg-gradient-to-r ${
                isDark ? 'from-white to-gray-300' : 'from-gray-800 to-gray-600'
              } bg-clip-text text-transparent`}>
                Reset All Expenses
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Clear all {expenseCount} expense(s) to start fresh
              </p>
            </div>
          </div>

          <div className={`p-4 rounded-2xl backdrop-blur-md border ${
            isDark 
              ? 'bg-yellow-500/20 border-yellow-400/30 text-yellow-300' 
              : 'bg-yellow-50/80 border-yellow-200/50 text-yellow-700'
          }`}>
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 mt-0.5" />
              <div>
                <p className="text-sm">
                  This will permanently delete all expense records. This action cannot be undone.
                </p>
              </div>
            </div>
          </div>

          <GradientButton
            onClick={() => setShowConfirmation(true)}
            variant="danger"
            className="w-full"
          >
            Delete All Expenses
          </GradientButton>
        </div>
      ) : (
        <div className="space-y-4">
          <div className={`p-4 rounded-2xl backdrop-blur-md border ${
            isDark 
              ? 'bg-red-500/20 border-red-400/30 text-red-300' 
              : 'bg-red-50/80 border-red-200/50 text-red-700'
          }`}>
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-6 h-6 mt-0.5" />
              <div>
                <h4 className="font-semibold text-lg">⚠️ Final Confirmation</h4>
                <p className="mt-2">
                  You are about to delete <strong>{expenseCount} expense(s)</strong>. This action cannot be undone!
                </p>
                <p className="mt-1 font-medium">
                  Are you absolutely sure you want to proceed?
                </p>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <GradientButton
              onClick={handleDeleteAll}
              disabled={isDeleting}
              variant="danger"
              className="flex-1"
            >
              {isDeleting ? 'Deleting...' : 'Yes, Delete All'}
            </GradientButton>
            <GradientButton
              onClick={() => setShowConfirmation(false)}
              disabled={isDeleting}
              variant="secondary"
              className="px-6"
            >
              Cancel
            </GradientButton>
          </div>
        </div>
      )}
    </GlassCard>
  );
};

export default DeleteAllExpenses;