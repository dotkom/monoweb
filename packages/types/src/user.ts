import { z } from "zod"
import type { UserType } from "@aws-sdk/client-cognito-identity-provider"

const CognitoSubjectIdSchema = z.string().uuid()

export const UserSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  cognitoSub:　CognitoSubjectIdSchema,
})

export type User = z.infer<typeof UserSchema>
export type UserId = User["id"]

export const UserWriteSchema = UserSchema.omit({
  id: true,
  createdAt: true,
})

export type UserWrite = z.infer<typeof UserWriteSchema>

export type CognitoUser = z.infer<typeof CognitoUserSchema>
export type CognitoSubject = User["cognitoSub"]

export const CognitoUserSchema = z.object({
  sub: CognitoSubjectIdSchema,
  username: z.string(),
  email_verified: z.boolean(),
  email: z.string().email(),
  givenName: z.string(),
  familyName: z.string(),
  gender: z.string(),
  status: z.enum([
    "UNCONFIRMED",
    "CONFIRMED",
    "ARCHIVED",
    "COMPROMISED",
    "UNKNOWN",
    "RESET_REQUIRED",
    "FORCE_CHANGE_PASSWORD",
  ]),
})

export const mapToCognitoUser = (user: UserType): CognitoUser => {
  const cognitoUser = {
    username: user.Username,
    status: user.UserStatus,
    email: user.Attributes?.find((s) => s.Name === "email")?.Value,
    emailVerified: user.Attributes?.find((s) => s.Name === "email_verified")?.Value,
    givenName: user.Attributes?.find((s) => s.Name === "given_name")?.Value,
    familyName: user.Attributes?.find((s) => s.Name === "family_name")?.Value,
    gender: user.Attributes?.find((s) => s.Name === "gender")?.Value,
    sub: user.Attributes?.find((s) => s.Name === "sub")?.Value,
  }
  return CognitoUserSchema.parse(cognitoUser)
}

export type UserWithCognitoUser = z.infer<typeof UserWithCognitoUserSchema>
export const UserWithCognitoUserSchema = UserSchema.extend({
  claims: CognitoUserSchema,
})

export const mapToUserWithCognitoUser = (user: UserWithCognitoUser) => {
  return UserWithCognitoUserSchema.parse(user)
}
