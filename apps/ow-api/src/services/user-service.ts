import { NotFoundError } from "../types/errors";
import { User } from "../models/user";
import { UserRepository } from "../repositories/user-repository";

export interface UserService {
  getUser: (id: User["id"]) => Promise<User>;
  getUsers: (limit: number) => Promise<User[]>;
  register: (
    uesrname: string,
    email: string,
    firstName: string,
    lastName: string
  ) => Promise<User>;
}

export const initUserverService = (
  userRepository: UserRepository
): UserService => ({
  getUser: async (id) => {
    const user = await userRepository.getUserByID(id);
    if (!user) throw new NotFoundError(`User with ID:${id} not found`);
    return user;
  },
  getUsers: async (limit) => {
    const users = await userRepository.getUsers(limit);
    return users;
  },
  register: async (username, email, firstName, lastName) => {
    const user = await userRepository.createUser({
      username,
      email,
      firstName,
      lastName,
    });
    return user;
  },
});
