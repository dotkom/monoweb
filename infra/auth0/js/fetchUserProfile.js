async function fetchUserProfile(accessToken, ctx, callback) {
  const headers = { Authorization: `Bearer ${accessToken}` }

  // https://docs.feide.no/reference/apis/userinfo.html
  const openid_userinfo_response = await fetch("https://auth.dataporten.no/openid/userinfo", { headers })

  if (!openid_userinfo_response.ok) {
    return callback(new Error("Failed to fetch user profile"))
  }

  const openid_userinfo = await openid_userinfo_response.json()

  // https://docs.feide.no/reference/apis/attributes_feide/extended_userinfo.html
  const extended_userinfo_response = await fetch("https://api.dataporten.no/userinfo/v1/userinfo", { headers })

  if (!extended_userinfo_response.ok) {
    return callback(new Error("Failed to fetch user profile"))
  }

  const extended_userinfo = await extended_userinfo_response.json()

  // Always a single string according to
  // https://docs.feide.no/reference/apis/attributes_feide/available_attributes.html#required-attributes
  const ntnu_username = extended_userinfo.uid[0]

  callback(null, {
    user_id: openid_userinfo.sub,
    email: openid_userinfo.email,
    email_verified: openid_userinfo.email_verified,
    name: openid_userinfo.name,
    app_metadata: { ntnu_username },
  })
}
