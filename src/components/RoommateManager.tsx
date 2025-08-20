import { 
  collection, 
  addDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';
import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, DollarSign, Edit3, Check, X, Upload, User } from 'lucide-react';
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

  useEffect(() => {
    const unsubscribe = roommateService.onRoommatesChange((roommateData) => {
      setRoommates(roommateData);
    });

    return () => unsubscribe();
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image size should be less than 10MB');
        return;
      }

      // Compress image before storing
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Set canvas size (compress to max 200x200)
        const maxSize = 200;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 with compression (0.7 quality)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
        
        // Check if still too large (should be under 500KB after compression)
        if (compressedDataUrl.length > 500000) {
          toast.error('Image is still too large after compression. Please use a smaller image.');
          return;
        }
        
        if (isEdit) {
          setEditForm((prev) => ({ ...prev, profilePic: compressedDataUrl }));
        } else {
          setNewRoommate((prev) => ({ ...prev, profilePic: compressedDataUrl }));
        }
      };
      
      img.onerror = () => {
        toast.error('Failed to load image. Please try a different image.');
      };
      
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddRoommate = async () => {
    if (!newRoommate.name.trim()) {
      toast.error('Please enter a roommate name');
      return;
    }

    const balance = parseFloat(newRoommate.balance) || 0;

    try {
      await addDoc(collection(db, 'roommates'), {
        name: newRoommate.name.trim(),
        profilePic: newRoommate.profilePic || '',
        balance: balance,
        createdAt: new Date().toISOString()
      });

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
      profilePic: roommate.profilePic || '',
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
      setEditForm({ name: '', profilePic: '', balance: '' });
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
              <p className="text-sm text-gray-600">Manage roommate balances manually</p>
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
              {/* Profile Picture Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Picture
                </label>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                    {newRoommate.profilePic ? (
                      <img 
                        src={newRoommate.profilePic} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, false)}
                      className="hidden"
                      id="profile-upload"
                    />
                    <label
                      htmlFor="profile-upload"
                      className="flex items-center space-x-2 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload Photo</span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1">Max 10MB (auto-compressed)</p>
                  </div>
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
                    Balance Amount (₹)
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{roommates.length}</div>
                <div className="text-sm text-green-600">Total Roommates</div>
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
                      <label className="block text-xs text-gray-600 mb-1">Profile Picture</label>
                      <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                          {editForm.profilePic ? (
                            <img 
                              src={editForm.profilePic} 
                              alt="Profile" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, true)}
                            className="hidden"
                            id={`edit-profile-${roommate.id}`}
                          />
                          <label
                            htmlFor={`edit-profile-${roommate.id}`}
                            className="text-xs bg-blue-500 text-white px-2 py-1 rounded cursor-pointer hover:bg-blue-600"
                          >
                            Change
                          </label>
                        </div>
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
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                      {roommate.profilePic ? (
                        <img 
                          src={roommate.profilePic} 
                          alt={roommate.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 text-gray-400" />
                      )}
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
                            ₹{roommate.balance?.toFixed(2) || '0.00'}
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