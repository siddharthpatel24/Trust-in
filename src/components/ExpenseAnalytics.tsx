import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar, PieChart, BarChart3 } from 'lucide-react';
import { expenseService } from '../firebase/firestore';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

interface Expense {
  id: string;
  title: string;
  amount: number;
  date: string;
  createdAt: string;
}

const ExpenseAnalytics: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  useEffect(() => {
    const unsubscribe = expenseService.onExpensesChange((expenseData) => {
      setExpenses(expenseData);
    });

    return () => unsubscribe();
  }, []);

  // Filter expenses by selected month
  const monthlyExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate >= startOfMonth(selectedMonth) && expenseDate <= endOfMonth(selectedMonth);
  });

  // Calculate category-wise expenses
  const categoryExpenses = monthlyExpenses.reduce((acc, expense) => {
    const category = getCategoryFromTitle(expense.title);
    acc[category] = (acc[category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  // Get daily expenses for the month
  const dailyExpenses = monthlyExpenses.reduce((acc, expense) => {
    const day = format(new Date(expense.date), 'dd');
    acc[day] = (acc[day] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  function getCategoryFromTitle(title: string): string {
    const category = title.toLowerCase();
    if (category.includes('food') || category.includes('meal') || category.includes('restaurant')) {
      return 'Food';
    }
    if (category.includes('transport') || category.includes('fuel') || category.includes('uber')) {
      return 'Transport';
    }
    if (category.includes('grocery') || category.includes('milk') || category.includes('vegetable')) {
      return 'Groceries';
    }
    if (category.includes('utility') || category.includes('electricity') || category.includes('water')) {
      return 'Utilities';
    }
    if (category.includes('clean') || category.includes('soap') || category.includes('detergent')) {
      return 'Cleaning';
    }
    return 'Others';
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      'Food': 'bg-orange-500',
      'Transport': 'bg-blue-500',
      'Groceries': 'bg-green-500',
      'Utilities': 'bg-purple-500',
      'Cleaning': 'bg-pink-500',
      'Others': 'bg-gray-500'
    };
    return colors[category] || 'bg-gray-500';
  };

  const totalMonthly = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const avgDaily = totalMonthly / new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0).getDate();

  // Compare with previous month
  const prevMonth = subMonths(selectedMonth, 1);
  const prevMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate >= startOfMonth(prevMonth) && expenseDate <= endOfMonth(prevMonth);
  });
  const prevMonthTotal = prevMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const monthlyChange = prevMonthTotal > 0 ? ((totalMonthly - prevMonthTotal) / prevMonthTotal) * 100 : 0;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Expense Analytics</h2>
              <p className="text-sm text-gray-600">Track spending patterns and trends</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-600" />
            <input
              type="month"
              value={format(selectedMonth, 'yyyy-MM')}
              onChange={(e) => setSelectedMonth(new Date(e.target.value + '-01'))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      <div className="p-6">
        {monthlyExpenses.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-6xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No Data for This Month</h3>
            <p className="text-gray-600">Add some expenses to see analytics</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Monthly Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                <div className="text-2xl font-bold text-blue-600">₹{totalMonthly}</div>
                <div className="text-sm text-blue-600">Total Spent</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                <div className="text-2xl font-bold text-green-600">₹{avgDaily.toFixed(0)}</div>
                <div className="text-sm text-green-600">Daily Average</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                <div className="text-2xl font-bold text-purple-600">{monthlyExpenses.length}</div>
                <div className="text-sm text-purple-600">Transactions</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl">
                <div className={`text-2xl font-bold ${monthlyChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {monthlyChange >= 0 ? '+' : ''}{monthlyChange.toFixed(1)}%
                </div>
                <div className="text-sm text-orange-600">vs Last Month</div>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-2 mb-4">
                <PieChart className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-800">Category Breakdown</h3>
              </div>
              <div className="space-y-3">
                {Object.entries(categoryExpenses)
                  .sort(([,a], [,b]) => b - a)
                  .map(([category, amount]) => {
                    const percentage = (amount / totalMonthly) * 100;
                    return (
                      <div key={category} className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full ${getCategoryColor(category)}`}></div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-gray-700">{category}</span>
                            <span className="text-sm text-gray-600">₹{amount} ({percentage.toFixed(1)}%)</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${getCategoryColor(category)}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Daily Spending Chart */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-2 mb-4">
                <BarChart3 className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-800">Daily Spending Pattern</h3>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0).getDate() }, (_, i) => {
                  const day = (i + 1).toString().padStart(2, '0');
                  const amount = dailyExpenses[day] || 0;
                  const maxAmount = Math.max(...Object.values(dailyExpenses));
                  const height = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;
                  
                  return (
                    <div key={day} className="text-center">
                      <div className="h-20 flex items-end justify-center mb-1">
                        <div
                          className="w-6 bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t"
                          style={{ height: `${height}%`, minHeight: amount > 0 ? '4px' : '0' }}
                          title={`Day ${day}: ₹${amount}`}
                        />
                      </div>
                      <div className="text-xs text-gray-600">{day}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseAnalytics;