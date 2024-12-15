const DispatchOrder = require('../models/DispatchOrder');
const Order = require('../models/Order');
const { AppError } = require('../utils/errorHandler');
const mongoose = require('mongoose');

exports.createDispatchOrder = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { 
      orderId, 
      vehicle, 
      estimatedDeliveryDate 
    } = req.body;

    // Verify order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    // Check if dispatch order already exists
    const existingDispatchOrder = await DispatchOrder.findOne({ 
      associatedOrder: orderId 
    });
    
    if (existingDispatchOrder) {
      return next(new AppError('Dispatch order already created for this order', 400));
    }

    // Generate unique dispatch order number
    const dispatchOrderNumber = `DSP-${Date.now().toString().slice(-6)}`;

    const dispatchOrder = new DispatchOrder({
      orderNumber: dispatchOrderNumber,
      associatedOrder: orderId,
      vehicle,
      estimatedDeliveryDate,
      trackingInformation: {
        currentLocation: 'Warehouse',
        lastUpdated: new Date()
      },
      history: [{
        action: 'created',
        user: req.user._id,
        details: req.body
      }]
    });

    await dispatchOrder.save({ session });

    // Update order status to processing
    order.status = 'processing';
    order.history.push({
      action: 'status-changed',
      user: req.user._id,
      details: { newStatus: 'processing' }
    });
    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      status: 'success',
      data: { dispatchOrder }
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(new AppError(error.message, 500));
  }
};

exports.updateDispatchOrder = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const updateData = req.body;

    const dispatchOrder = await DispatchOrder.findById(id);
    
    if (!dispatchOrder) {
      return next(new AppError('Dispatch order not found', 404));
    }

    // Track changes in history
    dispatchOrder.history.push({
      action: 'updated',
      user: req.user._id,
      details: {
        oldValues: { ...dispatchOrder.toObject() },
        newValues: updateData
      }
    });

    // Update specific fields
    Object.keys(updateData).forEach(key => {
      dispatchOrder[key] = updateData[key];
    });

    // Update status-related logic
    if (updateData.status === 'delivered') {
      const order = await Order.findById(dispatchOrder.associatedOrder);
      order.status = 'completed';
      order.history.push({
        action: 'status-changed',
        user: req.user._id,
        details: { newStatus: 'completed' }
      });
      await order.save({ session });
    }

    await dispatchOrder.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      status: 'success',
      data: { dispatchOrder }
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(new AppError(error.message, 500));
  }
};

exports.getDispatchOrders = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      sortBy = 'createdAt' 
    } = req.query;

    const queryOptions = {};
    if (status) queryOptions.status = status;

    const dispatchOrders = await DispatchOrder.find(queryOptions)
      .populate('associatedOrder')
      .sort({ [sortBy]: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await DispatchOrder.countDocuments(queryOptions);

    res.status(200).json({
      status: 'success',
      data: {
        dispatchOrders,
        totalPages: Math.ceil(total / limit),
        currentPage: page
      }
    });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};