import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

interface Captain {
    id: string;
    username: string;
    password: string;
    ferryId: string;
}

// This would typically come from a database
const captains: Captain[] = [
    {
        id: '1',
        username: 'likoni_captain',
        // This is a hashed version of 'password123'
        password: '$2b$10$YourHashedPasswordHere',
        ferryId: 'likoni'
    },
    {
        id: '2',
        username: 'mtongwe_captain',
        password: '$2b$10$YourHashedPasswordHere',
        ferryId: 'mtongwe'
    }
];

export const loginCaptain = async (username: string, password: string) => {
    const captain = captains.find(c => c.username === username);
    
    if (!captain) {
        throw new Error('Captain not found');
    }

    const validPassword = await bcrypt.compare(password, captain.password);
    if (!validPassword) {
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

    return token;
};