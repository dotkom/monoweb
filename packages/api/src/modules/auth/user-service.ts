import { User as ClerkUser } from "@clerk/nextjs/dist/api"
import { clerkClient } from "@clerk/nextjs/server"

import { NotFoundError } from "../../errors/errors"

export interface UserService {
  getUser(id: ClerkUser["id"]): Promise<ClerkUser>
  getUsers(limit: number): Promise<ClerkUser[]>
}

export class UserServiceImpl implements UserService {
  constructor(private clerk: typeof clerkClient) {}

  getUser = async (id: ClerkUser["id"]) => {
    const user = await this.clerk.users.getUser(id)
    if (!user) throw new NotFoundError(`User with ID:${id} not found`)
    return user
  }

  getUsers = async (limit: number) => {
    const users = await this.clerk.users.getUserList({ limit })
    return users
  }
}
