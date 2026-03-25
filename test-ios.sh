#!/bin/bash
# Fast iteration loop for iOS Safari crash debugging
# Usage: ./test-ios.sh [phase_name]
#
# This script:
# 1. Builds a Docker image from the local source
# 2. Stops the currently running web container
# 3. Starts the new image with prod env vars
# 4. ngrok should already be running on port 3000
#
# Prerequisites:
# - ngrok is already running: ngrok http 3000
# - .env.docker exists (extracted from prod container)

set -e

PHASE="${1:-unknown}"
IMAGE_NAME="monoweb-test"
CONTAINER_NAME="monoweb-test-web"
ENV_FILE=".env.docker"
MONOREPO_ROOT="$(cd "$(dirname "$0")" && pwd)"

cd "$MONOREPO_ROOT"

if [ ! -f "$ENV_FILE" ]; then
    echo "ERROR: $ENV_FILE not found. Extract from prod container:"
    echo "  docker inspect <container_id> --format '{{range .Config.Env}}{{println .}}{{end}}' > .env.docker"
    exit 1
fi

echo "=== iOS Safari Crash Debug: Phase [$PHASE] ==="
echo ""

# Step 1: Stop old container FIRST (free up memory for build on 8GB machine)
echo "[1/3] Stopping old web container..."
docker ps --format '{{.ID}} {{.Ports}}' | grep '0.0.0.0:3000' | awk '{print $1}' | xargs -r docker stop 2>/dev/null || true
docker rm -f "$CONTAINER_NAME" 2>/dev/null || true
echo "Old container stopped."
echo ""

# Step 2: Build
echo "[2/3] Building Docker image..."
START_BUILD=$(date +%s)

# Convert .env.docker lines into --build-arg flags
BUILD_ARGS=""
while IFS= read -r line; do
    # Skip empty lines and comments
    [[ -z "$line" || "$line" == \#* ]] && continue
    BUILD_ARGS="$BUILD_ARGS --build-arg $line"
done < "$ENV_FILE"

docker build \
    -t "$IMAGE_NAME" \
    -f apps/web/Dockerfile \
    $BUILD_ARGS \
    --progress plain \
    . 2>&1 | tail -30
END_BUILD=$(date +%s)
echo "Build took $((END_BUILD - START_BUILD))s"
echo ""

# Step 3: Start new container
echo "[3/3] Starting new container..."
docker run -d \
    --name "$CONTAINER_NAME" \
    --env-file "$ENV_FILE" \
    -e NODE_ENV=production \
    -e PORT=3000 \
    -e HOSTNAME=0.0.0.0 \
    -p 3000:3000 \
    "$IMAGE_NAME"

echo ""
echo "=== Container started! ==="
echo "Phase: $PHASE"
echo "Waiting for server to be ready..."

# Wait for the server to respond
for i in $(seq 1 30); do
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q '200\|304\|302'; then
        echo "Server ready after ${i}s!"
        echo ""
        echo ">>> Test on iPhone now via ngrok <<<"
        echo ">>> Check: does the page crash? <<<"
        echo ""
        echo "Logs (Ctrl+C to stop watching):"
        docker logs -f "$CONTAINER_NAME"
        exit 0
    fi
    sleep 1
done

echo "WARNING: Server didn't respond after 30s. Checking logs:"
docker logs "$CONTAINER_NAME"
