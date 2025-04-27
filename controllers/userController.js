const User = require('../models/User');
const LoginLog = require('../models/LoginLog');

const userController = {
  getProfile: async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id).select('-password');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      res.status(200).json({
        success: true,
        user
      });
    } catch (error) {
      next(error);
    }
  },
  
  getLoginHistory: async (req, res, next) => {
    try {
      const loginLogs = await LoginLog.find({ user_id: req.user.id })
        .sort({ timestamp: -1 })
        .limit(10);
      
      res.status(200).json({
        success: true,
        loginLogs
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = userController;
