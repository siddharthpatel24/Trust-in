import React, { useState } from 'react';
import { RefreshCw, AlertTriangle, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { monthlyResetService } from '../firebase/firestore';

interface MonthlyResetProps {
  onDataUpdate: () => void;
}

const MonthlyReset: React.FC<MonthlyResetProps> = ({ onDataUpdate }) => {
  const [isResetting, setIsResetting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleMonthlyReset = async () => {
    setIsResetting(true);
    
    try {
      // Clear all expenses
      await monthlyResetService.clearAllExpenses();
      
      // Reset roommate balances
      await monthlyResetService.resetRoommateBalances();
      
      toast.success('Monthly reset completed! All expenses cleared and balances reset.');
      setShowConfirmation(false);
      onDataUpdate();
    } catch (error) {
      toast.error('Failed to reset monthly data');
      console.error('Monthly reset error:', error);
    } finally {
      setIsResetting(false);
    }
  };

  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Monthly Reset</h2>
            <p className="text-sm text-gray-600">Clear all expenses for new month</p>
          </div>
        </div>

        {!showConfirmation ? (
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
              <h3 className="font-semibold text-indigo-800 mb-2">Current Month: {currentMonth}</h3>
              <p className="text-sm text-indigo-700">
                Use this feature at the beginning of each month to start fresh with a clean expense sheet.
              </p>
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">What will be reset:</h4>
                  <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                    <li>• All expense records will be permanently deleted</li>
                    <li>• All roommate balances will be reset to ₹0</li>
                    <li>• Monthly budget will remain unchanged</li>
                    <li>• Roommate list and cleaning tasks will remain</li>
                  </ul>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowConfirmation(true)}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-red-500 to-pink-600 text-white py-3 px-6 rounded-lg font-medium hover:from-red-600 hover:to-pink-700 transition-all duration-200"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Start Monthly Reset</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-6 h-6 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-800 text-lg">⚠️ Final Confirmation</h4>
                  <p className="text-red-700 mt-2">
                    This action cannot be undone! All your expense data will be permanently deleted.
                  </p>
                  <p className="text-red-700 mt-1 font-medium">
                    Are you absolutely sure you want to proceed?
                  </p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleMonthlyReset}
                disabled={isResetting}
                className="flex-1 flex items-center justify-center space-x-2 bg-red-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-5 h-5 ${isResetting ? 'animate-spin' : ''}`} />
                <span>{isResetting ? 'Resetting...' : 'Yes, Reset Everything'}</span>
              </button>
              <button
                onClick={() => setShowConfirmation(false)}
                disabled={isResetting}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MonthlyReset;