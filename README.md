# Claude SMS Notifications

Automatic SMS notifications when Claude completes tasks. Get notified on your phone when Claude finishes work, even when you're away from your computer.

## How It Works

This system has two main components:

1. **Notification Server** - Sends SMS messages via TextBelt API
2. **Claude Monitor** - Watches Claude's todo files and automatically sends SMS when tasks complete

When Claude marks a task as "completed" in its todo system, the monitor detects this change and sends you an SMS with the task details.

## Prerequisites

- Node.js (v16 or higher)
- Claude CLI installed and configured
- TextBelt API key (get one at https://textbelt.com)
- Phone number capable of receiving SMS

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Trolzie/claude-notifications.git
cd claude-notifications
```

2. Install dependencies:
```bash
npm install
```

3. Copy the settings template:
```bash
cp settings.json.example settings.json
```

4. Edit `settings.json` with your details:
```json
{
  "enabled": true,
  "phoneNumber": "+1234567890",
  "provider": "textbelt",
  "textbeltKey": "your-textbelt-api-key"
}
```

## Getting Started

### Step 1: Start the Notification Server

```bash
npm start
```

This starts the Express server on port 3456. Keep this running in a terminal.

### Step 2: Start the Claude Monitor

In a new terminal:
```bash
./start-monitor.sh
```

This starts the background monitor that watches for Claude task completions.

### Step 3: Use Claude Normally

When Claude completes tasks (marks todos as "completed"), you'll automatically receive SMS notifications!

## Usage

### Automatic Notifications (Main Feature)

The monitor runs in the background and automatically sends SMS when:
- Claude marks a todo task as "completed"
- A task status changes from "in_progress" to "completed"

### Manual Notifications

You can also send notifications manually:

```bash
# Using the alias (after running: source ~/.zshrc)
notify "Task name" "Brief description"

# Using the script directly
node claude-notify.js "Built API" "Created REST endpoints with auth"
```

### Web Interface

Access the configuration UI at http://localhost:3456 to:
- Enable/disable notifications
- Update phone number
- Change API key
- Send test messages
- Check remaining SMS quota

## Architecture

```
claude-notifications/
├── src/server.ts          # Express server that sends SMS
├── claude-monitor.js      # Daemon that watches Claude's todos
├── start-monitor.sh       # Start the monitor daemon
├── stop-monitor.sh        # Stop the monitor daemon
├── claude-notify.js       # Manual notification script
├── public/index.html      # Web UI for configuration
└── settings.json          # Your configuration (git ignored)
```

### How the Monitor Works

1. Watches `~/.claude/todos/` directory for changes
2. Reads todo JSON files when they change
3. Compares current state with previous state
4. Detects when tasks change to "completed" status
5. Sends SMS via the notification server
6. Logs all activity to `monitor.log`

## Commands Reference

### Server Commands
```bash
npm start              # Start notification server
npm run dev           # Start server with auto-reload
npm run build         # Build TypeScript
```

### Monitor Commands
```bash
./start-monitor.sh    # Start the monitor daemon
./start-monitor.sh status  # Check if monitor is running
./start-monitor.sh logs    # Tail the monitor logs
./stop-monitor.sh     # Stop the monitor daemon
```

### Testing
```bash
# Test SMS sending
node test-sms.js

# Send manual notification
node claude-notify.js "Test" "This is a test message"
```

## Configuration

### settings.json
```json
{
  "enabled": true,              // Enable/disable all notifications
  "phoneNumber": "+1234567890", // Your phone number with country code
  "provider": "textbelt",       // SMS provider (only textbelt supported)
  "textbeltKey": "your-key"     // Your TextBelt API key
}
```

### Environment Variables
Create a `.env` file for additional configuration:
```
PORT=3456  # Server port (optional, defaults to 3456)
```

## Troubleshooting

### SMS not sending

1. Check server is running:
```bash
curl http://localhost:3456/api/test
```

2. Check monitor is running:
```bash
./start-monitor.sh status
```

3. Check logs:
```bash
tail -f monitor.log
```

4. Verify TextBelt quota:
```bash
# Check quota in the web UI or look for "quotaRemaining" in logs
```

### Monitor not detecting changes

1. Ensure Claude has created todo files:
```bash
ls ~/.claude/todos/
```

2. Check monitor is watching the correct directory
3. Look for file change events in monitor.log

### Common Issues

- **"fetch failed"**: Notification server not running
- **"Out of quota"**: Need to purchase more SMS credits
- **No SMS received**: Check phone number format (+country code)
- **Monitor crashes**: Check `monitor.log` for errors

## SMS Message Format

Messages are automatically condensed to fit SMS 160-character limit:
```
Claude: Task: [First 30 chars of task]. [Task status/summary]
```

Example:
```
Claude: Task: Create React dashboard. Task completed: Create React dashboard
```

## Development

### Project Structure
- TypeScript server with Express
- File system watcher for Claude's todos
- Web UI for easy configuration
- Shell scripts for daemon management

### Adding Features
The codebase is modular:
- Add new SMS providers in `server.ts`
- Modify monitoring logic in `claude-monitor.js`
- Enhance UI in `public/index.html`

## Limitations

- Only watches Claude's todo system (not all Claude responses)
- SMS limited to 160 characters
- Requires TextBelt API key with credits
- Monitor must be running to detect changes

## Future Enhancements

Planned features:
- Multiple notification types (not just todo completions)
- Configurable message templates
- Support for other SMS providers
- Email notifications option
- Webhook support for other integrations

## License

MIT