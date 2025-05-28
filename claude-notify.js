/**
 * Simple Claude SMS Notifier
 * 
 * Call this function from Claude when a task is complete:
 * node /path/to/claude-notify.js "task description" "task result"
 */

async function notifyTaskComplete(task, result) {
  try {
    const response = await fetch('http://localhost:3456/api/claude-task-complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        task: task || 'Claude task',
        response: result || 'Task completed',
        success: true
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ SMS sent: ${data.sentMessage}`);
      console.log(`📱 Remaining quota: ${data.quotaRemaining}`);
    } else {
      console.log(`❌ SMS failed: ${data.error}`);
    }
  } catch (error) {
    console.error('Failed to send notification:', error.message);
  }
}

// Get command line arguments
const task = process.argv[2] || 'Claude task completed';
const result = process.argv[3] || 'Successfully completed the requested task';

// Send the notification
notifyTaskComplete(task, result);