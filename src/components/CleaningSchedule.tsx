import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Check, X, Trash2, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { cleaningService, roommateService } from '../firebase/firestore';
import { format, addDays, addWeeks, parseISO } from 'date-fns';

interface CleaningTask {
  id: string;
  title: string;
  assignedTo: string;
  frequency: 'daily' | 'weekly';
  dueDate: string;
  completed: boolean;
  createdAt: string;
}

interface Roommate {
  id: string;
  name: string;
}

const CleaningSchedule: React.FC = () => {
  const [tasks, setTasks] = useState<CleaningTask[]>([]);
  const [roommates, setRoommates] = useState<Roommate[]>([]);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    assignedTo: '',
    frequency: 'weekly' as 'daily' | 'weekly',
    dueDate: format(new Date(), 'yyyy-MM-dd')
  });

  const commonTasks = [
    'Bathroom Cleaning',
    'Mopping Floor',
    'Bring Water Can',
    'Take Out Trash',
    'Kitchen Cleaning',
    'Balcony Cleaning'
  ];

  useEffect(() => {
    const unsubscribeTasks = cleaningService.onCleaningTasksChange((taskData) => {
      setTasks(taskData);
    });

    const unsubscribeRoommates = roommateService.onRoommatesChange((roommateData) => {
      setRoommates(roommateData);
    });

    return () => {
      unsubscribeTasks();
      unsubscribeRoommates();
    };
  }, []);

  const handleAddTask = async () => {
    if (!newTask.title.trim() || !newTask.assignedTo || !newTask.dueDate) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await cleaningService.addCleaningTask(
        newTask.title.trim(),
        newTask.assignedTo,
        newTask.frequency,
        newTask.dueDate
      );
      toast.success('Cleaning task added successfully!');
      setNewTask({
        title: '',
        assignedTo: '',
        frequency: 'weekly',
        dueDate: format(new Date(), 'yyyy-MM-dd')
      });
      setIsAddingTask(false);
    } catch (error) {
      toast.error('Failed to add cleaning task');
      console.error('Add cleaning task error:', error);
    }
  };

  const handleToggleComplete = async (task: CleaningTask) => {
    try {
      await cleaningService.updateTaskStatus(task.id, !task.completed);
      
      // If marking as complete, create next occurrence
      if (!task.completed) {
        const nextDueDate = task.frequency === 'daily' 
          ? addDays(parseISO(task.dueDate), 1)
          : addWeeks(parseISO(task.dueDate), 1);
        
        await cleaningService.addCleaningTask(
          task.title,
          task.assignedTo,
          task.frequency,
          format(nextDueDate, 'yyyy-MM-dd')
        );
      }
      
      toast.success(task.completed ? 'Task marked as incomplete' : 'Task completed!');
    } catch (error) {
      toast.error('Failed to update task');
      console.error('Update task error:', error);
    }
  };

  const handleDeleteTask = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await cleaningService.deleteCleaningTask(id);
        toast.success('Task deleted successfully!');
      } catch (error) {
        toast.error('Failed to delete task');
        console.error('Delete task error:', error);
      }
    }
  };

  const getTaskStatus = (task: CleaningTask) => {
    const today = new Date();
    const dueDate = parseISO(task.dueDate);
    
    if (task.completed) return 'completed';
    if (dueDate < today) return 'overdue';
    if (format(dueDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) return 'due-today';
    return 'upcoming';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      case 'due-today': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'overdue': return 'Overdue';
      case 'due-today': return 'Due Today';
      default: return 'Upcoming';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-green-500 to-teal-600 rounded-xl">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Cleaning Schedule</h2>
              <p className="text-sm text-gray-600">Daily & weekly cleaning tasks</p>
            </div>
          </div>
          <button
            onClick={() => setIsAddingTask(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-teal-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-teal-700 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Add Task Form */}
        {isAddingTask && (
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <div className="space-y-4">
              {/* Quick task buttons */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quick Add
                </label>
                <div className="flex flex-wrap gap-2">
                  {commonTasks.map((task) => (
                    <button
                      key={task}
                      type="button"
                      onClick={() => setNewTask({ ...newTask, title: task })}
                      className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                        newTask.title === task
                          ? 'bg-green-500 text-white border-green-500'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-green-50 hover:border-green-300'
                      }`}
                    >
                      {task}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Task Title
                  </label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="Enter task title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assigned To
                  </label>
                  <select
                    value={newTask.assignedTo}
                    onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select roommate</option>
                    {roommates.map((roommate) => (
                      <option key={roommate.id} value={roommate.name}>
                        {roommate.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Frequency
                  </label>
                  <select
                    value={newTask.frequency}
                    onChange={(e) => setNewTask({ ...newTask, frequency: e.target.value as 'daily' | 'weekly' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleAddTask}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  Add Task
                </button>
                <button
                  onClick={() => setIsAddingTask(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tasks List */}
        {tasks.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-6xl mb-4">🧹</div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No Cleaning Tasks</h3>
            <p className="text-gray-600">Add cleaning tasks to keep your room organized</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => {
              const status = getTaskStatus(task);
              return (
                <div
                  key={task.id}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                    task.completed ? 'bg-green-50' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleToggleComplete(task)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        task.completed
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300 hover:border-green-500'
                      }`}
                    >
                      {task.completed && <Check className="w-4 h-4" />}
                    </button>

                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                          {task.title}
                        </h4>
                        <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(status)}`}>
                          {getStatusText(status)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                        <span>👤 {task.assignedTo}</span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{format(parseISO(task.dueDate), 'MMM dd, yyyy')}</span>
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          task.frequency === 'daily' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {task.frequency}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteTask(task.id, task.title)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {roommates.length === 0 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              💡 Add roommates first to assign cleaning tasks to them
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CleaningSchedule;