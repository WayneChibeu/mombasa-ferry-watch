import express from 'express';
import ferryRoutes from './routes/ferry.js';
import * as dotenv from 'dotenv';

dotenv.config();

if (!process.env.JWT_SECRET) {
    console.error('❌ JWT_SECRET is not set in environment variables!');
    process.exit(1);
}

console.log('✅ JWT_SECRET is set with length:', process.env.JWT_SECRET.length);

const app = express();

// Important: These must come before routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug middleware to log all requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

app.use('/api/ferry', ferryRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});