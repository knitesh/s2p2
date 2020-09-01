const express = require('express')
const session = require('express-session')
const TwitterLogin = require('twitter-login')
const GoogleLogin = require('google-login')
const config = require('./config')

require('dotenv').config()

const app = express()
const port = 9000

const sessionConfig = {
  user: null,
  tokenSecret: null,
  secret: 'keyboard cat',
}

app.use(session(sessionConfig))

const twitter = new TwitterLogin({
  consumerKey: config.consumerKey,
  consumerSecret: config.consumerSecret,
  callbackUrl: `http://localhost:${port}/twitter/auth/userToken`,
})

app.get('/twitter/auth', async (req, res) => {
  try {
    const result = await twitter.login()
    // Save the OAuth token secret for use in your /twitter/callback route
    req.session.tokenSecret = result.tokenSecret
    console.log(result)
    // Redirect to the /twitter/callback route, with the OAuth responses as query params
    res.redirect(result.url)
  } catch (err) {
    // Handle Error here
    res.send('Twitter login error.')
  }
})

app.get('/twitter/auth/userToken', async (req, res) => {
  try {
    const oAuthParam = {
      oauth_token: req.query.oauth_token,
      oauth_verifier: req.query.oauth_verifier,
    }
    const userInfo = await twitter.callback(
      oAuthParam,
      req.session.tokenSecret,
    )
    // Delete the tokenSecret securely
    delete req.session.tokenSecret

    req.session.user = userInfo

    // Redirect to whatever route that can handle your new Twitter login user details!
    res.redirect('/')
  } catch (err) {
    // Handle Error here
    console.log(err)
    res.send('Twitter login error.')
  }
})

const google = new GoogleLogin({
  clientId: config.clientId,
  clientSecret: config.clientSecret,
  redirectUri: config.redirectUri,
  scope: config.scope,
  accessType: config.accessType, // to get refresh token pass access type: offline
  prompt: config.prompt, // to prompt user everytime
})

app.get('/google/oauth', async (req, res) => {
  // generate the URL that Googl will use for login and consent dialog
  var result = await google.getGoogleOauthUrl()
  // redirect the user to consent screen
  res.redirect(result)
})

// This is the Authrized redirect URl that needs to be added to oAuth Client Id generation screen
// Google will  send the code and related scope as query string to this Url
app.get('/google/oauth/callback', async (req, res) => {
  const oAuthParam = {
    code: req.query.code,
    scope: req.query.scope,
  }
  // if you just need the code
  const code = await google.getOauthCodeAsync(oAuthParam)
  // get the access token, token_type  so that you can make additional call to google
  var result = await google.getAccessTokenAsync(oAuthParam)
  // This example just showing result returned in a browers
  // You should store this in a secure database and never expose to client app
  res.send(JSON.stringify(result))
})

app.get('/', (req, res) => {
  const _user = req.session && req.session.user
  if (_user) {
    res.send(JSON.stringify(_user))
  } else {
    res.send('Login with Twitter/ Google')
  }
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
