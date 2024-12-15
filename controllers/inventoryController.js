const Inventory = require('../models/Inventory');
const { AppError } = require('../utils/errorHandler');

exports.createInventoryItem = async (req, res, next) => {
  try {
    const {  
      productName, 
      productCode, 
      quantity, 
      unitPrice, 
      category, 
      location 
    } = req.body;

    // Check if product code already exists
    const existingProduct = await Inventory.findOne({ productCode });
    if (existingProduct) {
      return next(new AppError('Product code must be unique', 400));
    }

    const inventoryItem = new Inventory({
      productName,
      productCode,
      quantity,
      unitPrice,
      category,
      location,
      history: [{
        action: 'created',
        user: req.user._id,
        details: req.body
      }]
    });

    await inventoryItem.save();

    res.status(201).json({
      status: 'success',
      data: { inventoryItem }
    });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};


//TODO : How this update works
exports.updateInventoryItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const inventoryItem = await Inventory.findById(id);
    if (!inventoryItem) {
      return next(new AppError('Inventory item not found', 404));
    }

    // Track changes in history
    inventoryItem.history.push({
      action: 'updated',
      user: req.user._id,
      details: {
        oldValues: { ...inventoryItem.toObject() },
        newValues: updateData
      }
    });

    // Update inventory item
    Object.assign(inventoryItem, updateData);
    await inventoryItem.save();

    res.status(200).json({
      status: 'success',
      data: { inventoryItem }
    });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

exports.deleteInventoryItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    const inventoryItem = await Inventory.findByIdAndDelete(id);
    if (!inventoryItem) {
      return next(new AppError('Inventory item not found', 404));
    }

    res.status(200).json({
      status: 'success',
      message: 'Inventory item deleted successfully'
    });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

exports.getAllInventoryItems = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      status 
    } = req.query;

    const queryOptions = {};
    if (category) queryOptions.category = category;
    if (status) queryOptions.status = status;

    const inventoryItems = await Inventory.find(queryOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Inventory.countDocuments(queryOptions);

    res.status(200).json({
      status: 'success',
      data: {
        inventoryItems,
        totalPages: Math.ceil(total / limit),
        currentPage: page
      }
    });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};