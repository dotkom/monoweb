import { PostgresAdapter, PostgresDialect } from "kysely";

export class CockroachAdapter extends PostgresAdapter {
    override async acquireMigrationLock(): Promise<void> {
        return Promise.resolve();
    }
}

export class CockroachDialect extends PostgresDialect {
    override createAdapter(): CockroachAdapter {
        return new CockroachAdapter();
    }
}
