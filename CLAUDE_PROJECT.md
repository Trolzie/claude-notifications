# Claude Notifications Project Context

## Current Status
- ✅ Basic SMS notification system working
- ✅ Monitor watches Claude todo completions
- ✅ Repository created on GitHub
- ✅ Comprehensive README documentation

## Next Steps
1. Add support for multiple notification types (not just todo completions)
2. Create configurable notification filters
3. Add support for monitoring all Claude responses
4. Implement notification templates

## Architecture Notes
- Server runs on port 3456
- Monitor watches ~/.claude/todos/
- Currently only sends SMS on todo status changes to "completed"

## Known Limitations
- Only watches todo system, not all Claude responses
- SMS limited to 160 characters
- Requires running notification server + monitor

## Development Branch
Working in main branch. Create feature branches for new work.

## Testing
- Your phone: +4531654666
- TextBelt API configured
- 23 SMS remaining in quota as of last test