const express = require('express');
const inventoryController = require('../controllers/inventoryController');
const { 
  authMiddleware, 
  checkRolePermission 
} = require('../middleware/authMiddleware');

const router = express.Router();

// Create Inventory Item (Admin/SuperAdmin)
router.post('/', 
  authMiddleware, 
  checkRolePermission(['admin', 'superAdmin']),
  inventoryController.createInventoryItem
);

// Update Inventory Item (Admin/SuperAdmin)
router.patch('/:id', 
  authMiddleware, 
  checkRolePermission(['admin', 'superAdmin']),
  inventoryController.updateInventoryItem
);

// Delete Inventory Item (SuperAdmin)
router.delete('/:id', 
  authMiddleware, 
  checkRolePermission(['superAdmin']),
  inventoryController.deleteInventoryItem
);

// Get All Inventory Items (Authenticated Users)
router.get('/', 
  authMiddleware,
  inventoryController.getAllInventoryItems
);

module.exports = router;