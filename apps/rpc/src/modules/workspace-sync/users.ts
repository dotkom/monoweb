import type { User } from "@dotkomonline/types"
import type { admin_directory_v1 } from "googleapis"
import { getDirectory } from "./client"
import { getTemporaryPassword, getCommitteeEmail, getKey } from "./helpers"

const createRecoveryCodes = async (user: User): Promise<string[] | null> => {
  const directory = getDirectory()

  if (!directory) {
    return null
  }

  await directory.verificationCodes.generate({
    userKey: getKey(user),
  })
  const response = await directory.verificationCodes.list({
    userKey: getKey(user),
  })

  if (!response.data.items) {
    return null
  }

  return response.data.items.map((code) => code.verificationCode).filter(Boolean) as string[]
}

export async function createWorkspaceUser(
  user: User
): Promise<{ user: admin_directory_v1.Schema$User; recoveryCodes: string[] | null, password: string } | null> {
  if (user.workspaceUserId) {
    throw new Error("User already has a workspace user ID")
  }

  const directory = getDirectory()

  if (!directory) {
    return null
  }

  if (!user.name) {
    throw new Error("User name is required")
  }

  if (!user.name.includes(" ")) {
    throw new Error("User name must include a space")
  }

  const primaryEmail = getCommitteeEmail(user.name)
  const password = getTemporaryPassword()

  const firstName = user.name.split(" ").slice(0, -1).join(" ")
  const lastName = user.name.split(" ").at(-1)

  if (!firstName || !lastName) {
    throw new Error("Failed to split user name into first and last name")
  }

  const response = await directory.users.insert({
    requestBody: {
      primaryEmail,
      password,
      name: {
        givenName: firstName,
        familyName: lastName,
      },
      recoveryEmail: user.email,
      recoveryPhone: user.phone,
      changePasswordAtNextLogin: true,
    },
  })

  const is2faEnforced = response.data.isEnforcedIn2Sv ?? false
  const is2faEnabled = response.data.isEnrolledIn2Sv ?? false
  let recoveryCodes: string[] | null = null

  if (is2faEnforced && !is2faEnabled) {
    recoveryCodes = await createRecoveryCodes(user)
  }

  return {
    user: response.data,
    recoveryCodes,
    password,
  }
}

export const resetWorkspaceUserPassword = async (user: User): Promise<{ user: admin_directory_v1.Schema$User; recoveryCodes: string[] | null, password: string } | null> => {
  const directory = getDirectory()

  if (!directory) {
    return null
  }

  const password = getTemporaryPassword()

  const response = await directory.users.update({
    userKey: getKey(user),
    requestBody: {
      password,
      changePasswordAtNextLogin: true,
    },
  })

  const is2faEnforced = response.data.isEnforcedIn2Sv ?? false
  const is2faEnabled = response.data.isEnrolledIn2Sv ?? false
  let recoveryCodes: string[] | null = null

  if (is2faEnforced && !is2faEnabled) {
    recoveryCodes = await createRecoveryCodes(user)
  }

  return {
    user: response.data,
    recoveryCodes,
    password,
  }
}
