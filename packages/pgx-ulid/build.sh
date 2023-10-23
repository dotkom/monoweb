#!/usr/bin/env bash

[ ! -f v0.1.3.tar.gz ] && curl -LO https://github.com/pksunkara/pgx_ulid/archive/refs/tags/v0.1.3.tar.gz
tar -xvf v0.1.3.tar.gz

patch pgx_ulid-0.1.3/Dockerfile 0001-dockerfile.patch

BUILDKIT_PROGRESS=plain docker build --build-arg PG_MAJOR=15 -f pgx_ulid-0.1.3/Dockerfile -t pgx_ulid:0.1.3 pgx_ulid-0.1.3
