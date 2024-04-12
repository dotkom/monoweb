/**
 * Handler that will be called during the execution of a PostLogin flow.
 *
 * @param {Event} event - Details about the user and the context in which they are logging in.
 * @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
 */
exports.onExecutePostLogin = async (event, api) => {
  api.idToken.setCustomClaim("gender", event.user.user_metadata.gender)
  api.idToken.setCustomClaim("studyYear", event.user.app_metadata.studyYear)
  api.idToken.setCustomClaim("phoneNumber", event.user.app_metadata.phoneNumber)
  api.idToken.setCustomClaim("allergies", event.user.app_metadata.allergies)
  api.idToken.setCustomClaim("profilePicture", event.user.app_metadata.profilePicture)
  api.idToken.setCustomClaim("givenName", event.user.app_metadata.givenName)
  api.idToken.setCustomClaim("familyName", event.user.app_metadata.familyName)
  api.idToken.setCustomClaim("name", event.user.app_metadata.name)
  api.idToken.setCustomClaim("onBoarded", event.user.app_metadata.onBoarded)
}
