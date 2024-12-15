const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { AppError } = require('../utils/errorHandler');
const mongoose = require('mongoose');

const cookieOptions = {
  secure: process.env.NODE_ENV === 'production' ? true : false,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  httpOnly: true,
};


exports.registerUser = async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;
    console.log(req.body)
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      return next(new AppError('User already exists', 400));
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      role: req.user && req.user.role === 'superAdmin' ? role : 'user'
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );

    res.status(201).json({
      status: 'success',
      token,
      data: { 
        user: { 
          id: user._id, 
          username: user.username, 
          email: user.email, 
          role: user.role 
        } 
      }
    });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Invalid email or password', 401));
    }

    // Generate token
    // const token = jwt.sign(
    //   { id: user._id, role: user.role }, 
    //   process.env.JWT_SECRET, 
    //   { expiresIn: '1d' }
    // );
    const token = await user.generateJWTToken();
    // Update last login
    user.lastLogin = Date.now();
    await user.save();
    // Setting the token in the cookie with name token along with cookieOptions
    res.cookie('token', token, cookieOptions);
    // res.set('Authorization', `Bearer ${token}`);

    res.status(200).json({
      status: 'success',
      token,
      data: { 
        user: { 
          id: user._id, 
          username: user.username, 
          email: user.email, 
          role: user.role 
        } 
      }
    });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

exports.logoutUser = async (req, res, next) => {
  // Setting the cookie value to null
  res.cookie('token', null, {
    secure: process.env.NODE_ENV === 'production' ? true : false,
    maxAge: 0,
    httpOnly: true,
  }); 

  // Sending the response
  res.status(200).json({
    success: true,
    message: 'User logged out successfully',
  });
};

exports.updateUserPermissions = async (req, res, next) => {
  try {
    const { userId } = req.params;
    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return next(new AppError('Invalid user ID format', 400));
    }
    const { 
      role,
      permissions 
    } = req.body;
    console.log(req.body)
    // Only superAdmin can update roles and permissions
    const user = await User.findByIdAndUpdate(
      userId , 
      { 
        role, 
        permissions 
      }, 
      { new: true, runValidators: true }
    );

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};