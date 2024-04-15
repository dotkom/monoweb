/**
 * Handler that will be called during the execution of a PostLogin flow.
 *
 * @param {Event} event - Details about the user and the context in which they are logging in.
 * @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
 */
exports.onExecutePostLogin = async (event, api) => {
  const namespace = "https://online.ntnu.no"

  const { study_year, ow_user_id } = event.user.app_metadata

  if (study_year) {
    api.idToken.setCustomClaim(`${namespace}/study_year`, study_year)
  }

  if (ow_user_id) {
    api.idToken.setCustomClaim(`${namespace}/ow_user_id`, ow_user_id)
  }
}
