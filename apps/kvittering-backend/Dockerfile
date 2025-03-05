FROM python:3.12-slim-bookworm

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates
ADD https://astral.sh/uv/install.sh /uv-installer.sh
RUN sh /uv-installer.sh && rm /uv-installer.sh
ENV PATH="/root/.local/bin/:$PATH"

COPY apps/kvittering/pyproject.toml /app/pyproject.toml
COPY apps/kvittering/uv.lock /app/uv.lock

RUN uv sync

COPY apps/kvittering/src /app/src

ENV EMAIL_ENABLED="false"
ENV STORAGE_BUCKET="receipt-archive.online.ntnu.no"

EXPOSE 5000
CMD ["uv", "run", "src/server.py"]