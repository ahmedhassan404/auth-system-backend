const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');
const LoginLog = require('../models/LoginLog');
const bcrypt = require('bcrypt');

passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  async (email, password, done) => {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return done(null, false, { message: 'Incorrect email or password' });
      }
      if (user.auth_method !== 'manual') {
        return done(null, false, { 
          message: `This account uses ${user.auth_method} authentication. Please log in with ${user.auth_method}.` 
        });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false, { message: 'Incorrect email or password' });
      }
      const loginLog = new LoginLog({
        user_id: user._id,
        ip_address: '0.0.0.0',
        user_agent: 'Unknown',
        status: 'success'
      });
      await loginLog.save();
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

passport.use(new GitHubStrategy(
  {
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ 'github.id': profile.id });
      if (!user) {
        if (profile.emails && profile.emails.length > 0) {
          const existingUser = await User.findOne({ email: profile.emails[0].value });
          if (existingUser) {
            return done(null, false, { message: 'Email already in use with a different account' });
          }
        }
        user = new User({
          username: profile.username,
          email: profile.emails && profile.emails.length > 0 ? profile.emails[0].value : `${profile.username}@github.com`,
          auth_method: 'github',
          github: {
            id: profile.id,
            username: profile.username
          }
        });
        await user.save();
      }
      const loginLog = new LoginLog({
        user_id: user._id,
        ip_address: '0.0.0.0',
        user_agent: 'Unknown',
        status: 'success',
        auth_method: 'github'
      });
      await loginLog.save();
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});
