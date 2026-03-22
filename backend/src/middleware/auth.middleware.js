import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { config } from '../config/env.js';

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized - No token provided' });
        }

        // Verify token
        const decoded = jwt.verify(token, config.jwtSecret);
        
        // Validate that decoded token has userId
        if (!decoded.userId) {
            return res.status(401).json({ message: 'Unauthorized - Invalid token payload' });
        }

        // Fetch user from database
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized - User not found' });
        }

        // Attach user to request object for use in next middleware/controllers
        req.user = user;
        next();
    } catch (error) {
        console.error('Error in protectRoute:', error);
        
        // Handle JWT specific errors
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Unauthorized - Invalid token' });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Unauthorized - Token expired' });
        }
        
        // Handle database errors
        if (error.name === 'CastError') {
            return res.status(401).json({ message: 'Unauthorized - Invalid user ID' });
        }
        
        // Generic server error
        res.status(500).json({ message: 'Internal server error' });
    }
};