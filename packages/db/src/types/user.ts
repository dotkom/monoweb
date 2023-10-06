import { type Generated } from "kysely";

export interface UserTable {
    cognitoSub: string;
    createdAt: Generated<Date>;
    id: Generated<string>;
}

export interface SessionTable {
    createdAt: Generated<Date>;
    expires: Date;
    id: Generated<string>;
    sessionToken: string;
    userId: string;
}

export interface VerificationTokenTable {
    expires: Date;
    identifier: string;
    token: string;
}

export interface AccountTable {
    accessToken: null | string;
    createdAt: Generated<Date>;
    expiresAt: null | number;
    id: Generated<string>;
    idToken: null | string;
    oauthToken: null | string;
    oauthTokenSecret: null | string;
    provider: string;
    providerAccountId: string;
    refreshToken: null | string;
    scope: null | string;
    sessionState: null | string;
    tokenType: null | string;
    type: string;

    userId: string;
}
