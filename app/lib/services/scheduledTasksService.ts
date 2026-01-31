import { createScopedLogger } from '~/utils/logger';

const logger = createScopedLogger('ScheduledTasks');

export interface ScheduledTask {
  id: string;
  name: string;
  description: string;
  type: 'refactor' | 'build' | 'test' | 'audit' | 'deploy';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  scheduledTime: number;
  startTime?: number;
  endTime?: number;
  duration?: number;
  progress?: number;
  result?: string;
  error?: string;
  notifications: boolean;
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
}

export interface TaskResult {
  success: boolean;
  message: string;
  details?: any;
}

export class ScheduledTasksService {
  private static _instance: ScheduledTasksService;
  private _tasks: ScheduledTask[] = [];
  private _taskInterval: number = 60000; // Check every minute
  private _intervalId: NodeJS.Timeout | null = null;

  static getInstance(): ScheduledTasksService {
    if (!ScheduledTasksService._instance) {
      ScheduledTasksService._instance = new ScheduledTasksService();
    }

    return ScheduledTasksService._instance;
  }

  private constructor() {
    this._loadTasks();
    this._startTaskScheduler();
  }

  /**
   * Load tasks from storage
   */
  private _loadTasks(): void {
    try {
      const stored = localStorage.getItem('scheduledTasks');

      if (stored) {
        this._tasks = JSON.parse(stored);
      }
    } catch (error) {
      logger.error('Failed to load tasks:', error);
      this._tasks = [];
    }
  }

  /**
   * Save tasks to storage
   */
  private _saveTasks(): void {
    try {
      localStorage.setItem('scheduledTasks', JSON.stringify(this._tasks));
    } catch (error) {
      logger.error('Failed to save tasks:', error);
    }
  }

  /**
   * Start the task scheduler
   */
  private _startTaskScheduler(): void {
    this._intervalId = setInterval(() => {
      this._checkScheduledTasks();
    }, this._taskInterval);

    logger.info('Task scheduler started');
  }

  /**
   * Stop the task scheduler
   */
  stopScheduler(): void {
    if (this._intervalId) {
      clearInterval(this._intervalId);
      this._intervalId = null;
      logger.info('Task scheduler stopped');
    }
  }

  /**
   * Check and run scheduled tasks
   */
  private async _checkScheduledTasks(): Promise<void> {
    const now = Date.now();

    for (const task of this._tasks) {
      if (task.status === 'pending' && now >= task.scheduledTime) {
        await this._runTask(task.id);
      }
    }
  }

  /**
   * Run a specific task
   */
  private async _runTask(taskId: string): Promise<void> {
    const task = this._tasks.find((t) => t.id === taskId);

    if (!task) {
      logger.error(`Task ${taskId} not found`);
      return;
    }

    task.status = 'running';
    task.startTime = Date.now();
    task.progress = 0;
    this._saveTasks();

    try {
      const result = await this._executeTask(task);

      task.status = result.success ? 'completed' : 'failed';
      task.endTime = Date.now();
      task.duration = task.endTime - task.startTime;
      task.progress = 100;
      task.result = result.message;

      if (result.details) {
        task.result = `${result.message}\n\n${JSON.stringify(result.details, null, 2)}`;
      }

      if (!result.success) {
        task.error = result.message;
      }

      this._saveTasks();

      if (task.notifications) {
        this._sendNotification(task);
      }

      logger.info(`Task ${task.name} completed in ${task.duration}ms`);
    } catch (error) {
      task.status = 'failed';
      task.endTime = Date.now();
      task.duration = task.endTime - task.startTime;
      task.progress = 100;
      task.error = error instanceof Error ? error.message : 'Unknown error';
      this._saveTasks();

      if (task.notifications) {
        this._sendNotification(task);
      }

      logger.error(`Task ${task.name} failed:`, error);
    }
  }

  /**
   * Execute task logic
   */
  private async _executeTask(task: ScheduledTask): Promise<TaskResult> {
    // Simulate task execution with progress updates
    const progressInterval = setInterval(() => {
      if (task.progress && task.progress < 100) {
        task.progress = Math.min(task.progress + Math.floor(Math.random() * 20), 100);
        this._saveTasks();
      }
    }, 2000);

    try {
      // Simulate task duration based on type
      const durationMap = {
        refactor: 15000,
        build: 10000,
        test: 8000,
        audit: 12000,
        deploy: 18000,
      };

      const duration = durationMap[task.type] || 10000;
      await new Promise((resolve) => setTimeout(resolve, duration));

      clearInterval(progressInterval);

      // Randomly fail some tasks for testing
      const shouldFail = Math.random() < 0.1; // 10% failure rate

      if (shouldFail) {
        throw new Error(`Simulated failure for task type: ${task.type}`);
      }

      return {
        success: true,
        message: `Task completed successfully`,
        details: {
          duration,
          filesProcessed: Math.floor(Math.random() * 100),
          changesMade: Math.floor(Math.random() * 20),
          errorsFound: Math.floor(Math.random() * 5),
        },
      };
    } catch (error) {
      clearInterval(progressInterval);
      throw error;
    }
  }

  /**
   * Send notification for task completion/failure
   */
  private _sendNotification(task: ScheduledTask): void {
    if (!('Notification' in window)) {
      logger.warn('Notifications not supported');
      return;
    }

    if (Notification.permission === 'granted') {
      const title = task.status === 'completed' ? `Task Completed: ${task.name}` : `Task Failed: ${task.name}`;

      const body =
        task.status === 'completed'
          ? `Task finished successfully in ${Math.round(task.duration! / 1000)} seconds`
          : `Task failed: ${task.error}`;

      new Notification(title, {
        body,
        icon: task.status === 'completed' ? '/icons/success.svg' : '/icons/error.svg',
        tag: `task-${task.id}`,
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }

  /**
   * Create a new scheduled task
   */
  createTask(
    task: Omit<ScheduledTask, 'id' | 'status' | 'startTime' | 'endTime' | 'duration' | 'progress' | 'result' | 'error'>,
  ): ScheduledTask {
    const newTask: ScheduledTask = {
      ...task,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
      progress: 0,
    };

    this._tasks.push(newTask);
    this._saveTasks();

    logger.info(`Task created: ${task.name}`);

    return newTask;
  }

  /**
   * Get all tasks
   */
  getTasks(): ScheduledTask[] {
    return [...this._tasks];
  }

  /**
   * Get task by ID
   */
  getTaskById(id: string): ScheduledTask | undefined {
    return this._tasks.find((task) => task.id === id);
  }

  /**
   * Get tasks by status
   */
  getTasksByStatus(status: ScheduledTask['status']): ScheduledTask[] {
    return this._tasks.filter((task) => task.status === status);
  }

  /**
   * Get tasks by type
   */
  getTasksByType(type: ScheduledTask['type']): ScheduledTask[] {
    return this._tasks.filter((task) => task.type === type);
  }

  /**
   * Cancel a task
   */
  cancelTask(id: string): boolean {
    const task = this._tasks.find((task) => task.id === id);

    if (task && (task.status === 'pending' || task.status === 'running')) {
      task.status = 'cancelled';
      this._saveTasks();
      logger.info(`Task cancelled: ${task.name}`);

      return true;
    }

    return false;
  }

  /**
   * Delete a task
   */
  deleteTask(id: string): boolean {
    const taskIndex = this._tasks.findIndex((task) => task.id === id);

    if (taskIndex !== -1) {
      const task = this._tasks[taskIndex];

      if (task.status === 'running') {
        logger.warn(`Cannot delete running task: ${task.name}`);
        return false;
      }

      this._tasks.splice(taskIndex, 1);
      this._saveTasks();
      logger.info(`Task deleted: ${task.name}`);

      return true;
    }

    return false;
  }

  /**
   * Update task
   */
  updateTask(id: string, updates: Partial<ScheduledTask>): boolean {
    const task = this._tasks.find((task) => task.id === id);

    if (task) {
      Object.assign(task, updates);
      this._saveTasks();
      logger.info(`Task updated: ${task.name}`);

      return true;
    }

    return false;
  }

  /**
   * Get task statistics
   */
  getStatistics(): {
    total: number;
    pending: number;
    running: number;
    completed: number;
    failed: number;
    cancelled: number;
    averageDuration: number;
  } {
    const total = this._tasks.length;
    const pending = this.getTasksByStatus('pending').length;
    const running = this.getTasksByStatus('running').length;
    const completed = this.getTasksByStatus('completed').length;
    const failed = this.getTasksByStatus('failed').length;
    const cancelled = this.getTasksByStatus('cancelled').length;

    const completedTasks = this.getTasksByStatus('completed');
    const averageDuration =
      completedTasks.length > 0
        ? Math.round(completedTasks.reduce((sum, task) => sum + (task.duration || 0), 0) / completedTasks.length)
        : 0;

    return {
      total,
      pending,
      running,
      completed,
      failed,
      cancelled,
      averageDuration,
    };
  }

  /**
   * Clear completed tasks
   */
  clearCompletedTasks(): void {
    this._tasks = this._tasks.filter(
      (task) => task.status !== 'completed' && task.status !== 'failed' && task.status !== 'cancelled',
    );
    this._saveTasks();
    logger.info('Completed tasks cleared');
  }

  /**
   * Request notification permission
   */
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if ('Notification' in window) {
      return await Notification.requestPermission();
    }

    return 'denied';
  }

  /**
   * Check if notifications are available and granted
   */
  hasNotificationPermission(): boolean {
    return 'Notification' in window && Notification.permission === 'granted';
  }
}

export const scheduledTasksService = ScheduledTasksService.getInstance();
