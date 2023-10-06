import { PostgresAdapter, PostgresDialect } from "kysely";

export class CockroachAdapter extends PostgresAdapter {
  public override async acquireMigrationLock(): Promise<void> {
    return Promise.resolve();
  }
}

export class CockroachDialect extends PostgresDialect {
  public override createAdapter(): CockroachAdapter {
    return new CockroachAdapter();
  }
}
