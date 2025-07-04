# See https://github.com/astral-sh/uv-docker-example/blob/main/Dockerfile
FROM ghcr.io/astral-sh/uv:debian@sha256:851139e166de4212c4cdc5c25f5c5a39d3da9c884eb705aad17c27043a651933

WORKDIR /app

# Enable bytecode compilation
ENV UV_COMPILE_BYTECODE=1

COPY apps/kvittering-backend/pyproject.toml /app/pyproject.toml
COPY apps/kvittering-backend/uv.lock /app/uv.lock

RUN uv sync

COPY apps/kvittering-backend/src /app/src

RUN groupadd -r kvittering && useradd -r -g kvittering kvittering

# Create cache directory for uv and set proper permissions
RUN mkdir -p /home/kvittering/.cache/uv && \
    chown -R kvittering:kvittering /home/kvittering
RUN chown -R kvittering:kvittering /app
USER kvittering

EXPOSE 5000
ENTRYPOINT ["uv", "run", "src/server.py"]