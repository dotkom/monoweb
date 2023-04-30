import { User as ClerkUser } from "@clerk/nextjs/dist/api"
import { clerkClient } from "@clerk/nextjs/server"

import { NotFoundError } from "../../errors/errors"
import { UserRepository } from "./user-repository"
import { User } from "@dotkomonline/types"

export interface UserService {
  getClerkUser(id: User["id"]): Promise<ClerkUser>
  getClerkUsers(limit: number): Promise<ClerkUser[]>
  getUser(id: User["id"]): Promise<User | undefined>
  getAllUsers(limit: number): Promise<User[]>
  createUser(id: string): Promise<User>
}

export class UserServiceImpl implements UserService {
  constructor(private userRepository: UserRepository, private clerk: typeof clerkClient) {}

  async getClerkUser(id: ClerkUser["id"]) {
    const user = await this.clerk.users.getUser(id)
    if (!user) throw new NotFoundError(`User with ID:${id} not found`)
    return user
  }

  async getClerkUsers(limit: number) {
    const users = await this.clerk.users.getUserList({ limit })
    return users
  }

  async getAllUsers(limit: number) {
    const users = await this.userRepository.getAll(limit)
    return users
  }

  async getUser(id: User["id"]) {
    const user = await this.userRepository.getByID(id)
    if (!user) throw new NotFoundError(`User with ID:${id} not found`)
    return user
  }

  async createUser(id: string) {
    const res = await this.userRepository.create({ id: id })
    return res
  }
}
