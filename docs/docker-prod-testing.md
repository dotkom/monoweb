# Testing with Production Docker Image

Build and run the web app as a production Docker image locally, using real production environment variables from AWS.

## Prerequisites

- Docker (OrbStack recommended on macOS for lower memory usage)
- AWS CLI configured with the `dotkom` profile

## Setup

### 1. Extract production environment variables

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

### 2. Build and run from local source

Use the `docker-build.sh` script to build from your local source with prod env vars:

```bash
./docker-build.sh "optional label"
```

The script:
1. Stops any existing container on port 3000 (frees memory for the build)
2. Builds a Docker image from local source with env vars passed as build args
3. Starts the container on port 3000
4. Waits for the server to be ready

Then open http://localhost:3000.

### 3. Run the actual prod image (no local build)

To test the exact image deployed to production:

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

## Mobile Testing

To test on a physical phone, use [ngrok](https://ngrok.com/) to tunnel your local port:

```bash
ngrok http 3000
```

Open the `https://*.ngrok-free.app` URL on your phone. You may need to temporarily add `allowedDevOrigins: ["*.ngrok-free.app"]` to `next.config.mjs` (don't commit this).

## Tips

- **Low RAM machines (8GB)**: The script stops old containers before building. If Docker still crashes with EOF errors, run `docker system prune -af && docker builder prune -af` to free resources.
- **Local build differences**: The Docker build can behave differently from `next build && next start` locally due to the build environment (linux vs macOS, build args, etc.). If something works locally but fails in prod, test with Docker.
- **`next.config.mjs` for local Docker builds**: You may need `typescript: { ignoreBuildErrors: true }` temporarily. Don't commit this.

## Known Issues

### `next/image` with `images.unoptimized: true` crashes iOS Safari (March 2026)

`next/image` combined with `images.unoptimized: true` causes iOS Safari to crash during hydration when rendering multiple different image URLs. No console errors — just Safari's crash loop. Fixed by replacing `next/image` with plain `<img>` tags. See PR #3062.
