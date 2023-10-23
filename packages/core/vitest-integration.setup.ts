import { beforeEach } from 'vitest';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { kysely, createMigrator, createKysely } from "@dotkomonline/db"
import { createEnvironment } from "@dotkomonline/env"

const containers: StartedPostgreSqlContainer[] = [];

beforeEach(async () => {
  const container = await new PostgreSqlContainer('pgx_ulid:0.1.3')
    .withEnvironment({
      POSTGRES_INITDB_ARGS: "--locale=nl_NL --encoding=UTF8"
    })
    .withExposedPorts(5432)
    .withUsername('local')
    .withPassword('local')
    .withDatabase('main')
    .start();
  process.env.DATABASE_URL = container.getConnectionUri();
  const env = createEnvironment()
  const kysely = createKysely(env)
  const migrator = createMigrator(kysely);
  await migrator.migrateToLatest();
  containers.push(container);
});

process.on('exit', async () => {
  await Promise.all(containers.map((container) => container.stop()));
});