#!/bin/bash

# Claude Monitor Launcher
# This script starts the Claude task monitor in the background

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LOG_FILE="$SCRIPT_DIR/monitor.log"
PID_FILE="$SCRIPT_DIR/monitor.pid"

# Function to check if monitor is already running
is_running() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p "$PID" > /dev/null 2>&1; then
            return 0
        else
            rm "$PID_FILE"
        fi
    fi
    return 1
}

# Start the monitor
start_monitor() {
    if is_running; then
        echo "❌ Claude monitor is already running (PID: $(cat "$PID_FILE"))"
        exit 1
    fi
    
    echo "🚀 Starting Claude monitor..."
    
    # Start monitor in background
    nohup node "$SCRIPT_DIR/claude-monitor.js" > "$LOG_FILE" 2>&1 &
    PID=$!
    echo $PID > "$PID_FILE"
    
    # Wait a moment to check if it started successfully
    sleep 2
    
    if is_running; then
        echo "✅ Claude monitor started successfully (PID: $PID)"
        echo "📝 Logs: tail -f $LOG_FILE"
        echo "🛑 To stop: $SCRIPT_DIR/stop-monitor.sh"
    else
        echo "❌ Failed to start Claude monitor"
        echo "Check logs: cat $LOG_FILE"
        exit 1
    fi
}

# Main
case "${1:-start}" in
    start)
        start_monitor
        ;;
    status)
        if is_running; then
            echo "✅ Claude monitor is running (PID: $(cat "$PID_FILE"))"
            echo "📝 Recent activity:"
            tail -n 10 "$LOG_FILE"
        else
            echo "❌ Claude monitor is not running"
        fi
        ;;
    logs)
        if [ -f "$LOG_FILE" ]; then
            tail -f "$LOG_FILE"
        else
            echo "No logs found"
        fi
        ;;
    *)
        echo "Usage: $0 [start|status|logs]"
        exit 1
        ;;
esac