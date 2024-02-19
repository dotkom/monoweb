function fetchUserProfile(accessToken, ctx, callback) {
    // this is run every time a user logs in
    request.get(
      {
        url: 'https://auth.dataporten.no/openid/userinfo',
        headers: {
          'Authorization': 'Bearer ' + accessToken,
        }
      },
      (err, resp, body) => {
        if (err) {
          return callback(err);
        }
        if (resp.statusCode !== 200) {
          return callback(new Error(body));
        }
        let bodyParsed;
        try {
          bodyParsed = JSON.parse(body);
        } catch (jsonError) {
          return callback(new Error(body));
        }
        const profile = {
          user_id: bodyParsed.sub,
          email: bodyParsed.email,
          "email_verified": bodyParsed.email_verified,
          "name": bodyParsed.name,
        };
        callback(null, profile);
      }
    );
    }