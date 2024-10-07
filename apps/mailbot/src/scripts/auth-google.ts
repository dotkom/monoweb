import { GoogleAuthorizer } from "../core/gmail-client/GoogleAuthorizer"
import { env } from "../env"

const googleAuthorizer = new GoogleAuthorizer(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, env.GOOGLE_REDIRECT_URL)
await googleAuthorizer.authorizeUser()
console.log("Save the refresh token to the doppler project")
