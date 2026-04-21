/**
 * @param {Event} event - Details about registration event.
 * @param {PreUserRegistrationAPI} api
 */
exports.onExecutePreUserRegistration = async (event, api) => {
  if (event.secrets.DISALLOW_NTNU_MAIL !== "true") {
    return
  }

  const locale = event.transaction?.locale || event.request?.language || "nb"
  const isNorwegian = /^(nb|nn|no)(-|$)/i.test(locale)
  const ntnuMailNotAllowed = isNorwegian
    ? "Vennligst ikke bruk NTNU-e-posten din"
    : "Please do not use your NTNU student email address"

  const blacklist = ["ntnu.no", "stud.ntnu.no"]
  if (event.user.email) {
    const userEmailDomain = event.user.email.split("@")[1] // Get the user's email domain
    if (blacklist.includes(userEmailDomain)) {
      api.access.deny("invalid_request", ntnuMailNotAllowed)
      return
    }
  }
}
