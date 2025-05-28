#!/bin/bash

# Claude CLI Wrapper with SMS Notifications
# This script wraps the claude CLI command and sends SMS notifications when tasks complete

# Store the original command
CLAUDE_TASK="$*"
TEMP_OUTPUT="/tmp/claude_output_$$.txt"
NOTIFICATION_SCRIPT="$(dirname "$0")/claude-notify.js"

# Function to extract key information from output
extract_summary() {
    local output="$1"
    # Get last 10 lines and first 100 chars
    echo "$output" | tail -n 10 | tr '\n' ' ' | cut -c1-100
}

# Function to check if task completed
check_completion() {
    local output="$1"
    # Check for common completion indicators
    if echo "$output" | grep -qiE "(completed|finished|done|created|updated|fixed|error|failed)"; then
        return 0
    fi
    return 1
}

echo "🤖 Starting Claude with SMS notifications enabled..."
echo "📱 Task: $CLAUDE_TASK"
echo ""

# Run claude command and capture output
claude "$@" 2>&1 | tee "$TEMP_OUTPUT"

# Get exit code
EXIT_CODE=${PIPESTATUS[0]}

# Read the output
OUTPUT=$(cat "$TEMP_OUTPUT")

# Extract summary for SMS
SUMMARY=$(extract_summary "$OUTPUT")

# Determine success/failure
if [ $EXIT_CODE -eq 0 ]; then
    SUCCESS_MSG="Task completed successfully"
else
    SUCCESS_MSG="Task failed with exit code $EXIT_CODE"
fi

# Send SMS notification
echo ""
echo "📱 Sending SMS notification..."
node "$NOTIFICATION_SCRIPT" "$CLAUDE_TASK" "$SUCCESS_MSG: $SUMMARY"

# Clean up
rm -f "$TEMP_OUTPUT"

# Exit with original exit code
exit $EXIT_CODE