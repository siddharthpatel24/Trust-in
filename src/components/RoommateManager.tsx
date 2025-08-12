import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, DollarSign, Calculator, Edit3, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { roommateService } from '../firebase/firestore';

interface Roommate {
  id: string;
  name: string;
  totalOwed: number;
  createdAt: string;
}

interface RoommateManagerProps {
  totalExpenses: number;
  onDataUpdate: () => void;
}

const RoommateManager: React.FC<RoommateManagerProps> = ({ totalExpenses, onDataUpdate }) => {
  const [roommates, setRoommates] = useState<Roommate[]>([]);
  const [newRoommateName, setNewRoommateName] = useState('');
  const [isAddingRoommate, setIsAddingRoommate] = useState(false);
  const [editingBalanceId, setEditingBalanceId] = useState<string | null>(null);
  const [editBalance, setEditBalance] = useState('');
  const [autoSplit, setAutoSplit] = useState(true);

  useEffect(() => {
    const unsubscribe = roommateService.onRoommatesChange((roommateData) => {
      setRoommates(roommateData);
    });

    return () => unsubscribe();
  }, []);

  // Calculate individual share when expenses change
  useEffect(() => {
    if (roommates.length > 0 && totalExpenses > 0 && autoSplit) {
      const sharePerPerson = totalExpenses / roommates.length;
      roommates.forEach(async (roommate) => {
        if (roommate.totalOwed !== sharePerPerson) {
          await roommateService.updateRoommateBalance(roommate.id, sharePerPerson);
        }
      });
    }
  }, [totalExpenses, roommates.length, autoSplit]);

  const handleAddRoommate = async () => {
    if (!newRoommateName.trim()) {
      toast.error('Please enter a roommate name');
      return;
    }

    try {
      await roommateService.addRoommate(newRoommateName.trim());
      toast.success('Roommate added successfully!');
      setNewRoommateName('');
      setIsAddingRoommate(false);
      onDataUpdate();
    } catch (error) {
      toast.error('Failed to add roommate');
      console.error('Add roommate error:', error);
    }
  };

  const handleEditBalance = (roommate: Roommate) => {
    setEditingBalanceId(roommate.id);
    setEditBalance(roommate.totalOwed.toString());
  };

  const handleSaveBalance = async (id: string) => {
    const amount = parseFloat(editBalance);
    if (isNaN(amount) || amount < 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      await roommateService.updateRoommateBalance(id, amount);
      toast.success('Balance updated successfully!');
      setEditingBalanceId(null);
      setEditBalance('');
      onDataUpdate();
    } catch (error) {
      toast.error('Failed to update balance');
      console.error('Update balance error:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingBalanceId(null);
    setEditBalance('');
  };
  const handleDeleteRoommate = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove ${name}?`)) {
      try {
        await roommateService.deleteRoommate(id);
        toast.success('Roommate removed successfully!');
        onDataUpdate();
      } catch (error) {
        toast.error('Failed to remove roommate');
        console.error('Delete roommate error:', error);
      }
    }
  };

  const sharePerPerson = roommates.length > 0 ? totalExpenses / roommates.length : 0;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Roommates & Balances</h2>
              <p className="text-sm text-gray-600">Manage who owes what</p>
            </div>
          </div>
          <button
            onClick={() => setIsAddingRoommate(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>Add Roommate</span>
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Add Roommate Form */}
        {isAddingRoommate && (
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={newRoommateName}
                onChange={(e) => setNewRoommateName(e.target.value)}
                placeholder="Enter roommate name"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
              <button
                onClick={handleAddRoommate}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setIsAddingRoommate(false);
                  setNewRoommateName('');
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Balance Management Options */}
        {roommates.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-blue-800">Balance Management</h3>
              <div className="flex items-center space-x-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoSplit}
                    onChange={(e) => setAutoSplit(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-blue-700">Auto-split expenses equally</span>
                </label>
              </div>
            </div>
            <p className="text-sm text-blue-700">
              {autoSplit 
                ? "Expenses are automatically split equally among all roommates. Uncheck to set custom amounts."
                : "Manual mode: Click the edit icon next to any balance to set custom amounts."
              }
            </p>
          </div>
        )}
        {/* Expense Summary */}
        {roommates.length > 0 && totalExpenses > 0 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
            <div className="flex items-center space-x-2 mb-2">
              <Calculator className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold text-indigo-800">Expense Split</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-indigo-600">₹{totalExpenses}</div>
                <div className="text-sm text-indigo-600">Total Expenses</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{roommates.length}</div>
                <div className="text-sm text-green-600">Roommates</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  ₹{autoSplit ? sharePerPerson.toFixed(2) : 'Custom'}
                </div>
                <div className="text-sm text-orange-600">
                  {autoSplit ? 'Per Person (Auto)' : 'Manual Split'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Roommates List */}
        {roommates.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-6xl mb-4">👥</div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No Roommates Added</h3>
            <p className="text-gray-600">Add your roommates to track individual balances</p>
          </div>
        ) : (
          <div className="space-y-3">
            {roommates.map((roommate) => (
              <div
                key={roommate.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {roommate.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">{roommate.name}</h4>
                    <p className="text-sm text-gray-600">Roommate</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {editingBalanceId === roommate.id ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        step="0.01"
                        value={editBalance}
                        onChange={(e) => setEditBalance(e.target.value)}
                        className="w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        placeholder="Amount"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveBalance(roommate.id)}
                        className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-right">
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-4 h-4 text-orange-600" />
                        <span className="font-semibold text-orange-600">
                          ₹{roommate.totalOwed.toFixed(2)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">Amount to pay</div>
                    </div>
                  )}
                  
                  {editingBalanceId !== roommate.id && (
                    <button
                      onClick={() => handleEditBalance(roommate)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Edit balance"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDeleteRoommate(roommate.id, roommate.name)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoommateManager;