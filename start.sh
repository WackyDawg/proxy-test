#!/bin/bash
set -e

tmate -S /tmp/tmate.sock new-session -d

echo "Waiting for tmate session..."
tmate -S /tmp/tmate.sock wait tmate-ready

echo "=== tmate SSH session ==="
tmate -S /tmp/tmate.sock display -p '#{tmate_ssh}'
echo "=== tmate Web session ==="
tmate -S /tmp/tmate.sock display -p '#{tmate_web}'

echo "Starting Node.js server..."
node server.js
