module.exports.getGoogleAuthUrl = (client_id, redirect_uri) => {
  return `https://accounts.google.com/o/oauth2/v2/auth?scope=profile%20email&access_type=offline&response_type=code&redirect_uri=${redirect_uri}&client_id=${client_id}`;
};
