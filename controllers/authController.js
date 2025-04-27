const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User');
const LoginLog = require('../models/LoginLog');

const authController = {
  register: async (req, res, next) => {
    try {
      const { username, email, password } = req.body;
      
      const existingUser = await User.findOne({ $or: [{ username }, { email }] });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: existingUser.username === username ? 'Username already exists' : 'Email already exists'
        });
      }
      
      const newUser = new User({
        username,
        email,
        password,
        auth_method: 'manual'
      });
      
      await newUser.save();
      
      res.status(201).json({
        success: true,
        message: 'User registered successfully'
      });
    } catch (error) {
      if (error.message.includes('Password must')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  },
  
  login: (req, res, next) => {
    passport.authenticate('local', async (err, user, info) => {
      try {
        if (err) return next(err);
        
        if (!user) {
          await new LoginLog({
            user_id: info.userId || null,
            ip_address: req.ip || req.connection.remoteAddress,
            user_agent: req.headers['user-agent'] || 'Unknown',
            status: 'failure',
            failure_reason: info.message
          }).save();
          
          return res.status(401).json({
            success: false,
            message: info.message || 'Authentication failed'
          });
        }
        
        user.last_login = Date.now();
        await user.save();
        
        const token = jwt.sign(
          { id: user._id, username: user.username, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRES_IN }
        );
        
        res.status(200).json({
          success: true,
          message: 'Login successful',
          token,
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            auth_method: user.auth_method
          }
        });
      } catch (error) {
        next(error);
      }
    })(req, res, next);
  },
  
  githubLogin: passport.authenticate('github', { scope: ['user:email'] }),
  
  githubCallback: (req, res, next) => {
    passport.authenticate('github', async (err, user, info) => {
      try {
        if (err) return next(err);
        
        if (!user) {
          return res.redirect(`${process.env.FRONTEND_URL}/login?error=${encodeURIComponent(info.message || 'GitHub authentication failed')}`);
        }
        
        user.last_login = Date.now();
        await user.save();
        
        const token = jwt.sign(
          { id: user._id, username: user.username, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRES_IN }
        );
        
        res.redirect(`${process.env.FRONTEND_URL}/oauth-callback?token=${token}`);
      } catch (error) {
        next(error);
      }
    })(req, res, next);
  },
  
  verifyToken: (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Token is valid',
      user: req.user
    });
  },
  
  logout: (req, res) => {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });
    });
  }
};

module.exports = authController;
