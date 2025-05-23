import * as express from 'express';
import { rateLimit } from 'express-rate-limit';
import * as jwt from 'jsonwebtoken';
import { loginCaptain } from '../auth/captainAuth';

// Extend Express Request interface to include 'captain'
declare global {
    namespace Express {
        interface Request {
            captain?: any;
        }
    }
}

const router = express.Router();

const updateRateLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10, // Limit each captain to 10 requests per window
    message: 'Too many updates submitted, please try again later'
});

const authenticateCaptain = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        res.status(401).json({ error: 'No authentication token provided' });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        if (typeof decoded !== 'object' || !('isCaptain' in decoded) || !(decoded as any).isCaptain) {
            res.status(403).json({ error: 'Not authorized to submit updates' });
            return;
        }
        req.captain = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid authentication token' });
        return;
    }
};

router.post('/login', async (req: express.Request, res: express.Response) => {
    try {
        const { username, password } = req.body;
        const token = await loginCaptain(username, password);
        res.json({ token });
    } catch (error) {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

router.post('/status', 
    updateRateLimiter,
    authenticateCaptain,
    async (req: express.Request, res: express.Response) => {
        try {
            // Handle ferry status update logic here
            res.status(200).json({ message: 'Status updated successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to update status' });
        }
    }
);

export default router;