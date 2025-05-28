# Claude SMS Notifications

When you complete a task, please send an SMS notification by running:

```bash
node /Users/troelschristensen/claude-notifications/claude-notify.js "task description" "brief result summary"
```

## Guidelines:
1. Only send notifications for significant task completions (not for simple questions)
2. Keep the task description under 30 characters
3. Keep the result summary under 100 characters
4. Send notifications for:
   - File creation/modification tasks
   - Code implementation tasks
   - Bug fixes
   - System configuration changes
   - Any task that takes more than a few seconds

## Example:
After creating a new React component:
```bash
node /Users/troelschristensen/claude-notifications/claude-notify.js "Create React component" "Built Dashboard with charts and real-time updates"
```

## Don't send notifications for:
- Simple questions
- Code explanations
- Quick lookups
- Error messages (unless fixing them)