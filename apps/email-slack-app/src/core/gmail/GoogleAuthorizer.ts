import crypto from "crypto"
import * as http from "node:http"
import * as url from "node:url"
import express from "express"
import session from "express-session"
import { type Credentials, OAuth2Client } from "google-auth-library"

// If modifying these scopes, delete token.json.
const PORT = 3000
const REDIRECT_ROUTE = "/oauth2callback"
const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly", "https://www.googleapis.com/auth/gmail.modify"]
/* Global variable that stores user credential in this code example.
 * ACTION ITEM for developers:
 *   Store user's refresh token in your data store if
 *   incorporating this code into your real app.
 *   For more information on handling refresh tokens,
 *   see https://github.com/googleapis/google-api-nodejs-client#handling-refresh-tokens
 */
async function setupWebServerForOauth2(client: OAuth2Client): Promise<Credentials> {
  return new Promise((resolve, reject) => {
    const app = express()

    app.use(
      session({
        secret: "your_secure_secret_key", // Replace with a strong secret
        resave: false,
        saveUninitialized: false,
      })
    )

    // Example on redirecting user to Google's OAuth 2.0 server.
    app.get("/", async (req, res) => {
      // Generate a secure random state value.
      const state = crypto.randomBytes(32).toString("hex")
      // Store state in the session

      // @ts-ignore
      req.session.state = state

      // Generate a url that asks permissions for the Drive activity scope
      const authorizationUrl = client.generateAuthUrl({
        // 'online' (default) or 'offline' (gets refresh_token)
        access_type: "offline",
        /** Pass in the scopes array defined above.
         * Alternatively, if only one scope is needed, you can pass a scope URL as a string */
        scope: SCOPES,
        // Enable incremental authorization. Recommended as a best practice.
        include_granted_scopes: true,
        // Include the state parameter to reduce the risk of CSRF attacks.
        state: state,
      })

      res.redirect(authorizationUrl)
    })

    // Receive the callback from Google's OAuth 2.0 server.
    app.get(REDIRECT_ROUTE, async (req, res) => {
      // Handle the OAuth 2.0 server response
      const q = url.parse(req.url, true).query

      if (q.error) {
        // An error response e.g. error=access_denied
        console.log(`Error:${q.error}`)
        reject(q.error)
        //@ts-ignore
      } else if (q.state !== req.session.state) {
        //check state value
        console.log("State mismatch. Possible CSRF attack")
        res.end("State mismatch. Possible CSRF attack")
        reject("State mismatch. Possible CSRF attack")
      } else {
        // Get access and refresh tokens (if access_type is offline)
        const { tokens } = await client.getToken(q.code as string)
        client.setCredentials(tokens)

        // Redirect or respond to the user
        res.send("Authentication successful! You can close this window.")
        resolve(tokens)
      }
    })

    const server = http.createServer(app)
    server.listen(PORT)
    console.log(`http://localhost:${PORT}`)
  })
}

export class GoogleAuthorizer {
  private oauth2Client: OAuth2Client
  constructor(clientId: string, clientSecret: string, redirectUrl: string) {
    this.oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUrl)
  }
  async authorizeOauthClientWithUserRefreshToken(refreshToken: string): Promise<OAuth2Client> {
    this.oauth2Client.setCredentials({ refresh_token: refreshToken })
    return this.oauth2Client
  }

  async authorizeUser() {
    const token = await setupWebServerForOauth2(this.oauth2Client)
    console.log("Refresh token: \n", token.refresh_token)
  }
}
