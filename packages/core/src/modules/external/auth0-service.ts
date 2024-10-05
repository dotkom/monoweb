import type { User, UserWrite } from "@dotkomonline/types"
import type { Auth0Repository } from "./auth0-repository"

export interface Auth0Service {
  getByAuth0UserId(auth0Id: string): Promise<User | null>
  update(auth0Id: string, data: UserWrite): Promise<User>
}

export class Auth0ServiceImpl implements Auth0Service {
  constructor(private readonly auth0Repository: Auth0Repository) {}

  async getByAuth0UserId(auth0Id: string) {
    return this.auth0Repository.getByAuth0UserId(auth0Id)
  }

  async update(auth0Id: string, data: UserWrite) {
    return this.auth0Repository.update(auth0Id, data)
  }
}
