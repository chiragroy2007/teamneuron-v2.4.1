import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { query, get } from '../db';

const router = express.Router();

// Middleware to verify JWT
export const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET as string, (err: any, user: any) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Signup
router.post('/signup', async (req, res) => {
    const { email, password, username, fullName } = req.body;

    try {
        // Check if user exists
        const userCheck = await query('SELECT * FROM users WHERE email = ?', [email]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = uuidv4();
        const profileId = uuidv4();

        // Insert into users
        await query(
            'INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)',
            [userId, email, hashedPassword]
        );

        // Insert into profiles
        await query(
            'INSERT INTO profiles (id, user_id, username, full_name) VALUES (?, ?, ?, ?)',
            [profileId, userId, username, fullName]
        );

        const token = jwt.sign({ id: userId, email }, process.env.JWT_SECRET as string, { expiresIn: '1h' });

        res.json({ token, user: { id: userId, email, username, fullName } });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await query('SELECT * FROM users WHERE email = ?', [email]);
        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];
        const match = await bcrypt.compare(password, user.password_hash);

        if (!match) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Fetch profile
        const profileResult = await query('SELECT * FROM profiles WHERE user_id = ?', [user.id]);
        const profile = profileResult.rows[0];

        const token = jwt.sign({ id: user.id, email }, process.env.JWT_SECRET as string, { expiresIn: '1h' });

        res.json({ token, user: { ...user, ...profile } });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get Current User
router.get('/me', authenticateToken, async (req: any, res) => {
    try {
        const result = await query(
            `SELECT u.id, u.email, p.* 
       FROM users u 
       JOIN profiles p ON u.id = p.user_id 
       WHERE u.id = ?`,
            [req.user.id]
        );

        if (result.rows.length === 0) return res.sendStatus(404);

        const row = result.rows[0];

        // Helper to parse JSON fields safely
        const jsonFields = ['interests', 'skills', 'collaboration_preferences', 'current_projects']; // Add others if needed
        jsonFields.forEach(field => {
            if (row[field] && typeof row[field] === 'string') {
                try {
                    row[field] = JSON.parse(row[field]);
                } catch (e) {
                    row[field] = [];
                }
            }
        });

        res.json(row);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
