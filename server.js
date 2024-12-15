require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser') ;
const cors = require('cors');
const morgan = require('morgan');
const { connectDB } = require('./config/database.js');
const {errorHandler} = require('./utils/errorHandler.js');

// Route imports
const userRoutes = require('./routes/userRoutes.js');
const inventoryRoutes = require('./routes/inventoryRoutes');
// const orderRoutes = require('./routes/orderRoutes');
// const dispatchRoutes = require('./routes/dispatchRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Third-Party
app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
    credentials: true,
  })
);

app.use(morgan('combined'));
app.use(cookieParser());
// Database Connection
connectDB();

// Routes
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/inventory', inventoryRoutes);
// app.use('/api/orders', orderRoutes);
// app.use('/api/dispatch', dispatchRoutes);

// Global Error Handler
app.use(errorHandler);

//ping
app.use('.ping', (req, res) => {
  res.send('Pong')
})

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀🚀🚀`);
});

module.exports = app;
