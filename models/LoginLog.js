const mongoose = require('mongoose');

const loginLogSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  ip_address: {
    type: String,
    required: true
  },
  user_agent: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['success', 'failure'],
    required: true
  },
  auth_method: {
    type: String,
    enum: ['manual', 'github'],
    default: 'manual'
  },
  failure_reason: {
    type: String
  }
});

const LoginLog = mongoose.model('LoginLog', loginLogSchema);
module.exports = LoginLog;
