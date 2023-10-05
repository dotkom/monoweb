import {
    type NotificationPermissions,
    type NotificationPermissionsWrite,
    type PrivacyPermissions,
    type PrivacyPermissionsWrite,
    type User,
    type UserWrite,
} from "@dotkomonline/types";

import { type PrivacyPermissionsRepository } from "./privacy-permissions-repository";
import { type UserRepository } from "./user-repository";
import { type NotificationPermissionsRepository } from "./notification-permissions-repository";
import { NotFoundError } from "../../errors/errors";

export interface UserService {
    getUser(id: User["id"]): Promise<User | undefined>;
    getAllUsers(limit: number): Promise<Array<User>>;
    createUser(input: UserWrite): Promise<User>;
    getPrivacyPermissionsByUserId(id: string): Promise<PrivacyPermissions>;
    updatePrivacyPermissionsForUserId(
        id: string,
        data: Partial<Omit<PrivacyPermissionsWrite, "userId">>
    ): Promise<PrivacyPermissions>;
}

export class UserServiceImpl implements UserService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly privacyPermissionsRepository: PrivacyPermissionsRepository,
        private readonly notificationPermissionsRepository: NotificationPermissionsRepository
    ) {}
    async getAllUsers(limit: number) {
        const users = await this.userRepository.getAll(limit);

        return users;
    }

    async getUser(id: User["id"]) {
        const user = await this.userRepository.getById(id);

        if (!user) {
            throw new NotFoundError(`User with ID:${id} not found`);
        }

        return user;
    }

    async createUser(input: UserWrite) {
        const res = await this.userRepository.create(input);

        return res;
    }

    async getPrivacyPermissionsByUserId(id: string): Promise<PrivacyPermissions> {
        let privacyPermissions = await this.privacyPermissionsRepository.getByUserId(id);

        if (!privacyPermissions) {
            privacyPermissions = await this.privacyPermissionsRepository.create({ userId: id });
        }

        return privacyPermissions;
    }

    async updatePrivacyPermissionsForUserId(
        id: string,
        data: Partial<Omit<PrivacyPermissionsWrite, "userId">>
    ): Promise<PrivacyPermissions> {
        let privacyPermissions = await this.privacyPermissionsRepository.update(id, data);

        if (!privacyPermissions) {
            privacyPermissions = await this.privacyPermissionsRepository.create({ userId: id, ...data });
        }

        return privacyPermissions;
    }

    async getNotificationPermissionsByUserId(id: string): Promise<NotificationPermissions> {
        let notificationPermissions = await this.notificationPermissionsRepository.getByUserId(id);

        if (!notificationPermissions) {
            notificationPermissions = await this.notificationPermissionsRepository.create({ userId: id });
        }

        return notificationPermissions;
    }

    async updateNotificationPermissionsForUserId(
        id: string,
        data: Partial<Omit<NotificationPermissionsWrite, "userId">>
    ): Promise<NotificationPermissions> {
        let notificationPermissions = await this.notificationPermissionsRepository.update(id, data);

        if (!notificationPermissions) {
            notificationPermissions = await this.notificationPermissionsRepository.create({ userId: id, ...data });
        }

        return notificationPermissions;
    }
}
