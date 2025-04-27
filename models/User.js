const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: (value) => validator.isEmail(value),
      message: 'Invalid email format'
    }
  },
  password: {
    type: String,
    required: function() {
      return this.auth_method === 'manual';
    },
    minlength: 8
  },
  auth_method: {
    type: String,
    enum: ['manual', 'github'],
    required: true
  },
  github: {
    id: String,
    username: String
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  last_login: {
    type: Date
  }
}, { timestamps: true });

// Password validation middleware
userSchema.pre('save', async function(next) {
  const user = this;
  
  // Only hash password if it's modified (or new) and auth method is manual
  if (!user.isModified('password') || user.auth_method !== 'manual') return next();
  
  // Validate password strength
  if (user.auth_method === 'manual') {
    // At least 8 characters
    if (user.password.length < 8) {
      return next(new Error('Password must be at least 8 characters long'));
    }
    
    // At least one uppercase letter
    if (!/[A-Z]/.test(user.password)) {
      return next(new Error('Password must include at least one uppercase letter'));
    }
    
    // At least one lowercase letter
    if (!/[a-z]/.test(user.password)) {
      return next(new Error('Password must include at least one lowercase letter'));
    }
    
    // At least one number
    if (!/[0-9]/.test(user.password)) {
      return next(new Error('Password must include at least one number'));
    }
    
    // At least one special character
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(user.password)) {
      return next(new Error('Password must include at least one special character'));
    }
  }
  
  try {
    // Generate salt and hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});


userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
