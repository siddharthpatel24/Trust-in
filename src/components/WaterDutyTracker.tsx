import React, { useState, useEffect } from 'react';
import { Droplets, Check, Users, Clock, Trophy, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';
import GlassCard from './GlassCard';
import GradientButton from './GradientButton';
import AnimatedCounter from './AnimatedCounter';
import { waterDutyService, roommateService } from '../firebase/firestore';
import { format, parseISO } from 'date-fns';

const WaterDutyTracker: React.FC = () => {
  const { isDark } = useTheme();
  const [waterDuty, setWaterDuty] = useState<any>(null);
  const [roommates, setRoommates] = useState<any[]>([]);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    const unsubscribeWaterDuty = waterDutyService.onWaterDutyChange((dutyData) => {
      setWaterDuty(dutyData);
    });

    const unsubscribeRoommates = roommateService.onRoommatesChange((roommateData) => {
      setRoommates(roommateData);
      
      // Auto-update water duty when roommates change
      if (roommateData.length > 0) {
        waterDutyService.updateWaterDutyRoommates(roommateData);
      }
    });

    return () => {
      unsubscribeWaterDuty();
      unsubscribeRoommates();
    };
  }, []);

  const handleInitializeWaterDuty = async () => {
    if (roommates.length === 0) {
      toast.error('Add roommates first to start water duty rotation');
      return;
    }

    setIsInitializing(true);
    try {
      await waterDutyService.initializeWaterDuty(roommates);
      toast.success('🚰 Water duty rotation started!');
    } catch (error) {
      toast.error('Failed to initialize water duty');
      console.error('Initialize water duty error:', error);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleCompleteWaterDuty = async () => {
    if (!waterDuty) return;

    setIsCompleting(true);
    try {
      await waterDutyService.completeWaterDuty();
      toast.success(`✅ ${waterDuty.currentPerson} completed water duty! Next: ${getNextPersonName()}`);
    } catch (error) {
      toast.error('Failed to complete water duty');
      console.error('Complete water duty error:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  const getNextPersonName = () => {
    if (!waterDuty || !waterDuty.roommates) return '';
    const nextIndex = (waterDuty.currentPersonIndex + 1) % waterDuty.roommates.length;
    return waterDuty.roommates[nextIndex]?.name || '';
  };

  const getDutyHistory = () => {
    if (!waterDuty) return [];
    
    const history = [];
    if (waterDuty.lastCompletedBy && waterDuty.lastCompletedAt) {
      history.push({
        person: waterDuty.lastCompletedBy,
        completedAt: waterDuty.lastCompletedAt
      });
    }
    return history;
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 rounded-2xl shadow-lg animate-gradient hover:animate-glow-pulse">
            <Droplets className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className={`text-xl font-semibold bg-gradient-to-r ${
              isDark ? 'from-white to-gray-300' : 'from-gray-800 to-gray-600'
            } bg-clip-text text-transparent`}>
              💧 Water Duty Tracker
            </h2>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Automatic rotation system for water can duty
            </p>
          </div>
        </div>
      </div>

      {!waterDuty ? (
        <div className="text-center py-8">
          <div className="text-6xl mb-4 animate-bounce-slow">🚰</div>
          <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
            Water Duty Not Started
          </h3>
          <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Initialize the water duty rotation system for your roommates
          </p>
          
          {roommates.length === 0 ? (
            <div className={`p-4 rounded-2xl backdrop-blur-md border ${
              isDark 
                ? 'bg-yellow-500/20 border-yellow-400/30 text-yellow-300' 
                : 'bg-yellow-50/80 border-yellow-200/50 text-yellow-700'
            }`}>
              <p className="text-sm">
                💡 Add roommates first in the "Roommates" tab to start water duty tracking
              </p>
            </div>
          ) : (
            <GradientButton
              onClick={handleInitializeWaterDuty}
              disabled={isInitializing}
              variant="primary"
              size="lg"
            >
              {isInitializing ? 'Starting...' : 'Start Water Duty Rotation'}
            </GradientButton>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Current Duty Display */}
          <div className={`p-6 rounded-3xl backdrop-blur-md border transition-all duration-300 ${
            isDark 
              ? 'bg-blue-500/20 border-blue-400/30' 
              : 'bg-blue-50/80 border-blue-200/50'
          }`}>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Droplets className={`w-8 h-8 ${isDark ? 'text-blue-400' : 'text-blue-600'} animate-pulse`} />
                <h3 className={`text-2xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                  Current Water Duty
                </h3>
              </div>
              
              <div className={`text-4xl font-bold mb-2 bg-gradient-to-r ${
                isDark 
                  ? 'from-blue-300 to-cyan-300' 
                  : 'from-blue-600 to-cyan-600'
              } bg-clip-text text-transparent animate-pulse`}>
                {waterDuty.currentPerson}
              </div>
              
              <p className={`text-lg ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>
                🚰 It's your turn to bring the water can!
              </p>
              
              <div className="mt-6">
                <GradientButton
                  onClick={handleCompleteWaterDuty}
                  disabled={isCompleting}
                  variant="success"
                  size="lg"
                  className="animate-glow-pulse"
                >
                  {isCompleting ? 'Completing...' : '✅ Mark as Completed'}
                </GradientButton>
              </div>
            </div>
          </div>

          {/* Next Person Preview */}
          <div className={`p-4 rounded-2xl backdrop-blur-md border ${
            isDark 
              ? 'bg-emerald-500/20 border-emerald-400/30' 
              : 'bg-emerald-50/80 border-emerald-200/50'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Users className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                <div>
                  <h4 className={`font-semibold ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                    Next in Line
                  </h4>
                  <p className={`text-sm ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    {getNextPersonName()}
                  </p>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                isDark 
                  ? 'bg-emerald-400/20 text-emerald-300' 
                  : 'bg-emerald-100 text-emerald-700'
              }`}>
                Up Next
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className={`text-center p-4 rounded-2xl backdrop-blur-md border ${
              isDark 
                ? 'bg-purple-500/20 border-purple-400/30' 
                : 'bg-purple-50/80 border-purple-200/50'
            }`}>
              <div className={`text-2xl font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                <AnimatedCounter value={waterDuty.completedCount} />
              </div>
              <div className={`text-sm ${isDark ? 'text-purple-300' : 'text-purple-600'}`}>
                Total Completed
              </div>
            </div>
            
            <div className={`text-center p-4 rounded-2xl backdrop-blur-md border ${
              isDark 
                ? 'bg-orange-500/20 border-orange-400/30' 
                : 'bg-orange-50/80 border-orange-200/50'
            }`}>
              <div className={`text-2xl font-bold ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                <AnimatedCounter value={waterDuty.roommates?.length || 0} />
              </div>
              <div className={`text-sm ${isDark ? 'text-orange-300' : 'text-orange-600'}`}>
                Total Roommates
              </div>
            </div>
            
            <div className={`text-center p-4 rounded-2xl backdrop-blur-md border ${
              isDark 
                ? 'bg-pink-500/20 border-pink-400/30' 
                : 'bg-pink-50/80 border-pink-200/50'
            }`}>
              <div className={`text-2xl font-bold ${isDark ? 'text-pink-400' : 'text-pink-600'}`}>
                {waterDuty.startDate ? format(parseISO(waterDuty.startDate), 'MMM dd') : 'N/A'}
              </div>
              <div className={`text-sm ${isDark ? 'text-pink-300' : 'text-pink-600'}`}>
                Started On
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          {waterDuty.lastCompletedBy && (
            <div className={`p-4 rounded-2xl backdrop-blur-md border ${
              isDark 
                ? 'bg-green-500/20 border-green-400/30' 
                : 'bg-green-50/80 border-green-200/50'
            }`}>
              <div className="flex items-center space-x-3">
                <Trophy className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                <div>
                  <h4 className={`font-semibold ${isDark ? 'text-green-300' : 'text-green-700'}`}>
                    Last Completed
                  </h4>
                  <p className={`text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                    {waterDuty.lastCompletedBy} • {format(parseISO(waterDuty.lastCompletedAt), 'MMM dd, yyyy at h:mm a')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Rotation Order */}
          <div className={`p-4 rounded-2xl backdrop-blur-md border ${
            isDark 
              ? 'bg-gray-500/20 border-gray-400/30' 
              : 'bg-gray-50/80 border-gray-200/50'
          }`}>
            <h4 className={`font-semibold mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              🔄 Rotation Order
            </h4>
            <div className="flex flex-wrap gap-2">
              {waterDuty.roommates?.map((roommate: any, index: number) => (
                <div
                  key={roommate.id}
                  className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    index === waterDuty.currentPersonIndex
                      ? `bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg animate-glow-pulse`
                      : `${isDark 
                          ? 'bg-gray-600/30 text-gray-300 border border-gray-500/30' 
                          : 'bg-gray-100 text-gray-700 border border-gray-200'
                        }`
                  }`}
                >
                  {index === waterDuty.currentPersonIndex && '👑 '}
                  {roommate.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </GlassCard>
  );
};

export default WaterDutyTracker;