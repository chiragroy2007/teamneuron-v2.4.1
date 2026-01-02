const path = require('path');
const sqlite3 = require(path.resolve('./server/node_modules/sqlite3')).verbose();
const dbPath = path.resolve('./server/neuron.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // 1. Get a user
    db.get("SELECT id FROM users LIMIT 1", (err, user) => {
        if (err) { console.error(err); return; }
        if (!user) { console.log('No users found'); return; }

        console.log(`User found: ${user.id}`);
        const clubId = 'iiser-tirupati';
        const userId = user.id;

        // 2. Check membership
        db.get("SELECT * FROM club_members WHERE club_id = ? AND user_id = ?", [clubId, userId], (err, row) => {
            if (err) console.error(err);

            if (row) {
                console.log('User IS already a member in DB.');
            } else {
                console.log('User is NOT a member. Inserting...');
                db.run("INSERT INTO club_members (id, club_id, user_id) VALUES (?, ?, ?)",
                    ['debug-' + Date.now(), clubId, userId],
                    (err) => {
                        if (err) console.error('Insert failed:', err);
                        else console.log('Insert success.');
                    }
                );
            }

            // 3. Print curl command
            console.log(`\nTest Command:\ncurl -s http://localhost:8090/api/clubs/${clubId}/members/check/${userId}`);
        });
    });
});
