#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { watch } = require('fs');

const CLAUDE_TODOS_DIR = path.join(process.env.HOME, '.claude/todos');
const NOTIFICATION_API = 'http://localhost:3456/api/claude-task-complete';
const CHECK_INTERVAL = 2000; // Check every 2 seconds

// Store the state of todos to detect changes
const todoStates = new Map();
let sessionStartTime = Date.now();

// Helper to read all todo files
async function readAllTodos() {
  try {
    const files = await fs.promises.readdir(CLAUDE_TODOS_DIR);
    const todos = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        try {
          const content = await fs.promises.readFile(
            path.join(CLAUDE_TODOS_DIR, file), 
            'utf8'
          );
          const data = JSON.parse(content);
          if (Array.isArray(data) && data.length > 0) {
            todos.push({ file, todos: data, mtime: Date.now() });
          }
        } catch (e) {
          // Skip invalid files
        }
      }
    }
    
    return todos;
  } catch (error) {
    console.error('Error reading todos:', error);
    return [];
  }
}

// Send notification for completed task
async function sendNotification(task, success = true) {
  try {
    const response = await fetch(NOTIFICATION_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        task: task.content,
        response: `Task ${task.status}: ${task.content}`,
        success: success
      })
    });
    
    const result = await response.json();
    if (result.success) {
      console.log(`📱 SMS sent for: ${task.content}`);
      console.log(`   Message: ${result.sentMessage}`);
      console.log(`   Quota remaining: ${result.quotaRemaining}`);
    } else {
      console.error(`❌ SMS failed:`, result.error);
    }
  } catch (error) {
    console.error('Failed to send notification:', error.message);
  }
}

// Check for task status changes
async function checkForCompletions() {
  const allTodoFiles = await readAllTodos();
  
  for (const todoFile of allTodoFiles) {
    const fileKey = todoFile.file;
    const previousState = todoStates.get(fileKey);
    
    // Store current state
    todoStates.set(fileKey, JSON.stringify(todoFile.todos));
    
    // Skip if this is the first time we see this file
    if (!previousState) continue;
    
    // Compare with previous state
    const prevTodos = JSON.parse(previousState);
    
    for (const currentTodo of todoFile.todos) {
      const prevTodo = prevTodos.find(t => t.id === currentTodo.id);
      
      if (prevTodo) {
        // Check if status changed to completed
        if (prevTodo.status !== 'completed' && currentTodo.status === 'completed') {
          console.log(`✅ Task completed: ${currentTodo.content}`);
          await sendNotification(currentTodo, true);
        }
        // Check if status changed from in_progress to pending (might indicate failure)
        else if (prevTodo.status === 'in_progress' && currentTodo.status === 'pending') {
          console.log(`⚠️  Task reverted: ${currentTodo.content}`);
          // Optionally send notification for reverted tasks
        }
      } else {
        // New todo added
        if (currentTodo.status === 'completed') {
          // New todo that's already completed
          console.log(`✅ New completed task: ${currentTodo.content}`);
          await sendNotification(currentTodo, true);
        }
      }
    }
  }
}

// Monitor for new sessions (check if there's at least one active task)
async function checkActiveSession() {
  const allTodoFiles = await readAllTodos();
  
  for (const todoFile of allTodoFiles) {
    // Check if any task is in_progress
    const hasActiveTasks = todoFile.todos.some(t => t.status === 'in_progress');
    if (hasActiveTasks) {
      return true;
    }
    
    // Check if file was modified recently (within last 5 minutes)
    const stat = await fs.promises.stat(path.join(CLAUDE_TODOS_DIR, todoFile.file));
    if (Date.now() - stat.mtimeMs < 5 * 60 * 1000) {
      return true;
    }
  }
  
  return false;
}

// Main monitoring loop
async function startMonitoring() {
  console.log('🔍 Claude Task Monitor Started');
  console.log(`📁 Watching: ${CLAUDE_TODOS_DIR}`);
  console.log('📱 SMS notifications will be sent when tasks complete\n');
  
  // Initial read
  await checkForCompletions();
  
  // Set up file watcher for immediate updates
  const watcher = watch(CLAUDE_TODOS_DIR, async (eventType, filename) => {
    if (filename && filename.endsWith('.json')) {
      console.log(`📝 Todo file changed: ${filename}`);
      // Small delay to ensure file write is complete
      setTimeout(() => checkForCompletions(), 100);
    }
  });
  
  // Also check periodically in case watcher misses something
  const interval = setInterval(checkForCompletions, CHECK_INTERVAL);
  
  // Cleanup on exit
  process.on('SIGINT', () => {
    console.log('\n👋 Stopping Claude monitor...');
    watcher.close();
    clearInterval(interval);
    process.exit(0);
  });
  
  // Log periodic status
  setInterval(async () => {
    const isActive = await checkActiveSession();
    if (isActive) {
      console.log(`⏰ ${new Date().toLocaleTimeString()} - Monitoring active Claude session...`);
    }
  }, 30000); // Every 30 seconds
}

// Check if notification service is running
async function checkNotificationService() {
  try {
    const response = await fetch('http://localhost:3456/api/test');
    const data = await response.json();
    if (data.status === 'ok') {
      console.log('✅ Notification service is running\n');
      return true;
    }
  } catch (error) {
    console.error('❌ Notification service is not running!');
    console.error('   Please start it with: cd ~/claude-notifications && npm start\n');
    return false;
  }
}

// Start the monitor
async function main() {
  console.log('Claude Task Monitor with SMS Notifications\n');
  
  // Check if notification service is running
  const serviceRunning = await checkNotificationService();
  if (!serviceRunning) {
    console.log('⚠️  Warning: Notification service may not be running');
    console.log('   Continuing anyway...\n');
  }
  
  // Check if Claude todos directory exists
  if (!fs.existsSync(CLAUDE_TODOS_DIR)) {
    console.error(`❌ Claude todos directory not found: ${CLAUDE_TODOS_DIR}`);
    console.error('   Please run Claude at least once to create this directory.\n');
    process.exit(1);
  }
  
  startMonitoring();
}

main().catch(console.error);