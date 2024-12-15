const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    // const token = (Object.keys(req.cookies).length > 1 && req.cookies.token) || (req.headers.authorization && req.headers["authorization"].split(" ")[1]);
    const token = (req.cookies.token) 
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ 
      _id: decoded.id
    });
    if (!user) {
      throw new Error('Please authenticate');
    }

    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).send({ error: 'Please authenticate' });
  }
};

const checkRolePermission = (roles) => {
  return async (req, res, next) => {
    try {
      console.log(req.user.role)
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ 
          error: 'Access denied. Insufficient permissions.' 
        });
      }
      console.log('works till here')
      next();
    } catch (error) {
      res.status(500).json({ error: 'Permission check failed' });
    }
  };
};

module.exports = { 
  authMiddleware, 
  checkRolePermission 
};