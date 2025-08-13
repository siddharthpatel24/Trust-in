import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, DollarSign, Edit3, Check, X, Camera, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { roommateService } from '../firebase/firestore';

interface Roommate {
  id: string;
  name: string;
  balance: number;
  profilePic?: string;
  createdAt: string;
}

interface RoommateManagerProps {
  totalExpenses: number;
  onDataUpdate: () => void;
}

const RoommateManager: React.FC<RoommateManagerProps> = ({ totalExpenses, onDataUpdate }) => {
  const [roommates, setRoommates] = useState<Roommate[]>([]);
  const [isAddingRoommate, setIsAddingRoommate] = useState(false);
  const [newRoommate, setNewRoommate] = useState({
    name: '',
    profilePic: '',
    balance: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    profilePic: '',
    balance: ''
  });

  // Predefined avatar options
  const avatarOptions = [
    '👨‍🎓', '👩‍🎓', '👨‍💻', '👩‍💻', '👨‍🔬', '👩‍🔬', 
    '👨‍🎨', '👩‍🎨', '👨‍🏫', '👩‍🏫', '👨‍⚕️', '👩‍⚕️',
    '🧑‍🎓', '🧑‍💻', '🧑‍🔬', '🧑‍🎨', '🧑‍🏫', '🧑‍⚕️'
  ];

  useEffect(() => {
    const unsubscribe = roommateService.onRoommatesChange((roommateData) => {
      setRoommates(roommateData);
    });

    return () => unsubscribe();
  }, []);

  const handleAddRoommate = async () => {
    if (!newRoommate.name.trim()) {
      toast.error('Please enter a roommate name');
      return;
    }

    const balance = parseFloat(newRoommate.balance) || 0;
    if (balance < 0) {
      toast.error('Balance cannot be negative');
      return;
    }

    try {
      await roommateService.addRoommate(
        newRoommate.name.trim(),
        newRoommate.profilePic || '👨‍🎓'
      );
      
      // If balance is set, update it
      if (balance > 0) {
        const roommatesList = await roommateService.getRoommates();
        const newRoommateDoc = roommatesList.find(r => r.name === newRoommate.name.trim());
        if (newRoommateDoc) {
          await roommateService.updateRoommateBalance(newRoommateDoc.id, balance);
        }
      }

      toast.success('Roommate added successfully!');
      setNewRoommate({ name: '', profilePic: '', balance: '' });
      setIsAddingRoommate(false);
      onDataUpdate();
    } catch (error) {
      toast.error('Failed to add roommate');
      console.error('Add roommate error:', error);
    }
  };

  const handleEditRoommate = (roommate: Roommate) => {
    setEditingId(roommate.id);
    setEditForm({
      name: roommate.name,
      profilePic: roommate.profilePic || '👨‍🎓',
      balance: roommate.balance.toString()
    });
  };

  const handleSaveEdit = async (id: string) => {
    if (!editForm.name.trim()) {
      toast.error('Please enter a name');
      return;
    }

    const balance = parseFloat(editForm.balance) || 0;
    if (balance < 0) {
      toast.error('Balance cannot be negative');
      return;
    }

    try {
      await roommateService.updateRoommateProfile(id, editForm.name.trim(), editForm.profilePic);
      await roommateService.updateRoommateBalance(id, balance);
      toast.success('Roommate updated successfully!');
      setEditingId(null);
      onDataUpdate();
    } catch (error) {
      toast.error('Failed to update roommate');
      console.error('Update roommate error:', error);
    }
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

  const totalBalance = roommates.reduce((sum, roommate) => sum + roommate.balance, 0);

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
              <p className="text-sm text-gray-600">Manage individual balances manually</p>
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
            <h3 className="font-semibold text-gray-800 mb-4">Add New Roommate</h3>
            
            <div className="space-y-4">
              {/* Profile Picture Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose Profile Avatar
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {avatarOptions.map((avatar) => (
                    <button
                      key={avatar}
                      type="button"
                      onClick={() => setNewRoommate({ ...newRoommate, profilePic: avatar })}
                      className={`w-12 h-12 text-2xl rounded-full border-2 transition-all ${
                        newRoommate.profilePic === avatar
                          ? 'border-indigo-500 bg-indigo-50 scale-110'
                          : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                      }`}
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Roommate Name
                  </label>
                  <input
                    type="text"
                    value={newRoommate.name}
                    onChange={(e) => setNewRoommate({ ...newRoommate, name: e.target.value })}
                    placeholder="Enter name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Initial Balance (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newRoommate.balance}
                    onChange={(e) => setNewRoommate({ ...newRoommate, balance: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleAddRoommate}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  Add Roommate
                </button>
                <button
                  onClick={() => {
                    setIsAddingRoommate(false);
                    setNewRoommate({ name: '', profilePic: '', balance: '' });
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Balance Summary */}
        {roommates.length > 0 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold text-indigo-800">Balance Summary</h3>
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
                <div className="text-2xl font-bold text-orange-600">₹{totalBalance.toFixed(2)}</div>
                <div className="text-sm text-orange-600">Total Balances</div>
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
                {editingId === roommate.id ? (
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Avatar</label>
                      <div className="flex space-x-1">
                        {avatarOptions.slice(0, 6).map((avatar) => (
                          <button
                            key={avatar}
                            type="button"
                            onClick={() => setEditForm({ ...editForm, profilePic: avatar })}
                            className={`w-8 h-8 text-lg rounded-full border ${
                              editForm.profilePic === avatar
                                ? 'border-indigo-500 bg-indigo-50'
                                : 'border-gray-200 hover:border-indigo-300'
                            }`}
                          >
                            {avatar}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Name</label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Balance (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editForm.balance}
                        onChange={(e) => setEditForm({ ...editForm, balance: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-2xl">
                      {roommate.profilePic || '👨‍🎓'}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">{roommate.name}</h4>
                      <p className="text-sm text-gray-600">Roommate</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  {editingId === roommate.id ? (
                    <>
                      <button
                        onClick={() => handleSaveEdit(roommate.id)}
                        className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="text-right">
                        <div className="flex items-center space-x-1">
                          <DollarSign className="w-4 h-4 text-orange-600" />
                          <span className="font-semibold text-orange-600">
                            ₹{roommate.balance.toFixed(2)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">Balance to pay</div>
                      </div>
                      
                      <button
                        onClick={() => handleEditRoommate(roommate)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Edit roommate"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteRoommate(roommate.id, roommate.name)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
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