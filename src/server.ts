import express from 'express';
import ferryRoutes from './routes/ferry';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Add these middleware before your routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/ferry', ferryRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});