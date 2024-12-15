const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: validator.isEmail,
      message: 'Invalid email address'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  role: {
    type: String,
    enum: ['superAdmin', 'admin', 'user'],
    default: 'user'
  },
  permissions: {
    createInventoryOrder: { type: Boolean, default: false },
    updateInventoryOrder: { type: Boolean, default: false },
    createDispatchOrder: { type: Boolean, default: false },
    updateDispatchOrder: { type: Boolean, default: false }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: Date
}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.generateJWTToken = async function () {
  return await jwt.sign(
    { id: this._id, role: this.role},
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRY,
    }
  );
},

module.exports = mongoose.model('User', UserSchema);