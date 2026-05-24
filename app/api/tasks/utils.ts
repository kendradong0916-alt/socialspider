// app/api/tasks/utils.ts
// Shared utilities for task management

// Simple in-memory storage for tasks
export const tasks: Record<string, any> = {};

// Task state storage
export const taskStates: Record<string, any> = {};

// Get task information
export function getTaskInfo(taskId: string) {
  return tasks[taskId] || null;
}

// Update task information
export function updateTask(taskId: string, updates: any) {
  if (tasks[taskId]) {
    tasks[taskId] = { ...tasks[taskId], ...updates };
    return tasks[taskId];
  }
  return null;
}

// Initialize task state
export function initializeTaskState(taskId: string, data: any) {
  taskStates[taskId] = {
    ...data,
    created_at: new Date().toISOString(),
  };
}

// Update task state
export function updateTaskState(taskId: string, updates: any) {
  if (taskStates[taskId]) {
    taskStates[taskId] = {
      ...taskStates[taskId],
      ...updates,
    };
  }
}
