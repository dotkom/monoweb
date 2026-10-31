#!/bin/bash
# Build and run the web app as a production Docker image locally.
# Uses .env.docker for production environment variables.
# See docs/docker-prod-testing.md for setup instructions.
#
# Usage: ./docker-build.sh [label]

set -eo pipefail

LABEL="${1:-local}"
IMAGE_NAME="monoweb-test"
CONTAINER_NAME="monoweb-test-web"
ENV_FILE=".env.docker"
MONOREPO_ROOT="$(cd "$(dirname "$0")" && pwd)"

cd "$MONOREPO_ROOT"

if [ ! -f "$ENV_FILE" ]; then
    echo "ERROR: $ENV_FILE not found. See docs/docker-prod-testing.md for setup."
    exit 1
fi

echo "=== Docker Build: [$LABEL] ==="
echo ""

# Step 1: Stop old container FIRST (free up memory for build)
echo "[1/3] Stopping old web container..."
docker ps --format '{{.ID}} {{.Ports}}' | grep '0.0.0.0:3000' | awk '{print $1}' | xargs -r docker stop 2>/dev/null || true
docker rm -f "$CONTAINER_NAME" 2>/dev/null || true
echo "Old container stopped."
echo ""

# Step 2: Build
echo "[2/3] Building Docker image..."
START_BUILD=$(date +%s)

# Pass public configuration as build arguments and credentials as BuildKit secrets.
build_options=()
secret_environment_variables=()
while IFS= read -r environment_variable || [[ -n "$environment_variable" ]]; do
    environment_variable="${environment_variable%$'\r'}"
    # Skip empty lines and comments
    if [[ -z "$environment_variable" || "$environment_variable" == \#* ]]; then
        continue
    fi

    environment_variable_name="${environment_variable%%=*}"

    case "$environment_variable_name" in
        AUTH0_CLIENT_SECRET|AUTH_SECRET|SIGNING_KEY|SENTRY_AUTH_TOKEN)
            secret_environment_variables+=("$environment_variable")
            build_options+=(--secret "id=$environment_variable_name,env=$environment_variable_name")
            ;;
        AUTH0_CLIENT_ID|AUTH0_ISSUER|AUTH0_AUDIENCES|NEXT_PUBLIC_*|RPC_HOST|SENTRY_DSN|SENTRY_RELEASE|DOPPLER_ENVIRONMENT)
            build_options+=(--build-arg "$environment_variable")
            ;;
    esac
done < "$ENV_FILE"

env "${secret_environment_variables[@]}" docker build \
    -t "$IMAGE_NAME" \
    -f apps/web/Dockerfile \
    "${build_options[@]}" \
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
echo "Label: $LABEL"
echo "Waiting for server to be ready..."

# Wait for the server to respond
for i in $(seq 1 30); do
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q '200\|304\|302'; then
        echo "Server ready after ${i}s!"
        echo ""
        echo "Open http://localhost:3000"
        echo "For mobile testing, use ngrok: ngrok http 3000"
        echo ""
        echo "Logs (Ctrl+C to stop watching):"
        docker logs -f "$CONTAINER_NAME"
        exit 0
    fi
    sleep 1
done

echo "WARNING: Server didn't respond after 30s. Checking logs:"
docker logs "$CONTAINER_NAME"
