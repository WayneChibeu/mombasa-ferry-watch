import express from 'express';
import * as jwt from 'jsonwebtoken';
import { loginCaptain } from '../auth/captainAuth.js';

// Extend Express Request interface to include 'captain'
declare global {
    namespace Express {
        interface Request {
            captain?: any;
        }
    }
}

const router = express.Router();

// Dummy rate limiter middleware (replace with real implementation if available)
const updateRateLimiter = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // Example: Allow all requests (no actual rate limiting)
    next();
};

// Debug middleware
router.use((req, res, next) => {
    console.log('\n=== 🔍 Request Debug ===');
    console.log('Method:', req.method);
    console.log('Path:', req.path);
    console.log('Headers:', {
        auth: req.headers.authorization,
        contentType: req.headers['content-type']
    });
    console.log('Body:', req.body);
    console.log('=== Debug End ===\n');
    next();
});

// Authentication middleware
const authenticateCaptain = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
    console.log('\n=== 🔐 Auth Check ===');
    
    if (!req.headers.authorization?.startsWith('Bearer ')) {
        console.log('❌ Missing Bearer prefix');
        res.status(401).json({ error: 'Invalid authorization format' });
        return;
    }
    
    const token = req.headers.authorization.split(' ')[1];
    console.log('Token received:', token.substring(0, 20) + '...');
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        console.log('✅ Token verified:', decoded);
        req.captain = decoded;
        next();
    } catch (error: any) {
        console.log('❌ Token verification failed:', error.message);
        res.status(401).json({ error: 'Invalid authentication token' });
    }
};

// Login route
router.post('/login', async (req: express.Request, res: express.Response) => {
    try {
        const { username, password } = req.body;
        const token = await loginCaptain(username, password);
        res.json({ token });
    } catch (error) {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// Status update route
router.post('/status', 
    updateRateLimiter,
    authenticateCaptain,
    async (req: express.Request, res: express.Response) => {
        try {
            const { ferryId, status, crowdLevel } = req.body;
            // Add your status update logic here
            res.json({ message: 'Status updated successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to update status' });
        }
    }
);

// Debug status update route (temporary)
router.post('/debug/status', async (req: express.Request, res: express.Response) => {
    try {
        const { ferryId, status, crowdLevel } = req.body;
        console.log('Received status update:', { ferryId, status, crowdLevel });
        
        // TODO: Add your actual status update logic here
        
        res.json({ 
            message: 'Status updated successfully',
            debug: true,
            received: { ferryId, status, crowdLevel }
        });
    } catch (error) {
        console.error('Debug route error:', error);
        res.status(500).json({ error: 'Failed to update status' });
    }
});

export default router;