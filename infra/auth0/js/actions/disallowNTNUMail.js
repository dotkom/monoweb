/**
 * @param {Event} event - Details about registration event.
 * @param {PreUserRegistrationAPI} api
 */
exports.onExecutePreUserRegistration = async (event, api) => {
    const blacklist = ["ntnu.no", "stud.ntnu.no"];
        if (event.user.email) {
        const  userEmailDomain = event.user.email.split('@')[1] // Get the user's email domain
        if(blacklist.includes(userEmailDomain)){
            api.access.deny('invalid_request', "Vennligst ikke bruk stud.ntnu.no-mailen din");
        }
    }
};