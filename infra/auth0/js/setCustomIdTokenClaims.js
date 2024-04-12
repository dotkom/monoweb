/**
 * Handler that will be called during the execution of a PostLogin flow.
 *
 * @param {Event} event - Details about the user and the context in which they are logging in.
 * @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
 */
exports.onExecutePostLogin = async (event, api) => {
  const namespace = "https://online.ntnu.no"
  const { gender, studyYear, phoneNumber, allergies, profilePicture, givenName, familyName, name, onBoarded } =
    event.user.app_metadata

  api.idToken.setCustomClaim(`${namespace}/givenName`, givenName)
  api.idToken.setCustomClaim(`${namespace}/familyName`, familyName)
  api.idToken.setCustomClaim(`${namespace}/name`, name)
  api.idToken.setCustomClaim(`${namespace}/gender`, gender)
  api.idToken.setCustomClaim(`${namespace}/phoneNumber`, phoneNumber)

  api.idToken.setCustomClaim(`${namespace}/studyYear`, studyYear)
  api.idToken.setCustomClaim(`${namespace}/allergies`, allergies)
  api.idToken.setCustomClaim(`${namespace}/profilePicture`, profilePicture)
  api.idToken.setCustomClaim(`${namespace}/onBoarded`, onBoarded)
}
