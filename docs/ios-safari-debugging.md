# iOS Safari Debugging Guide

This guide documents how to reproduce and debug iOS Safari crashes using the production Docker image locally.

## Background

The production Docker image can behave differently from a local `next build && next start` due to differences in the build environment (e.g., linux/arm64 vs macOS). Some bugs only manifest on iOS Safari through the Docker-built image.

## Prerequisites

- Docker (OrbStack recommended on macOS for lower memory usage)
- [ngrok](https://ngrok.com/) account and CLI installed
- An iPhone on the same network (or any network — ngrok tunnels publicly)
- AWS CLI configured with the `dotkom` profile (for pulling prod images)

## Setup

### 1. Extract production environment variables

Pull the prod image and extract its env vars:

```bash
# Login to ECR
aws ecr get-login-password --region eu-north-1 --profile dotkom | \
  docker login --username AWS --password-stdin 891459268445.dkr.ecr.eu-north-1.amazonaws.com

# Pull the prod image
docker pull 891459268445.dkr.ecr.eu-north-1.amazonaws.com/monoweb/prd/web:latest

# Run it temporarily to extract env vars
docker run -d --name tmp-web 891459268445.dkr.ecr.eu-north-1.amazonaws.com/monoweb/prd/web:latest
docker inspect tmp-web --format '{{range .Config.Env}}{{println .}}{{end}}' > .env.docker
docker rm -f tmp-web
```

> `.env.docker` is gitignored. It contains production secrets — never commit it.

### 2. Start ngrok

```bash
ngrok http 3000
```

Keep this running in a separate terminal. Note the `https://*.ngrok-free.app` URL — this is what you'll open on iPhone.

### 3. Build and test

Use the `test-ios.sh` script to build from local source with prod env vars:

```bash
./test-ios.sh "description-of-what-youre-testing"
```

The script:
1. Stops any existing container on port 3000
2. Builds a Docker image from local source (with env vars as build args)
3. Starts the container on port 3000
4. Waits for the server to be ready

Then refresh the ngrok URL on your iPhone.

### 4. Alternatively: test the actual prod image

To test the exact production image (not a local build):

```bash
docker run -d \
  --name monoweb-test-web \
  --env-file .env.docker \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -e HOSTNAME=0.0.0.0 \
  -p 3000:3000 \
  891459268445.dkr.ecr.eu-north-1.amazonaws.com/monoweb/prd/web:latest
```

## Tips

- **8GB RAM machines**: Stop Docker containers before building. The build + running container can exceed available memory and crash Docker.
- **Docker crashes (EOF errors)**: Run `docker system prune -af && docker builder prune -af` to free resources, then restart Docker/OrbStack.
- **Safari crash loop**: "Det oppsto et gjentakende problem" means Safari's crash loop detection triggered — the page crashes on hydration, Safari retries, crashes again.
- **No console output**: iOS Safari crashes often produce zero console output. Use binary search (comment out components) to isolate the issue.
- **`next.config.mjs` for local builds**: You may need `typescript: { ignoreBuildErrors: true }` and `allowedDevOrigins: ["*.ngrok-free.app"]` temporarily during debugging. Don't commit these.

## Known Issues

### `next/image` with `images.unoptimized: true` crashes iOS Safari (March 2025)

**Root cause**: The `next/image` (`Image`) component combined with `images.unoptimized: true` in `next.config.mjs` causes iOS Safari to crash when rendering multiple images from different URLs. The crash is a client-side hydration crash with no console output.

**Fix**: Replace `next/image` `Image` with plain `<img>` tags in components that render multiple images (event cards, thumbnails, etc.).

**Affected files**:
- `apps/web/src/app/page.tsx`
- `apps/web/src/components/molecules/EventListItem/Thumbnail.tsx`
- `apps/web/src/app/arrangementer/components/EventHeader.tsx`

**Investigation method**: Binary search through components using phased Docker builds via `test-ios.sh`. See git history for the full investigation.
