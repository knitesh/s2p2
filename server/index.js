const express = require('express')
const session = require('express-session')
const TwitterLogin = require('twitter-login')
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

app.get('/', (req, res) => {
  const _user = req.session && req.session.user
  if (_user) {
    res.send(JSON.stringify(_user))
  } else {
    res.send('Login with Twitter')
  }
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
