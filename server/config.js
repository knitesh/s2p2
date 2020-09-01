// config.js
const dotenv = require('dotenv')
dotenv.config()
module.exports = {
  consumerKey: process.env.CONSUMER_API_KEY,
  consumerSecret: process.env.CONSUMER_API_KEY_SECRET,

  clientId: process.env.clientId,
  clientSecret: process.env.clientSecret,
  redirectUri: process.env.redirectUri,
  scope: process.env.redirectUri,
  accessType: process.env.redirectUri,
  prompt: process.env.redirectUri,
}
