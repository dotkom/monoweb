/**
 * Handler that will be called during the execution of a PostLogin flow.
 *
 * @param {Event} event - Details about the user and the context in which they are logging in.
 * @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
 */
exports.onExecutePostLogin = async (event, api) => {
  // Only try to link accounts when logging in via Feide
  if (event.connection.id !== event.secrets.FEIDE_CONNECTION_ID) {
    return
  }

  // Only try to link accounts on first login (if running in production)
  if (event.stats.logins_count > 1 && event.secrets.PRODUCTION === "true") {
    return
  }

  // Do not link accounts if the user has other connections
  if (event.user.identities.length > 1) {
    return
  }

  if (!event.user.app_metadata["ntnu_username"]) {
    throw new Error("User signed in with Feide does not have ntnu_username in app_metadata")
  }

  const ntnu_username = event.user.app_metadata["ntnu_username"]

  const ManagementClient = require("auth0").ManagementClient

  const mgmt = new ManagementClient({
    domain: event.secrets.DOMAIN,
    clientId: event.secrets.CLIENT_ID,
    clientSecret: event.secrets.CLIENT_SECRET,
  })

  const response = await mgmt.users.getAll({
    q: `app_metadata.ntnu_username:${ntnu_username} AND NOT user_id:${event.user.user_id}`,
  })
  if (response.status !== 200) {
    throw new Error(response.data)
  }

  const matched_users = response.data

  if (matched_users.length > 1) {
    throw new Error("Multiple auth0 users found with the same ntnu_username")
  }

  if (matched_users.length === 0) {
    return
  }

  const existing_user = matched_users[0]

  await mgmt.users.link(
    {
      id: existing_user.user_id,
    },
    {
      user_id: event.user.user_id,
      provider: "oauth2",
    }
  )

  api.authentication.setPrimaryUser(existing_user.user_id)
}
