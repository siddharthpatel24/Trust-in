import React, { useState } from 'react';
import { User, CreditCard as Edit3, Check, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import GlassCard from './GlassCard';
import GradientButton from './GradientButton';
import { getCurrentUser, updateUserName } from '../utils/userManager';
import toast from 'react-hot-toast';

interface UserProfileProps {
  onUserUpdated?: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onUserUpdated }) => {
  const { isDark } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const currentUser = getCurrentUser();

  const handleEdit = () => {
    setNewName(currentUser?.name || '');
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!newName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    if (newName.trim().length < 2) {
      toast.error('Name must be at least 2 characters');
      return;
    }

    const updatedUser = updateUserName(newName);
    if (updatedUser) {
      toast.success('Name updated successfully!');
      setIsEditing(false);
      onUserUpdated?.();
    } else {
      toast.error('Failed to update name');
    }
  };

  const handleCancel = () => {
    setNewName('');
    setIsEditing(false);
  };

  if (!currentUser) {
    return null;
  }

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-2xl shadow-lg animate-gradient">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            {isEditing ? (
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className={`px-3 py-2 rounded-2xl backdrop-blur-md border transition-all duration-300 focus:outline-none focus:ring-2 ${
                  isDark 
                    ? 'bg-white/10 border-white/20 text-white placeholder-gray-400 focus:ring-purple-400' 
                    : 'bg-white/80 border-gray-300/50 text-gray-800 placeholder-gray-500 focus:ring-purple-500'
                }`}
                placeholder="Enter your name"
                autoFocus
              />
            ) : (
              <>
                <h3 className={`text-lg font-semibold bg-gradient-to-r ${
                  isDark ? 'from-white to-gray-300' : 'from-gray-800 to-gray-600'
                } bg-clip-text text-transparent`}>
                  {currentUser.name}
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Your expenses will be tagged with this name
                </p>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className={`p-2 rounded-xl transition-all duration-300 hover:scale-110 ${
                  isDark 
                    ? 'text-green-400 hover:bg-green-500/20' 
                    : 'text-green-600 hover:bg-green-100/80'
                }`}
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={handleCancel}
                className={`p-2 rounded-xl transition-all duration-300 hover:scale-110 ${
                  isDark 
                    ? 'text-red-400 hover:bg-red-500/20' 
                    : 'text-red-600 hover:bg-red-100/80'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={handleEdit}
              className={`p-2 rounded-xl transition-all duration-300 hover:scale-110 ${
                isDark 
                  ? 'text-blue-400 hover:bg-blue-500/20 border border-white/10 hover:border-blue-400/30' 
                  : 'text-blue-600 hover:bg-blue-50/80 border border-gray-200/50 hover:border-blue-300/50'
              }`}
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </GlassCard>
  );
};

export default UserProfile;