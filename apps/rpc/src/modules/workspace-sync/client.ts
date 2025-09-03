import { type admin_directory_v1, google } from "googleapis"
import z from "zod"
import { isSyncEnabled } from "./helpers"

const SCOPES = [
  "https://www.googleapis.com/auth/admin.directory.group",
  "https://www.googleapis.com/auth/admin.directory.group.member",
  "https://www.googleapis.com/auth/admin.directory.user",
  "https://www.googleapis.com/auth/admin.directory.user.alias",
  "https://www.googleapis.com/auth/admin.directory.user.security",
]

const serviceAccountJsonSchema = z.object({
  auth_provider_x509_cert_url: z.string().url(),
  auth_uri: z.string().url(),
  client_email: z.string().email(),
  client_id: z.string().min(1).max(100),
  client_x509_cert_url: z.string().url(),
  private_key: z.string().min(1).max(1000),
  private_key_id: z.string().min(1).max(100),
  project_id: z.string().min(1).max(100),
  token_uri: z.string().url(),
  type: z.literal("service_account"),
})

const getJWT = () => {
  if (!process.env.WORKSPACE_SYNC_SERVICE_ACCOUNT) {
    return null
  }

  const serviceAccountJson = JSON.parse(process.env.WORKSPACE_SYNC_SERVICE_ACCOUNT)
  const result = serviceAccountJsonSchema.safeParse(serviceAccountJson)

  if (!result.success) {
    return null
  }

  return new google.auth.JWT({
    email: result.data.client_email,
    key: result.data.private_key,
    scopes: SCOPES,
    subject: process.env.WORKSPACE_SYNC_SERVICE_ACCOUNT_EMAIL,
  })
}

export function getDirectory(): admin_directory_v1.Admin | null {
  if (!isSyncEnabled()) {
    return null
  }

  const auth = getJWT()

  if (!auth) {
    return null
  }

  return google.admin({ version: "directory_v1", auth })
}
