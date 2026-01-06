import express from 'express';
import { query, get } from '../db';
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken } from './auth';

const router = express.Router();

// GET /conversations - List all users I have chatted with
router.get('/conversations', authenticateToken, async (req: any, res) => {
    const userId = req.user.id;
    try {
        // Find all unique users where I am sender or receiver
        // And get the last message for preview
        const sql = `
            SELECT 
                u.id as user_id, 
                p.full_name, 
                p.username, 
                p.avatar_url,
                m.content as last_message,
                m.created_at as last_message_at,
                (CASE WHEN m.sender_id = ? THEN 1 ELSE 0 END) as is_me
            FROM messages m
            JOIN users u ON (m.sender_id = u.id OR m.receiver_id = u.id)
            JOIN profiles p ON u.id = p.user_id
            WHERE (m.sender_id = ? OR m.receiver_id = ?) AND u.id != ?
            GROUP BY u.id
            ORDER BY m.created_at DESC
        `;
        // SQLite GROUP BY implies taking one row per group, usually arbitrary but commonly first encountered. 
        // For strict "last message", we need a better query using window functions or subqueries, 
        // but for MVP this might show *some* message.
        // Better approach for SQLite:

        const betterSql = `
            SELECT 
                other_user.id as user_id,
                p.full_name,
                p.username,
                p.avatar_url,
                m.content as last_message,
                m.created_at as last_message_at,
                m.sender_id
            FROM messages m
            JOIN users other_user ON (
                CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END = other_user.id
            )
            JOIN profiles p ON other_user.id = p.user_id
            WHERE m.id IN (
                SELECT id FROM messages 
                WHERE sender_id = ? OR receiver_id = ?
                ORDER BY created_at DESC
            )
            AND (m.sender_id = ? OR m.receiver_id = ?)
            GROUP BY other_user.id
            ORDER BY m.created_at DESC
        `;

        // Simplified approach for reliability: Get all distinct partners, then fetch last message for each.
        // 1. Get partners
        const partnersSql = `
            SELECT DISTINCT CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END as partner_id
            FROM messages
            WHERE sender_id = ? OR receiver_id = ?
        `;
        const partners = await query(partnersSql, [userId, userId, userId]);

        const conversations = [];
        for (const row of partners.rows) {
            const partnerId = row.partner_id;
            // Get details
            const userDetails = await get(`
                SELECT u.id, p.full_name, p.username, p.avatar_url 
                FROM users u JOIN profiles p ON u.id = p.user_id 
                WHERE u.id = ?`, [partnerId]);

            // Get last message
            const lastMsg = await get(`
                SELECT content, created_at, sender_id 
                FROM messages 
                WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
                ORDER BY created_at DESC LIMIT 1`,
                [userId, partnerId, partnerId, userId]);

            if (userDetails && lastMsg) {
                conversations.push({
                    ...userDetails,
                    last_message: lastMsg.content,
                    last_message_at: lastMsg.created_at,
                    is_me: lastMsg.sender_id === userId
                });
            }
        }

        conversations.sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());

        res.json(conversations);
    } catch (error) {
        console.error("Error fetching conversations:", error);
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
});

// GET /:userId - Get messages with specific user
router.get('/:partnerId', authenticateToken, async (req: any, res) => {
    const userId = req.user.id;
    const partnerId = req.params.partnerId;

    try {
        const sql = `
            SELECT id, sender_id, receiver_id, content, created_at, read_at
            FROM messages
            WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
            ORDER BY created_at ASC
        `;
        const result = await query(sql, [userId, partnerId, partnerId, userId]);
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// POST / - Send a message
router.post('/', authenticateToken, async (req: any, res) => {
    const senderId = req.user.id;
    const { receiverId, content } = req.body;

    if (!receiverId || !content) return res.status(400).json({ error: "Missing fields" });

    try {
        const id = uuidv4();
        await query(
            `INSERT INTO messages (id, sender_id, receiver_id, content) VALUES (?, ?, ?, ?)`,
            [id, senderId, receiverId, content]
        );

        res.json({ success: true, message: { id, sender_id: senderId, receiver_id: receiverId, content, created_at: new Date().toISOString() } });
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// GET /unread-count
router.get('/unread-count', authenticateToken, async (req: any, res) => {
    const userId = req.user.id;
    try {
        const result = await get(
            `SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND read_at IS NULL`,
            [userId]
        );
        res.json({ count: result.count });
    } catch (error) {
        console.error("Error fetching unread count:", error);
        res.status(500).json({ error: 'Failed to fetch count' });
    }
});

// POST /messages/:partnerId/read - Mark all as read for a sender
router.post('/:partnerId/read', authenticateToken, async (req: any, res) => {
    const userId = req.user.id;
    const partnerId = req.params.partnerId;
    try {
        await query(
            `UPDATE messages SET read_at = CURRENT_TIMESTAMP WHERE sender_id = ? AND receiver_id = ? AND read_at IS NULL`,
            [partnerId, userId]
        );
        res.json({ success: true });
    } catch (error) {
        console.error("Error marking read:", error);
        res.status(500).json({ error: 'Failed' });
    }
});

export default router;
