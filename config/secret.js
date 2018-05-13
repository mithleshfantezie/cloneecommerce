module.exports = {
  database: 'mongodb://localhost:27017/Amaclone',
  secretKey: "keyboard cat",
  facebook: {
    clientID: process.env.FACEBOOK_ID || '183704505789139' ,
    clientSecrect: process.env.FACEBOOK_SECRET || '146b308a60de4636a2d83bc4f1c30a66' ,
    profileFields: ['email','displayName'],
    callbackURL: 'http://localhost:3000/auth/facebook/callback'
  }
}
