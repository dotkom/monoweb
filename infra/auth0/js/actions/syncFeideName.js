/**
 * Handler that will be called during the execution of a PostLogin flow.
 *
 * @param {Event} event - Details about the user and the context in which they are logging in.
 * @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
 */
exports.onExecutePostLogin = async (event, api) => {
  if (event.connection.id !== event.secrets.FEIDE_CONNECTION_ID) {
    return
  }

  const feideIdentity = event.user.identities?.find((identity) => identity.connection === event.connection.name)
  const rawName = feideIdentity?.profileData?.name ?? event.user.name
  const feideName = typeof rawName === "string" ? rawName.trim() : ""

  if (!feideName) {
    return
  }

  api.user.setAppMetadata("feide_full_name", feideName)
}
