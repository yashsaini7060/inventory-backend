const Order = require('../models/Order');
const Inventory = require('../models/Inventory');
const { AppError } = require('../utils/errorHandler');
const mongoose = require('mongoose');


exports.createOrder = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { customer, items } = req.body;

    // Validate and update inventory
    const updatedItems = await Promise.all(items.map(async (item) => {
      const inventoryItem = await Inventory.findById(item.product);
      
      if (!inventoryItem) {
        throw new AppError(`Product ${item.product} not found`, 404);
      }

      if (inventoryItem.quantity < item.quantity) {
        throw new AppError(`Insufficient stock for product ${inventoryItem.productName}`, 400);
      }

      // Reduce inventory
      inventoryItem.quantity -= item.quantity;
      inventoryItem.history.push({
        action: 'stock-adjusted',
        user: req.user._id,
        details: { 
          orderId: 'pending', 
          quantityReduced: item.quantity 
        }
      });
      await inventoryItem.save({ session });

      return {
        ...item,
        unitPrice: inventoryItem.unitPrice
      };
    }));

    // Calculate total amount
    const totalAmount = updatedItems.reduce((total, item) => 
      total + (item.quantity * item.unitPrice), 0);

    // Create order
    const order = new Order({
      customer,
      items: updatedItems,
      totalAmount,
      history: [{
        action: 'created',
        user: req.user._id,
        details: req.body
      }]
    });

    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      status: 'success',
      data: { order }
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(new AppError(error.message, 500));
  }
};


exports.updateOrderStatus = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findById(id);
    
    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    // Tracking status changes
    order.history.push({
      action: 'status-changed',
      user: req.user._id,
      details: {
        oldStatus: order.status,
        newStatus: status
      }
    });

    // If order is cancelled, restore inventory
    if (status === 'cancelled') {
      await Promise.all(order.items.map(async (item) => {
        const inventoryItem = await Inventory.findById(item.product);
        
        if (inventoryItem) {
          inventoryItem.quantity += item.quantity;
          inventoryItem.history.push({
            action: 'stock-adjusted',
            user: req.user._id,
            details: { 
              orderId: order._id, 
              quantityRestored: item.quantity 
            }
          });
          await inventoryItem.save({ session });
        }
      }));
    }

    // Update order status
    order.status = status;
    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      status: 'success',
      data: { order }
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(new AppError(error.message, 500));
  }
};

exports.getOrders = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      sortBy = 'createdAt' 
    } = req.query;

    const queryOptions = {};
    if (status) queryOptions.status = status;

    const orders = await Order.find(queryOptions)
      .populate('items.product')
      .sort({ [sortBy]: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(queryOptions);

    res.status(200).json({
      status: 'success',
      data: {
        orders,
        totalPages: Math.ceil(total / limit),
        currentPage: page
      }
    });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

exports.getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate('items.product')
      .populate('history.user', 'username email');

    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { order }
    });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};