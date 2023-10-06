import { type Generated } from "kysely";

export interface PrivacyPermissionsTable {
    addressVisible: boolean;
    attendanceVisible: boolean;
    createdAt: Generated<Date>;
    emailVisible: boolean;
    phoneVisible: boolean;
    profileVisible: boolean;
    updatedAt: Generated<Date>;
    userId: string;
    usernameVisible: boolean;
}
