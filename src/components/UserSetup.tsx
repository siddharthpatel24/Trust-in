import React, { useState } from 'react';
import { User, Sparkles } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import GlassCard from './GlassCard';
import GradientButton from './GradientButton';
import { createUser } from '../utils/userManager';
import toast from 'react-hot-toast';

interface UserSetupProps {
  onUserCreated: (user: any) => void;
}

const UserSetup: React.FC<UserSetupProps> = ({ onUserCreated }) => {
  const { isDark } = useTheme();
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (name.trim().length < 2) {
      toast.error('Name must be at least 2 characters');
      return;
    }

    setIsLoading(true);

    try {
      const user = createUser(name);
      toast.success(`Welcome, ${user.name}! 🎉`);
      onUserCreated(user);
    } catch (error) {
      toast.error('Failed to create user profile');
      console.error('User creation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-500 flex items-center justify-center p-4 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900' 
        : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
    }`}>
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse-slow ${
          isDark ? 'bg-purple-500' : 'bg-blue-400'
        }`} />
        <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse-slow animation-delay-2000 ${
          isDark ? 'bg-pink-500' : 'bg-purple-400'
        }`} />
      </div>

      <GlassCard className="w-full max-w-md p-8 text-center">
        <div className="mb-8">
          <div className="p-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl shadow-lg animate-gradient mx-auto w-fit mb-6">
            <User className="w-8 h-8 text-white" />
          </div>
          
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Sparkles className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'} animate-pulse`} />
            <h1 className={`text-2xl font-bold bg-gradient-to-r ${
              isDark 
                ? 'from-white to-gray-300' 
                : 'from-gray-800 to-gray-600'
            } bg-clip-text text-transparent`}>
              Welcome to Room Tracker!
            </h1>
            <Sparkles className={`w-5 h-5 ${isDark ? 'text-pink-400' : 'text-pink-600'} animate-pulse`} />
          </div>
          
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
            Let's get you set up! Enter your name to start tracking expenses with your roommates.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className={`block text-sm font-medium mb-3 text-left ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-4 py-4 rounded-2xl backdrop-blur-md border transition-all duration-300 focus:outline-none focus:ring-2 focus:scale-105 ${
                isDark 
                  ? 'bg-white/10 border-white/20 text-white placeholder-gray-400 focus:ring-purple-400 focus:border-purple-400/50' 
                  : 'bg-white/80 border-gray-300/50 text-gray-800 placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500/50'
              }`}
              placeholder="Enter your name (e.g., Ravi, Priya)"
              required
              autoFocus
              disabled={isLoading}
            />
          </div>

          <GradientButton
            type="submit"
            disabled={isLoading || !name.trim()}
            variant="primary"
            size="lg"
            className="w-full"
          >
            {isLoading ? 'Setting up...' : 'Get Started'}
          </GradientButton>
        </form>

        <div className={`mt-6 p-4 rounded-2xl backdrop-blur-md border ${
          isDark 
            ? 'bg-blue-500/20 border-blue-400/30 text-blue-300' 
            : 'bg-blue-50/80 border-blue-200/50 text-blue-700'
        }`}>
          <p className="text-sm">
            💡 <strong>Your name will be saved</strong> and automatically added to all expenses you create. You can change it later in settings.
          </p>
        </div>
      </GlassCard>
    </div>
  );
};

export default UserSetup;