// config.js
const dotenv = require('dotenv')
dotenv.config()
module.exports = {
  consumerKey: process.env.CONSUMER_API_KEY,
  consumerSecret: process.env.CONSUMER_API_KEY_SECRET,
}
