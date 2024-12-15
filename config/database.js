const mongoose = require('mongoose');
// const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || `mongodb://127.0.0.1:27017/inventory`);
    // logger.info('MongoDB connected successfully');
    console.log('MongoDB connected successfully');

  } catch (error) {
    // logger.error('MongoDB connection failed:', error);
    console.log('MongoDB connection failed:', error);

    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    // logger.info('MongoDB disconnected');
    console.log('MongoDB disconnected');

  } catch (error) {
    // logger.error('Error disconnecting from MongoDB:', error);
    console('Error disconnecting from MongoDB:', error);

  }
};

module.exports = { connectDB, disconnectDB };