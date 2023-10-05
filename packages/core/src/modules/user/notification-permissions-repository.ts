import { type Database } from "@dotkomonline/db";
import {
    type NotificationPermissions,
    NotificationPermissionsSchema,
    type NotificationPermissionsWrite,
} from "@dotkomonline/types";
import { type Kysely, type Selectable } from "kysely";

export const mapToNotificationPermissions = (
    payload: Selectable<Database["notificationPermissions"]>
): NotificationPermissions => NotificationPermissionsSchema.parse(payload);

export interface NotificationPermissionsRepository {
    create(data: Partial<NotificationPermissionsWrite>): Promise<NotificationPermissions>;
    getByUserId(id: string): Promise<NotificationPermissions | undefined>;
    update(
        userId: string,
        data: Partial<Omit<NotificationPermissionsWrite, "userId">>
    ): Promise<NotificationPermissions | undefined>;
}

export class NotificationPermissionsRepositoryImpl implements NotificationPermissionsRepository {
    public constructor(private readonly db: Kysely<Database>) {}

    public async create(data: NotificationPermissionsWrite): Promise<NotificationPermissions> {
        const notificationPermissions = await this.db
            .insertInto("notificationPermissions")
            .values(data)
            .returningAll()
            .executeTakeFirstOrThrow();

        return mapToNotificationPermissions(notificationPermissions);
    }

    public async getByUserId(id: string): Promise<NotificationPermissions | undefined> {
        const notificationPermissions = await this.db
            .selectFrom("notificationPermissions")
            .selectAll()
            .where("userId", "=", id)
            .executeTakeFirst();

        return notificationPermissions ? mapToNotificationPermissions(notificationPermissions) : undefined;
    }

    public async update(
        userId: string,
        data: Partial<Omit<NotificationPermissionsWrite, "userId">>
    ): Promise<NotificationPermissions | undefined> {
        const notificationPermissions = await this.db
            .updateTable("notificationPermissions")
            .set({
                ...data,
                updatedAt: new Date(),
            })
            .where("userId", "=", userId)
            .returningAll()
            .executeTakeFirst();

        return notificationPermissions ? mapToNotificationPermissions(notificationPermissions) : undefined;
    }
}
