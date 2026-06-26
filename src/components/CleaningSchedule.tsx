import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Trash2, Clock, User, History } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';
import GlassCard from './GlassCard';
import GradientButton from './GradientButton';
import { cleaningService, roommateService } from '../firebase/firestore';
import { format, parseISO } from 'date-fns';

interface CleaningLog {
  id: string;
  roommateName: string;
  task: string;
  date: string;
  note?: string;
  createdAt?: string;
}

interface Roommate {
  id: string;
  name: string;
}

const COMMON_TASKS = [
  'Bathroom Cleaning',
  'Mopping Floor',
  'Take Out Trash',
  
];

const CleaningSchedule: React.FC = () => {
  const { isDark } = useTheme();
  const [logs, setLogs] = useState<CleaningLog[]>([]);
  const [roommates, setRoommates] = useState<Roommate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    roommateName: '',
    task: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    note: '',
  });

  // Load roommates from Firebase
  useEffect(() => {
    const unsubscribe = roommateService.onRoommatesChange((data: any[]) => {
      setRoommates(data);
    });
    return () => unsubscribe();
  }, []);

  // Load cleaning logs from Firebase in real-time
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = cleaningService.onCleaningLogsChange((data: CleaningLog[]) => {
      setLogs(data);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAddLog = async () => {
    if (!form.roommateName.trim()) {
      toast.error('Please select who did the task');
      return;
    }
    if (!form.task.trim()) {
      toast.error('Please enter the task');
      return;
    }
    if (!form.date) {
      toast.error('Please pick a date');
      return;
    }

    setIsSaving(true);
    try {
      await cleaningService.addCleaningLog(
        form.roommateName.trim(),
        form.task.trim(),
        form.date,
        form.note.trim() || undefined
      );
      toast.success('Cleaning log added!');
      setForm({
        roommateName: '',
        task: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        note: '',
      });
      setShowForm(false);
    } catch (err) {
      console.error('Add cleaning log error:', err);
      toast.error('Failed to add cleaning log');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteLog = async (id: string) => {
    if (!window.confirm('Delete this cleaning log entry?')) return;
    try {
      await cleaningService.deleteCleaningLog(id);
      toast.success('Entry deleted');
    } catch (err) {
      console.error('Delete cleaning log error:', err);
      toast.error('Failed to delete entry');
    }
  };

  // Group logs by date
  const groupedLogs = logs.reduce((acc: Record<string, CleaningLog[]>, log) => {
    (acc[log.date] = acc[log.date] || []).push(log);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedLogs).sort((a, b) => (a < b ? 1 : -1));

  // Count per roommate
  const counts = logs.reduce((acc: Record<string, number>, log) => {
    acc[log.roommateName] = (acc[log.roommateName] || 0) + 1;
    return acc;
  }, {});

  return (
    <GlassCard className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl shadow-lg animate-gradient hover:animate-glow-pulse">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className={`text-xl font-semibold bg-gradient-to-r ${
              isDark ? 'from-white to-gray-300' : 'from-gray-800 to-gray-600'
            } bg-clip-text text-transparent`}>
              Cleaning Log
            </h2>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Record who did what, and when
            </p>
          </div>
        </div>
        <GradientButton
          onClick={() => setShowForm((s) => !s)}
          variant="primary"
          size="sm"
        >
          <Plus className="w-4 h-4" />
          {showForm ? 'Close' : 'Log Task'}
        </GradientButton>
      </div>

      {/* Add Log Form */}
      {showForm && (
        <div className={`mb-6 p-5 rounded-2xl backdrop-blur-md border transition-all duration-300 ${
          isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50/80 border-gray-200/50'
        }`}>
          <div className="space-y-4">
            {/* Who */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Who did it?
              </label>
              {roommates.length === 0 ? (
                <input
                  type="text"
                  value={form.roommateName}
                  onChange={(e) => setForm({ ...form, roommateName: e.target.value })}
                  placeholder="Type a name"
                  className={`w-full px-4 py-3 rounded-2xl backdrop-blur-md border transition-all duration-300 focus:outline-none focus:ring-2 focus:scale-[1.02] ${
                    isDark
                      ? 'bg-white/10 border-white/20 text-white placeholder-gray-400 focus:ring-emerald-400'
                      : 'bg-white/80 border-gray-300/50 text-gray-800 placeholder-gray-500 focus:ring-emerald-500'
                  }`}
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {roommates.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setForm({ ...form, roommateName: r.name })}
                      className={`px-4 py-2 text-sm rounded-2xl border transition-all duration-300 hover:scale-105 ${
                        form.roommateName === r.name
                          ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white border-transparent shadow-lg'
                          : isDark
                            ? 'bg-emerald-500/10 text-emerald-200 border-emerald-400/20 hover:bg-emerald-500/20'
                            : 'bg-cyan-50/80 text-cyan-700 border-cyan-200/50 hover:bg-emerald-50/80'
                      }`}
                    >
                      {r.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* What task */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                What task?
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {COMMON_TASKS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm({ ...form, task: t })}
                    className={`px-3 py-1.5 text-sm rounded-2xl border transition-all duration-300 hover:scale-105 ${
                      form.task === t
                        ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white border-transparent shadow-lg'
                        : isDark
                          ? 'bg-teal-500/10 text-teal-200 border-teal-400/20 hover:bg-teal-500/20'
                          : 'bg-teal-50/80 text-teal-700 border-teal-200/50 hover:bg-emerald-50/80'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={form.task}
                onChange={(e) => setForm({ ...form, task: e.target.value })}
                placeholder="Or type a custom task"
                className={`w-full px-4 py-3 rounded-2xl backdrop-blur-md border transition-all duration-300 focus:outline-none focus:ring-2 focus:scale-[1.02] ${
                  isDark
                    ? 'bg-white/10 border-white/20 text-white placeholder-gray-400 focus:ring-emerald-400'
                    : 'bg-white/80 border-gray-300/50 text-gray-800 placeholder-gray-500 focus:ring-emerald-500'
                }`}
              />
            </div>

            {/* Date + Note */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Date
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className={`w-full px-4 py-3 rounded-2xl backdrop-blur-md border transition-all duration-300 focus:outline-none focus:ring-2 focus:scale-[1.02] ${
                    isDark
                      ? 'bg-white/10 border-white/20 text-white focus:ring-emerald-400'
                      : 'bg-white/80 border-gray-300/50 text-gray-800 focus:ring-emerald-500'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Note (optional)
                </label>
                <input
                  type="text"
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  placeholder="Any extra detail"
                  className={`w-full px-4 py-3 rounded-2xl backdrop-blur-md border transition-all duration-300 focus:outline-none focus:ring-2 focus:scale-[1.02] ${
                    isDark
                      ? 'bg-white/10 border-white/20 text-white placeholder-gray-400 focus:ring-emerald-400'
                      : 'bg-white/80 border-gray-300/50 text-gray-800 placeholder-gray-500 focus:ring-emerald-500'
                  }`}
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <GradientButton
                onClick={handleAddLog}
                disabled={isSaving}
                variant="success"
                className="flex-1"
              >
                {isSaving ? 'Saving...' : 'Add to Log'}
              </GradientButton>
              <GradientButton
                onClick={() => setShowForm(false)}
                variant="secondary"
                className="px-6"
              >
                Cancel
              </GradientButton>
            </div>
          </div>
        </div>
      )}

      {/* Roommate contribution summary */}
      {logs.length > 0 && Object.keys(counts).length > 0 && (
        <div className={`mb-6 p-4 rounded-2xl backdrop-blur-md border ${
          isDark ? 'bg-emerald-500/10 border-emerald-400/20' : 'bg-emerald-50/80 border-emerald-200/50'
        }`}>
          <div className="flex items-center space-x-2 mb-3">
            <User className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
            <h3 className={`text-sm font-semibold ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
              Tasks done so far
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(counts)
              .sort(([, a], [, b]) => b - a)
              .map(([name, count]) => (
                <div
                  key={name}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                    isDark
                      ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30'
                      : 'bg-emerald-100 text-emerald-700 border border-emerald-200/50'
                  }`}
                >
                  {name}: {count}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* History */}
      {isLoading ? (
        <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Loading history...
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-10">
          <div className="text-6xl mb-4 animate-bounce-slow">🧹</div>
          <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
            No Cleaning Logged Yet
          </h3>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Tap "Log Task" to record who did what. Everyone will see it here.
          </p>
        </div>
      ) : (
        <div className="space-y-5 max-h-[28rem] overflow-y-auto pr-1">
          <div className="flex items-center space-x-2 mb-1">
            <History className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
            <h3 className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              History
            </h3>
          </div>
          {sortedDates.map((date) => (
            <div key={date}>
              <div className="flex items-center mb-2">
                <div className={`text-sm font-medium px-3 py-1.5 rounded-2xl backdrop-blur-md border ${
                  isDark
                    ? 'text-gray-300 bg-white/10 border-white/20'
                    : 'text-gray-600 bg-gray-100/80 border-gray-200/50'
                }`}>
                  {format(parseISO(date), 'EEE, MMM dd, yyyy')}
                </div>
                <div className={`flex-1 h-px ml-3 ${isDark ? 'bg-white/10' : 'bg-gray-200/50'}`} />
              </div>
              <div className="space-y-2">
                {groupedLogs[date].map((log) => (
                  <div
                    key={log.id}
                    className={`flex items-center justify-between p-4 rounded-2xl backdrop-blur-md border transition-all duration-300 hover:scale-[1.01] ${
                      isDark
                        ? 'bg-white/5 border-white/10 hover:bg-white/10'
                        : 'bg-gray-50/80 border-gray-200/50 hover:bg-gray-100/80'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 flex-wrap">
                        <h4 className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                          {log.task}
                        </h4>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {log.roommateName}
                        </span>
                      </div>
                      <div className={`text-sm mt-1 flex items-center space-x-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        <Clock className="w-3 h-3" />
                        <span>{format(parseISO(log.date), 'MMM dd, yyyy')}</span>
                        {log.note && (
                          <span className={`ml-2 italic ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                            — {log.note}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteLog(log.id)}
                      className={`p-2 rounded-xl transition-all duration-300 hover:scale-110 ${
                        isDark
                          ? 'text-red-400 hover:bg-red-500/20'
                          : 'text-red-600 hover:bg-red-50'
                      }`}
                      title="Delete entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {roommates.length === 0 && !showForm && (
        <div className={`mt-4 p-3 rounded-2xl backdrop-blur-md border ${
          isDark
            ? 'bg-yellow-500/20 border-yellow-400/30 text-yellow-300'
            : 'bg-yellow-50/80 border-yellow-200/50 text-yellow-700'
        }`}>
          <p className="text-sm">
            Tip: Add roommates in the "Roommates" tab so you can pick them quickly here. You can still type any name manually.
          </p>
        </div>
      )}
    </GlassCard>
  );
};

export default CleaningSchedule;
