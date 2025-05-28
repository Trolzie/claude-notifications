#!/bin/bash

# Claude Monitor Stopper

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PID_FILE="$SCRIPT_DIR/monitor.pid"

if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p "$PID" > /dev/null 2>&1; then
        echo "🛑 Stopping Claude monitor (PID: $PID)..."
        kill "$PID"
        rm "$PID_FILE"
        echo "✅ Claude monitor stopped"
    else
        echo "❌ Monitor not running (stale PID file removed)"
        rm "$PID_FILE"
    fi
else
    echo "❌ Claude monitor is not running"
fi