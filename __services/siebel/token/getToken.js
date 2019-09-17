const request = require("request");
const siebelApiBaseurl = process.env.SIEBEL_API_BASEURL;

const getToken = async () => {
  const bodyDataToToken = {
    auth: {
      user: process.env.MIDDLEWARE_USERNAME,
      pass: process.env.MIDDLEWARE_PASSWORD
    },
    form: {
      grant_type: "client_credentials"
    },
    json: true,
    strictSSL: false
  };

  const accessToken = await new Promise((resolve, reject) => {
    request.post(
      `${siebelApiBaseurl}/GetToken`,
      bodyDataToToken,
      (err, res, body) => {
        if (err) reject(err);
        resolve(body);
      }
    );
  });

  return accessToken;
};

module.exports = getToken;
