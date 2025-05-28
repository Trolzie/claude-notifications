#!/usr/bin/env node

/**
 * Claude Notification Wrapper
 * 
 * This script can be used to wrap Claude commands and automatically send SMS notifications
 * when tasks are completed.
 * 
 * Usage:
 * 1. Direct: node claude-notify-wrapper.js "Your task for Claude"
 * 2. With Claude CLI: claude-notify "Your task for Claude"
 * 3. As a function in your shell: claude-notify() { node /path/to/claude-notify-wrapper.js "$@"; }
 */

const { spawn } = require('child_process');
const readline = require('readline');

const NOTIFICATION_API = 'http://localhost:3456/api/claude-task-complete';

async function sendNotification(task, response, success) {
  try {
    const res = await fetch(NOTIFICATION_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        task: task,
        response: response,
        success: success
      })
    });
    
    const result = await res.json();
    if (result.success) {
      console.log('\n📱 SMS notification sent:', result.sentMessage);
    } else {
      console.log('\n⚠️  SMS notification failed:', result.error);
    }
  } catch (error) {
    console.error('\n❌ Failed to send notification:', error.message);
  }
}

// Function to extract key information from Claude's response
function extractKeyInfo(output) {
  // Look for common completion indicators
  const completionPhrases = [
    'completed successfully',
    'finished',
    'done',
    'created',
    'updated',
    'fixed',
    'implemented',
    'task complete',
    'error:',
    'failed'
  ];
  
  // Extract the last few meaningful lines
  const lines = output.split('\n').filter(line => line.trim());
  const lastLines = lines.slice(-5).join(' ');
  
  // Check if task succeeded or failed
  const success = !output.toLowerCase().includes('error') && 
                  !output.toLowerCase().includes('failed');
  
  return {
    summary: lastLines.substring(0, 200),
    success: success
  };
}

// Main function
async function main() {
  const task = process.argv.slice(2).join(' ');
  
  if (!task) {
    console.log('Usage: claude-notify "Your task for Claude"');
    process.exit(1);
  }
  
  console.log(`🤖 Starting Claude with task: ${task}\n`);
  
  // Here you would integrate with your Claude CLI
  // For demonstration, we'll simulate a Claude response
  // In real usage, replace this with actual Claude CLI integration
  
  let output = '';
  
  // Example: If you have a Claude CLI command, use this instead:
  /*
  const claude = spawn('claude', [task], {
    stdio: ['inherit', 'pipe', 'inherit']
  });
  
  claude.stdout.on('data', (data) => {
    process.stdout.write(data);
    output += data.toString();
  });
  
  claude.on('close', async (code) => {
    const { summary, success } = extractKeyInfo(output);
    await sendNotification(task, summary, success && code === 0);
    process.exit(code);
  });
  */
  
  // For testing, simulate a response
  console.log('Simulating Claude task execution...');
  setTimeout(async () => {
    const simulatedResponse = `Task analysis complete. Created SMS notification system with condensed messaging.`;
    console.log(simulatedResponse);
    
    const { summary, success } = extractKeyInfo(simulatedResponse);
    await sendNotification(task, summary, success);
  }, 1000);
}

main().catch(console.error);