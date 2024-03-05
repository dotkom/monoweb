import { type ServiceLayer } from "@dotkomonline/core"
import { User } from "@dotkomonline/types"

type JWTToken = {
  email?: string | null
  sub?: string | null
  name?: string | null
  givenName?: string | null
  familyName?: string | null
}

export const createNewUser = async (core: ServiceLayer, token: JWTToken) => {
  if (!token.email || !token.sub || !token.name || !token.givenName || !token.familyName) {
    throw new Error("Missing user data in claims")
  }
  const userData = {
    auth0Sub: token.sub,
    studyYear: -1,
    email: token.email,
    name: token.name,
    givenName: token.givenName,
    familyName: token.familyName,
  }

  return core.userService.createUser(userData)
}

export const syncUserWithAuth0 = async (core: ServiceLayer, user: User) => {
  // if user.updatedAt is more than 1 day ago, update user

  const oneDay = 1000 * 60 * 60 * 24
  const oneDayAgo = new Date(Date.now() - oneDay)
  if (user.updatedAt < oneDayAgo) {
    console.log("updating user", user.id, user.auth0Sub)
    const idpUser = await core.auth0Repository.getBySubject(user.auth0Sub)

    if (idpUser === undefined) {
      throw new Error("User does not exist in Auth0")
    }

    return core.userService.updateUser(user.id, {
      email: idpUser.email,
      givenName: idpUser.givenName,
      familyName: idpUser.familyName,
      name: `${idpUser.givenName} ${idpUser.familyName}`,
    })
  }
}
