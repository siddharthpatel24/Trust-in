import React from 'react';
import { Zap, Calculator, Download, Share2, Bell, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

interface QuickActionsProps {
  totalExpenses: number;
  roommateCount: number;
  onCalculateSplit: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ 
  totalExpenses, 
  roommateCount, 
  onCalculateSplit 
}) => {
  const handleExportData = () => {
    // This would export expense data as CSV
    toast.success('Export feature coming soon!');
  };

  const handleShareApp = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Room Expense Tracker',
          text: 'Check out our shared room expense tracker!',
          url: window.location.href,
        });
      } catch (error) {
        // Fallback to copying URL
        navigator.clipboard.writeText(window.location.href);
        toast.success('App URL copied to clipboard!');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('App URL copied to clipboard!');
    }
  };

  const handleSetReminder = () => {
    toast.success('Reminder feature coming soon!');
  };

  const handleSettings = () => {
    toast.success('Settings panel coming soon!');
  };

  const splitAmount = roommateCount > 0 ? totalExpenses / roommateCount : 0;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Quick Actions</h2>
            <p className="text-sm text-gray-600">Handy tools and shortcuts</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Split Calculator */}
          <button
            onClick={onCalculateSplit}
            className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 text-left"
          >
            <div className="p-2 bg-blue-500 rounded-lg">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-800">Split Calculator</h3>
              <p className="text-sm text-blue-600">
                ₹{splitAmount.toFixed(2)} per person
              </p>
            </div>
          </button>

          {/* Share App */}
          <button
            onClick={handleShareApp}
            className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl hover:from-green-100 hover:to-emerald-100 transition-all duration-200 text-left"
          >
            <div className="p-2 bg-green-500 rounded-lg">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-green-800">Share App</h3>
              <p className="text-sm text-green-600">
                Invite roommates
              </p>
            </div>
          </button>

          {/* Export Data */}
          <button
            onClick={handleExportData}
            className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl hover:from-purple-100 hover:to-pink-100 transition-all duration-200 text-left"
          >
            <div className="p-2 bg-purple-500 rounded-lg">
              <Download className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-purple-800">Export Data</h3>
              <p className="text-sm text-purple-600">
                Download CSV
              </p>
            </div>
          </button>

          {/* Set Reminders */}
          <button
            onClick={handleSetReminder}
            className="flex items-center space-x-3 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl hover:from-orange-100 hover:to-red-100 transition-all duration-200 text-left"
          >
            <div className="p-2 bg-orange-500 rounded-lg">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-orange-800">Set Reminders</h3>
              <p className="text-sm text-orange-600">
                Payment alerts
              </p>
            </div>
          </button>
        </div>

        {/* Quick Stats */}
        <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl">
          <h3 className="font-semibold text-gray-800 mb-3">Quick Stats</h3>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-gray-700">₹{totalExpenses}</div>
              <div className="text-xs text-gray-600">Total Expenses</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-700">{roommateCount}</div>
              <div className="text-xs text-gray-600">Roommates</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;