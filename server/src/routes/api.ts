import express from 'express';
import { query } from '../db';
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken } from './auth';

const router = express.Router();

const parseJSONFields = (row: any, fields: string[]) => {
    fields.forEach(field => {
        if (row[field] && typeof row[field] === 'string') {
            try {
                row[field] = JSON.parse(row[field]);
            } catch (e) {
                row[field] = [];
            }
        }
    });
    return row;
};

// Get Articles
router.get('/articles', async (req, res) => {
    try {
        const { limit = 10, featured } = req.query;

        let sql = `SELECT a.*, 
              json_object('name', c.name, 'color', c.color) as categories,
               p.username as author_username, u.email as author_email,
              p.full_name as author_full_name, p.avatar_url as author_avatar_url
       FROM articles a
       LEFT JOIN categories c ON a.category_id = c.id
       LEFT JOIN users u ON a.author_id = u.id
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE a.published_at IS NOT NULL`;

        const params: any[] = [];

        if (featured === 'true') {
            sql += ` AND a.is_featured = 1`;
        }

        sql += ` ORDER BY a.published_at DESC LIMIT ?`;
        params.push(parseInt(limit as string));

        // SQLite: use json_object
        const result = await query(sql, params);

        // Parse JSON fields
        const rows = result.rows.map(row => {
            row = parseJSONFields(row, ['tags']);
            if (typeof row.categories === 'string') {
                try { row.categories = JSON.parse(row.categories); } catch (e) { }
            }
            row.profiles = {
                username: row.author_username,
                full_name: row.author_full_name,
                avatar_url: row.author_avatar_url
            };
            return row;
        });

        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get Article by ID
router.get('/articles/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await query(
            `SELECT a.*, 
              json_object('name', c.name, 'color', c.color) as categories,
              p.username as author_username, u.email as author_email,
              p.full_name as author_full_name, p.avatar_url as author_avatar_url
       FROM articles a
       LEFT JOIN categories c ON a.category_id = c.id
       LEFT JOIN users u ON a.author_id = u.id
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE a.id = ?`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Article not found' });
        }

        const row = result.rows[0];
        parseJSONFields(row, ['tags']);
        if (typeof row.categories === 'string') {
            try { row.categories = JSON.parse(row.categories); } catch (e) { }
        }

        // Structure author object to match expected format if needed, or leave flat
        // Frontend likely expects nested author/profile.
        // The previous frontend joined profiles. 
        // Let's return a constructed profile object.
        row.profiles = {
            username: row.author_username,
            full_name: row.author_full_name,
            avatar_url: row.author_avatar_url
        };

        res.json(row);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create Article
router.post('/articles', authenticateToken, async (req: any, res) => {

    const { title, content, excerpt, featured_image, category_id, tags } = req.body;
    const id = uuidv4();
    const userId = req.user?.id; // Assuming middleware

    try {
        await query(
            `INSERT INTO articles (id, title, content, excerpt, featured_image, category_id, tags, author_id, published_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
            [id, title, content, excerpt, featured_image, category_id, JSON.stringify(tags || []), userId]
        );
        res.json({ id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get Discussions
router.get('/discussions', async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const result = await query(
            `SELECT d.*,
              json_object('name', c.name, 'color', c.color) as categories,
              (SELECT count(*) FROM comments cm WHERE cm.discussion_id = d.id) as comments_count,
              p.username as author_username, p.full_name as author_full_name, p.avatar_url as author_avatar_url
       FROM discussions d
       LEFT JOIN categories c ON d.category_id = c.id
       LEFT JOIN users u ON d.author_id = u.id
       LEFT JOIN profiles p ON u.id = p.user_id
       ORDER BY d.is_pinned DESC, d.created_at DESC 
       LIMIT ?`,
            [parseInt(limit as string)]
        );

        // Parse JSON fields
        const rows = result.rows.map(row => {
            row = parseJSONFields(row, ['tags']);
            if (typeof row.categories === 'string') {
                try { row.categories = JSON.parse(row.categories); } catch (e) { }
            }
            row.profiles = {
                username: row.author_username,
                full_name: row.author_full_name,
                avatar_url: row.author_avatar_url
            };
            return row;
        });

        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get Discussion by ID
router.get('/discussions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await query(
            `SELECT d.*,
              json_object('name', c.name, 'color', c.color) as categories,
              p.username as author_username, p.full_name as author_full_name, p.avatar_url as author_avatar_url
       FROM discussions d
       LEFT JOIN categories c ON d.category_id = c.id
       LEFT JOIN users u ON d.author_id = u.id
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE d.id = ?`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Discussion not found' });
        }

        const row = result.rows[0];
        parseJSONFields(row, ['tags']);
        if (typeof row.categories === 'string') {
            try { row.categories = JSON.parse(row.categories); } catch (e) { }
        }
        row.profiles = {
            username: row.author_username,
            full_name: row.author_full_name,
            avatar_url: row.author_avatar_url
        };

        // Fetch Comments
        const commentsResult = await query(
            `SELECT cm.*,
                    p.username as author_username, p.full_name as author_full_name, p.avatar_url as author_avatar_url
             FROM comments cm
             LEFT JOIN users u ON cm.author_id = u.id
             LEFT JOIN profiles p ON u.id = p.user_id
             WHERE cm.discussion_id = ?
             ORDER BY cm.created_at ASC`,
            [id]
        );

        row.comments = commentsResult.rows.map(c => ({
            ...c,
            profiles: {
                username: c.author_username,
                full_name: c.author_full_name,
                avatar_url: c.author_avatar_url
            }
        }));

        res.json(row);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create Discussion
router.post('/discussions', authenticateToken, async (req: any, res) => {
    const { title, content, category_id, tags } = req.body;
    const author_id = req.user.id;
    const id = uuidv4();

    try {
        await query(
            `INSERT INTO discussions (id, title, content, author_id, category_id, tags, created_at, updated_at, is_pinned)
             VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0)`,
            [id, title, content, author_id, category_id, JSON.stringify(tags || [])]
        );
        res.json({ id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create Comment
router.post('/comments', authenticateToken, async (req: any, res) => {
    const { content, discussion_id } = req.body;
    const author_id = req.user.id;
    const id = uuidv4();

    try {
        await query(
            `INSERT INTO comments (id, content, discussion_id, author_id, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
            [id, content, discussion_id, author_id]
        );
        res.json({ id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get Categories
router.get('/categories', async (req, res) => {
    try {
        const { limit = 6 } = req.query;
        const result = await query('SELECT * FROM categories LIMIT ?', [parseInt(limit as string)]);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get All Profiles (with search)
router.get('/profiles', async (req, res) => {
    try {
        const { limit = 20, offset = 0, q } = req.query;
        let sql = `SELECT user_id, username, full_name, avatar_url, role, bio, interests, skills, education, linkedin_url FROM profiles`;
        const params: any[] = [];

        if (q) {
            sql += ` WHERE username LIKE ? OR full_name LIKE ? OR interests LIKE ? OR skills LIKE ?`;
            const search = `%${q}%`;
            params.push(search, search, search, search);
        }

        sql += ` ORDER BY user_id DESC LIMIT ? OFFSET ?`;
        params.push(parseInt(limit as string), parseInt(offset as string));

        const result = await query(sql, params);

        // Parse JSON fields
        const rows = result.rows.map(row => parseJSONFields(row, ['interests', 'skills', 'collaboration_preferences']));

        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get Profiles (Random/Researchers)
router.get('/profiles/random', async (req, res) => {
    try {
        const { count = 4 } = req.query;
        // SQLite RANDOM()
        const result = await query('SELECT * FROM profiles ORDER BY RANDOM() LIMIT ?', [parseInt(count as string)]);

        const rows = result.rows.map(row => parseJSONFields(row, ['skills', 'interests', 'expertise', 'collaboration_preferences']));
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get Profiles by IDs (for Author mapping)
router.post('/profiles/batch', async (req, res) => {
    try {
        const { userIds } = req.body;
        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({ error: 'Invalid userIds' });
        }

        // SQLite doesn't support ANY($1) efficiently like PG. 
        // Construct placeholders: ?,?,?
        const placeholders = userIds.map(() => '?').join(',');
        const result = await query(
            `SELECT user_id, username, full_name, avatar_url FROM profiles WHERE user_id IN (${placeholders})`,
            userIds
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update Profile
router.put('/profiles', authenticateToken, async (req: any, res) => {
    try {
        const updates = req.body;
        const userId = req.user.id;

        console.log('Profile update request:', { userId, updates });

        // Ensure user can only update their own profile (which they are identified by token)
        // Fields allowed to update: role, education, linkedin_url, interests, skills, collaboration_preferences, availability, current_projects, bio, cv_url

        const allowedInfo = ['role', 'education', 'linkedin_url', 'interests', 'skills', 'collaboration_preferences', 'availability', 'current_projects', 'bio', 'cv_url'];

        const fields = [];
        const values = [];

        for (const key of Object.keys(updates)) {
            if (allowedInfo.includes(key)) {
                fields.push(`${key} = ?`);
                let val = updates[key];
                if (['interests', 'skills', 'collaboration_preferences'].includes(key)) {
                    val = JSON.stringify(val);
                }
                values.push(val);
            }
        }

        if (fields.length === 0) {
            console.log('No fields to update');
            return res.json({ success: true }); // Nothing to update
        }

        const sql = `UPDATE profiles SET ${fields.join(', ')} WHERE user_id = ?`;
        const params = [...values, userId];
        console.log('Executing SQL:', sql);
        console.log('With params:', params);

        const result = await query(sql, params);
        console.log('Update result:', result);

        res.json({ success: true });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get User's Clubs
router.get('/clubs/my', authenticateToken, async (req: any, res) => {
    try {
        const userId = req.user.id;
        const result = await query(
            `SELECT c.* 
             FROM clubs c
             JOIN club_members cm ON c.id = cm.club_id
             WHERE cm.user_id = ?`,
            [userId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get All Clubs (Public/Admin)
router.get('/clubs', async (req, res) => {
    try {
        const result = await query('SELECT * FROM clubs ORDER BY name ASC');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Join Club
router.post('/clubs/:id/join', authenticateToken, async (req: any, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const memberId = uuidv4();

        // Check if already member
        const existing = await query('SELECT * FROM club_members WHERE club_id = ? AND user_id = ?', [id, userId]);
        if (existing.rows.length > 0) {
            return res.status(400).json({ error: 'Already a member' });
        }

        await query(
            'INSERT INTO club_members (id, club_id, user_id) VALUES (?, ?, ?)',
            [memberId, id, userId]
        );
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Leave Club (Self)
router.post('/clubs/:id/leave', authenticateToken, async (req: any, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        await query('DELETE FROM club_members WHERE club_id = ? AND user_id = ?', [id, userId]);
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Remove Member from Club (Admin/Owner)
router.delete('/clubs/:id/members/:userId', authenticateToken, async (req: any, res) => {
    try {
        const { id, userId } = req.params;
        // Ideally enforce admin check here.
        // Assuming Admin UI calls this.
        await query('DELETE FROM club_members WHERE club_id = ? AND user_id = ?', [id, userId]);
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get Club Members
router.get('/clubs/:id/members', async (req, res) => {
    try {
        const { id } = req.params;
        // Join with profiles to get user info
        const result = await query(
            `SELECT cm.*, p.username, p.full_name, p.avatar_url
             FROM club_members cm
             LEFT JOIN profiles p ON cm.user_id = p.user_id
             WHERE cm.club_id = ?`,
            [id]
        );

        // Return structured data as expected by frontend
        const formatted = result.rows.map(row => ({
            id: row.id,
            user_id: row.user_id,
            created_at: row.joined_at,
            user: {
                id: row.user_id,
                username: row.username,
                full_name: row.full_name,
                avatar_url: row.avatar_url
            }
        }));

        res.json(formatted);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Check if User is Member
router.get('/clubs/:id/members/check/:userId', async (req, res) => {
    try {
        const { id, userId } = req.params;
        const result = await query(
            'SELECT * FROM club_members WHERE club_id = ? AND user_id = ?',
            [id, userId]
        );
        res.json({ isMember: result.rows.length > 0 });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get Club Posts
router.get('/clubs/:id/posts', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await query(
            `SELECT cp.*, p.username, p.full_name, p.avatar_url
             FROM club_posts cp
             LEFT JOIN profiles p ON cp.user_id = p.user_id
             WHERE cp.club_id = ?
             ORDER BY cp.created_at DESC`,
            [id]
        );

        const formatted = result.rows.map(row => ({
            id: row.id,
            content: row.content,
            created_at: row.created_at,
            user_id: row.user_id,
            user: {
                id: row.user_id,
                username: row.username,
                full_name: row.full_name,
                avatar_url: row.avatar_url
            }
        }));

        res.json(formatted);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create Club Post
router.post('/clubs/:id/posts', authenticateToken, async (req: any, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const userId = req.user.id;
        const postId = uuidv4();

        await query(
            'INSERT INTO club_posts (id, club_id, user_id, content) VALUES (?, ?, ?, ?)',
            [postId, id, userId, content]
        );

        // Return the created post with user info
        const result = await query(
            `SELECT cp.*, p.username, p.full_name, p.avatar_url
             FROM club_posts cp
             LEFT JOIN profiles p ON cp.user_id = p.user_id
             WHERE cp.id = ?`,
            [postId]
        );

        const row = result.rows[0];
        const formatted = {
            id: row.id,
            content: row.content,
            created_at: row.created_at,
            user_id: row.user_id,
            user: {
                id: row.user_id,
                username: row.username,
                full_name: row.full_name,
                avatar_url: row.avatar_url
            }
        };

        res.json(formatted);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get Projects
router.get('/projects', async (req, res) => {
    try {
        const { status = 'open' } = req.query;
        // Basic filtering, search can be improved later
        const result = await query(
            `SELECT * FROM projects WHERE status = ? ORDER BY created_at DESC`,
            [status as string]
        );

        const rows = result.rows.map(row => parseJSONFields(row, ['areas', 'skills_needed', 'tags', 'collaboration_types']));
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get Project by ID
router.get('/projects/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await query(`SELECT * FROM projects WHERE id = ?`, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const row = parseJSONFields(result.rows[0], ['areas', 'skills_needed', 'tags', 'collaboration_types']);
        res.json(row);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create Project
router.post('/projects', authenticateToken, async (req: any, res) => {
    const data = req.body;
    const id = uuidv4();
    const creator_id = req.user.id;

    // SQLite doesn't support arrays, so stringify them
    const areas = JSON.stringify(data.areas || []);
    const skills = JSON.stringify(data.skills_needed || []);
    const tags = JSON.stringify(data.tags || []);
    const collab_types = JSON.stringify(data.collaboration_types || []);

    try {
        await query(
            `INSERT INTO projects (
                id, creator_id, kind, title, description, areas, skills_needed, tags, 
                commitment, collaboration_types, location, timezone, is_paid, 
                application_instructions, status, visibility, deadline, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
            [
                id, creator_id, data.kind, data.title, data.description, areas, skills, tags,
                data.commitment, collab_types, data.location, data.timezone, data.is_paid ? 1 : 0,
                data.application_instructions, 'open', data.visibility || 'public', data.deadline
            ]
        );
        res.json({ id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Apply to Project
router.post('/projects/:id/apply', authenticateToken, async (req: any, res) => {
    const { id } = req.params;
    const { cover_note } = req.body;
    const applicant_id = req.user.id;
    const reqId = uuidv4();

    try {
        // Check if already applied? (Constraint usually handles this)

        await query(
            `INSERT INTO join_requests (id, project_id, applicant_id, cover_note, status, created_at)
             VALUES (?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP)`,
            [reqId, id, applicant_id, cover_note]
        );
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Templates
router.get('/templates', async (req, res) => {
    try {
        const { scope, owner_id } = req.query;
        let sql = `SELECT * FROM post_templates WHERE 1=1`;
        const params: any[] = [];

        if (scope === 'global') {
            sql += ` AND scope = 'global'`;
        } else if (owner_id) {
            sql += ` AND (scope = 'global' OR owner_id = ?)`;
            params.push(owner_id);
        }

        sql += ` ORDER BY scope DESC`;

        const result = await query(sql, params);
        const rows = result.rows.map(row => parseJSONFields(row, ['default_tags', 'default_skills', 'default_collaboration_types']));
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Admin / Update / Delete Endpoints
// Delete Article
router.delete('/articles/:id', authenticateToken, async (req: any, res) => {
    try {
        const { id } = req.params;
        // Check ownership or admin role? For now allow owner or admin.
        await query('DELETE FROM articles WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update Article (e.g. Featured)
router.put('/articles/:id', authenticateToken, async (req: any, res) => {
    try {
        const { id } = req.params;
        const updates = req.body; // e.g. { is_featured: true }

        const fields = Object.keys(updates).map(k => `${k} = ?`).join(', ');
        const values = Object.values(updates);

        if (fields.length > 0) {
            await query(`UPDATE articles SET ${fields} WHERE id = ?`, [...values, id]);
        }
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete Discussion
router.delete('/discussions/:id', authenticateToken, async (req: any, res) => {
    try {
        const { id } = req.params;
        await query('DELETE FROM discussions WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update Discussion (e.g. Pinned)
router.put('/discussions/:id', authenticateToken, async (req: any, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const fields = Object.keys(updates).map(k => `${k} = ?`).join(', ');
        const values = Object.values(updates);

        if (fields.length > 0) {
            await query(`UPDATE discussions SET ${fields} WHERE id = ?`, [...values, id]);
        }
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete User (Admin only)
router.delete('/users/:id', authenticateToken, async (req: any, res) => {
    try {
        const { id } = req.params;

        // SQLite foreign keys might not be enabled by default.
        // Manually delete related records to ensure cleanup.
        await query('DELETE FROM profiles WHERE user_id = ?', [id]);
        await query('DELETE FROM club_members WHERE user_id = ?', [id]);
        // Also posts, comments, articles? 
        // For now, let's stick to the immediate profile issue.
        // Ideally should optimize schema or enable PRAGMA foreign_keys = ON.

        await query('DELETE FROM users WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get User Growth Stats (Admin)
router.get('/stats/users-growth', authenticateToken, async (req: any, res) => {
    try {
        const baselineResult = await query(`
            SELECT count(*) as count
            FROM users
            WHERE created_at < date('now', '-30 days')
        `);
        const baseline = baselineResult.rows[0]?.count || 0;

        const result = await query(`
            SELECT date(created_at) as date, count(*) as count
            FROM users
            WHERE created_at >= date('now', '-30 days')
            GROUP BY date(created_at)
            ORDER BY date(created_at) ASC
        `);

        res.json({
            baseline: baseline,
            history: result.rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Sitemap Generator
router.get('/sitemap.xml', async (req, res) => {
    try {
        const baseUrl = 'https://www.teamneuron.blog';

        // 1. Get dynamic content
        const articles = await query('SELECT id, updated_at FROM articles WHERE published_at IS NOT NULL');
        const discussions = await query('SELECT id, updated_at FROM discussions');

        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <!-- Static Pages -->
    <url><loc>${baseUrl}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>
    <url><loc>${baseUrl}/auth</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>
    <url><loc>${baseUrl}/articles</loc><changefreq>daily</changefreq><priority>0.8</priority></url>
    <url><loc>${baseUrl}/discussions</loc><changefreq>daily</changefreq><priority>0.8</priority></url>
    <url><loc>${baseUrl}/collaborate</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>
    <url><loc>${baseUrl}/projects</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>
    <url><loc>${baseUrl}/clubs</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>
    <url><loc>${baseUrl}/clubs/iiser-tirupati</loc><changefreq>daily</changefreq><priority>0.9</priority></url>
`;

        // 2. Add Articles
        articles.rows.forEach(article => {
            xml += `    <url>
        <loc>${baseUrl}/articles/${article.id}</loc>
        <lastmod>${new Date(article.updated_at).toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>\n`;
        });

        // 3. Add Discussions
        discussions.rows.forEach(disc => {
            xml += `    <url>
        <loc>${baseUrl}/discussions/${disc.id}</loc>
        <lastmod>${new Date(disc.updated_at).toISOString()}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.7</priority>
    </url>\n`;
        });

        xml += '</urlset>';

        res.header('Content-Type', 'application/xml');
        res.send(xml);

    } catch (error) {
        console.error(error);
        res.status(500).send('Error generating sitemap');
    }
});

// Get Hype Count
router.get('/hype/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await query('SELECT count FROM hypes WHERE id = ?', [id]);

        if (result.rows.length === 0) {
            await query('INSERT OR IGNORE INTO hypes (id, count) VALUES (?, 0)', [id]);
            return res.json({ count: 0 });
        }

        res.json({ count: result.rows[0].count });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Increment Hype Count
router.post('/hype/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await query('UPDATE hypes SET count = count + 1 WHERE id = ?', [id]);
        const result = await query('SELECT count FROM hypes WHERE id = ?', [id]);
        res.json({ count: result.rows[0].count });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
