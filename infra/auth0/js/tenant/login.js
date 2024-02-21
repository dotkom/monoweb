function login(email, password, callback) {
  // This script should authenticate a user against the credentials stored in
  // your database.
  // It is executed when a user attempts to log in or immediately after signing
  // up (as a verification that the user was successfully signed up).
  //
  // Everything returned by this script will be set as part of the user profile
  // and will be visible by any of the tenant admins. Avoid adding attributes
  // with values such as passwords, keys, secrets, etc.
  //
  // The `password` parameter of this function is in plain text. It must be
  // hashed/salted to match whatever is stored in your database. For example:
  //
  //     var bcrypt = require('bcrypt@0.8.5');
  //     bcrypt.compare(password, dbPasswordHash, function(err, res)) { ... }
  //
  // There are three ways this script can finish:
  // 1. The user's credentials are valid. The returned user profile should be in
  // the following format: https://auth0.com/docs/users/normalized/auth0/normalized-user-profile-schema
  //     var profile = {
  //       user_id: ..., // user_id is mandatory
  //       email: ...,
  //       [...]
  //     };
  //     callback(null, profile);
  // 2. The user's credentials are invalid
  //     callback(new WrongUsernameOrPasswordError(email, "my error message"));
  //
  //    Note: Passing no arguments or a falsey first argument to
  //    `WrongUsernameOrPasswordError` will result in the error being logged as
  //    an `fu` event (invalid username/email) with an empty string for a user_id.
  //    Providing a truthy first argument will result in the error being logged
  //    as an `fp` event (the user exists, but the password is invalid) with a
  //    user_id value of "auth0|<first argument>". See the `Log Event Type Codes`
  //    documentation for more information about these event types:
  //    https://auth0.com/docs/deploy-monitor/logs/log-event-type-codes
  // 3. Something went wrong while trying to reach your database
  //     callback(new Error("my error message"));
  //
  // A list of Node.js modules which can be referenced is available here:
  //
  //    https://tehsis.github.io/webtaskio-canirequire/

  const msg = 'Please implement the Login script for this database connection ' +
    'at https://manage.auth0.com/#/connections/database';
  return callback(new Error(msg));
}
