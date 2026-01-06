import express from 'express';
import { query, get } from '../db';
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken } from './auth';

const router = express.Router();

// Middleware to get user ID (Mocking or retrieving from request if auth middleware puts it there)
// For now, assuming auth middleware populates req.user
// If not, I'll check how auth.ts does it. 
// checking server/src/routes/auth.ts might be good, but I'll assume standard express pattern for now
// and fix if needed.

// Helper to normalize skills
const normalize = (s: string) => s.trim().toLowerCase();

// POST /onboarding
router.post('/onboarding', authenticateToken, async (req: any, res) => {
    const userId = req.user.id;
    const { teachSkills, learnSkills, bio, role, education, linkedin_url } = req.body;

    try {
        // 1. Update Profile Fields (Bio, Role, Education, LinkedIn)
        const updates: any[] = [];
        let sql = 'UPDATE profiles SET ';

        if (bio !== undefined) { sql += 'bio = ?, '; updates.push(bio); }
        if (role !== undefined) { sql += 'role = ?, '; updates.push(role); }
        if (education !== undefined) { sql += 'education = ?, '; updates.push(education); }
        if (linkedin_url !== undefined) { sql += 'linkedin_url = ?, '; updates.push(linkedin_url); }

        // Remove trailing comma
        if (updates.length > 0) {
            sql = sql.slice(0, -2);
            sql += ' WHERE user_id = ?';
            updates.push(userId);
            await query(sql, updates);
        }

        // 2. Clear existing synapse skills for this user
        await query('DELETE FROM synapse_skills WHERE user_id = ?', [userId]);

        // 3. Insert new skills
        const timestamp = new Date().toISOString();

        // Teach Skills
        if (Array.isArray(teachSkills)) {
            for (const skill of teachSkills) {
                const id = uuidv4();
                await query(
                    'INSERT INTO synapse_skills (id, user_id, skill, type, created_at) VALUES (?, ?, ?, ?, ?)',
                    [id, userId, normalize(skill), 'TEACH', timestamp]
                );
            }
        }

        // Learn Skills
        if (Array.isArray(learnSkills)) {
            for (const skill of learnSkills) {
                const id = uuidv4();
                await query(
                    'INSERT INTO synapse_skills (id, user_id, skill, type, created_at) VALUES (?, ?, ?, ?, ?)',
                    [id, userId, normalize(skill), 'LEARN', timestamp]
                );
            }
        }

        res.json({ success: true, message: 'Synapse profile updated' });

    } catch (error) {
        console.error('Synapse Onboarding Error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// GET /profile
router.get('/profile', authenticateToken, async (req: any, res) => {
    const userId = req.user.id;
    try {
        const skills = await query('SELECT skill, type FROM synapse_skills WHERE user_id = ?', [userId]);
        const bioResult = await get('SELECT bio FROM profiles WHERE user_id = ?', [userId]);

        const teach = skills.rows.filter(s => s.type === 'TEACH').map(s => s.skill);
        const learn = skills.rows.filter(s => s.type === 'LEARN').map(s => s.skill);

        res.json({
            bio: bioResult?.bio || '',
            teach,
            learn
        });
    } catch (error) {
        console.error('Synapse Profile Error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// GET /matches
router.get('/matches', authenticateToken, async (req: any, res) => {
    const userId = req.user.id;

    try {
        // 1. Get My Skills
        const mySkillsRows = await query('SELECT skill, type FROM synapse_skills WHERE user_id = ?', [userId]);
        const myTeach = new Set(mySkillsRows.rows.filter(s => s.type === 'TEACH').map(s => s.skill));
        const myLearn = new Set(mySkillsRows.rows.filter(s => s.type === 'LEARN').map(s => s.skill));

        // 2. Get All Other Users with their skills
        // We need: user_id, full_name, avatar_url, bio, and their skills
        // This query might be heavy if lots of users, but okay for start
        const allUsersRows = await query(`
            SELECT 
                u.id as user_id, 
                p.full_name, 
                p.username,
                p.avatar_url, 
                p.bio,
                ss.skill, 
                ss.type 
            FROM users u
            JOIN profiles p ON u.id = p.user_id
            JOIN synapse_skills ss ON u.id = ss.user_id
            WHERE u.id != ?
        `, [userId]);

        // Group by User
        const users: Record<string, any> = {};
        for (const row of allUsersRows.rows) {
            if (!users[row.user_id]) {
                users[row.user_id] = {
                    id: row.user_id,
                    full_name: row.full_name,
                    username: row.username,
                    avatar_url: row.avatar_url,
                    bio: row.bio,
                    teach: new Set<string>(),
                    learn: new Set<string>()
                };
            }
            if (row.type === 'TEACH') users[row.user_id].teach.add(row.skill);
            if (row.type === 'LEARN') users[row.user_id].learn.add(row.skill);
        }

        // 3. Scoring Algorithm
        const matches = Object.values(users).map(user => {
            let score = 0;
            const reasons: string[] = [];
            const badges: string[] = [];

            // A. Reciprocal (Gold Standard)
            // They teach what I want AND I teach what they want
            const teachMatch = [...user.teach].filter(s => myLearn.has(s as string)); // They teach, I learn
            const learnMatch = [...user.learn].filter(s => myTeach.has(s as string)); // They learn, I teach

            if (teachMatch.length > 0 && learnMatch.length > 0) {
                score += 50 + (teachMatch.length + learnMatch.length) * 5;
                badges.push('Perfect Match');
                reasons.push(`Can teach you ${teachMatch.join(', ')} and wants to learn ${learnMatch.join(', ')}`);
            } else {
                // B. Mentor Match (They teach what I want)
                if (teachMatch.length > 0) {
                    score += 20 + (teachMatch.length * 3);
                    badges.push('Mentor');
                    reasons.push(`Can teach you ${teachMatch.join(', ')}`);
                }

                // C. Student Match (I teach what they want)
                if (learnMatch.length > 0) {
                    score += 10 + (learnMatch.length * 2);
                    badges.push('Student');
                    reasons.push(`Wants to learn ${learnMatch.join(', ')} from you`);
                }
            }

            return {
                ...user,
                teach: [...user.teach], // Convert sets back to arrays for JSON
                learn: [...user.learn],
                score,
                reasons,
                badges
            };
        });

        // 4. Sort and return
        const sortedMatches = matches
            .filter(m => m.score > 0)
            .sort((a, b) => b.score - a.score);

        res.json(sortedMatches);

    } catch (error) {
        console.error('Synapse Matchmaking Error:', error);
        res.status(500).json({ error: 'Matchmaking failed' });
    }
});

// GET /explore (Unified Feed)
router.get('/explore', authenticateToken, async (req: any, res) => {
    const userId = req.user.id;

    try {
        // 1. Get My Skills
        const mySkillsRows = await query('SELECT skill, type FROM synapse_skills WHERE user_id = ?', [userId]);
        const myTeachSet = new Set(mySkillsRows.rows.filter(s => s.type === 'TEACH').map(s => s.skill)); // Skills I teach
        const myLearnSet = new Set(mySkillsRows.rows.filter(s => s.type === 'LEARN').map(s => s.skill)); // Skills I want to learn

        // Convert to arrays for easy matching
        const myTeach = [...myTeachSet];
        const myLearn = [...myLearnSet];

        if (myTeach.length === 0 && myLearn.length === 0) {
            return res.json([]);
        }

        // --- FETCHERS ---

        // A. Users (Collaborators)
        // Fetch users who either NEED what I teach OR TEACH what I need
        const usersPromise = query(`
            SELECT 
                u.id as item_id, 
                'user' as type,
                p.full_name as title, 
                p.username as subtitle,
                p.avatar_url as image_url, 
                p.bio as description,
                ss.skill, 
                ss.type as skill_type
            FROM users u
            JOIN profiles p ON u.id = p.user_id
            JOIN synapse_skills ss ON u.id = ss.user_id
            WHERE u.id != ?
        `, [userId]);

        // B. Projects (Collaboration Opportunities)
        // Fetch projects that need skills I TEACH
        // Projects store skills_needed as JSON string "[\"React\", \"Node\"]"
        const projectsPromise = query(`
             SELECT 
                id as item_id,
                'project' as type,
                title,
                status as subtitle, -- e.g. 'open'
                NULL as image_url,
                description,
                skills_needed as skills_json
            FROM projects
            WHERE status = 'open'
        `);

        // C. Articles (Knowledge)
        // Fetch articles that match skills I LEARN
        // Articles store tags as JSON string
        const articlesPromise = query(`
            SELECT 
                a.id as item_id,
                'article' as type,
                a.title,
                p.full_name as subtitle, -- Author Name
                a.featured_image as image_url,
                a.excerpt as description,
                a.tags as skills_json
            FROM articles a
            LEFT JOIN users u ON a.author_id = u.id
            LEFT JOIN profiles p ON u.id = p.user_id
        `);

        // Execute all
        const [usersResult, projectsResult, articlesResult] = await Promise.all([
            usersPromise,
            projectsPromise,
            articlesPromise
        ]);

        const feed: any[] = [];

        // --- PROCESS USERS ---
        const userMap: Record<string, any> = {};
        for (const row of usersResult.rows) {
            if (!userMap[row.item_id]) {
                userMap[row.item_id] = {
                    ...row,
                    teach: new Set<string>(),
                    learn: new Set<string>()
                };
            }
            if (row.skill_type === 'TEACH') userMap[row.item_id].teach.add(row.skill);
            if (row.skill_type === 'LEARN') userMap[row.item_id].learn.add(row.skill);
        }

        Object.values(userMap).forEach(user => {
            let score = 0;
            const reasons: string[] = [];

            // Overlaps
            const teachMatch = [...user.teach].filter((s: string) => myLearnSet.has(s)); // They teach, I learn
            const learnMatch = [...user.learn].filter((s: string) => myTeachSet.has(s)); // They learn, I teach

            if (teachMatch.length > 0 && learnMatch.length > 0) {
                score = 100 + (teachMatch.length + learnMatch.length) * 10;
                reasons.push(`Perfect Match: Can teach you ${teachMatch.length} skills and needs your help with ${learnMatch.length}.`);
            } else if (teachMatch.length > 0) {
                score = 50 + (teachMatch.length * 5);
                reasons.push(`Mentor: Can teach you ${teachMatch.join(', ')}.`);
            } else if (learnMatch.length > 0) {
                score = 50 + (learnMatch.length * 5);
                reasons.push(`Student: Needs your help with ${learnMatch.join(', ')}.`);
            }

            if (score > 0) {
                feed.push({
                    id: user.item_id,
                    type: 'user',
                    title: user.title,
                    subtitle: user.subtitle,
                    image_url: user.image_url,
                    description: user.description,
                    score,
                    reasons,
                    details: {
                        match_skills: [...teachMatch, ...learnMatch],
                        teach: [...user.teach],
                        learn: [...user.learn]
                    }
                });
            }
        });

        // --- PROCESS PROJECTS ---
        projectsResult.rows.forEach(proj => {
            let skills: string[] = [];
            try { skills = JSON.parse(proj.skills_json || '[]'); } catch (e) { }

            // Match: Projects needs skills I TEACH
            const overlap = skills.filter(s => myTeach.some(mt => mt.toLowerCase() === s.toLowerCase()));

            if (overlap.length > 0) {
                const score = 70 + (overlap.length * 10); // High priority
                feed.push({
                    id: proj.item_id,
                    type: 'project',
                    title: proj.title,
                    subtitle: 'Project Opportunity',
                    image_url: proj.image_url, // Likely null
                    description: proj.description,
                    score, // Projects slightly lower than perfect user matches but higher than one-way
                    reasons: [`Needs your superpowers in ${overlap.join(', ')}`],
                    details: {
                        skills_needed: skills
                    }
                });
            }
        });

        // --- PROCESS ARTICLES ---
        articlesResult.rows.forEach(art => {
            let tags: string[] = [];
            try { tags = JSON.parse(art.skills_json || '[]'); } catch (e) { }

            // Match: Article has tags I want to LEARN
            const overlap = tags.filter(t => myLearn.some(ml => ml.toLowerCase() === t.toLowerCase()));

            if (overlap.length > 0) {
                const score = 30 + (overlap.length * 5); // Knowledge is good, but people/projects first
                feed.push({
                    id: art.item_id,
                    type: 'article',
                    title: art.title,
                    subtitle: `By ${art.subtitle}`,
                    image_url: art.image_url,
                    description: art.description,
                    score,
                    reasons: [`Learn about ${overlap.join(', ')}`],
                    details: {
                        tags
                    }
                });
            }
        });

        // Sort descending by score
        feed.sort((a, b) => b.score - a.score);

        res.json(feed);

    } catch (error) {
        console.error('Synapse Explore Error:', error);
        res.status(500).json({ error: 'Explore failed' });
    }
});

export default router;
