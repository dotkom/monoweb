import { type Database } from "@dotkomonline/db";
import { type User, type UserId, UserSchema, type UserWrite } from "@dotkomonline/types";
import { type Kysely, type Selectable } from "kysely";

export const mapToUser = (payload: Selectable<Database["owUser"]>): User => UserSchema.parse(payload);

export interface UserRepository {
    create(userWrite: UserWrite): Promise<User>;
    getAll(limit: number): Promise<Array<User>>;
    getById(id: UserId): Promise<User | undefined>;
}

export class UserRepositoryImpl implements UserRepository {
    public constructor(private readonly db: Kysely<Database>) {}

    public async create(userWrite: UserWrite) {
        const user = await this.db.insertInto("owUser").values(userWrite).returningAll().executeTakeFirstOrThrow();

        return mapToUser(user);
    }

    public async getAll(limit: number) {
        const users = await this.db.selectFrom("owUser").selectAll().limit(limit).execute();

        return users.map(mapToUser);
    }

    public async getById(id: UserId) {
        const user = await this.db.selectFrom("owUser").selectAll().where("id", "=", id).executeTakeFirst();

        return user ? mapToUser(user) : undefined;
    }
}
