import { CommitteeSchema, type Committee, type CommitteeWrite } from "@dotkomonline/types";
import { type Kysely, type Selectable } from "kysely";
import { paginateQuery, type Cursor } from "../../utils/db-utils";

import { type Database } from "@dotkomonline/db";

const mapToCommittee = (payload: Selectable<Database["committee"]>): Committee => CommitteeSchema.parse(payload);

export interface CommitteeRepository {
    getById(id: string): Promise<Committee | undefined>;
    getAll(take: number, cursor?: Cursor): Promise<Array<Committee>>;
    create(values: CommitteeWrite): Promise<Committee>;
}

export class CommitteeRepositoryImpl implements CommitteeRepository {
    public constructor(private readonly db: Kysely<Database>) {}

    public async getById(id: string) {
        const committee = await this.db.selectFrom("committee").selectAll().where("id", "=", id).executeTakeFirst();

        return committee ? mapToCommittee(committee) : undefined;
    }

    public async getAll(take: number, cursor?: Cursor) {
        let query = this.db.selectFrom("committee").selectAll().limit(take);

        if (cursor) {
            query = paginateQuery(query, cursor);
        }

        const committees = await query.execute();

        return committees.map(mapToCommittee);
    }

    public async create(values: CommitteeWrite) {
        const committee = await this.db
            .insertInto("committee")
            .values(values)
            .returningAll()
            // It should not be possible for this to throw, since there are no
            // restrictions on creating committees, as name is not unique.
            .executeTakeFirstOrThrow();

        return mapToCommittee(committee);
    }
}
