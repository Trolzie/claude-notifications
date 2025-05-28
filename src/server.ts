import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { promises as fs } from 'fs';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3456;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Settings file path
const SETTINGS_FILE = path.join(process.cwd(), 'settings.json');

// Default settings
const defaultSettings = {
  enabled: false,
  phoneNumber: '',
  provider: 'textbelt',
  textbeltKey: 'textbelt'
};

// Load or create settings
async function loadSettings() {
  try {
    const data = await fs.readFile(SETTINGS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(defaultSettings, null, 2));
    return defaultSettings;
  }
}

// Save settings
async function saveSettings(settings: any) {
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2));
}

// Send SMS using TextBelt
async function sendSMS(phoneNumber: string, message: string, key: string = 'textbelt') {
  try {
    const response = await fetch('https://textbelt.com/text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: phoneNumber,
        message: message,
        key: key
      })
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('SMS send error:', error);
    return { success: false, error: error.message };
  }
}

// Routes
app.get('/api/settings', async (req, res) => {
  const settings = await loadSettings();
  res.json(settings);
});

app.post('/api/settings', async (req, res) => {
  const settings = { ...await loadSettings(), ...req.body };
  await saveSettings(settings);
  res.json({ success: true, settings });
});

app.post('/api/notify', async (req, res) => {
  const { message } = req.body;
  const settings = await loadSettings();
  
  if (!settings.enabled) {
    return res.json({ success: false, error: 'Notifications disabled' });
  }
  
  if (!settings.phoneNumber) {
    return res.json({ success: false, error: 'No phone number configured' });
  }
  
  const result = await sendSMS(
    settings.phoneNumber, 
    message || 'Claude task completed!',
    settings.textbeltKey
  );
  
  res.json(result);
});

// Condense message to fit SMS limits (160 chars)
function condenseMessage(message: string, maxLength: number = 160): string {
  // Remove URLs if present
  message = message.replace(/https?:\/\/[^\s]+/g, '[URL]');
  
  // Remove code blocks
  message = message.replace(/```[\s\S]*?```/g, '[CODE]');
  
  // Remove excessive whitespace
  message = message.replace(/\s+/g, ' ').trim();
  
  // If still too long, truncate with ellipsis
  if (message.length > maxLength - 3) {
    return message.substring(0, maxLength - 3) + '...';
  }
  
  return message;
}

app.post('/api/claude-task-complete', async (req, res) => {
  const { task, response, success } = req.body;
  const settings = await loadSettings();
  
  if (!settings.enabled) {
    return res.json({ success: false, error: 'Notifications disabled' });
  }
  
  if (!settings.phoneNumber) {
    return res.json({ success: false, error: 'No phone number configured' });
  }
  
  // Create a condensed message from Claude's response
  let smsMessage = '';
  
  if (success) {
    // Extract key information from the response
    const taskSummary = task ? `Task: ${task.substring(0, 30)}` : 'Task completed';
    const responseSummary = response ? condenseMessage(response, 100) : '';
    
    smsMessage = `Claude: ${taskSummary}. ${responseSummary}`.trim();
  } else {
    smsMessage = `Claude: Task failed. ${task ? task.substring(0, 50) : 'Unknown error'}`;
  }
  
  // Ensure the full message fits in 160 chars
  smsMessage = condenseMessage(smsMessage, 160);
  
  const result = await sendSMS(
    settings.phoneNumber, 
    smsMessage,
    settings.textbeltKey
  );
  
  res.json({ ...result, sentMessage: smsMessage });
});

app.get('/api/test', async (req, res) => {
  res.json({ status: 'ok', message: 'Claude notification service is running' });
});

app.listen(PORT, () => {
  console.log(`Claude notification service running at http://localhost:${PORT}`);
  console.log(`\nTo send a notification from Claude, use:`);
  console.log(`fetch('http://localhost:${PORT}/api/notify', {`);
  console.log(`  method: 'POST',`);
  console.log(`  headers: { 'Content-Type': 'application/json' },`);
  console.log(`  body: JSON.stringify({ message: 'Task completed!' })`);
  console.log(`})`);
});