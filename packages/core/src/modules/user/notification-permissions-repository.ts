import { type Kysely, type Selectable } from "kysely";
import {
    type NotificationPermissions,
    NotificationPermissionsSchema,
    type NotificationPermissionsWrite,
} from "@dotkomonline/types";

import { type Database } from "@dotkomonline/db";

export const mapToNotificationPermissions = (
    payload: Selectable<Database["notificationPermissions"]>
): NotificationPermissions => NotificationPermissionsSchema.parse(payload);

export interface NotificationPermissionsRepository {
    getByUserId(id: string): Promise<NotificationPermissions | undefined>;
    create(data: Partial<NotificationPermissionsWrite>): Promise<NotificationPermissions>;
    update(
        userId: string,
        data: Partial<Omit<NotificationPermissionsWrite, "userId">>
    ): Promise<NotificationPermissions | undefined>;
}

export class NotificationPermissionsRepositoryImpl implements NotificationPermissionsRepository {
    constructor(private readonly db: Kysely<Database>) {}

    async getByUserId(id: string): Promise<NotificationPermissions | undefined> {
        const notificationPermissions = await this.db
            .selectFrom("notificationPermissions")
            .selectAll()
            .where("userId", "=", id)
            .executeTakeFirst();

        return notificationPermissions ? mapToNotificationPermissions(notificationPermissions) : undefined;
    }

    async create(data: NotificationPermissionsWrite): Promise<NotificationPermissions> {
        const notificationPermissions = await this.db
            .insertInto("notificationPermissions")
            .values(data)
            .returningAll()
            .executeTakeFirstOrThrow();

        return mapToNotificationPermissions(notificationPermissions);
    }

    async update(
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
