import { type Generated } from "kysely";

export interface NotificationPermissionsTable {
  applications: boolean;
  createdAt: Generated<Date>;
  groupMessages: boolean;
  markRulesUpdates: boolean;
  newArticles: boolean;
  receipts: boolean;
  registrationByAdministrator: boolean;
  registrationStart: boolean;
  standardNotifications: boolean;
  updatedAt: Generated<Date>;
  userId: string;
}
