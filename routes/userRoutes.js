const express = require('express');

const userController = require('../controllers/userController');
const { 
  authMiddleware, 
  checkRolePermission 
} = require('../middleware/authMiddleware');

const router = express.Router();

// Public Routes
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/logout', userController.logoutUser);
// Protected Routes
router.get('/profile', 
  authMiddleware, 
  userController.getUserProfile
);

// Super Admin Routes
router.patch('/permissions/:userId', 
  authMiddleware, 
  checkRolePermission(['superAdmin']),
  userController.updateUserPermissions
);

module.exports = router;