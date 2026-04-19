#!/usr/bin/env node
/**
 * Async Subagent Orchestrator
 *
 * Central coordinator for managing multiple async agents with state persistence,
 * dependency resolution, and intelligent error handling for deployment automation.
 *
 * Features:
 * - Task queue with priority management
 * - Agent state persistence (SQLite-based)
 * - Dependency resolution between agents
 * - Error handling with automatic retry
 * - Concurrent execution management
 * - YOLO mode fallbacks and healing
 */

import Database from 'better-sqlite3';
import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';

interface AgentTask {
  id: string;
  agentType: string;
  task: string;
  priority: number;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'retrying';
  dependencies?: string[];
  retryCount: number;
  maxRetries: number;
  timeout: number;
  result?: any;
  error?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

interface AgentConfig {
  maxConcurrent: number;
  defaultTimeout: number;
  defaultRetries: number;
  retryDelay: number;
  stateFile: string;
}

export class AgentOrchestrator extends EventEmitter {
  private db: Database.Database;
  private config: AgentConfig;
  private runningTasks: Map<string, ChildProcess> = new Map();
  private taskQueue: AgentTask[] = [];
  private isProcessing: boolean = false;

  constructor(config: Partial<AgentConfig> = {}) {
    super();
    this.config = {
      maxConcurrent: config.maxConcurrent || 3,
      defaultTimeout: config.defaultTimeout || 300000, // 5 minutes
      defaultRetries: config.defaultRetries || 3,
      retryDelay: config.retryDelay || 5000, // 5 seconds
      stateFile: config.stateFile || '.agent-orchestrator-state.db'
    };

    // Initialize SQLite database for state persistence
    this.db = new Database(this.config.stateFile);
    this.initializeDatabase();
  }

  private initializeDatabase(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS agent_tasks (
        id TEXT PRIMARY KEY,
        agent_type TEXT NOT NULL,
        task TEXT NOT NULL,
        priority INTEGER NOT NULL,
        status TEXT NOT NULL,
        dependencies TEXT,
        retry_count INTEGER DEFAULT 0,
        max_retries INTEGER NOT NULL,
        timeout INTEGER NOT NULL,
        result TEXT,
        error TEXT,
        created_at TEXT NOT NULL,
        started_at TEXT,
        completed_at TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_status ON agent_tasks(status);
      CREATE INDEX IF NOT EXISTS idx_priority ON agent_tasks(priority);
      CREATE INDEX IF NOT EXISTS idx_agent_type ON agent_tasks(agent_type);
    `);
  }

  /**
   * Schedule a new agent task for execution
   */
  async scheduleAgentTask(
    agentType: string,
    task: string,
    options: {
      priority?: number;
      dependencies?: string[];
      timeout?: number;
      maxRetries?: number;
    } = {}
  ): Promise<string> {
    const taskId = `${agentType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const agentTask: AgentTask = {
      id: taskId,
      agentType,
      task,
      priority: options.priority || 5,
      status: 'pending',
      dependencies: options.dependencies,
      retryCount: 0,
      maxRetries: options.maxRetries || this.config.defaultRetries,
      timeout: options.timeout || this.config.defaultTimeout,
      createdAt: new Date()
    };

    // Store in database
    const stmt = this.db.prepare(`
      INSERT INTO agent_tasks
      (id, agent_type, task, priority, status, dependencies, max_retries, timeout, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      agentTask.id,
      agentTask.agentType,
      agentTask.task,
      agentTask.priority,
      agentTask.status,
      JSON.stringify(agentTask.dependencies),
      agentTask.maxRetries,
      agentTask.timeout,
      agentTask.createdAt.toISOString()
    );

    this.emit('taskScheduled', agentTask);

    // Trigger processing if not already running
    if (!this.isProcessing) {
      this.processQueue().catch(err => this.emit('error', err));
    }

    return taskId;
  }

  /**
   * Monitor agent execution progress
   */
  async monitorAgentExecution(taskId: string): Promise<AgentTask | null> {
    const stmt = this.db.prepare('SELECT * FROM agent_tasks WHERE id = ?');
    const row = stmt.get(taskId) as any;

    if (!row) return null;

    return {
      id: row.id,
      agentType: row.agent_type,
      task: row.task,
      priority: row.priority,
      status: row.status,
      dependencies: row.dependencies ? JSON.parse(row.dependencies) : [],
      retryCount: row.retry_count,
      maxRetries: row.max_retries,
      timeout: row.timeout,
      result: row.result ? JSON.parse(row.result) : undefined,
      error: row.error,
      createdAt: new Date(row.created_at),
      startedAt: row.started_at ? new Date(row.started_at) : undefined,
      completedAt: row.completed_at ? new Date(row.completed_at) : undefined
    };
  }

  /**
   * Handle agent failure with intelligent retry
   */
  async handleAgentFailure(taskId: string, fallbackStrategy: 'retry' | 'skip' | 'abort' = 'retry'): Promise<void> {
    const task = await this.monitorAgentExecution(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    if (fallbackStrategy === 'retry' && task.retryCount < task.maxRetries) {
      // Update task for retry
      const stmt = this.db.prepare(`
        UPDATE agent_tasks
        SET status = 'retrying',
            retry_count = retry_count + 1,
            started_at = NULL
        WHERE id = ?
      `);
      stmt.run(taskId);

      // Re-queue the task
      setTimeout(() => {
        this.processQueue().catch(err => this.emit('error', err));
      }, this.config.retryDelay);

      this.emit('taskRetry', task);
    } else if (fallbackStrategy === 'skip') {
      // Mark as failed but don't retry
      await this.markTaskFailed(taskId, 'Skipped due to fallback strategy');
    } else {
      // Abort and emit error
      await this.markTaskFailed(taskId, 'Aborted due to failure fallback strategy');
      this.emit('taskAborted', task);
    }
  }

  /**
   * Aggregate results from multiple agent tasks
   */
  async aggregateAgentResults(taskIds: string[]): Promise<Map<string, any>> {
    const results = new Map<string, any>();

    for (const taskId of taskIds) {
      const task = await this.monitorAgentExecution(taskId);
      if (task && task.status === 'completed' && task.result) {
        results.set(taskId, task.result);
      }
    }

    return results;
  }

  /**
   * Process the task queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      while (true) {
        // Check if we can run more tasks
        if (this.runningTasks.size >= this.config.maxConcurrent) {
          await this.waitForTaskCompletion();
          continue;
        }

        // Get next task to run
        const task = await this.getNextTask();
        if (!task) {
          // No more tasks to process
          break;
        }

        // Execute the task
        this.executeTask(task).catch(err => {
          console.error(`Task execution error: ${err.message}`);
          this.handleAgentFailure(task.id, 'retry').catch(console.error);
        });
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Get the next task to execute based on priority and dependencies
   */
  private async getNextTask(): Promise<AgentTask | null> {
    // Get pending tasks sorted by priority (higher priority first)
    const stmt = this.db.prepare(`
      SELECT * FROM agent_tasks
      WHERE status = 'pending'
      ORDER BY priority DESC, created_at ASC
      LIMIT 10
    `);

    const rows = stmt.all() as any[];

    for (const row of rows) {
      const task: AgentTask = {
        id: row.id,
        agentType: row.agent_type,
        task: row.task,
        priority: row.priority,
        status: row.status,
        dependencies: row.dependencies ? JSON.parse(row.dependencies) : [],
        retryCount: row.retry_count,
        maxRetries: row.max_retries,
        timeout: row.timeout,
        result: row.result ? JSON.parse(row.result) : undefined,
        error: row.error,
        createdAt: new Date(row.created_at),
        startedAt: row.started_at ? new Date(row.started_at) : undefined,
        completedAt: row.completed_at ? new Date(row.completed_at) : undefined
      };

      // Check if dependencies are met
      if (await this.areDependenciesMet(task)) {
        return task;
      }
    }

    return null;
  }

  /**
   * Check if task dependencies are met
   */
  private async areDependenciesMet(task: AgentTask): Promise<boolean> {
    if (!task.dependencies || task.dependencies.length === 0) {
      return true;
    }

    for (const depId of task.dependencies) {
      const depTask = await this.monitorAgentExecution(depId);
      if (!depTask || depTask.status !== 'completed') {
        return false;
      }
    }

    return true;
  }

  /**
   * Execute a single task
   */
  private async executeTask(task: AgentTask): Promise<void> {
    // Mark task as running
    const updateStmt = this.db.prepare(`
      UPDATE agent_tasks
      SET status = 'running', started_at = ?
      WHERE id = ?
    `);
    updateStmt.run(new Date().toISOString(), task.id);

    this.emit('taskStarted', task);

    // Execute the task based on agent type
    try {
      const result = await this.executeAgentTask(task);

      // Mark as completed
      await this.markTaskCompleted(task.id, result);
      this.emit('taskCompleted', task);
    } catch (error) {
      // Mark as failed
      await this.markTaskFailed(task.id, error.message);
      this.emit('taskFailed', task);
      throw error;
    }
  }

  /**
   * Execute agent task based on type
   */
  private async executeAgentTask(task: AgentTask): Promise<any> {
    switch (task.agentType) {
      case 'deploy-easypanel':
        return this.executeEasypanelDeployment(task);
      case 'deploy-vercel':
        return this.executeVercelDeployment(task);
      case 'visual-test':
        return this.executeVisualTest(task);
      case 'route-validation':
        return this.executeRouteValidation(task);
      case 'health-check':
        return this.executeHealthCheck(task);
      default:
        throw new Error(`Unknown agent type: ${task.agentType}`);
    }
  }

  /**
   * Execute Easypanel deployment task
   */
  private async executeEasypanelDeployment(task: AgentTask): Promise<any> {
    return new Promise((resolve, reject) => {
      const proc = spawn('yarn', ['easypanel:deploy'], {
        stdio: 'pipe',
        timeout: task.timeout
      });

      this.runningTasks.set(task.id, proc);

      let output = '';
      let error = '';

      proc.stdout?.on('data', (data) => {
        output += data.toString();
        this.emit('taskProgress', { taskId: task.id, data: data.toString() });
      });

      proc.stderr?.on('data', (data) => {
        error += data.toString();
      });

      proc.on('close', (code) => {
        this.runningTasks.delete(task.id);
        if (code === 0) {
          resolve({ success: true, output });
        } else {
          reject(new Error(`Easypanel deployment failed with code ${code}: ${error}`));
        }
      });

      proc.on('error', (err) => {
        this.runningTasks.delete(task.id);
        reject(new Error(`Easypanel deployment error: ${err.message}`));
      });
    });
  }

  /**
   * Execute Vercel deployment task
   */
  private async executeVercelDeployment(task: AgentTask): Promise<any> {
    return new Promise((resolve, reject) => {
      const proc = spawn('yarn', ['vercel:deploy'], {
        stdio: 'pipe',
        timeout: task.timeout
      });

      this.runningTasks.set(task.id, proc);

      let output = '';
      let error = '';

      proc.stdout?.on('data', (data) => {
        output += data.toString();
        this.emit('taskProgress', { taskId: task.id, data: data.toString() });
      });

      proc.stderr?.on('data', (data) => {
        error += data.toString();
      });

      proc.on('close', (code) => {
        this.runningTasks.delete(task.id);
        if (code === 0) {
          resolve({ success: true, output });
        } else {
          reject(new Error(`Vercel deployment failed with code ${code}: ${error}`));
        }
      });

      proc.on('error', (err) => {
        this.runningTasks.delete(task.id);
        reject(new Error(`Vercel deployment error: ${err.message}`));
      });
    });
  }

  /**
   * Execute visual testing task
   */
  private async executeVisualTest(task: AgentTask): Promise<any> {
    return new Promise((resolve, reject) => {
      const proc = spawn('node', ['scripts/visual-testing.mts', ...task.task.split(' ')], {
        stdio: 'pipe',
        timeout: task.timeout
      });

      this.runningTasks.set(task.id, proc);

      let output = '';
      let error = '';

      proc.stdout?.on('data', (data) => {
        output += data.toString();
        this.emit('taskProgress', { taskId: task.id, data: data.toString() });
      });

      proc.stderr?.on('data', (data) => {
        error += data.toString();
      });

      proc.on('close', (code) => {
        this.runningTasks.delete(task.id);
        if (code === 0) {
          resolve({ success: true, output });
        } else {
          reject(new Error(`Visual testing failed with code ${code}: ${error}`));
        }
      });

      proc.on('error', (err) => {
        this.runningTasks.delete(task.id);
        reject(new Error(`Visual testing error: ${err.message}`));
      });
    });
  }

  /**
   * Execute route validation task
   */
  private async executeRouteValidation(task: AgentTask): Promise<any> {
    return new Promise((resolve, reject) => {
      const proc = spawn('node', ['scripts/route-validation.mts', ...task.task.split(' ')], {
        stdio: 'pipe',
        timeout: task.timeout
      });

      this.runningTasks.set(task.id, proc);

      let output = '';
      let error = '';

      proc.stdout?.on('data', (data) => {
        output += data.toString();
        this.emit('taskProgress', { taskId: task.id, data: data.toString() });
      });

      proc.stderr?.on('data', (data) => {
        error += data.toString();
      });

      proc.on('close', (code) => {
        this.runningTasks.delete(task.id);
        if (code === 0) {
          resolve({ success: true, output });
        } else {
          reject(new Error(`Route validation failed with code ${code}: ${error}`));
        }
      });

      proc.on('error', (err) => {
        this.runningTasks.delete(task.id);
        reject(new Error(`Route validation error: ${err.message}`));
      });
    });
  }

  /**
   * Execute health check task
   */
  private async executeHealthCheck(task: AgentTask): Promise<any> {
    return new Promise((resolve, reject) => {
      const proc = spawn('yarn', ['easypanel:health'], {
        stdio: 'pipe',
        timeout: task.timeout
      });

      this.runningTasks.set(task.id, proc);

      let output = '';
      let error = '';

      proc.stdout?.on('data', (data) => {
        output += data.toString();
        this.emit('taskProgress', { taskId: task.id, data: data.toString() });
      });

      proc.stderr?.on('data', (data) => {
        error += data.toString();
      });

      proc.on('close', (code) => {
        this.runningTasks.delete(task.id);
        if (code === 0) {
          resolve({ success: true, output });
        } else {
          reject(new Error(`Health check failed with code ${code}: ${error}`));
        }
      });

      proc.on('error', (err) => {
        this.runningTasks.delete(task.id);
        reject(new Error(`Health check error: ${err.message}`));
      });
    });
  }

  /**
   * Mark task as completed
   */
  private async markTaskCompleted(taskId: string, result: any): Promise<void> {
    const stmt = this.db.prepare(`
      UPDATE agent_tasks
      SET status = 'completed',
          result = ?,
          completed_at = ?
      WHERE id = ?
    `);
    stmt.run(JSON.stringify(result), new Date().toISOString(), taskId);
  }

  /**
   * Mark task as failed
   */
  private async markTaskFailed(taskId: string, error: string): Promise<void> {
    const stmt = this.db.prepare(`
      UPDATE agent_tasks
      SET status = 'failed',
          error = ?,
          completed_at = ?
      WHERE id = ?
    `);
    stmt.run(error, new Date().toISOString(), taskId);
  }

  /**
   * Wait for task completion
   */
  private async waitForTaskCompletion(): Promise<void> {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (this.runningTasks.size < this.config.maxConcurrent) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
    });
  }

  /**
   * Cleanup and close database connection
   */
  async cleanup(): Promise<void> {
    // Kill all running tasks
    for (const [taskId, proc] of this.runningTasks) {
      proc.kill();
      await this.markTaskFailed(taskId, 'Killed during cleanup');
    }

    // Close database
    this.db.close();
  }

  /**
   * Get statistics
   */
  async getStats(): Promise<{
    total: number;
    pending: number;
    running: number;
    completed: number;
    failed: number;
    retrying: number;
  }> {
    const stmt = this.db.prepare(`
      SELECT status, COUNT(*) as count
      FROM agent_tasks
      GROUP BY status
    `);

    const rows = stmt.all() as any[];
    const stats = {
      total: 0,
      pending: 0,
      running: 0,
      completed: 0,
      failed: 0,
      retrying: 0
    };

    for (const row of rows) {
      stats[row.status] = row.count;
      stats.total += row.count;
    }

    return stats;
  }
}

/**
 * CLI interface for the orchestrator
 */
async function main() {
  const orchestrator = new AgentOrchestrator();

  // Example usage
  if (process.argv.includes('--test')) {
    console.log('Testing agent orchestrator...');

    // Schedule test tasks
    const healthTask = await orchestrator.scheduleAgentTask('health-check', 'check-all-platforms', {
      priority: 10
    });

    const deployTask = await orchestrator.scheduleAgentTask('deploy-easypanel', 'production', {
      priority: 8,
      dependencies: [healthTask]
    });

    const visualTask = await orchestrator.scheduleAgentTask('visual-test', '--compare', {
      priority: 6,
      dependencies: [deployTask]
    });

    console.log(`Scheduled tasks: ${healthTask}, ${deployTask}, ${visualTask}`);

    // Monitor progress
    const monitorInterval = setInterval(async () => {
      const stats = await orchestrator.getStats();
      console.log('Task stats:', stats);

      if (stats.running === 0 && stats.pending === 0) {
        clearInterval(monitorInterval);
        console.log('All tasks completed');

        // Get results
        const results = await orchestrator.aggregateAgentResults([healthTask, deployTask, visualTask]);
        console.log('Results:', results);

        await orchestrator.cleanup();
        process.exit(0);
      }
    }, 2000);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { AgentOrchestrator, AgentTask, AgentConfig };