import { type Generated } from "kysely";

export interface NotificationPermissionsTable {
    createdAt: Generated<Date>;
    updatedAt: Generated<Date>;
    userId: string;
    applications: boolean;
    newArticles: boolean;
    standardNotifications: boolean;
    groupMessages: boolean;
    markRulesUpdates: boolean;
    receipts: boolean;
    registrationByAdministrator: boolean;
    registrationStart: boolean;
}
