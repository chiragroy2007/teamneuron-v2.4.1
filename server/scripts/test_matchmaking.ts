
import sqlite3 from 'sqlite3';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const dbPath = path.resolve(__dirname, '../neuron.db');
const db = new sqlite3.Database(dbPath);

const run = (sql: string, params: any[] = []) => new Promise<void>((resolve, reject) => {
    db.run(sql, params, (err) => err ? reject(err) : resolve());
});

const get = (sql: string, params: any[] = []) => new Promise<any>((resolve, reject) => {
    db.get(sql, params, (err, row) => err ? reject(err) : resolve(row));
});

const all = (sql: string, params: any[] = []) => new Promise<any[]>((resolve, reject) => {
    db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows));
});

async function testMatchmaking() {
    console.log('--- Starting Matchmaking Test ---');
    const timestamp = new Date().toISOString();

    // Init Schema
    const schemaPath = path.resolve(__dirname, '../src/db/schema.sql');
    // We need fs
    const fs = require('fs');
    if (fs.existsSync(schemaPath)) {
        const schema = fs.readFileSync(schemaPath, 'utf8');
        await new Promise<void>((resolve, reject) => {
            db.exec(schema, (err) => err ? reject(err) : resolve());
        });
        console.log('Schema applied');
    }

    // 1. Create Test Users
    const userA = uuidv4(); // Me (Teacher: Python, Learner: React)
    const userB = uuidv4(); // Perfect Match (Teacher: React, Learner: Python)
    const userC = uuidv4(); // Mentor (Teacher: React)
    const userD = uuidv4(); // Student (Learner: Python)
    const userE = uuidv4(); // No Match (Teacher: Java)

    try {
        await run("BEGIN TRANSACTION");

        // Insert Users & Profiles
        const users = [
            { id: userA, name: 'User A (Me)', email: 'a@test.com' },
            { id: userB, name: 'User B (Perfect)', email: 'b@test.com' },
            { id: userC, name: 'User C (Mentor)', email: 'c@test.com' },
            { id: userD, name: 'User D (Student)', email: 'd@test.com' },
            { id: userE, name: 'User E (None)', email: 'e@test.com' }
        ];

        for (const u of users) {
            await run(`INSERT OR IGNORE INTO users (id, email, password_hash) VALUES (?, ?, 'hash')`, [u.id, u.email]);
            await run(`INSERT OR IGNORE INTO profiles (id, user_id, full_name, username) VALUES (?, ?, ?, ?)`, [uuidv4(), u.id, u.name, u.email.split('@')[0]]);
            // Clear existing synapse skills if any (in case of rerun)
            await run(`DELETE FROM synapse_skills WHERE user_id = ?`, [u.id]);
        }

        // Insert Synapse Skills
        // User A: Teach Python, Learn React
        await run(`INSERT INTO synapse_skills (id, user_id, skill, type) VALUES (?, ?, 'python', 'TEACH')`, [uuidv4(), userA]);
        await run(`INSERT INTO synapse_skills (id, user_id, skill, type) VALUES (?, ?, 'react', 'LEARN')`, [uuidv4(), userA]);

        // User B: Teach React, Learn Python (Perfect)
        await run(`INSERT INTO synapse_skills (id, user_id, skill, type) VALUES (?, ?, 'react', 'TEACH')`, [uuidv4(), userB]);
        await run(`INSERT INTO synapse_skills (id, user_id, skill, type) VALUES (?, ?, 'python', 'LEARN')`, [uuidv4(), userB]);

        // User C: Teach React (Mentor)
        await run(`INSERT INTO synapse_skills (id, user_id, skill, type) VALUES (?, ?, 'react', 'TEACH')`, [uuidv4(), userC]);

        // User D: Learn Python (Student)
        await run(`INSERT INTO synapse_skills (id, user_id, skill, type) VALUES (?, ?, 'python', 'LEARN')`, [uuidv4(), userD]);

        // User E: Teach Java (No Match)
        await run(`INSERT INTO synapse_skills (id, user_id, skill, type) VALUES (?, ?, 'java', 'TEACH')`, [uuidv4(), userE]);

        await run("COMMIT");
        console.log('Test Data Inserted');

        // --- SIMULATE MATCHMAKING ALGORITHM ---
        // (Copying logic from route for independent verification)

        // 1. Get My Skills (User A)
        const mySkills = await all(`SELECT skill, type FROM synapse_skills WHERE user_id = ?`, [userA]);
        const myTeach = new Set(mySkills.filter(s => s.type === 'TEACH').map(s => s.skill));
        const myLearn = new Set(mySkills.filter(s => s.type === 'LEARN').map(s => s.skill));

        // 2. Get Others
        const others = await all(`
            SELECT u.id as user_id, p.full_name, ss.skill, ss.type 
            FROM users u
            JOIN profiles p ON u.id = p.user_id
            JOIN synapse_skills ss ON u.id = ss.user_id
            WHERE u.id != ?
        `, [userA]);

        // Group
        const candidates: Record<string, any> = {};
        for (const row of others) {
            if (!candidates[row.user_id]) {
                candidates[row.user_id] = { id: row.user_id, name: row.full_name, teach: new Set(), learn: new Set() };
            }
            if (row.type === 'TEACH') candidates[row.user_id].teach.add(row.skill);
            if (row.type === 'LEARN') candidates[row.user_id].learn.add(row.skill);
        }

        // Score
        const results = Object.values(candidates).map(c => {
            let score = 0;
            const teachMatch = [...c.teach].filter(s => myLearn.has(s as string)); // They teach, I learn
            const learnMatch = [...c.learn].filter(s => myTeach.has(s as string)); // They learn, I teach

            if (teachMatch.length > 0 && learnMatch.length > 0) {
                score += 50;
                console.log(`Match: ${c.name} is Perfect`);
            } else if (teachMatch.length > 0) {
                score += 20;
                console.log(`Match: ${c.name} is Mentor`);
            } else if (learnMatch.length > 0) {
                score += 10;
                console.log(`Match: ${c.name} is Student`);
            }

            return { name: c.name, score };
        }).sort((a, b) => b.score - a.score);

        console.log('\n--- Results ---');
        console.table(results);

        // Assertions
        const perfect = results.find(r => r.name.includes('User B'));
        const mentor = results.find(r => r.name.includes('User C'));
        const student = results.find(r => r.name.includes('User D'));
        const none = results.find(r => r.name.includes('User E'));

        if (perfect && mentor && student && !none && perfect.score > mentor.score && mentor.score > student.score) {
            console.log('\n✅ VERIFICATION PASSED: Ranking is correct (Perfect > Mentor > Student > None)');
        } else {
            console.log('\n❌ VERIFICATION FAILED: Unexpected ranking');
        }

    } catch (e) {
        console.error(e);
        await run("ROLLBACK");
    } finally {
        // Cleanup Test Data
        await run(`DELETE FROM users WHERE email LIKE '%@test.com'`);
        db.close();
    }
}

testMatchmaking();
