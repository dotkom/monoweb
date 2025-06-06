/**
* Handler that will be called during the execution of a PostLogin flow.
*
* @param {Event} event - Details about the user and the context in which they are logging in.
* @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
*/
exports.onExecutePostLogin = async (event, api) => {
  // Only try to link accounts when logging in via Feide
  if (event.connection.id !== event.secrets.FEIDE_CONNECTION_ID) {
    return;
  }
};
