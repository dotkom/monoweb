import { CognitoRepository } from "./cognito-repository"
import { mapToUserWithCognitoUser, UserWithCognitoUser } from "@dotkomonline/types"
import { UserRepository } from "./user-repository"

export interface CognitoService {
  getAllUsersWithCognitoUser(): Promise<UserWithCognitoUser[]>
}

export class CognitoServiceImpl implements CognitoService {
  constructor(private readonly cognitoRepository: CognitoRepository,
              private readonly userRepository: UserRepository,
  ) {
  }

  async getAllUsersWithCognitoUser(): Promise<UserWithCognitoUser[]> {
    const allCognitoUsers = await this.cognitoRepository.getAll();
    if (allCognitoUsers.length === 0) {
      return []
    }
    const subjects = allCognitoUsers.map((u) => u.sub);
    const allUsers = await this.userRepository.getBySubjects(subjects)
    if (allUsers.length !== allCognitoUsers.length) {
      throw new Error(`Not all cognito users had matching ow_users. Found ${allCognitoUsers.length} active Cognito users, but only ${allUsers.length} in the database`)
    }
    const merged = allUsers.map((u, i) => ({
      ...u,
      claims: allCognitoUsers[i]
    }))
    return merged.map(mapToUserWithCognitoUser)
  }
}
