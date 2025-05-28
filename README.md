# Claude SMS Notifications

A service that sends SMS notifications when Claude completes tasks.

## Setup

1. **Server is running** on port 3456
2. **SMS provider**: TextBelt with your API key configured

## Usage Options

### Option 1: Manual Notification (Recommended)
After Claude completes an important task, run:
```bash
notify "task name" "brief result"
```

Example:
```bash
notify "Built React app" "Created dashboard with 5 components"
```

### Option 2: Claude Auto-notification
Copy the CLAUDE.md file to any project where you want Claude to send notifications:
```bash
cp /Users/troelschristensen/claude-notifications/CLAUDE.md /path/to/your/project/
```

When Claude reads this file, it will know to send SMS notifications after completing tasks.

### Option 3: Direct API Call
```bash
curl -X POST http://localhost:3456/api/claude-task-complete \
  -H "Content-Type: application/json" \
  -d '{"task":"Task name","response":"Result summary","success":true}'
```

## Configuration

Edit settings at: http://localhost:3456
- Phone number: +4531654666
- API Key: Your TextBelt key
- Remaining quota: Check after each SMS

## Troubleshooting

1. **"fetch failed" error**: Make sure the server is running:
   ```bash
   cd ~/claude-notifications && npm run dev
   ```

2. **SMS not received**: Check your quota at http://localhost:3456

3. **Reload shell config**: 
   ```bash
   exec zsh
   ```

## API Endpoints

- `POST /api/notify` - Send simple notification
- `POST /api/claude-task-complete` - Send task completion with summary
- `GET /api/settings` - Get current settings
- `POST /api/settings` - Update settings