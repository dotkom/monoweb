#!/usr/bin/env bash

[ ! -f v0.1.3.tar.gz ] && curl -LO https://github.com/pksunkara/pgx_ulid/archive/refs/tags/v0.1.3.tar.gz
tar -xvf v0.1.3.tar.gz

sed -i '/ENV POSTGRES_HOST_AUTH_METHOD=trust/d' ./pgx_ulid-0.1.3/Dockerfile
docker build --build-arg PG_MAJOR=15 -f pgx_ulid-0.1.3/Dockerfile -t pgx_ulid:0.1.3 pgx_ulid-0.1.3
