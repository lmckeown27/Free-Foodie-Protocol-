const jwt = require('jsonwebtoken');
const { AppError } = require('./errorHandler');
const logger = require('../utils/logger');

// Verify JWT token
const authenticate = async (req, res, next) => {
  try {
    let token;
    
    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return next(new AppError('Not authorized to access this route', 401));
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user info to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };
    
    logger.debug('User authenticated', { userId: req.user.id, role: req.user.role });
    next();
  } catch (error) {
    logger.error('Authentication error', error);
    return next(new AppError('Not authorized to access this route', 401));
  }
};

// Check user role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('User not authenticated', 401));
    }
    
    if (!roles.includes(req.user.role)) {
      logger.warn('Authorization failed', { 
        userId: req.user.id, 
        userRole: req.user.role, 
        requiredRoles: roles 
      });
      return next(new AppError('Not authorized to access this resource', 403));
    }
    
    next();
  };
};

module.exports = { authenticate, authorize };

