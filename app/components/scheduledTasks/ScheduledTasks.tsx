import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createScopedLogger } from '~/utils/logger';
import { scheduledTasksService, type ScheduledTask } from '~/lib/services/scheduledTasksService';
import { ScheduledTaskDialog } from './ScheduledTaskDialog';

const logger = createScopedLogger('ScheduledTasks');

interface ScheduledTasksProps {
  onTaskClick?: (task: ScheduledTask) => void;
}

export const ScheduledTasks = ({ onTaskClick }: ScheduledTasksProps) => {
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedTask, setSelectedTask] = useState<ScheduledTask | null>(null);
  const [showTaskDialog, setShowTaskDialog] = useState<boolean>(false);

  useEffect(() => {
    loadTasks();
    const interval = setInterval(loadTasks, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const loadTasks = () => {
    try {
      const allTasks = scheduledTasksService.getTasks();
      setTasks(allTasks);
    } catch (error) {
      logger.error('Failed to load tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTasks = filter === 'all' 
    ? tasks 
    : tasks.filter(task => task.status === filter);

  const getStatusIcon = (status: ScheduledTask['status']) => {
    switch (status) {
      case 'pending':
        return 'i-ph:clock';
      case 'running':
        return 'i-ph:spinner animate-spin';
      case 'completed':
        return 'i-ph:check-circle';
      case 'failed':
        return 'i-ph:x-circle';
      case 'cancelled':
        return 'i-ph:slash-circle';
    }
  };

  const getStatusColor = (status: ScheduledTask['status']) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-500';
      case 'running':
        return 'text-blue-500';
      case 'completed':
        return 'text-green-500';
      case 'failed':
        return 'text-red-500';
      case 'cancelled':
        return 'text-gray-500';
    }
  };

  const getTypeIcon = (type: ScheduledTask['type']) => {
    switch (type) {
      case 'refactor':
        return 'i-ph:wrench';
      case 'build':
        return 'i-ph:hammer';
      case 'test':
        return 'i-ph:flask';
      case 'audit':
        return 'i-ph:shield';
      case 'deploy':
        return 'i-ph:rocket';
    }
  };

  const getPriorityColor = (priority: ScheduledTask['priority']) => {
    switch (priority) {
      case 'low':
        return 'text-blue-500';
      case 'medium':
        return 'text-yellow-500';
      case 'high':
        return 'text-red-500';
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const formatDuration = (duration: number | undefined) => {
    if (!duration) return 'N/A';
    
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}s`;
  };

  const handleCancelTask = (taskId: string) => {
    if (confirm('Are you sure you want to cancel this task?')) {
      scheduledTasksService.cancelTask(taskId);
      loadTasks();
    }
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      scheduledTasksService.deleteTask(taskId);
      loadTasks();
    }
  };

  const handleClearCompleted = () => {
    if (confirm('Are you sure you want to clear all completed tasks?')) {
      scheduledTasksService.clearCompletedTasks();
      loadTasks();
    }
  };

  const statistics = scheduledTasksService.getStatistics();

  const getFilterButtonClass = (filterName: string) => {
    const baseClass = 'px-3 py-1.5 text-sm rounded-lg transition-colors';
    if (filter === filterName) {
      return `${baseClass} bg-bolt-elements-primary text-white`;
    }
    return `${baseClass} bg-bolt-elements-background-depth-2 hover:bg-bolt-elements-background-depth-3`;
  };

  return (
    <div className="flex flex-col h-full bg-bolt-elements-background-depth-1 rounded-lg border border-bolt-elements-borderColor">
      {/* Header */}
      <div className="p-4 border-b border-bolt-elements-borderColor">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-bolt-elements-textPrimary">
            Scheduled Tasks
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-3 py-1.5 text-sm bg-bolt-elements-primary text-white rounded-lg hover:bg-bolt-elements-primary/90 transition-colors"
            >
              <i className="i-ph:plus mr-1"></i>
              New Task
            </button>
            <button
              onClick={handleClearCompleted}
              className="px-3 py-1.5 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              disabled={statistics.completed + statistics.failed + statistics.cancelled === 0}
            >
              <i className="i-ph:trash mr-1"></i>
              Clear Completed
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="p-2 bg-bolt-elements-background-depth-2 rounded-lg">
            <div className="flex items-center gap-2">
              <i className="i-ph:calendar text-blue-500"></i>
              <span className="text-bolt-elements-textSecondary">Total</span>
            </div>
            <div className="text-lg font-semibold text-bolt-elements-textPrimary">
              {statistics.total}
            </div>
          </div>
          <div className="p-2 bg-bolt-elements-background-depth-2 rounded-lg">
            <div className="flex items-center gap-2">
              <i className="i-ph:clock text-yellow-500"></i>
              <span className="text-bolt-elements-textSecondary">Pending</span>
            </div>
            <div className="text-lg font-semibold text-bolt-elements-textPrimary">
              {statistics.pending}
            </div>
          </div>
          <div className="p-2 bg-bolt-elements-background-depth-2 rounded-lg">
            <div className="flex items-center gap-2">
              <i className="i-ph:spinner animate-spin text-blue-500"></i>
              <span className="text-bolt-elements-textSecondary">Running</span>
            </div>
            <div className="text-lg font-semibold text-bolt-elements-textPrimary">
              {statistics.running}
            </div>
          </div>
          <div className="p-2 bg-bolt-elements-background-depth-2 rounded-lg">
            <div className="flex items-center gap-2">
              <i className="i-ph:check-circle text-green-500"></i>
              <span className="text-bolt-elements-textSecondary">Completed</span>
            </div>
            <div className="text-lg font-semibold text-bolt-elements-textPrimary">
              {statistics.completed}
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="p-3 border-b border-bolt-elements-borderColor">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={getFilterButtonClass('all')}
          >
            All
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={getFilterButtonClass('pending')}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('running')}
            className={getFilterButtonClass('running')}
          >
            Running
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={getFilterButtonClass('completed')}
          >
            Completed
          </button>
          <button
            onClick={() => setFilter('failed')}
            className={getFilterButtonClass('failed')}
          >
            Failed
          </button>
        </div>
      </div>

      {/* Tasks List */}
      <div className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-bolt-elements-textSecondary">
            <div className="flex items-center gap-2">
              <i className="i-ph:spinner animate-spin"></i>
              <span>Loading tasks...</span>
            </div>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-8 text-bolt-elements-textTertiary">
            <i className="i-ph:calendar text-4xl mb-2"></i>
            <p>No tasks found</p>
            <p className="text-sm mt-1">
              {filter === 'all' 
                ? 'Create your first scheduled task' 
                : 'No tasks with this status'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredTasks.map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="p-3 bg-bolt-elements-background-depth-2 rounded-lg border border-bolt-elements-borderColor hover:border-bolt-elements-primary/50 transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedTask(task);
                    setShowTaskDialog(true);
                    onTaskClick?.(task);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <i className={`${getTypeIcon(task.type)} text-blue-500`}></i>
                        <h4 className="font-medium text-bolt-elements-textPrimary">{task.name}</h4>
                        <i className={`${getPriorityColor(task.priority)} text-sm`} title={task.priority}>
                          {task.priority === 'high' ? 'i-ph:warning' : task.priority === 'medium' ? 'i-ph:exclamation' : 'i-ph:info'}
                        </i>
                      </div>
                      <p className="text-sm text-bolt-elements-textSecondary mb-2">{task.description}</p>
                      <div className="flex items-center gap-4 text-xs text-bolt-elements-textSecondary">
                        <span className="flex items-center gap-1">
                          <i className="i-ph:clock"></i>
                          {formatDate(task.scheduledTime)}
                        </span>
                        {task.duration && (
                          <span className="flex items-center gap-1">
                            <i className="i-ph:timer"></i>
                            {formatDuration(task.duration)}
                          </span>
                        )}
                        {task.recurrence && task.recurrence !== 'none' && (
                          <span className="flex items-center gap-1">
                            <i className="i-ph:refresh"></i>
                            {task.recurrence}
                          </span>
                        )}
                      </div>
                      {task.progress !== undefined && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-bolt-elements-textSecondary mb-1">
                            <span>Progress</span>
                            <span>{task.progress}%</span>
                          </div>
                          <div className="w-full bg-bolt-elements-background-depth-1 rounded-full h-1.5 overflow-hidden">
                            <motion.div
                              className="bg-bolt-elements-primary h-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${task.progress}%` }}
                              transition={{ duration: 0.3 }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2 ml-4">
                      <div className="flex items-center gap-2">
                        <i className={`${getStatusIcon(task.status)} ${getStatusColor(task.status)}`} 
                           title={task.status}></i>
                        <span className="text-xs text-bolt-elements-textSecondary capitalize">
                          {task.status}
                        </span>
                      </div>
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        {task.status === 'pending' && (
                          <button
                            onClick={() => handleCancelTask(task.id)}
                            className="p-1.5 text-xs text-gray-500 hover:text-red-500 transition-colors"
                            title="Cancel"
                          >
                            <i className="i-ph:stop"></i>
                          </button>
                        )}
                        {task.status !== 'running' && (
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1.5 text-xs text-gray-500 hover:text-red-500 transition-colors"
                            title="Delete"
                          >
                            <i className="i-ph:trash"></i>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Footer */}
      {tasks.length > 0 && (
        <div className="p-3 border-t border-bolt-elements-borderColor bg-bolt-elements-background-depth-2">
          <div className="flex items-center justify-between text-xs text-bolt-elements-textSecondary">
            <span>Showing {filteredTasks.length} of {tasks.length} tasks</span>
            <span>Avg duration: {formatDuration(statistics.averageDuration)}</span>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <CreateTaskModal
          onClose={() => setShowCreateModal(false)}
          onTaskCreated={loadTasks}
        />
      )}

      {/* Task Detail Dialog */}
      <ScheduledTaskDialog
        task={selectedTask}
        isOpen={showTaskDialog}
        onClose={() => {
          setShowTaskDialog(false);
          setSelectedTask(null);
        }}
        onTaskUpdated={loadTasks}
      />
    </div>
  );
};

// Create Task Modal Component
interface CreateTaskModalProps {
  onClose: () => void;
  onTaskCreated: () => void;
}

const CreateTaskModal = ({ onClose, onTaskCreated }: CreateTaskModalProps) => {
  const [taskData, setTaskData] = useState({
    name: '',
    description: '',
    type: 'build' as ScheduledTask['type'],
    priority: 'medium' as ScheduledTask['priority'],
    scheduledTime: Date.now() + 3600000, // 1 hour from now
    notifications: true,
    recurrence: 'none' as ScheduledTask['recurrence']
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      scheduledTasksService.createTask(taskData);
      onTaskCreated();
      onClose();
    } catch (error) {
      logger.error('Failed to create task:', error);
      alert('Failed to create task');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Create New Task</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <i className="i-ph:x"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task Name
            </label>
            <input
              type="text"
              required
              value={taskData.name}
              onChange={(e) => setTaskData({ ...taskData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter task name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={taskData.description}
              onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter task description"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task Type
            </label>
            <select
              value={taskData.type}
              onChange={(e) => setTaskData({ ...taskData, type: e.target.value as ScheduledTask['type'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="build">Build</option>
              <option value="test">Test</option>
              <option value="refactor">Refactor</option>
              <option value="audit">Security Audit</option>
              <option value="deploy">Deploy</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              value={taskData.priority}
              onChange={(e) => setTaskData({ ...taskData, priority: e.target.value as ScheduledTask['priority'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Scheduled Time
            </label>
            <input
              type="datetime-local"
              required
              value={new Date(taskData.scheduledTime).toISOString().slice(0, 16)}
              onChange={(e) => setTaskData({ 
                ...taskData, 
                scheduledTime: new Date(e.target.value).getTime() 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recurrence
            </label>
            <select
              value={taskData.recurrence}
              onChange={(e) => setTaskData({ ...taskData, recurrence: e.target.value as ScheduledTask['recurrence'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="none">One Time</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="notifications"
              checked={taskData.notifications}
              onChange={(e) => setTaskData({ ...taskData, notifications: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="notifications" className="text-sm text-gray-700">
              Send notifications
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
