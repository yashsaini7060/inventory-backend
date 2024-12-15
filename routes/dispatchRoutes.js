const express = require('express');
const dispatchController = require('../controllers/dispatchOrderController');
const { 
  authMiddleware, 
  checkRolePermission 
} = require('../middleware/authMiddleware');

const router = express.Router();

// Create Dispatch Order (Admin/SuperAdmin)
router.post('/', 
  authMiddleware,
  checkRolePermission(['admin', 'superAdmin']),
  dispatchController.createDispatchOrder
);

// Update Dispatch Order (Admin/SuperAdmin)
router.patch('/:id', 
  authMiddleware,
  checkRolePermission(['admin', 'superAdmin']),
  dispatchController.updateDispatchOrder
);

// Get Dispatch Orders (Authenticated Users)
router.get('/', 
  authMiddleware,
  dispatchController.getDispatchOrders
);

module.exports = router;