import {
    type NotificationPermissions,
    type NotificationPermissionsWrite,
    type PrivacyPermissions,
    type PrivacyPermissionsWrite,
    type User,
    type UserWrite,
} from "@dotkomonline/types";

import { NotFoundError } from "../../errors/errors";
import { type NotificationPermissionsRepository } from "./notification-permissions-repository";
import { type PrivacyPermissionsRepository } from "./privacy-permissions-repository";
import { type UserRepository } from "./user-repository";

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
    public constructor(
        private readonly userRepository: UserRepository,
        private readonly privacyPermissionsRepository: PrivacyPermissionsRepository,
        private readonly notificationPermissionsRepository: NotificationPermissionsRepository
    ) {}

    public async getAllUsers(limit: number) {
        const users = await this.userRepository.getAll(limit);

        return users;
    }

    public async getUser(id: User["id"]) {
        const user = await this.userRepository.getById(id);

        if (!user) {
            throw new NotFoundError(`User with ID:${id} not found`);
        }

        return user;
    }

    public async createUser(input: UserWrite) {
        const res = await this.userRepository.create(input);

        return res;
    }

    public async getPrivacyPermissionsByUserId(id: string): Promise<PrivacyPermissions> {
        let privacyPermissions = await this.privacyPermissionsRepository.getByUserId(id);

        if (!privacyPermissions) {
            privacyPermissions = await this.privacyPermissionsRepository.create({ userId: id });
        }

        return privacyPermissions;
    }

    public async updatePrivacyPermissionsForUserId(
        id: string,
        data: Partial<Omit<PrivacyPermissionsWrite, "userId">>
    ): Promise<PrivacyPermissions> {
        let privacyPermissions = await this.privacyPermissionsRepository.update(id, data);

        if (!privacyPermissions) {
            privacyPermissions = await this.privacyPermissionsRepository.create({ userId: id, ...data });
        }

        return privacyPermissions;
    }

    public async getNotificationPermissionsByUserId(id: string): Promise<NotificationPermissions> {
        let notificationPermissions = await this.notificationPermissionsRepository.getByUserId(id);

        if (!notificationPermissions) {
            notificationPermissions = await this.notificationPermissionsRepository.create({ userId: id });
        }

        return notificationPermissions;
    }

    public async updateNotificationPermissionsForUserId(
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
