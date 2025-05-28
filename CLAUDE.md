# Claude Notifications Project

## Quick Context
This is the Claude SMS notification system project. When resuming work:
1. Check if notification server is running: `npm start`
2. Check if monitor is running: `./start-monitor.sh status`
3. Current branch: main
4. GitHub: https://github.com/Trolzie/claude-notifications

## Current State (as of 2025-01-28)
- ✅ Basic system working - sends SMS when Claude completes todos
- ✅ Repository created and documented
- 🔄 Next: Add support for monitoring all Claude responses (not just todos)

## Project Structure
```
/claude-notifications
├── src/server.ts          # SMS server (port 3456)
├── claude-monitor.js      # Todo watcher daemon
├── start-monitor.sh       # Start daemon
├── settings.json          # Your config (gitignored)
└── README.md             # Full documentation
```

## Key Commands
```bash
# Start services
npm start                  # Start SMS server
./start-monitor.sh         # Start monitor daemon

# Check status
./start-monitor.sh status  # Is monitor running?
curl http://localhost:3456/api/test  # Is server running?

# View logs
tail -f monitor.log        # Monitor activity
```

## Development Notes
- Monitor only watches todo completions currently
- Want to add: monitor all Claude responses
- Want to add: configurable notification filters
- SMS limit: 160 chars
- Your phone: +4531654666

## When Resuming Tomorrow
1. Start in this directory: `cd ~/claude-notifications`
2. Pull latest changes: `git pull`
3. Start services if needed
4. Continue where we left off!

## SMS Notifications
When you complete a task, please send an SMS notification by running:
```bash
node /Users/troelschristensen/claude-notifications/claude-notify.js "task description" "brief result summary"
```