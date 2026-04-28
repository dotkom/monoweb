/**
 * @param {Event} event - Details about registration event.
 * @param {PreUserRegistrationAPI} api
 */
exports.onExecutePreUserRegistration = async (event, api) => {
  const locale = event.transaction?.locale || event.request?.language || "nb"
  const isNorwegian = /^(nb|nn|no)(-|$)/i.test(locale)
  const fullNameRequired = isNorwegian ? "Fullt navn er påkrevd" : "Full name is required"

  const fullName = event.request.body?.["ulp-full-name"]?.trim()

  if (!fullName || !/\s+/.test(fullName)) {
    api.validation.error("invalid_payload", fullNameRequired)
    return
  }

  api.user.setUserMetadata("full_name", fullName)
  // We store a copy of their inputted full name so we can keep track of if their name has been manually updated. This
  // allows us to replace self-entered name with their Feide name, but keep manual updates.
  api.user.setAppMetadata("initial_full_name", fullName)
}
