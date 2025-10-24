#!/bin/bash
set -e

# --- Start Foxytoux PRoot environment ---
if [ -d "$HOME/freeroot" ]; then
    echo "Starting Foxytoux PRoot environment..."
    cd "$HOME/freeroot"
    
    # Initialize Foxytoux only if not already installed
    if [ ! -f "$HOME/freeroot/.foxytoux_installed" ]; then
        echo "Running root.sh to set up Foxytoux..."
        bash root.sh
        touch "$HOME/freeroot/.foxytoux_installed"
    fi

    # Start a PRoot shell in background
    echo "Launching Foxytoux shell in background..."
    proot -S "$HOME/freeroot" /bin/bash &
    FOX_ROOT_PID=$!
else
    echo "Warning: Foxytoux folder not found, skipping..."
fi

# --- Start tmate session ---
tmate -S /tmp/tmate.sock new-session -d

echo "Waiting for tmate session..."
tmate -S /tmp/tmate.sock wait tmate-ready

echo "=== tmate SSH session ==="
tmate -S /tmp/tmate.sock display -p '#{tmate_ssh}'
echo "=== tmate Web session ==="
tmate -S /tmp/tmate.sock display -p '#{tmate_web}'

# --- Start Node.js server ---
echo "Starting Node.js server..."
node server.js

# Wait for Foxytoux background process (optional)
if [ ! -z "$FOX_ROOT_PID" ]; then
    wait $FOX_ROOT_PID
fi
