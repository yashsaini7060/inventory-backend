const express = require('express');
const orderController = require('../controllers/orderController');
const { 
  authMiddleware, 
  checkRolePermission 
} = require('../middleware/authMiddleware');

const router = express.Router();

// Create Order (User with specific permission)
router.post('/', 
  authMiddleware,
  orderController.createOrder
);

// Update Order Status (Admin/SuperAdmin)
router.patch('/:id/status', 
  authMiddleware,
  checkRolePermission(['admin', 'superAdmin']),
  orderController.updateOrderStatus
);

// Get Orders (Authenticated Users)
router.get('/', 
  authMiddleware,
  orderController.getOrders
);

// Get Order by ID (Authenticated Users)
router.get('/:id', 
  authMiddleware,
  orderController.getOrderById
);

module.exports = router;