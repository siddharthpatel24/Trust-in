import React, { useState } from 'react';
import { Plus, Calendar, DollarSign, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { expenseService } from '../firebase/firestore';
import { format } from 'date-fns';

interface AddExpenseFormProps {
  onExpenseAdded: () => void;
}

const AddExpenseForm: React.FC<AddExpenseFormProps> = ({ onExpenseAdded }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      await expenseService.addExpense(title.trim(), expenseAmount, date);
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

  const quickExpenses = ['Room-Rent','vegetables', 'chicken', 'water', 'Cleaners', 'kiranam', 'Eggs','Rice-Bag','MILK'];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full p-6 text-left hover:bg-gray-50 transition-colors rounded-2xl"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Add New Expense</h3>
                <p className="text-sm text-gray-600">Track your daily expenses</p>
              </div>
            </div>
            <div className="text-gray-400">
              <Plus className="w-5 h-5" />
            </div>
          </div>
        </button>
      ) : (
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Add New Expense</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 text-xl font-semibold"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Quick expense buttons */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quick Add
              </label>
              <div className="flex flex-wrap gap-2">
                {quickExpenses.map((expense) => (
                  <button
                    key={expense}
                    type="button"
                    onClick={() => setTitle(expense)}
                    className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                      title === expense
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-blue-50 hover:border-blue-300'
                    }`}
                  >
                    {expense}
                  </button>
                ))}
              </div>
            </div>

            {/* Expense title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                Expense Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Milk, Electricity Bill"
                required
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Amount
              </label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter amount"
                required
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Submit button */}
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 px-6 rounded-lg font-medium hover:from-green-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Adding...' : 'Add Expense'}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AddExpenseForm;