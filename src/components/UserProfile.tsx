import React, { useState } from 'react';
import { User, CreditCard as Edit3, Check, X, Camera } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import GlassCard from './GlassCard';
import GradientButton from './GradientButton';
import { getCurrentUser, updateUserName, updateUserProfilePic, saveUserToFirestore } from '../utils/userManager';
import { uploadProfilePicture, dataUrlToFile } from '../firebase/storageService';
import toast from 'react-hot-toast';

interface UserProfileProps {
  onUserUpdated?: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onUserUpdated }) => {
  const { isDark } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [newProfilePic, setNewProfilePic] = useState('');
  const currentUser = getCurrentUser();

  const handleEdit = () => {
    setNewName(currentUser?.name || '');
    setNewProfilePic(currentUser?.profilePic || '');
    setIsEditing(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setNewProfilePic(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!newName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    if (newName.trim().length < 2) {
      toast.error('Name must be at least 2 characters');
      return;
    }

    try {
      let updatedUser = updateUserName(newName);
      if (!updatedUser) {
        toast.error('Failed to update profile');
        return;
      }

      if (newProfilePic && newProfilePic !== currentUser?.profilePic) {
        const file = dataUrlToFile(newProfilePic, `profile-${currentUser?.id}.jpg`);
        const imageUrl = await uploadProfilePicture(currentUser?.id || '', file);
        updatedUser = updateUserProfilePic(imageUrl);
      }

      if (updatedUser) {
        await saveUserToFirestore(updatedUser);
        toast.success('Profile updated successfully!');
        setIsEditing(false);
        onUserUpdated?.();
      }
    } catch (error) {
      toast.error('Failed to update profile');
      console.error('Profile update error:', error);
    }
  };

  const handleCancel = () => {
    setNewName('');
    setNewProfilePic('');
    setIsEditing(false);
  };

  if (!currentUser) {
    return null;
  }

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center space-x-4 flex-1">
          {isEditing ? (
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 flex-shrink-0">
              {newProfilePic ? (
                <img src={newProfilePic} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className={`w-full h-full flex items-center justify-center text-2xl ${
                  isDark ? 'bg-white/10' : 'bg-gray-100'
                }`}>
                  📷
                </div>
              )}
              <label className={`absolute inset-0 flex items-center justify-center cursor-pointer transition-all ${
                isDark ? 'bg-black/50 hover:bg-black/70' : 'bg-black/30 hover:bg-black/50'
              } opacity-0 hover:opacity-100`}>
                <Camera className="w-6 h-6 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 flex-shrink-0">
              {currentUser?.profilePic ? (
                <img src={currentUser.profilePic} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className={`w-full h-full flex items-center justify-center text-2xl ${
                  isDark ? 'bg-white/10' : 'bg-gray-100'
                }`}>
                  👤
                </div>
              )}
            </div>
          )}

          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className={`w-full px-3 py-2 rounded-2xl backdrop-blur-md border transition-all duration-300 focus:outline-none focus:ring-2 ${
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
                  {currentUser?.name}
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Your expenses will be tagged with this name
                </p>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0">
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