import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

interface Captain {
    id: string;
    username: string;
    password: string;
    ferryId: string;
}

// Temporary captain data (replace with database in production)
const captains: Captain[] = [
    {
        id: '1',
        username: 'likoni_captain',
        // This is a hashed version of 'password123'
        password: '$2b$10$w1Z2D0J4iX7CG61HI9RWMuUPpXyONFuuRmkUvXvde7ToyZOIlMHRq',
        ferryId: 'likoni'
    }
];

export const loginCaptain = async (username: string, password: string) => {
    console.log('Login attempt for username:', username);
    
    const captain = captains.find(c => c.username === username);
    
    if (!captain) {
        console.log('❌ Captain not found:', username);
        throw new Error('Captain not found');
    }

    const validPassword = await bcrypt.compare(password, captain.password);
    console.log('Password validation result:', validPassword);

    if (!validPassword) {
        console.log('❌ Invalid password for:', username);
        throw new Error('Invalid password');
    }

    const token = jwt.sign(
        { 
            id: captain.id,
            username: captain.username,
            ferryId: captain.ferryId,
            isCaptain: true
        },
        process.env.JWT_SECRET as string,
        { expiresIn: '8h' }
    );

    console.log('✅ Login successful for:', username);
    return token;
};