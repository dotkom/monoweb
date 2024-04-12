/**
 * Handler that will be called during the execution of a PostLogin flow.
 *
 * @param {Event} event - Details about the user and the context in which they are logging in.
 * @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
 */
exports.onExecutePostLogin = async (event, api) => {
  const namespace = "https://online.ntnu.no"
  const { gender, phone, allergies } = event.user.app_metadata
  const { study_year } = event.user.user_metadata

  api.idToken.setCustomClaim(`${namespace}/gender`, gender)
  api.idToken.setCustomClaim(`${namespace}/phone`, phone)
  api.idToken.setCustomClaim(`${namespace}/study_year`, study_year)
  api.idToken.setCustomClaim(`${namespace}/allergies`, allergies)
}
