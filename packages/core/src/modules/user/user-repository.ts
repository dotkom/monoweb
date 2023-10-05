import { type Database } from "@dotkomonline/db";
import { UserSchema, type User, type UserId, type UserWrite } from "@dotkomonline/types";
import { type Kysely, type Selectable } from "kysely";

export const mapToUser = (payload: Selectable<Database["owUser"]>): User => UserSchema.parse(payload);

export interface UserRepository {
    getById(id: UserId): Promise<User | undefined>;
    getAll(limit: number): Promise<Array<User>>;
    create(userWrite: UserWrite): Promise<User>;
}

export class UserRepositoryImpl implements UserRepository {
    public constructor(private readonly db: Kysely<Database>) {}

    public async getById(id: UserId) {
        const user = await this.db.selectFrom("owUser").selectAll().where("id", "=", id).executeTakeFirst();

        return user ? mapToUser(user) : undefined;
    }

    public async getAll(limit: number) {
        const users = await this.db.selectFrom("owUser").selectAll().limit(limit).execute();

        return users.map(mapToUser);
    }

    public async create(userWrite: UserWrite) {
        const user = await this.db.insertInto("owUser").values(userWrite).returningAll().executeTakeFirstOrThrow();

        return mapToUser(user);
    }
}
