/**
 * Handler that will be called during the execution of a PostLogin flow.
 *
 * @param {Event} event - Details about the user and the context in which they are logging in.
 * @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
 */
exports.onExecutePostLogin = async (event, api) => {
  const namespace = "https://online.ntnu.no"
  const { gender, studyYear, phoneNumber, allergies, onBoarded } = event.user.app_metadata

  api.idToken.setCustomClaim(`${namespace}/gender`, gender)
  api.idToken.setCustomClaim(`${namespace}/phone_number`, phoneNumber)
  api.idToken.setCustomClaim(`${namespace}/study_year`, studyYear)
  api.idToken.setCustomClaim(`${namespace}/allergies`, allergies)
  api.idToken.setCustomClaim(`${namespace}/is_on_boarded`, onBoarded)
}
