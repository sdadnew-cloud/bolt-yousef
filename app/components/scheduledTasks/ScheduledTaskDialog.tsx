import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createScopedLogger } from '~/utils/logger';
import { scheduledTasksService, type ScheduledTask } from '~/lib/services/scheduledTasksService';

const logger = createScopedLogger('ScheduledTaskDialog');

interface ScheduledTaskDialogProps {
  task: ScheduledTask | null;
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdated?: () => void;
}

export const ScheduledTaskDialog = ({ task, isOpen, onClose, onTaskUpdated }: ScheduledTaskDialogProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<Partial<ScheduledTask>>({});

  useEffect(() => {
    if (task) {
      setEditedTask({ ...task });
    }
  }, [task]);

  if (!isOpen || !task) return null;

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
        return 'text-yellow-500 bg-yellow-500/10';
      case 'running':
        return 'text-blue-500 bg-blue-500/10';
      case 'completed':
        return 'text-green-500 bg-green-500/10';
      case 'failed':
        return 'text-red-500 bg-red-500/10';
      case 'cancelled':
        return 'text-gray-500 bg-gray-500/10';
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

  const formatDate = (timestamp: number | undefined) => {
    if (!timestamp) return 'N/A';
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

  const handleSave = () => {
    try {
      if (editedTask.id) {
        scheduledTasksService.updateTask(editedTask.id, editedTask);
        setIsEditing(false);
        onTaskUpdated?.();
      }
    } catch (error) {
      logger.error('Failed to update task:', error);
      alert('Failed to update task');
    }
  };

  const handleCancelTask = () => {
    if (confirm('Are you sure you want to cancel this task?')) {
      scheduledTasksService.cancelTask(task.id);
      onTaskUpdated?.();
      onClose();
    }
  };

  const handleDeleteTask = () => {
    if (confirm('Are you sure you want to delete this task?')) {
      scheduledTasksService.deleteTask(task.id);
      onTaskUpdated?.();
      onClose();
    }
  };

  const handleRerunTask = () => {
    try {
      scheduledTasksService.createTask({
        name: task.name,
        description: task.description,
        type: task.type,
        priority: task.priority,
        scheduledTime: Date.now() + 60000, // 1 minute from now
        notifications: task.notifications,
        recurrence: task.recurrence || 'none'
      });
      onTaskUpdated?.();
      onClose();
    } catch (error) {
      logger.error('Failed to rerun task:', error);
      alert('Failed to rerun task');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-bolt-elements-background-depth-1 rounded-xl border border-bolt-elements-borderColor w-full max-w-2xl max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-bolt-elements-borderColor">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getStatusColor(task.status)}`}>
                    <i className={`${getStatusIcon(task.status)} text-xl`}></i>
                  </div>
                  <div>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedTask.name || ''}
                        onChange={(e) => setEditedTask({ ...editedTask, name: e.target.value })}
                        className="text-lg font-semibold bg-bolt-elements-background-depth-2 border border-bolt-elements-borderColor rounded px-2 py-1 text-bolt-elements-textPrimary"
                      />
                    ) : (
                      <h3 className="text-lg font-semibold text-bolt-elements-textPrimary">{task.name}</h3>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(task.status)} capitalize`}>
                        {task.status}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-bolt-elements-textSecondary">
                        <i className={`${getTypeIcon(task.type)}`}></i>
                        {task.type}
                      </span>
                      <span className={`text-xs flex items-center gap-1 ${getPriorityColor(task.priority)}`}>
                        <i className="i-ph:flag"></i>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary transition-colors"
                >
                  <i className="i-ph:x text-xl"></i>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Description */}
              <div>
                <h4 className="text-sm font-medium text-bolt-elements-textSecondary mb-2">Description</h4>
                {isEditing ? (
                  <textarea
                    value={editedTask.description || ''}
                    onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                    className="w-full px-3 py-2 bg-bolt-elements-background-depth-2 border border-bolt-elements-borderColor rounded-lg text-bolt-elements-textPrimary focus:ring-2 focus:ring-bolt-elements-primary/50 focus:border-transparent"
                    rows={3}
                  />
                ) : (
                  <p className="text-bolt-elements-textPrimary">
                    {task.description || 'No description provided'}
                  </p>
                )}
              </div>

              {/* Progress */}
              {task.progress !== undefined && (
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-bolt-elements-textSecondary">Progress</span>
                    <span className="text-bolt-elements-textPrimary">{task.progress}%</span>
                  </div>
                  <div className="w-full bg-bolt-elements-background-depth-2 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="bg-bolt-elements-primary h-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${task.progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-bolt-elements-background-depth-2 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-bolt-elements-textSecondary mb-1">
                    <i className="i-ph:calendar"></i>
                    Scheduled Time
                  </div>
                  <div className="text-bolt-elements-textPrimary">{formatDate(task.scheduledTime)}</div>
                </div>
                {task.startTime && (
                  <div className="p-3 bg-bolt-elements-background-depth-2 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-bolt-elements-textSecondary mb-1">
                      <i className="i-ph:play"></i>
                      Started
                    </div>
                    <div className="text-bolt-elements-textPrimary">{formatDate(task.startTime)}</div>
                  </div>
                )}
                {task.endTime && (
                  <div className="p-3 bg-bolt-elements-background-depth-2 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-bolt-elements-textSecondary mb-1">
                      <i className="i-ph:stop"></i>
                      Ended
                    </div>
                    <div className="text-bolt-elements-textPrimary">{formatDate(task.endTime)}</div>
                  </div>
                )}
                {task.duration && (
                  <div className="p-3 bg-bolt-elements-background-depth-2 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-bolt-elements-textSecondary mb-1">
                      <i className="i-ph:timer"></i>
                      Duration
                    </div>
                    <div className="text-bolt-elements-textPrimary">{formatDuration(task.duration)}</div>
                  </div>
                )}
              </div>

              {/* Recurrence */}
              {task.recurrence && task.recurrence !== 'none' && (
                <div className="p-3 bg-bolt-elements-background-depth-2 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-bolt-elements-textSecondary mb-1">
                    <i className="i-ph:refresh"></i>
                    Recurrence
                  </div>
                  <div className="text-bolt-elements-textPrimary capitalize">{task.recurrence}</div>
                </div>
              )}

              {/* Result */}
              {task.result && (
                <div>
                  <h4 className="text-sm font-medium text-bolt-elements-textSecondary mb-2">Result</h4>
                  <div className="p-3 bg-bolt-elements-background-depth-2 rounded-lg text-bolt-elements-textPrimary whitespace-pre-wrap font-mono text-sm">
                    {task.result}
                  </div>
                </div>
              )}

              {/* Error */}
              {task.error && (
                <div>
                  <h4 className="text-sm font-medium text-bolt-elements-textSecondary mb-2">Error</h4>
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 whitespace-pre-wrap font-mono text-sm">
                    {task.error}
                  </div>
                </div>
              )}

              {/* Notifications */}
              <div className="flex items-center gap-2">
                <i className={`${task.notifications ? 'i-ph:bell text-green-500' : 'i-ph:bell-slash text-gray-500'}`}></i>
                <span className="text-sm text-bolt-elements-textSecondary">
                  Notifications {task.notifications ? 'enabled' : 'disabled'}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-bolt-elements-borderColor bg-bolt-elements-background-depth-2">
              {isEditing ? (
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-bolt-elements-textSecondary bg-bolt-elements-background-depth-1 rounded-lg hover:bg-bolt-elements-background-depth-3 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-bolt-elements-primary rounded-lg hover:bg-bolt-elements-primary/90 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {task.status === 'pending' && (
                    <button
                      onClick={handleCancelTask}
                      className="px-4 py-2 text-sm font-medium text-yellow-500 bg-yellow-500/10 rounded-lg hover:bg-yellow-500/20 transition-colors"
                    >
                      <i className="i-ph:stop mr-1"></i>
                      Cancel Task
                    </button>
                  )}
                  {(task.status === 'completed' || task.status === 'failed' || task.status === 'cancelled') && (
                    <button
                      onClick={handleRerunTask}
                      className="px-4 py-2 text-sm font-medium text-blue-500 bg-blue-500/10 rounded-lg hover:bg-blue-500/20 transition-colors"
                    >
                      <i className="i-ph:arrow-clockwise mr-1"></i>
                      Run Again
                    </button>
                  )}
                  {task.status !== 'running' && (
                    <button
                      onClick={handleDeleteTask}
                      className="px-4 py-2 text-sm font-medium text-red-500 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-colors"
                    >
                      <i className="i-ph:trash mr-1"></i>
                      Delete
                    </button>
                  )}
                  <div className="flex-1"></div>
                  {task.status === 'pending' && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 text-sm font-medium text-bolt-elements-textSecondary bg-bolt-elements-background-depth-1 rounded-lg hover:bg-bolt-elements-background-depth-3 transition-colors"
                    >
                      <i className="i-ph:pencil mr-1"></i>
                      Edit
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
